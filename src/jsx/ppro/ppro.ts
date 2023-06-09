export const getFilePath = () => {
  const filePath = app.project.path;
  return filePath;
};

export const insertVideoDownload = (
  videoPath: string,
  toggleOverwrite: boolean,
  toggleNoInject: boolean,
  toggleTopTrack: boolean,
  toggleAudioOnly: boolean
) => {
  // TODO: Can use const/let in here since it will transpile down to var
  // Get the active sequence
  var activeSequence = app.project.activeSequence;
  var projectItems = app.project.rootItem.children;
  // Import the video file
  var importedClip = app.project.importFiles(
    [videoPath],
    true,
    app.project.rootItem,
    false
  );
  if (toggleNoInject) {
    return;
  }
  var tracksList = activeSequence.videoTracks;
  if (toggleAudioOnly) {
    tracksList = activeSequence.audioTracks;
  }

  var trackToInsert = tracksList[tracksList.numTracks - 1];

  if (!toggleTopTrack) {
    for (var i = 0; i < tracksList.numTracks; i++) {
      if (tracksList[i].isTargeted()) {
        trackToInsert = tracksList[i];
        break;
      }
    }
  }

  // Add the imported video to the active sequence
  if (toggleOverwrite) {
    trackToInsert.overwriteClip(
      // TODO: While this works most of the time, there might be instances where it's not the last item.
      // TODO: Might want to verify it's the same path since importFiles() doesn't return the project item files it created.
      projectItems[projectItems.numItems - 1],
      activeSequence.getPlayerPosition()
    ); // Insert the clip at the start of the sequence
  } else {
    trackToInsert.insertClip(
      projectItems[projectItems.numItems - 1],
      // @ts-ignore
      activeSequence.getPlayerPosition()
    ); // Insert the clip at the start of the sequence
  }
};
