// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isWindows: async () => {
    const result = await ipcRenderer.invoke("isWindows");
    return result;
  },
  checkVersion: async () => {
    const result = await ipcRenderer.invoke("check-version");
    return result;
  },
  verifySession: async (accessToken) => {
    const result = await ipcRenderer.invoke("verify-session", accessToken);
    return result;
  },
  authenticateUser: async (credentials) => {
    const result = await ipcRenderer.invoke("authenticate-user", credentials);
    return result;
  },
  executeExternal: () => {
    ipcRenderer.send("execute-external");
    ipcRenderer.on("external-execution-result", (event, result) => {
      console.log("Execution Result:", result);
    });
  },
  executeFFmpeg: (videoPath, audioPath, outputPath, mode) => {
    ipcRenderer.send("execute-ffmpeg", videoPath, audioPath, outputPath, mode);
  },
  sendCharacterPath: (path) => {
    ipcRenderer.send("character-path", path);
  },
  fileDialog: async (parameter) => {
    const result = await ipcRenderer.invoke("open-file-dialog", parameter);
    return result;
  },
  folderDialog: async () => {
    const result = await ipcRenderer.invoke("open-folder-dialog");
    return result;
  },
  fileAssetsDialog: async () => {
    const result = await ipcRenderer.invoke("open-file-assets");
    return result;
  },
  characterDialog: async () => {
    const result = await ipcRenderer.invoke("open-character");
    return result;
  },
  fileScenesDialog: async () => {
    const result = await ipcRenderer.invoke("open-file-scenes");
    return result;
  },
  saveCamera: (arrayBuffer) => {
    console.log("appl1");
    ipcRenderer.send("save-video", arrayBuffer);
  },
  saveDialog: async (imageData, count, duration, check, frameNum) => {
    const result = await ipcRenderer.invoke(
      "save-file-dialog",
      imageData,
      count,
      duration,
      check,
      frameNum
    );

    return result;
  },

  skeletonMake: async () => {
    const { count, durationTimes, durationCounts } = await ipcRenderer.invoke(
      "skeleton-make"
    );
    return { count, durationTimes, durationCounts };
  },
  openPose: async () => {
    ipcRenderer.send("open-pose");
    ipcRenderer.once("character-null", (event) => {
      ipcRenderer.send("file-null-error", "Please select character glb file!");
    });
    const showVideoInContainer = (outputPath) => {
      const videoElement = document.getElementById("video-openpose");
      let source = document.createElement("source");

      source.setAttribute("src", outputPath);
      source.setAttribute("type", "video/mp4");
      // Function to show the video and hide the canvas
      const showVideo = () => {
        videoElement.style.display = "block";
        videoElement.appendChild(source);
        videoElement.play();
        console.log("OPENPOSE IS SHOWING");
      };

      // Set a timeout to show the video after 5 seconds
      setTimeout(showVideo, 5000);

      // Optional: Add stop button functionality
    };
    ipcRenderer.once("output-file-exists", (event, outputPath) => {
      showVideoInContainer(outputPath);
      console.log("exists!!!!!!!");
    });
  },
  selectBackground: async () => {
    ipcRenderer.send("select-background");
  },
  // bpy animation
  makeAnimation: async () => {
    ipcRenderer.send("animation-making");
    ipcRenderer.once("character-null", (event) => {
      ipcRenderer.send("file-null-error", "Please select character glb file!");
    });
  },
  makeBackgroundAnimation: async () => {
    ipcRenderer.send("animation-making-background");
  },
  // ----------------
  notification: (msg) => {
    ipcRenderer.send(
      "file-null-error",
      "Please select video file and audio file correctly."
    );
  },

  // You can also expose other functions, like runInference from earlier
  runInference: async ({url, clicks, modelScale, tensorFile, dType}) => {
    const results = await ipcRenderer.invoke("run-onnx-inference", {url, clicks, modelScale, tensorFile, dType});

    return results;
  }, 

  generateNpyFile: async ({filePath}) => {
    const result = await ipcRenderer.invoke("generate-npy-file", {filePath});
    console.log('******************************** here is npy result file ******************************** :' + result + "********************");
    return result;
  },
});
