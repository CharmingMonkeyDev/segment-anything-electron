const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  protocol,
  net,
} = require("electron");
const { execFile } = require("child_process");
const path = require("node:path");
const os = require("os");
const fs = require("fs");
const { App_Path, getExePath, getFolderPath, getExePath1 } = require("./utils");
let charcter = "empty";
let background = "empty";
let video = "empty";
let sceneoutputfolderPaht = "C:/";
let currentProjectPath = "projects";

require("dotenv").config();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Metadata version from metadata.json
var metadataVersion = {
  major: "0",
  minor: "0",
  release: "zeta",
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    icon: path.join(App_Path, "Icons/yusha.ico"),
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  try {
    protocol.handle("resource", async (request, callback) => {
      try {
        const filePath = request.url.replace(
          /resource:\\|resource:\/\//g,
          "file://"
        );
        return net.fetch(filePath);
      } catch (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log("e", error);
  }
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("file-null-error", (event, message) => {
  const notification = new Notification({
    title: "File Error",
    body: message,
  });
  notification.show();
});

ipcMain.on("execute-external", (event) => {
  const executablePath = getExePath("ai.exe");
  const parameters = [getFolderPath("assets")];
  console.log(parameters, executablePath);
  execFile(executablePath, parameters, (err, data) => {
    if (err) {
      console.error("Error:", err);
      event.sender.send("external-execution-result", {
        success: false,
        error: err.message,
      });
      return;
    }
    console.log("Output:", data.toString());
    event.sender.send("external-execution-result", {
      success: true,
      output: data.toString(),
    });
  });
});

// aros - 2024-5-31 bpy
ipcMain.on("animation-making", (event) => {
  if (charcter === "empty") {
    event.sender.send("character-null");
  } else {
    const exePath1 = getExePath("rigging.exe");
    let command1;
    command1 = `-g ${charcter}`;

    execFile(exePath1, command1.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      console.log("Output:", stdout);
    });
    if (background === "empty") {
      const exePath = getExePath("animation.exe");
      let command;
      command = `-g ./rigged.glb -l ./exe/logo.png f ${sceneoutputfolderPaht}`;
      execFile(exePath, command.split(" "), (err, stdout, stderr) => {
        if (err) {
          console.error("Error:", err);
          return;
        }
        console.log("Output:", stdout);
      });
      background = "empty";
      charcter = "empty";
    } else {
      const exePath = getExePath("animation-background.exe");
      let command;
      command = `-g ./rigged.glb -b ./assets/background.jpg -f ${sceneoutputfolderPaht}`;
      execFile(exePath, command.split(" "), (err, stdout, stderr) => {
        if (err) {
          console.error("Error:", err);
          return;
        }
        console.log("Output:", stdout);
      });
      background = "empty";
      charcter = "empty";
    }
  }
});
//openpose
ipcMain.on("open-pose", (event) => {
  if (charcter === "empty") {
    event.sender.send("character-null");
  } else {
    const deleteFolderRecursive = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file, index) => {
          const curPath = path.join(folderPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            // Recursively delete the subdirectory
            deleteFolderRecursive(curPath);
          } else {
            // Delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(folderPath);
      }
    };
    // Function to check for the output file
    const checkForOutputFile = (filePath, interval, callback) => {
      const intervalId = setInterval(() => {
        if (fs.existsSync(filePath)) {
          clearInterval(intervalId);
          callback();
        }
      }, interval);
    };
    // Delete the './scene' folder
    const scenePath = getFolderPath("scene");
    deleteFolderRecursive(scenePath);

    const exePath1 = getExePath("rigging.exe");
    let command1;
    command1 = `-g ${charcter}`;

    execFile(exePath1, command1.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      console.log("Output:", stdout);
    });
    const exePath = getExePath("openpose.exe");

    let command;
    command = `-g ./rigged.glb -l ./exe/logo.png -v ./video/video.mp4`;
    execFile(exePath, command.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      console.log("Output:", stdout);
    });
    charcter = "empty";
    const outputPath = path.resolve(scenePath, "output.mp4");
    checkForOutputFile(outputPath, 1000, () => {
      console.log("exists!!!!!!!", outputPath);

      event.sender.send("output-file-exists", outputPath);
    });
  }
});

ipcMain.on("select-background", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "select background file", extensions: ["png", "jpg", "jpeg"] },
    ],
  });
  if (result.canceled) {
    background = "empty";
    return;
  }
  const sourceFilePath = result.filePaths[0];
  background = sourceFilePath;
  const outputFolderPath = getFolderPath(currentProjectPath, "/assets");

  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  fs.copyFileSync(
    sourceFilePath,
    path.join(outputFolderPath, "background.jpg")
  );
  console.log(background);
  return sourceFilePath;
});
// aros

