<script lang="ts">
  import { url } from "../lib/cep/node";
  import { get } from "svelte/store";
  import { switchSettings } from "./utils";
  import {
    download_path,
    toggleOverwrite,
    toggleTopTrack,
    toggleNoInject,
  } from "./stores";
  import { toggleSettings } from "./stores";
  let result = "";
  const chooseFile = () => {
    result = window.cep.fs.showOpenDialog(
      false,
      true,
      "Choose a file",
      get(download_path),
      null
    ).data;
    result = url.fileURLToPath(result.toString());
    download_path.update((n) => result);
  };
</script>

<body>
  <div class="app">
    <header class="app-header">
      <article class="settings">
        <button
          class="nav-button"
          on:click={() => switchSettings(toggleSettings)}
        >
          <span class="settings-text">Settings</span>
          <svg
            class="backLogo"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M19 7v4H5.83l3.58-3.59L8 6l-6 6l6 6l1.41-1.41L5.83 13H21V7z"
            /></svg
          >
        </button>
        <h6>Download Path:</h6>
        <div class="button-group">
          <input
            class="download-path"
            type="text"
            bind:value={$download_path}
          />
          <button class="folder-button" on:click={chooseFile}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z"
              /></svg
            >
          </button>
        </div>
        <div class="button-group">
          <label for="Overwrite">Overwrite:</label>
          <input
            type="checkbox"
            value="Overwrite"
            bind:checked={$toggleOverwrite}
          />
        </div>
        <div class="button-group">
          <label for="Top Track">Top Track:</label>
          <input
            type="checkbox"
            value="Top Track"
            bind:checked={$toggleTopTrack}
          />
        </div>
        <div class="button-group">
          <label for="No Inject">No Inject:</label>
          <input
            type="checkbox"
            value="No Inject"
            bind:checked={$toggleNoInject}
          />
        </div>
      </article>
    </header>
  </div>
</body>

<style lang="scss">
  .settings {
    width: 28rem;
  }
  .app-header {
    padding-bottom: 21.2rem;
  }

  .folder-button {
    padding-left: 0rem;
    padding-right: 0rem;
    padding-top: 0.5rem;
    padding-bottom: 0.6rem;
    width: 3rem;
  }

  .download-path {
    width: 20rem;
  }

  .backLogo {
    margin-left: 23rem;
    width: 32px;
    height: 32px;
    fill: #fff;
  }

  .button-group {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    margin: 0 0 10px 10px;
  }
  .settings-text {
    margin: 0rem;
    position: absolute;
    padding-top: 0.2rem;
    padding-left: 10.7rem;
  }
</style>
