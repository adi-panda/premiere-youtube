<script context="module">
    let iframeApiReady = false;
  
    import { setContext, onMount } from "svelte";
    import { inPoint, outPoint } from "./stores";
    import {get} from 'svelte/store'
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  
    window.onYouTubeIframeAPIReady = () =>
      window.dispatchEvent(new Event("iframeApiReady"));
  </script>
  
  <script>
    import { createEventDispatcher } from "svelte";
    import { getContext } from "svelte";
    export let videoId;
    let player;
    var loaded = false;
    let divId = "player_" + parseInt(Math.random() * 109999);
    export function play(){
      player.playVideo()
    }
    const dispatch = createEventDispatcher();

    window.addEventListener("iframeApiReady", function(e) {
      createPlayer();
    });

    function createPlayer () {
      console.log("yo", divId);
      player = new YT.Player(divId, {
        height: "292",
        width: "480",
        videoId,
        events: {
          onReady: playerIsReady,
          onStateChange: playerStateChange
        }
      });
    }

    function playerStateChange({data}){
      dispatch("PlayerStateChange", data)
      console.log(data)
      let strReturn = "";
      if(data== -1){ strReturn = "(unstarted)"}
      if(data== 0 ){ strReturn = "(ended)"}
      if(data== 1 ){ strReturn = "(playing)"}
      if(data== 2 ){ strReturn = "(paused)"}
      if(data== 3 ){ strReturn = "(buffering)"}
      if(data== 5 ){ strReturn = "(video cued)."}
      dispatch("PlayerStateChangeString", strReturn)
    }
    function playerIsReady() {
      dispatch("Ready");
      setInterval(() => {
        dispatch("currentPlayTime", player.getCurrentTime());
        //console.log(player.getCurrentTime())
        if(!loaded){
          loaded = true;
          inPoint.update(n => 0 );
          outPoint.update(n => player.getDuration() );
        }
      }, 1000);
    }
    export const logTime = () => {
      console.log(player.getCurrentTime());
    };
    export const setInPoint = () => {
      if (player.getCurrentTime()<= get(outPoint)) {
        inPoint.update(n => player.getCurrentTime());
      }
    };
    export const setOutPoint = () => {
      if(player.getCurrentTime() >= get(inPoint)){
        outPoint.update(n => player.getCurrentTime());
      }
    };

    export const goToInPoint = () => {
      player.seekTo(get(inPoint), true);
    };
    export const goToOutPoint = () => {
      player.seekTo(get(outPoint), true);
    };

    export const refreshPlayer = () => {
      loaded = false;
      player.destroy();
      createPlayer();
    };
  </script>
  
  <div id={divId} />