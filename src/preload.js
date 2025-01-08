// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

contextBridge.exposeInMainWorld("electronAPI", {
  isWindows: async () => {
    const result = await ipcRenderer.invoke("isWindows");
    return result;
  },
  checkVersion: async () => {
    const result = await ipcRenderer.invoke("check-version");
    return result;
  },
  setProjectPath: (projectPath) =>
    ipcRenderer.invoke("set-project-path", projectPath),
  getProjectPath: () => ipcRenderer.invoke("get-project-path"),
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
  projectDisplay: async () => {
    const result = await ipcRenderer.invoke("toggle-project-page");
    return result;
  },
  newProjectDialog: async () => {
    const result = await ipcRenderer.invoke("new-project-path");
    return result;
  },
  fileAssetsDialog: async (current_project) => {
    const result = await ipcRenderer.invoke("open-file-assets", current_project);
    return result;
  },
  characterDialog: async () => {
    const result = await ipcRenderer.invoke("open-character");
    return result;
  },
  projectDialog: async () => {
    const result = await ipcRenderer.invoke("open-projects");
    return result;
  },
  projectFolderCount: async () => {
    const result = await ipcRenderer.invoke("project-folder-count");
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
  onGifReady: (callback) => {
    ipcRenderer.on('gif-ready', (event, gifPath) => callback(gifPath));
  },
  renameGif: (gifPath, email) => {
    ipcRenderer.send('rename-gif', gifPath, email);
  },
  onRenameSuccess: (callback) => {
    ipcRenderer.on('rename-success', (event, newGifPath) => callback(newGifPath));
  },
  onRenameFailed: (callback) => {
    ipcRenderer.on('rename-failed', () => callback());
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
  supabaseInit: async (email, password) => {
    const result = await ipcRenderer.invoke("supabase-init", email, password);
    return result;
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
    });
  },
  selectBackground: async () => {
    ipcRenderer.send("select-background");
  },
  selectVideo: async () => {
    ipcRenderer.send("select-video");
  },
  selectGallery: async (bvhPath) => {
    ipcRenderer.send("select-gallery", bvhPath);
  },
  // bpy animation
  makeAnimation: async () => {
    ipcRenderer.send("animation-making");
    ipcRenderer.once("character-null", (event) => {
      console.log("hello");
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
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      return data.session;
    } else {
      return null;
    }
  },
  signIn: async (email, password) => {
    const { data } = await supabase.auth.getSession();

    if (data?.session) {
      return data.session;
    } else {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return result;
    }
  },
  signOut: async () => {
    const result = await supabase.auth.signOut();
    return result;
  },
});
