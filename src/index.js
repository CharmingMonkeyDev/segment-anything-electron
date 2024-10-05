const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Notification,
  protocol,
  net,
} = require("electron");
const { spawn } = require('child_process');

const {execFile} = require("child_process");
const path = require("node:path");
const os = require("os");
const fs = require("fs");
const {App_Path, getExePath, getFolderPath} = require("./utils");
// const ort = require("onnxruntime-node");

const ort = require('./native_module/onnxruntime-node');
import npyjs from "npyjs";

let charcter = "empty";
let background = "empty";
let sceneoutputfolderPaht = "C:/";

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
    },
  });

  mainWindow.setMenuBarVisibility(false);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
    command = `-g ./rigged.glb -l ./exe/logo.png -v ./camera/camera.mp4`;
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
      {name: "select background file", extensions: ["png", "jpg", "jpeg"]},
    ],
  });
  if (result.canceled) {
    background = "empty";
    return;
  }
  const sourceFilePath = result.filePaths[0];
  background = sourceFilePath;
  const outputFolderPath = getFolderPath("assets");

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
    if (mode == 1) {
      command = `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac ${outputPath}`;
    } else {
      command = `-i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`;
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
    filters: [{name: "PNG Images", extensions: ["png"]}],
  });

  const sourceFilePath = result.filePaths[0];
  const outputFolderPath = getFolderPath("assets");

  // Create the output folder if it doesn't exist
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
  }

  // Copy the selected file to the output folder as "front.png"
  fs.copyFileSync(sourceFilePath, path.join(outputFolderPath, parameter));

  console.log(
    `File copied successfully to ${path.join(outputFolderPath, parameter)}`
  );
  return {parameter, filePath: path.join(outputFolderPath, parameter)};
});
ipcMain.handle("open-folder-dialog", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    sceneoutputfolderPaht = "C:/";
    return {folderPath: null};
  }
  const folderPath = result.filePaths[0];
  sceneoutputfolderPaht = folderPath;
  console.log(`Folder selected: ${folderPath}`);

  // Return the selected folder path
  return {folderPath};
});
ipcMain.handle("open-file-assets", async (event) => {
  const directoryPath = getFolderPath("assets");
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

ipcMain.handle("open-character", async (event) => {
  console.log("open-character");
  const directoryPath = getFolderPath("characters");
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

ipcMain.handle("open-file-scenes", async (event) => {
  const directoryPath = getFolderPath("scene");
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

    if (check == false) {
      const folders = fs.readdirSync(outputFolderPath);
      folders.forEach((folder) => {
        if (folder.startsWith("scene_")) {
          count++;
          console.log("Matched folder:", folder);
        }
      });
      folderPath =
        outputFolderPath + "scene_" + count.toString() + "_animation";
      fs.mkdirSync(folderPath);
    } else {
      console.log("find the frame which need to edit", frameNum);
      folderPath =
        outputFolderPath + "scene_" + frameNum.toString() + "_animation";
      const files = fs.readdirSync(folderPath);

      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        fs.unlinkSync(filePath);
      });
    }

    let outputFileName = folderPath + "/1.png";

    console.log("path : : : ", outputFileName);

    await fs.writeFileSync(outputFileName, imageData.split(";base64,").pop(), {
      encoding: "base64",
    });

    const content = `${countNum}\n${durationNum}`;
    let txtFilePath = folderPath + "/info.txt";
    await fs.writeFileSync(txtFilePath, content);

    const exePath = getExePath("skeleton.exe");
    let command;
    command = `-f ${folderPath}`;
    execFile(exePath, command.split(" "), (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
        return;
      }
      console.log("Output:", stdout);
    });
  }
);

ipcMain.on("save-video", (event, arrayBuffer) => {
  const videoBuffer = Buffer.from(new Uint8Array(arrayBuffer));
  const filePath = path.join(getFolderPath("camera"), "./camera1.mp4");
  fs.mkdir(path.dirname(filePath), {recursive: true}, (err) => {
    if (err) throw err;

    fs.writeFile(filePath, videoBuffer, (err) => {
      if (err) throw err;
      console.log("Video saved successfully!");
    });
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
  return {count, durationTimes, durationCounts};
});

ipcMain.handle("verify-session", async (event, accessToken) => {
  try {
    const response = await fetch(
      "https://rmhfunncqzrridcwwquo.supabase.co/functions/v1/get-user-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return {success: true, data};
  } catch (error) {
    return {success: false, error: error.message};
  }
});

ipcMain.handle("authenticate-user", async (event, credentials) => {
  try {
    const response = await fetch(
      "https://rmhfunncqzrridcwwquo.supabase.co/functions/v1/auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();
    return {success: true, data};
  } catch (error) {
    return {success: false, error: error.message};
  }
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

    return {isSameVersion, apiVersion};
  } catch (error) {
    console.log(error);
    return {success: false, error: error.message};
  }
});

ipcMain.handle("run-onnx-inference", async (event, parameter) => {
  const {url, clicks, modelScale, tensorFile, dType} = parameter;
  const modelResourcePath = getFolderPath("models");
  const onnxUrl = path.join(modelResourcePath, url);
  const model = await ort.InferenceSession.create(onnxUrl,{ executionProviders: ['cpu'] });
  const segmentResultResourcePath = getFolderPath("segResults");
  const npyUrl = path.join(segmentResultResourcePath, tensorFile);
  if (!fs.existsSync(npyUrl)) {
    console.error('Npy file not found:', npyUrl);
    process.exit(1);
  }
  const buffer = await fs.readFileSync(npyUrl, async (err, buffer) => {
    if (err) {
        console.error('Error reading file:', err);
        return null;
    }
    // Convert Buffer to ArrayBuffer
    return buffer;
  });
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  let npyLoader = new npyjs();
  const npArray = await npyLoader.parse(arrayBuffer);
  const npyTensor = new ort.Tensor(npArray.dtype, npArray.data, npArray.shape);
  
// create a model Data

  const imageEmbedding = npyTensor;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;
  // Check there are input click prompts
  if (clicks) {
    let n = clicks.length;

    // If there is no box input, a single padding point with 
    // label -1 and coordinates (0.0, 0.0) should be concatenated
    // so initialize the array to support (n + 1) points.
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);

    // Add clicks and scale to what SAM expects
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.samScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.samScale;
      pointLabels[i] = clicks[i].clickType;
    }

    // Add in the extra point/label when only clicks and no box
    // The extra point is at (0, 0) with label -1
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

  //   // Create the tensor
    pointCoordsTensor = new ort.Tensor("float32", pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new ort.Tensor("float32", pointLabels, [1, n + 1]);
  }

  const imageSizeTensor = new ort.Tensor("float32", [
    modelScale.height,
    modelScale.width,
  ]);  
  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
    return;

  // There is no previous mask, so default to an empty tensor
  const maskInput = new ort.Tensor(
    "float32",
    new Float32Array(256 * 256),
    [1, 1, 256, 256]
  );

  // There is no previous mask, so default to 0
  const hasMaskInput = new ort.Tensor("float32", [0]);
  const data = {
    image_embeddings: imageEmbedding,
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
  const results = await model.run(data);
  const output = results[model.outputNames[0]];

  return {data: output.data, dim0: output.dims[2], dim1: output.dims[3]};
});
ipcMain.handle("generate-npy-file", async (event, parameter) => {
  const {filePath} = parameter;
  const pythonPath = getFolderPath('python'); // For Windows
  const pythonExecutablePath = path.join(pythonPath, 'generate_image_embedding.exe'); // For Windows
  // const pythonExecutable = path.join(__dirname, 'venv', 'bin', 'python'); // For macOS/Linux

  const modelPath = getFolderPath('models'); // For Windows
  // const checkpoint = path.join(modelPath, "sam_vit_h_4b8939.pth")
  const checkpoint = path.join(modelPath, "sam_vit_b_01ec64.pth")

  const segResultFolder = getFolderPath('segResults');

  const args = [
    '--checkpoint', `${checkpoint}`,
    '--input', `${filePath}`,
    '--output', `${segResultFolder}`
  ];

  if (!fs.existsSync(filePath)) {
      console.error('Input image not found:', filePath);
      process.exit(1);
  }

  if (!fs.existsSync(pythonExecutablePath)) {
    console.error('Python executable not found:', pythonExecutablePath);
    process.exit(1);
  }

  if (!fs.existsSync(checkpoint)) {
    console.error('Checkpointer not found:', checkpoint);
    process.exit(1);
  }
  // const process1 = await spawn(pythonExecutablePath, ['--input', filePath]);
// Arguments array

  // process1.stdout.on('data', (data) => {
  //   return data;
  // });
  // process1.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // process1.on('close', (code) => {
  //     console.log(`child process exited with code ${code}`);
  // });
  const result = await new Promise((resolve, reject) => {
    execFile(pythonExecutablePath, args, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
      }
  
      if (stderr) {
        console.error(`Error in script execution: ${stderr}`);
      }
  
      console.log(`Python script output: ${stdout}`);
      resolve(stdout);
      // You can further process the output here if needed
    });
  });

  return result.split('\r')[0];
});
