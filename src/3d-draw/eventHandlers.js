import { displayFrames } from "./layerList";
import {
  clearEntireCanvas,
  setSelectedTool,
  isEraser,
  renderer,
  canvas,
  userMovement,
  setUserMovement,
  createPlaneInFront,
} from "./sketch";
import { clearStacks } from "./undoredo";

let selectedColor = "#000000";
let brushWidth = 5;
let eraserWidth = 10;

let sizeSlider = document.querySelector("#size-input"),
  eraserSizeSlider = document.querySelector("#eraser-size-input"),
  colorPicker = document.querySelector("#color-input"),
  colorPicker1 = document.querySelector("#color-input-scene"),
  clearCanvas = document.querySelector(".clear-canvas"),
  clearCanvas1 = document.querySelector(".clear-canvas1"),
  saveImg1 = document.querySelector(".save-img1"),
  imageEdit = document.querySelector(".image-edit");

const toolBtns = document.querySelectorAll(".tool");
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active")?.classList.remove("active");
    btn.classList.add("active");
    setSelectedTool(btn.id);
    if (!isEraser()) {
      createPlaneInFront();
      displayFrames();
      renderer.domElement.classList.remove("eraser-cursor");
      renderer.domElement.classList.add("brush-cursor");
    } else {
      renderer.domElement.classList.remove("brush-cursor");
      renderer.domElement.classList.add("eraser-cursor");
    }
  });
});

sizeSlider.addEventListener("change", () => {
  brushWidth = sizeSlider.value;
});

eraserSizeSlider.addEventListener("change", () => {
  eraserWidth = eraserSizeSlider.value;
});

colorPicker.addEventListener("change", () => {
  selectedColor = colorPicker.value;
  colorPicker.parentElement.click();
});

colorPicker1.addEventListener("change", () => {
  selectedColor = colorPicker1.value;
  colorPicker1.parentElement.click();
});

clearCanvas.addEventListener("click", clearEntireCanvas);

clearCanvas1.addEventListener("click", clearEntireCanvas);

saveImg1?.addEventListener("click", saveCanvasImage);

// Event Listener Handlers
function saveCanvasImage() {
  let tempCanvas = document.createElement("canvas");
  let tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvas.width * 0.45;
  tempCanvas.height = canvas.height * 0.45;

  tempCtx.scale(0.45, 0.45);
  tempCtx.fillStyle = "#ffffff";
  tempCtx.fillRect(0, 0, canvas.width, canvas.height);

  tempCtx.drawImage(canvas, 0, 0);

  tempCtx.setTransform(0.45, 0, 0, 0.45, 0, 0);

  const scaledImageData = tempCanvas.toDataURL();

  const result = window.electronAPI.saveDialog(
    scaledImageData,
    0,
    0,
    false,
    null
  );
}

export { selectedColor, brushWidth, eraserWidth };
