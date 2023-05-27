
<script>
    import {url} from "../lib/cep/node";
    import {get} from 'svelte/store';
    import {download_path} from './stores';
    import {toggleSettings} from './stores';
    import "./main.scss";
    let result;
    const chooseFile = () => {
        result =  window.cep.fs.showOpenDialog(false, true, "Choose a file", get(download_path), null).data;
        result = url.fileURLToPath(result.toString());
        download_path.update(n => result);
    }
    const switchSettings = () => {
      toggleSettings.update(n => !n);
    };
</script>


<body>
    <div class="app">
      <header class="app-header">
        <article class = "settings">
          <h6>Download Path:</h6>
          <div class = "button-group">
              <input class = "downlaod-path" type="text" bind:value={($download_path)} />
              <button class = "folder-button" on:click={chooseFile}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z"/></svg>
              </button>
          </div>
          <div class = "button-group">
              <label for="Overwrite">Overwrite:</label>
              <input type="checkbox" value="Overwrite" checked={true}>
          </div>
          <div class = "button-group">
              <label for="Top Track">Top Track:</label>
              <input type="checkbox" value="Top Track" checked={true}>
          </div>
          <button on:click={switchSettings}>
            Back
          </button>
        </article>
      </header>
    </div>   
</body>

<style lang="scss">

.app-header {
  padding-bottom: 14rem;
}

.folder-button{ 
  padding-left: 0%;
  padding-right: 0%;
  padding-top: 2%;
  padding-bottom: 3%;
  width: 3rem;

}

.settings{
  width: 27rem;
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