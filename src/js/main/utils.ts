import { Writable, get } from "svelte/store";
import { os, path, child_process } from "../lib/cep/node";
import { evalTS } from "../lib/utils/bolt";
import { ChildProcessWithoutNullStreams } from "child_process";

const buildYtdlpArgs = (
  toggleAudioOnly: boolean,
  toggleVideoOnly: boolean,
  downloadClip: boolean,
  inPoint: number,
  outPoint: number,
  currentVideo: string,
  download_path: string
) => {
  var args = [];
  args.push(`--ffmpeg-location`);
  args.push(`"${__dirname}${path.sep}public"`);
  if (toggleAudioOnly) {
    args.push(`-x`);
    args.push(`--audio-format`);
    args.push(`mp3`);
  } else if (toggleVideoOnly) {
    args.push(`-f`);
    args.push(`"bestvideo[height<=1080][ext=mp4]"`);
  } else {
    args.push(`-f`);
    args.push(
      `"bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`
    );
  }
  if (downloadClip) {
    args.push(`--download-sections`);
    args.push(`*${inPoint}-${outPoint}`);
  }
  args.push(`"${currentVideo}"`);
  args.push(`-o`);
  const currentDate = new Date();
  args.push(`"${download_path}${path.sep}%(title)s[${currentDate}].%(ext)s"`);
  return args;
};

export const youtube_parser = (url: string) => {
  var regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
};

const nthIndex = (str: string, pat: string, n: number) => {
  let L = str.length,
    i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
};

export const switchSettings = (toggleSettings: Writable<boolean>) => {
  toggleSettings.update((n) => !n);
};

export const updateToggles = (
  toggleAudioOnly: Writable<boolean>,
  toggleVideoOnly: Writable<boolean>
) => {
  if (!get(toggleAudioOnly)) {
    toggleVideoOnly.update((n) => false);
    console.log("audio only");
  } else if (!get(toggleVideoOnly)) {
    toggleAudioOnly.update((n) => false);
    console.log("video only");
  }
};

export const downloadVideo = (
  downloadClip: Writable<boolean>,
  downloading: boolean,
  downloadPercentage: number,
  currentVideo: Writable<string>,
  toggleAudioOnly: Writable<boolean>,
  toggleVideoOnly: Writable<boolean>,
  inPoint: Writable<number>,
  outPoint: Writable<number>,
  download_path: Writable<string>,
  toggleOverwrite: Writable<boolean>,
  toggleNoInject: Writable<boolean>,
  toggleTopTrack: Writable<boolean>
) => {
  downloading = true;
  let url = get(currentVideo);
  let videoPath = "";
  let result: ChildProcessWithoutNullStreams;
  if (os.platform() == "win32") {
    result = child_process.spawn(
      `"${__dirname}\\public\\yt-dlp.exe"`,
      buildYtdlpArgs(
        get(toggleAudioOnly),
        get(toggleVideoOnly),
        get(downloadClip),
        get(inPoint),
        get(outPoint),
        get(currentVideo),
        get(download_path)
      ),
      {
        shell: true,
      }
    );
  } else {
    result = child_process.spawn(
      `"${__dirname}/public/yt-dlp_macos"`,
      buildYtdlpArgs(
        get(toggleAudioOnly),
        get(toggleVideoOnly),
        get(downloadClip),
        get(inPoint),
        get(outPoint),
        get(currentVideo),
        get(download_path)
      ),
      {
        shell: true,
      }
    );
  }

  result.stdout.on("data", function (data) {
    console.log("stdout: " + data);
    if (data.toString().includes("%")) {
      downloadPercentage = data
        .toString()
        //TODO: use Regex instead of multiple indexes
        .substring(data.indexOf("%") - 4, data.indexOf("%"));
    }
    if (data.toString().includes("Destination:")) {
      videoPath = data
        .toString()
        .substring(data.indexOf("Destination:") + 13, data.length - 1);
      console.log(videoPath);
    }
    if (data.includes("Merging formats into")) {
      videoPath = data.substring(data.indexOf('"') + 1, nthIndex(data, '"', 2));
      console.log(data.toString());
      console.log(videoPath);
    }
    if (data.toString().includes("has already been downloaded")) {
      videoPath = data
        .toString()
        .substring(
          data.indexOf("[download] ") + 11,
          data.indexOf(" has already been downloaded")
        );
      console.log(videoPath);
    }
    if (data.includes("Deleting original file")) {
      downloadPercentage = 0;
    }
  });

  result.stderr.on("data", function (data: any) {
    console.log("stderr: " + data);
  });

  result.on("exit", function (code: any) {
    console.log("child process exited with code " + code.toString());
    downloading = false;
    evalTS(
      "insertVideoDownload",
      videoPath,
      get(toggleOverwrite),
      get(toggleNoInject),
      get(toggleTopTrack),
      get(toggleAudioOnly)
    );
  });
};
