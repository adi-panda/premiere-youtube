<script context="module" lang="ts">
  import Downloader from "./downloader.svelte";
  import Settings from "./settings.svelte";
  import "../index.scss";
  import { toggleSettings } from "./stores";
</script>

{#if !$toggleSettings}
  <Downloader />
{:else}
  <Settings />
{/if}

<style lang="scss">
</style>
