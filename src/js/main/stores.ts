import { writable } from "svelte/store";

export const inPoint = writable(0);
export const outPoint = writable(0);
export const currentVideo = writable("https://www.youtube.com/watch?v=fEErySYqItI");
export const download_path = writable("");