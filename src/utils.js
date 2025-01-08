const { app } = require("electron");
const path = require("path");

const Is_Prod = process.env.NODE_ENV === "production";
const App_Path = app.getAppPath();
const Is_Packaged = app.isPackaged;

function getExePath(exeName) {
  const exeFilePath =
    Is_Prod && Is_Packaged
      ? path.join(process.resourcesPath, "exe", exeName)
      : path.join(App_Path, "exe", exeName);

  return path.normalize(exeFilePath);
}

function getExePath1(exeName) {
  const exeFilePath =
    Is_Prod && Is_Packaged
      ? path.join(process.resourcesPath, exeName)
      : path.join(App_Path, exeName);

  return path.normalize(exeFilePath);
}

// To directly join all the paths from argument with app path
function getFolderPath(...paths) {
  const folderPath =
    Is_Prod && Is_Packaged
      ? path.join(process.resourcesPath, ...paths)
      : path.join(App_Path, ...paths);

  return path.normalize(folderPath);
}

export {getExePath, App_Path, getFolderPath, getExePath1};
