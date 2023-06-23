<script lang="ts">
  import { onMount } from "svelte";
  import { path } from "../lib/cep/node";
  import { evalTS } from "../lib/utils/bolt";
  import { get } from "svelte/store";
  import {
    inPoint,
    outPoint,
    currentVideo,
    download_path,
    toggleSettings,
    toggleTopTrack,
    toggleOverwrite,
    toggleNoInject,
    toggleAudioOnly,
    toggleVideoOnly,
    downloadClip,
    downloadPercentage,
  } from "./stores";
  import {
    youtube_parser,
    switchSettings,
    updateToggles,
    downloadVideo,
  } from "./utils";

  import YouTube from "./videoplayer.svelte";

  let downloadState = {
    downloading: false,
    downloadPercentage: 0,
  };

  let player: any;

  onMount(() => {
    console.log("mounted");
    if (get(download_path) === "") {
      evalTS("getFilePath").then((res) => {
        download_path.update((n) => path.resolve(res, ".."));
      });
    }
    player.refreshPlayer();
  });

  let displayInPoint: string;
  inPoint.subscribe((value) => {
    if (value >= 3600) {
      displayInPoint = new Date(value * 1000).toISOString().substring(11, 19);
    } else {
      displayInPoint = new Date(value * 1000).toISOString().substring(14, 19);
    }
  });
  let displayOutPoint: string;
  outPoint.subscribe((value) => {
    if (value >= 3600) {
      displayOutPoint = new Date(value * 1000).toISOString().substring(11, 19);
    } else {
      displayOutPoint = new Date(value * 1000).toISOString().substring(14, 19);
    }
  });
</script>

<body>
  <div class="app">
    <header class="app-header">
      <article class="downloader">
        <button
          on:click={() => switchSettings(toggleSettings)}
          class="nav-button"
        >
          <span class="home-text">Youtube Inject!</span>
          <svg
            class="settingsLogo"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M19.43 12.98c.04-.32.07-.64.07-.98c0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 0 0-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98c0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03c.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73c0 .21-.02.43-.05.73l-.14 1.13l.89.7l1.08.84l-.7 1.21l-1.27-.51l-1.04-.42l-.9.68c-.43.32-.84.56-1.25.73l-1.06.43l-.16 1.13l-.2 1.35h-1.4l-.19-1.35l-.16-1.13l-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7l-1.06.43l-1.27.51l-.7-1.21l1.08-.84l.89-.7l-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13l-.89-.7l-1.08-.84l.7-1.21l1.27.51l1.04.42l.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43l.16-1.13l.2-1.35h1.39l.19 1.35l.16 1.13l1.06.43c.43.18.83.41 1.23.71l.91.7l1.06-.43l1.27-.51l.7 1.21l-1.07.85l-.89.7l.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z"
            /></svg
          >
        </button>
        <div class="button-group">
          <input
            class="url-input"
            placeholder="Search"
            type="search"
            bind:value={$currentVideo}
          />
          <button class="search-button" on:click={player.refreshPlayer}
            >Search</button
          >
        </div>
        <div class="youtube-player">
          <YouTube videoId={youtube_parser($currentVideo)} bind:this={player} />
        </div>
        <div class="button-group">
          <button class="point-button" on:click={player.setInPoint}>In</button>
          <button class="time-button" on:click={player.goToInPoint}>
            {displayInPoint}
          </button>
          <button class="point-button" on:click={player.setOutPoint}>Out</button
          >
          <button class="time-button" on:click={player.goToOutPoint}
            >{displayOutPoint}</button
          >
        </div>
        <div class="button-group">
          <label for="audioToggle">Audio:</label>
          <input
            type="checkbox"
            on:change={() => updateToggles(toggleAudioOnly, toggleVideoOnly)}
            bind:checked={$toggleAudioOnly}
          />

          <label for="videoToggle">Video:</label>
          <input
            type="checkbox"
            on:change={() => updateToggles(toggleAudioOnly, toggleVideoOnly)}
            bind:checked={$toggleVideoOnly}
          />

          <label for="downloadClip">Download Clip:</label>
          <input type="checkbox" bind:checked={$downloadClip} />
        </div>
        <div class="inject-group">
          <button
            class="inject-button"
            on:click={() =>
              downloadVideo(
                downloadClip,
                downloadPercentage,
                currentVideo,
                toggleAudioOnly,
                toggleVideoOnly,
                inPoint,
                outPoint,
                download_path,
                toggleOverwrite,
                toggleNoInject,
                toggleTopTrack
              )}>Inject!</button
          >
        </div>
        <progress value={$downloadPercentage} max="100" />
      </article>
    </header>
  </div>
</body>

<style lang="scss">
  .downloader {
    width: 28rem;
  }
  .settingsLogo {
    margin-left: 23rem;
    width: 32px;
    height: 32px;
    fill: #fff;
  }
  .inject-group {
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

  .button-group {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    margin: 10px;
  }
  .url-input {
    width: 100%;
    min-width: 20rem;
  }

  .youtube-player {
    width: 100%;
    height: 292px;
  }

  .time-button {
    background-color: aliceblue;
    color: black;

    padding-top: 3% 0%;

    margin-bottom: 0%;
    margin-top: 0.25rem;
    width: 5rem;
    border: none;
  }
  progress {
    width: 22rem;
  }

  .point-button {
    background-color: #b94747;
    width: 3rem;
    margin-bottom: 0%;
    margin-top: 0.25rem;
    padding-bottom: 3%;
    padding-top: 3%;
    padding-left: 0%;
    padding-right: 0%;
  }

  .search-button {
    background-color: #b94747;
    width: 4rem;
    font-size: small;
    padding-left: 0%;
    padding-right: 0%;
  }

  .home-text {
    margin: 0%;
    position: absolute;
    padding-top: 0.2rem;
    padding-left: 9.3rem;
  }
</style>
