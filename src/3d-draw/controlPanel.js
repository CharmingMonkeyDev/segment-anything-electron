import CameraControls from "camera-controls";
import { cameraControls, renderer, transformControls } from "./sketch";
import { addCameraToScene } from "./cameraList";

const moveButton = document.getElementById("move-btn");
const rotateButton = document.getElementById("rotate-btn");
const cameraButton = document.getElementById("camera-btn");

let offBgColor = "#4e4e4e",
  onBgColor = "#f9f9f9";

let isMovement = false,
  isRotate = false;

function changeBgColor() {
  moveButton.style.backgroundColor = isMovement ? onBgColor : offBgColor;
  rotateButton.style.backgroundColor = isRotate ? onBgColor : offBgColor;
}

function setIsMovement(val) {
  isMovement = val;
}

function setIsRotate(val) {
  isRotate = val;
}

function disableMovementRotate() {
  isMovement = false;
  isRotate = false;
  changeBgColor();
  updateCameraControls();
}

function togglePanelSettings(type) {
  switch (type) {
    case "movement":
      isMovement = !isMovement;
      isRotate = false;
      changeBgColor();
      transformControls.detach();
      break;
    case "rotate":
      isRotate = !isRotate;
      isMovement = false;
      changeBgColor();
      transformControls.detach();
      break;
    case "camera":
      isRotate = false;
      isMovement = false;
      changeBgColor();
      addCameraToScene();
      break;
  }
  updateCameraControls();
}

moveButton.addEventListener("click", () => {
  togglePanelSettings("movement");
});

rotateButton.addEventListener("click", () => {
  togglePanelSettings("rotate");
});

cameraButton.addEventListener("click", () => {
  togglePanelSettings("camera");
});

function updateCameraControls() {
  cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.wheel = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.middle = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.right = CameraControls.ACTION.NONE;
  cameraControls.touches.one = CameraControls.ACTION.NONE;

  if (isMovement) {
    cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
    cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    renderer.domElement.style.cursor = "grab";
    cameraControls.enabled = true;
  } else if (isRotate) {
    cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    cameraControls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    renderer.domElement.style.cursor = "grab";
    cameraControls.enabled = true;
  } else {
    cameraControls.enabled = false;
    renderer.domElement.style.cursor = "default";
  }
}

export { setIsMovement, setIsRotate, disableMovementRotate };
