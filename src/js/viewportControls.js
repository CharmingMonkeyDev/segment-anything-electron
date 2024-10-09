import { generateFilmstrip } from "../filmstrip";

document.addEventListener("DOMContentLoaded", () => {
  const filmstripContainer = document.getElementById("filmstrip-container");
  const containerWidth = filmstripContainer.clientWidth - 140;
  const duration = containerWidth / 20; // 100 pixels per second
  generateFilmstrip(duration, null, 20, 0, null, null);
});
// var button = document.getElementsByClassName('tab-button'),
//    tabContent = document.getElementsByClassName('tab-content');
// button[0]?.classList.add('active');
// tabContent[0].style.display = 'block';

function city(e, city) {
  var i;
  for (i = 0; i < button.length; i++) {
    tabContent[i].style.display = "none";
    button[i].classList.remove("active");
  }
  document.getElementById(city).style.display = "block";
  e.currentTarget.classList.add("active");
}

document.querySelectorAll(".display-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.getAttribute("data-view");
    openFileDialog(`${view}.png`);
  });
});
async function openFileDialog(param) {
  const result = await window.electronAPI.fileDialog(param);
}

async function openFileAssetsDialog() {
  closeFileAssetsDialog();
  const result = await window.electronAPI.fileAssetsDialog();
  const assetGallery = document.getElementById("assetGallery");
  assetGallery.innerHTML = ""; // Clear existing images

  const isWindows = await window.electronAPI.isWindows();

  result.forEach((assetPath) => {
    // Convert backslashes to forward slashes for URL
    assetGallery.innerHTML += `
      <div class="gallery-image">
        <img src="resource:${isWindows ? "\\\\" : "//"}${assetPath}">
      </div>`;
  });
}

async function closeFileAssetsDialog() {
  document.getElementById("assetGallery").innerHTML = "";
}

async function openCharacterDialog() {
  closeCharacterDialog();
  const result = await window.electronAPI.characterDialog();
  var totalAssetsCount = result.length;
  var characterGallery = document.getElementById("characterGallery");
  characterGallery.innerHTML = "";
  const isWindows = await window.electronAPI.isWindows();
  for (let count = 0; count < totalAssetsCount; count++) {
    var div = document.createElement("div");
    div.className = "gallery-character-image";
    div.innerHTML =
      `<img src="resource:${isWindows ? "\\\\" : "//"}` +
      result[count] +
      '" style="width:100px; height:100px;">';

    div.addEventListener("click", function () {
      document.querySelectorAll(".gallery-character-image").forEach((item) => {
        item.classList.remove("selected");
      });
      this.classList.add("selected");
      let path = result[count].replace("front.png", "final.glb");
      console.log("Clicked item index:", path);
      // localStorage.setItem("characterPath", path);
      window.electronAPI.sendCharacterPath(path);
    });

    characterGallery.appendChild(div);
  }
}

async function closeCharacterDialog() {
  document.getElementById("characterGallery").innerHTML = "";
}
async function openCharacterOpenposeDialog() {
  closeCharacterOpenposeDialog();
  const result = await window.electronAPI.characterDialog();
  var totalAssetsCount = result.length;
  var characterOpenposeGallery = document.getElementById(
    "characterOpenposeGallery"
  );
  characterOpenposeGallery.innerHTML = "";
  console.log(result);
  for (let count = 0; count < totalAssetsCount; count++) {
    var div = document.createElement("div");
    div.className = "gallery-character-openpose-image";
    div.innerHTML =
      '<img src="' + result[count] + '" style="width:100px; height:100px;">';

    div.addEventListener("click", function () {
      document
        .querySelectorAll(".gallery-character-openpose-image")
        .forEach((item) => {
          item.classList.remove("selected");
        });
      this.classList.add("selected");
      let path = result[count].replace("front.png", "final.glb");
      console.log("Clicked item index:", path);
      // localStorage.setItem("characterPath", path);
      window.electronAPI.sendCharacterPath(path);
    });

    characterOpenposeGallery.appendChild(div);
  }
}
async function closeCharacterOpenposeDialog() {
  document.getElementById("characterOpenposeGallery").innerHTML = "";
}

async function openFileScenesDialog() {
  const result = await window.electronAPI.fileAssetsDialog();
  var totalAssetsCount = result.length;
  var count = 0;
  while (count < totalAssetsCount) {
    document.getElementById("sceneGallery").innerHTML +=
      '<div class="gallery"> <img src="' +
      result[count] +
      '" style="width:600 height:400"> </div>';
    count++;
  }
}

async function closeFileScenesDialog() {
  document.getElementById("sceneGallery").innerHTML = "";
}

// function hideViewport() {
//   var x = document.getElementById("myDIV");
//   var y = document.getElementById("myNDIV");

//   x.style.display = "block";
//   y.style.display = "none";
// }

// function openViewport() {
//   var x = document.getElementById("myDIV");
//   var y = document.getElementById("myNDIV");

//   x.style.display = "none";
//   y.style.display = "block";
// }
export {
  openFileAssetsDialog,
  openCharacterDialog,
  openCharacterOpenposeDialog,
};
