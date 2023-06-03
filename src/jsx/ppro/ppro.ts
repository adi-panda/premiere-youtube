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

export const insertVideoDownload = (videoPath: string, toggleOverwrite : boolean, toggleNoInject : boolean, 
                                    toggleTopTrack : boolean, toggleAudioOnly : boolean) => {

  // Get the active sequence
  var activeSequence = app.project.activeSequence;
  var projectItems = app.project.rootItem.children;
  // Import the video file
  var importedClip = app.project.importFiles([videoPath], true, app.project.rootItem, false);
  if(toggleNoInject){
    return;
  }
  var tracksList = activeSequence.videoTracks;
  if(toggleAudioOnly){
    tracksList = activeSequence.audioTracks;
  }

  var trackToInsert = tracksList[tracksList.numTracks - 1];
  

  if(!toggleTopTrack){
    for(var i = 0; i < tracksList.numTracks; i++){
      if (tracksList[i].isTargeted()){
        trackToInsert = tracksList[i];
        break;
      }
    }
  }

  // Add the imported video to the active sequence
  if(toggleOverwrite){
    trackToInsert.overwriteClip(projectItems[projectItems.numItems - 1], activeSequence.getPlayerPosition()); // Insert the clip at the start of the sequence
  } else {
    //@ts-ignore
    trackToInsert.insertClip(projectItems[projectItems.numItems - 1], activeSequence.getPlayerPosition()); // Insert the clip at the start of the sequence
  }


};
