
<script>
    import {url} from "../lib/cep/node";
    import {get} from 'svelte/store';
    import {download_path} from './stores';
    import "./main.scss";
    let result;
    const chooseFile = () => {
        result =  window.cep.fs.showOpenDialog(false, true, "Choose a file", get(download_path), null).data;
        result = url.fileURLToPath(result.toString());
        download_path.update(n => result);
    }
</script>


<body>
    <div class="app">
      <header class="app-header">
        <h1>Settings</h1>
        <h3>Download Path:</h3>
        <div class = "button-group">
            <input class = "url-input" type="text" bind:value={($download_path)} />
            <button on:click={chooseFile}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z"/></svg>
            </button>
        </div>
        <div class = "button-group">
            <h4>Overwirte:</h4>
            <input type="checkbox" value="Overwrite" checked={true}>
        </div>
        <div class = "button-group">
            <h4>Always Insert Top:</h4>
            <input type="checkbox" value="Top Track" checked={true}>
        </div>
      </header>
    </div>   
</body>

<style lang="scss">
    .button-group{
        align-items: center;
        vertical-align: middle;
    }
    h4{
        margin-bottom: 0px;
    }
    input[type="checkbox"]{
        margin-left: 10px;
        margin-bottom: 0px;
        margin-top: 22px;
    }

</style>