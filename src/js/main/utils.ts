import { Writable, get } from "svelte/store";
import { path } from "../lib/cep/node";

export const buildYtdlpArgs = (
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

export const nthIndex = (str: string, pat: string, n: number) => {
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
