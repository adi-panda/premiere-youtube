import { writable } from "svelte/store";

export const inPoint = writable(0);
export const outPoint = writable(0);
export const currentVideo = writable(
  "https://www.youtube.com/watch?v=fEErySYqItI"
);
export const download_path = writable("");
export const toggleSettings = writable(false);
export const toggleOverwrite = writable(false);
export const toggleTopTrack = writable(false);
export const toggleNoInject = writable(false);
export const toggleAudioOnly = writable(false);
export const downloadClip = writable(false);
export const toggleVideoOnly = writable(false);
export const downloadPercentage = writable(0);
