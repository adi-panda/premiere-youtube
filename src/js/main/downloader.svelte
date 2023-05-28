<script>
  import { onMount } from "svelte";
  import { os, path } from "../lib/cep/node";
  import {get} from 'svelte/store';
  import {inPoint, outPoint, currentVideo, download_path, toggleSettings} from './stores'


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


  import "./main.scss";
  import { set_data_maybe_contenteditable } from "svelte/internal";

  let loaded = false;
  let player;
  let downloading = false;
  let downloadPercentage = 0;
  let downloadClip = false;
  let audioToggle = false;

  if(!loaded){
    loaded = true;
    if(get(download_path) === ""){
      evalTS("getFilePath", "test").then((res) => {
        download_path.update(n => path.resolve(res, '..'));
      });
    }
  }

  onMount(() => {
    console.log("mounted");
    player.refreshPlayer();
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
    const path = require('path');
    args.push(`--ffmpeg-location`);
    args.push(`"${__dirname}${path.sep}public"`);
    if(audioToggle){
      args.push(`-x`);
      args.push(`--audio-format`);
      args.push(`mp3`);
    } else{
      args.push(`-f`);
      args.push(`"bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`);
    }
    if(downloadClip){
      args.push(`--download-sections`);
      args.push(`*${$inPoint}-${$outPoint}`);
    }
    args.push(`"${$currentVideo}"`);
    args.push(`-P`);
    args.push(`"${get(download_path)}"`);
    return args;
  }
  
  const downloadVideo = () => {
    console.log(downloadClip);
    downloading = true;
    var url = $currentVideo;
    const {spawn} = require('child_process');
    var videoPath = "";
    var result;
    if(os.platform() == "win32"){
      result = spawn(`"${__dirname}\\public\\yt-dlp.exe"`, buildYtdlpArgs(), {shell : true});
    } else {
      result = spawn(`"${__dirname}/public/yt-dlp_macos"`, buildYtdlpArgs(), {shell : true});
    } 

    result.stdout.on('data', function (data) {
      console.log('stdout: ' + data.toString());
      if(data.toString().includes('%')){
        downloadPercentage = data.toString().substring(data.toString().indexOf('%') - 4, data.toString().indexOf('%'));
      }
      if(data.toString().includes('Destination:')){
        videoPath = data.toString().substring(data.toString().indexOf('Destination:') + 13, data.toString().length - 1);
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
      downloading = false;
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


  const switchSettings = () => {
    toggleSettings.update(n => !n);
  };

</script>


<body>
<div class="app">
  <header class="app-header">

    <svg class = "settingsLogo" on:click={switchSettings} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98c0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 0 0-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98c0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03c.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73c0 .21-.02.43-.05.73l-.14 1.13l.89.7l1.08.84l-.7 1.21l-1.27-.51l-1.04-.42l-.9.68c-.43.32-.84.56-1.25.73l-1.06.43l-.16 1.13l-.2 1.35h-1.4l-.19-1.35l-.16-1.13l-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7l-1.06.43l-1.27.51l-.7-1.21l1.08-.84l.89-.7l-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13l-.89-.7l-1.08-.84l.7-1.21l1.27.51l1.04.42l.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43l.16-1.13l.2-1.35h1.39l.19 1.35l.16 1.13l1.06.43c.43.18.83.41 1.23.71l.91.7l1.06-.43l1.27-.51l.7 1.21l-1.07.85l-.89.7l.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z"/></svg>

    <article>
      <div class = "button-group">
        <input class = "url-input" placeholder = "Search" type = "search" bind:value={$currentVideo}/>
        <button class = "search-button" on:click={player.refreshPlayer()}>Search</button>
      </div>
      <div class = "youtube-player">
        <YouTube videoId="{$currentVideo.substring(32, 43)}"
        bind:this={player} />
      </div>
    <div class = "button-group">
      <button class = "point-button" on:click={() => player.setInPoint()}>In</button>
      <button class="time-button" on:click={() => player.goToInPoint()} > {displayInPoint} </button>
      <button class = "point-button" on:click={() => player.setOutPoint()}>Out</button>
      <button class="time-button" on:click={() => player.goToOutPoint()} >{displayOutPoint}</button>
    </div>
    </article>

    <div class = "button-group">
      <label for="audioToggle">Audio Only:</label>
      <input type="checkbox" bind:checked={audioToggle} >
      <label for="downloadClip">Download Clip:</label>
      <input type="checkbox" bind:checked={downloadClip} >
    </div>
    {#if downloading}
      <progress value="{downloadPercentage}" max="100"></progress>
    {/if}
    <div class = "inject-group">
      <button class = "inject-button" on:click={downloadVideo}>Inject!</button>
    </div>
    

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


.inject-group{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  width: 20rem;
}
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
.url-input{
  width: 100%;
  min-width: 20rem;
}

.youtube-player{
  width: 100%;
  height: 292px;
}

.time-button{
  background-color: aliceblue;
  color: black;
  padding-left: 0%;
  padding-right: 0%;
  padding-bottom: 3%;
  padding-top: 3%;
  margin-bottom: 0%;
  margin-top: 0.25rem;
  width: 5rem;
  border: none;
}
progress{
  width: 22rem;
}

.point-button{
  width: 3rem;
  margin-bottom: 0%;
  margin-top: 0.25rem;
  padding-bottom: 3%;
  padding-top: 3%;
  padding-left: 0%;
  padding-right: 0%;
}


.search-button{
  width: 4rem;
  font-size: small;
  padding-left: 0%;
  padding-right: 0%;
}
.settingsLogo{
  margin-left: 28rem;
  width: 32px;
  height: 32px; 
  fill: #fff;
}
</style>
  