ipcMain.on(
  "execute-ffmpeg",
  (event, videoPath, audioPath, outputPath, mode) => {
    const ffmpegPath = getExePath("ffmpeg.exe");
    let command;
    if (mode === 1) {
      command = `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac ${outputPath}`;
    } else if (mode === 0) {
      command = `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`;
    } else if (mode === -1) {
      command = `-i ${videoPath} -i ${audioPath} -vf "fps=15" -c:v libx264 -c:a aac -shortest ${outputPath}`;
    } else {
      console.error("Invalid mode");
      return;
    }
    execFile(ffmpegPath, command.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        event.sender.send("ffmpeg-execution-result", {
          success: false,
          error: err.message,
        });
        return;
      }
      console.log("Output:", stdout);
      event.sender.send("ffmpeg-execution-result", {
        success: true,
        output: stdout,
      });
    });
  }
);

ipcMain.on("character-path", (event, path) => {
  console.log("character path processing ...");
  charcter = path;
});

ipcMain.handle("isWindows", () => {
  return os.platform() === "win32";
});

ipcMain.handle("open-file-dialog", async (event, parameter) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "PNG Images", extensions: ["png"] }],
  });

  const sourceFilePath = result.filePaths[0];
  const outputFolderPath = getFolderPath(currentProjectPath, "assets");

  // Create the output folder if it doesn't exist
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  // Copy the selected file to the output folder as "front.png"
  fs.copyFileSync(sourceFilePath, path.join(outputFolderPath, parameter));

  console.log(
    `File copied successfully to ${path.join(outputFolderPath, parameter)}`
  );
  return { parameter, filePath: path.join(outputFolderPath, parameter) };
});
ipcMain.handle("open-folder-dialog", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    sceneoutputfolderPaht = "C:/";
    return { folderPath: null };
  }
  const folderPath = result.filePaths[0];
  sceneoutputfolderPaht = folderPath;
  console.log(`Folder selected: ${folderPath}`);

  // Return the selected folder path
  return { folderPath };
});

ipcMain.handle("new-project-path", async (event) => {
  console.log("Inside folder dialog");
  // const outputFolderBasePath = "./projects";
  // const assetSourcePath = "./projects/assets"
  const outputFolderBasePath = "./projects";
  const assetSourcePath = "./projects/assets"
  const iconSourcePath = "./src/Icons/projectIcon.png";

  // Ensure the 'projects' folder exists
  if (!fs.existsSync(outputFolderBasePath)) {
    fs.mkdirSync(outputFolderBasePath);
  }

  let folderIndex = 1;
  let newFolderName;
  let newFolderPath;

  function copyDirectorySync(src, dest) {
    // Ensure the destination directory exists
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read contents of the source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // If entry is a directory, recursively copy it
            copyDirectorySync(srcPath, destPath);
        } else if (entry.isFile()) {
            // If entry is a file, copy it
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

  // Loop to find the next available folder name (project_1, project_2, etc.)
  do {
    newFolderName = `project_${folderIndex}`;
    newFolderPath = path.join(outputFolderBasePath, newFolderName);
    folderIndex++;
  } while (fs.existsSync(newFolderPath));  // Increment until an available folder name is found

  // Create the new folder
  try {
    fs.mkdirSync(newFolderPath);
    console.log("Folder created at:", newFolderPath);
    
    const destinationImagePath = path.join(newFolderPath, 'front.png');
    const destinationDirectory = path.join(newFolderPath, 'assets')
    fs.copyFileSync(iconSourcePath, destinationImagePath);
    fs.mkdirSync(destinationDirectory);
    copyDirectorySync(assetSourcePath, destinationDirectory);

    console.log(`Image copied to: ${destinationImagePath}`);
    
  } catch (error) {
    console.error("Error creating folder:", error);
    return "";  // Return an empty string on error
  }

  // Return the path of the newly created folder
  return newFolderPath;
});

ipcMain.handle("open-file-assets", async (event, current_project) => {
  const directoryPath =  `./projects/${current_project}/assets`
  let arrayOfFiles = [];

  async function recursiveRead(currentPath) {
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        await recursiveRead(fullPath);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        if (ext === ".gif") {
          arrayOfFiles.push(fullPath);
        }
      }
    }
  }
  await recursiveRead(directoryPath);
  return arrayOfFiles;
});

ipcMain.handle("open-character", async (event) => {
  console.log("hello");
  const directoryPath = getFolderPath(currentProjectPath, "characters");
  let arrayOfFiles = [];

  async function recursiveRead(currentPath) {
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        await recursiveRead(fullPath);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
          arrayOfFiles.push(fullPath);
        }
      }
    }
  }
  await recursiveRead(directoryPath);
  return arrayOfFiles;
});

