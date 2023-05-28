import {
  helloError,
  helloStr,
  helloNum,
  helloArrayStr,
  helloObj,
} from "../utils/samples";
export { helloError, helloStr, helloNum, helloArrayStr, helloObj };

export const qeDomFunction = () => {
  if (typeof qe === "undefined") {
    app.enableQE();
  }
  if (qe) {
    qe.name;
    qe.project.getVideoEffectByName("test");
  }
};

export const helloWorld = () => {
  alert("Hello from Premiere Pro.");
};

export const getFilePath = () => {
  const filePath = app.project.path;
  return filePath;
};

export const insertVideoDownload = (videoPath: string) => {
  // Get the active sequence

  var activeSequence = app.project.activeSequence;
  var projectItems = app.project.rootItem.children;
  // Import the video file
  alert(videoPath);
  var importedClip = app.project.importFiles([videoPath], true, app.project.rootItem, false);
  var videoTrack = activeSequence.videoTracks[activeSequence.videoTracks.numTracks - 1];
  for(var i = 0; i < activeSequence.videoTracks.numTracks; i++){
    alert("track" + i)
    if (activeSequence.videoTracks[i].isTargeted()){
      alert("targeted" + i)
      var videoTrack = activeSequence.videoTracks[i];
      break;
    }
  }
  // Add the imported video to the active sequence
  
  videoTrack.insertClip(projectItems[projectItems.numItems - 1], activeSequence.getPlayerPosition()); // Insert the clip at the start of the sequence

};
