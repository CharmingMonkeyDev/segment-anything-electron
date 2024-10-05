const {app} = require("electron");
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

function getFolderPath(folderName) {
  const folderPath =
    Is_Prod && Is_Packaged
      ? path.join(process.resourcesPath, folderName)
      : path.join(App_Path, folderName);

  return path.normalize(folderPath);
}

export {getExePath, App_Path, getFolderPath};