ipcMain.handle("set-project-path", async (event, projectPath) => {
  currentProjectPath = projectPath;
  console.log(currentProjectPath);
});

// To get the currentProjectPath in renderer process
ipcMain.handle("get-project-path", async () => {
  return currentProjectPath;
});

ipcMain.handle("open-projects", async (event) => {
  const directoryPath = getFolderPath("projects");

  // Ensure the 'projects' folder exists
  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });
    console.log(`Verified or created projects folder at: ${directoryPath}`);
  } catch (error) {
    console.error("Error ensuring projects folder:", error);
    return []; // Return an empty array if folder creation fails
  }
  
  let arrayOfFiles = [];

  async function readImmediateSubdirectories(currentPath) {
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = await fs.promises.stat(fullPath);

      // If it's project directory, check for 'front.png' inside it only, not in its nested folders
      if (stat.isDirectory()) {
        const frontImagePath = path.join(fullPath, "front.png");
        // Check if 'front.png' exists in the directory
        try {
          const imageStat = await fs.promises.stat(frontImagePath);
          if (imageStat.isFile()) {
            arrayOfFiles.push(frontImagePath);
          }
        } catch (err) { }
      }
    }
  }

  await readImmediateSubdirectories(directoryPath);
  return arrayOfFiles;
});

ipcMain.handle("project-folder-count", async (event) => {
  const directoryPath = getFolderPath("projects");
  let folderCount = 0;

  async function readImmediateSubdirectories(currentPath) {
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = await fs.promises.stat(fullPath);

      // If it's a directory, increment the folder count
      if (stat.isDirectory()) {
        folderCount += 1;
      }
    }
  }

  await readImmediateSubdirectories(directoryPath);
  return folderCount;
});

ipcMain.handle("open-file-scenes", async (event) => {
  const directoryPath = getFolderPath(currentProjectPath, "scene");
  let arrayOfFiles = [];

  async function recursiveRead(currentPath) {
    const files = await fs.promises.readdir(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = await fs.promises.stat(fullPath);

      if (stat.isDirectory()) {
        await recursiveRead(fullPath);
      } else {
        const ext = path.extname(fullPath).toLowerCase();
        if (ext === ".mp4") {
          arrayOfFiles.push(fullPath);
        }
      }
    }
  }
  await recursiveRead(directoryPath);
  return arrayOfFiles;
});

ipcMain.handle(
  "save-file-dialog",
  async (event, imageData, countNum, durationNum, check, frameNum) => {
    let outputFolderPath = "./";
    let folderPath;
    let count = 0;

    // if (check == false) {
    //   const folders = fs.readdirSync(outputFolderPath);
    //   folders.forEach((folder) => {
    //     if (folder.startsWith("scene_")) {
    //       count++;
    //       console.log("Matched folder:", folder);
    //     }
    //   });
    //   folderPath =
    //     outputFolderPath + "scene_" + count.toString() + "_animation";
    //   fs.mkdirSync(folderPath);
    // } else {
    //   console.log("find the frame which need to edit", frameNum);
    //   folderPath =
    //     outputFolderPath + "scene_" + frameNum.toString() + "_animation";
    //   const files = fs.readdirSync(folderPath);

    //   files.forEach((file) => {
    //     const filePath = path.join(folderPath, file);
    //     fs.unlinkSync(filePath);
    //   });
    // }

    // let outputFileName = folderPath + "/1.png";
    // let outputFileName = "./1.png";
    const outputFileName = path.join(("./input_image"), "./1.png");

    console.log("path : : : ", outputFileName);

    await fs.writeFileSync(outputFileName, imageData.split(";base64,").pop(), {
      encoding: "base64",
    });

  }
);

