<script>
  import { onMount } from "svelte";
  import { os, path } from "../lib/cep/node";
  import {inPoint, outPoint, currentVideo} from './stores'


  import {
    csi,
    evalES,
    evalFile,
    openLinkInBrowser,
    subscribeBackgroundColor,
    evalTS,
  } from "../lib/utils/bolt";



  import nodeJs from "../assets/node-js.svg";
  import adobe from "../assets/adobe.svg";
  import YouTube from "./videoplayer.svelte";


  import "../index.scss";
  import "./main.scss";
  import { set_data_maybe_contenteditable } from "svelte/internal";

  let loaded = false;
  let player;
  let downloadPercentage = 0;
  let download_path;
  let downloadClip = false;
  
  let backgroundColor = "#282c34";

  if(!loaded){
    loaded = true;
    evalTS("getFilePath", "test").then((res) => {
      download_path = path.resolve(res, '..');
    });
  }

  onMount(() => {
    if (window.cep) {
      
      subscribeBackgroundColor((c) => (backgroundColor = c));
    }
  });

  function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
  }

  const buildYtdlpArgs = () => {
    var args = [];
    args.push(`--ffmpeg-location`);
    args.push(`"${__dirname}/public"`);
    args.push(`-f`);
    args.push(`"bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`);
    if(downloadClip){
      args.push(`--download-sections`);
      args.push(`*${$inPoint}-${$outPoint}`);
    }
    args.push(`"${$currentVideo}"`);
    args.push(`-P`);
    args.push(`"${download_path}"`);
    return args;
  }
  
  const downloadVideo = () => {
    var url = $currentVideo;
    const {spawn} = require('child_process');
    var videoPath = "";
    var result;
    if(os.platform() == "win32"){
      result = spawn(`"${__dirname}/public/yt-dlp.exe"`, buildYtdlpArgs(), {shell : true});
    } else {
      result = spawn(`"${__dirname}/public/yt-dlp_macos"`, buildYtdlpArgs(), {shell : true});
    } 

    result.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
      if(data.toString().includes('%')){
        downloadPercentage = data.toString().substring(data.toString().indexOf('%') - 4, data.toString().indexOf('%'));
      }
      if(data.toString().includes('Destination:')){
        videoPath = data.toString().substring(data.toString().indexOf('Destination:') + 13, data.toString().indexOf('Destination:') + 100);
        videoPath = videoPath.substring(0, videoPath.indexOf('\n'));
        console.log(videoPath);
      }
      if(data.toString().includes('Merging formats into')) {
        videoPath = data.toString().substring(data.toString().indexOf('"') + 1, nthIndex(data.toString(), '"', 2));
        console.log(data.toString());
        console.log(videoPath);
      }
      if(data.toString().includes("has already been downloaded")){
        videoPath = data.toString().substring(data.toString().indexOf("[download] ") + 11, data.toString().indexOf(" has already been downloaded"));
        console.log(videoPath);
      }
      if(data.toString().includes('Deleting original file')){
        downloadPercentage = 0;
      }
    });

    result.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    });

    result.on('exit', function (code) {
      console.log('child process exited with code ' + code.toString());
      evalTS("insertVideoDownload", videoPath);
    });
  };

  let displayInPoint;
  inPoint.subscribe(value => {
    if (value >= 3600){
      displayInPoint = new Date(value * 1000).toISOString().substring(11, 19);
    } else {
      displayInPoint = new Date(value * 1000).toISOString().substring(14, 19);
    }
  });
  let displayOutPoint
  outPoint.subscribe(value => {
    if (value >= 3600){
      displayOutPoint = new Date(value * 1000).toISOString().substring(11, 19);
    } else {
      displayOutPoint = new Date(value * 1000).toISOString().substring(14, 19);
    }
  });

</script>

<body>
<div class="app" style="background-color: {backgroundColor};">
  <header class="app-header">
    <h1>YouTube Injector!</h1>
    <div class = "button-group">
      <input class = "url-input" type = "text" bind:value={$currentVideo}/>
      <button on:click={player.refreshPlayer()}>Search</button>
    </div>
    <YouTube videoId="{$currentVideo.substring(32, 43)}"
    bind:this={player} />

    <div class = "button-group">
      <button on:click={() => player.setInPoint()}>In</button>
      <button class="time-button" on:click={() => player.goToInPoint()} > {displayInPoint} </button>
      <button on:click={() => player.setOutPoint()}>Out</button>
      <button class="time-button" on:click={() => player.goToOutPoint()} >{displayOutPoint}</button>
    </div>
    <div class = "button-group">
      <label for="downloadClip">Download Clip:</label>
      <input type="checkbox" bind:value={downloadClip} >
      <button on:click={downloadVideo}>Inject!</button>
    </div>
    <h5>Download Progress: {downloadPercentage}</h5>

      <!-- ... -->
    <!-- <div class="button-group">
      <button on:click={() => (count += 1)}>Count is: {count}</button>
      <button on:click={nodeTest}>
        <img class="icon-button" src={nodeJs} alt="" />
      </button>
      <button on:click={jsxTest}>
        <img class="icon-button" src={adobe} alt="" />
      </button>
      <button on:click={jsxTestTS}>Ts</button>
    </div> -->

  </header>
</div>

</body>
<style>

.app-header {
  padding-top: 0%;
}
.button-group{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  margin: 10px;
}
</style>
  