ipcMain.on("save-video", async (event, arrayBuffer) => {
  const videoBuffer = Buffer.from(new Uint8Array(arrayBuffer));
  const webmFilePath = path.join("./video", "video.webm");
  const mp4FilePath = path.join("./video", "video.mp4");

  const imagePath = path.join(("./input_image"), "./1.png");

  const gifPath = path.resolve('./', "video.gif");
  if (await fs.existsSync(gifPath)) {
    await fs.unlinkSync(gifPath);
  }
  if (await fs.existsSync(webmFilePath)) {
    await fs.unlinkSync(webmFilePath);
  }
  if (await fs.existsSync(mp4FilePath)) {
    await fs.unlinkSync(mp4FilePath);
  }
  // await fs.mkdir(path.dirname(webmFilePath), { recursive: true }, async(err) => {
  const filePath = path.join(getFolderPath("video"), "./video1.mp4");
  fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
    if (err) throw err;

    fs.writeFile(webmFilePath, videoBuffer, (err) => {
      if (err) throw err;
      console.log("Video saved successfully!");
      const ffmpegPath = getExePath("ffmpeg.exe");
      const command1 = `-i ${webmFilePath} -c:v libx264 ${mp4FilePath}`;

      execFile(ffmpegPath, command1.split(" "), (err, stdout, stderr) => {
        if (err) {
          console.error("FFmpeg conversion error:", err);
          return;
        }
        console.log("Video converted to MP4 successfully!");

        const exePath = ("./app.exe");
        let command;
        command = `-i ${imagePath} -v ${mp4FilePath}`;
        execFile(exePath, command.split(" "), (err, stdout, stderr) => {
          if (err) {
            console.error("Error:", err);
            return;
          }
          console.log("Output:", stdout);
          fs.watchFile('./video.gif', (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
              event.sender.send('gif-ready', gifPath);
            }
          });
        });
      });
    });
  });
});

ipcMain.on('rename-gif', (event, gifPath, email) => {
  const newGifPath = (`./${email}.gif`);

  fs.rename(gifPath, newGifPath, (err) => {
    if (err) {
      console.error('Error renaming GIF:', err);
      event.sender.send('rename-failed');
    } else {
      console.log(`GIF renamed to ${email}.gif`);
      event.sender.send('rename-success', newGifPath);
    }
  });
});

ipcMain.handle("skeleton-make", async (event) => {
  const folders = await fs.readdirSync("./");
  let count = 0;
  let durationTimes = [];
  let durationCounts = [];
  folders.forEach((folder) => {
    if (folder.startsWith("scene_")) {
      count++;
      console.log("Matched folder:", folder);
      const filePath = path.join(folder, "info.txt");
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, "utf-8");
        const firstLine = fileContents.split("\n")[0];
        const secondLine = fileContents.split("\n")[1];
        const firstLineValue = parseInt(firstLine, 10);
        const secondLineValue = parseInt(secondLine, 10);

        if (isNaN(firstLineValue)) {
          firstLineValue = 0;
        }
        if (isNaN(secondLineValue)) {
          secondLineValue = 0;
        }
        durationTimes.push(secondLineValue);
        durationCounts.push(firstLineValue);
      }
    }
  });
  console.log(count, durationTimes, durationCounts);
  return { count, durationTimes, durationCounts };
});

ipcMain.handle("check-version", async () => {
  try {
    const response = await fetch(
      "https://rmhfunncqzrridcwwquo.supabase.co/functions/v1/godot_version_api"
    );

    const apiVersion = await response.text();

    var [apiMajor, apiMinor, apiRelease] = apiVersion.split(".");

    var isSameVersion =
      metadataVersion.major === apiMajor &&
      metadataVersion.minor === apiMinor &&
      metadataVersion.release === apiRelease;

    return { isSameVersion, apiVersion };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
});


ipcMain.on("select-video", async (event) => {
  const gifPath = "video.gif";
  if (fs.existsSync(gifPath)) {
    fs.unlinkSync(gifPath);
  }
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "select video file", extensions: ["mp4"] },
    ],
  });
  if (result.canceled) {
    video = "empty";
    return;
  }
  const sourceFilePath = result.filePaths[0];
  video = sourceFilePath;
  const outputFolderPath = "./video";

  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  fs.copyFileSync(
    sourceFilePath,
    path.join(outputFolderPath, "video.mp4")
  );
  const imagePath = path.join(("./input_image"), "./1.png");
  const mp4FilePath = path.join(outputFolderPath, "video.mp4");
  const exePath = ("./video2gif.exe");
  let command;
  command = `-i ${imagePath} -v ${mp4FilePath}`;
  execFile(exePath, command.split(" "), (err, stdout, stderr) => {
    if (err) {
      console.error("Error:", err);
      return;
    }
    event.sender.send("gif-ready", gifPath);
  });
});
// bvh to gif
ipcMain.on("select-gallery", async (event, bvhPath) => {
  const gifPath = "video.gif";
  if (fs.existsSync(gifPath)) {
    fs.unlinkSync(gifPath);
  }
  console.log("bvhPath", bvhPath);
  if (fs.existsSync(bvhPath)) {
    const exePath = "image_bvh2gif.exe";
    const imagePath = "input_image/1.png";
    let command;
    command = `-i ${imagePath} -b ${bvhPath}`;

    execFile(exePath, command.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      event.sender.send("gif-ready", gifPath);
    });
  }
});
