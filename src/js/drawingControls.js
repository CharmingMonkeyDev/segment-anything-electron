const canvas = document.querySelector("canvas"),
  undoBtn = document.getElementById("undo"),
  redoBtn = document.getElementById("redo"),
  ctx = canvas.getContext("2d");

let isDrawing = false,
  mouseDown = false,
  selectedTool = null, // no tool selected initially
  brushWidth = 2, // default brush width set to 5
  eraserWidth = 10, // default eraser width set to 10
  selectedColor = "#000",
  scaleFactor = 1, // initial scale factor
  undoStack = [],
  redoStack = [];

const setCanvasSize = () => {
  // Determine the dimensions of the parent container
  const containerWidth = canvas.parentElement.clientWidth;
  const containerHeight = canvas.parentElement.clientHeight;

  // Set canvas resolution based on device pixel ratio
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = containerWidth * devicePixelRatio;
  canvas.height = containerHeight * devicePixelRatio;

  // Scale canvas context to account for device pixel ratio
  ctx.scale(devicePixelRatio, devicePixelRatio);
  scaleFactor = devicePixelRatio; // Update scale factor

  // Update canvas display size
  canvas.style.width = containerWidth + "px";
  canvas.style.height = containerHeight + "px";
};

function setIsDrawing(val) {
  isDrawing = val;
}
function setMouseDown(val) {
  mouseDown = val;
}

const setCanvasBackground = () => {
  // setting whole canvas background to white, so the downloaded img background will be white
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
};

window.addEventListener("load", () => {
  setCanvasSize(); // Set initial canvas size
  setCanvasBackground(); // Set initial canvas background
});

const saveState = (stack, limit) => {
  if (stack.length >= limit) {
    stack.shift();
  }
  stack.push(canvas.toDataURL());
};

const undo = () => {
  if (undoStack.length > 0) {
    saveState(redoStack, 10);
    const previousState = undoStack.pop();
    const img = new Image();
    img.src = previousState;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
};

const redo = () => {
  if (redoStack.length > 0) {
    saveState(undoStack, 10);
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
};

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
    e.preventDefault(); // Prevent the default action (if any)
  } else if (e.ctrlKey && e.key === "y") {
    redo();
    e.preventDefault(); // Prevent the default action (if any)
  }
});

const startDraw = (e) => {
  if (!selectedTool) return; // Do nothing if no tool is selected
  let xPos, yPos;
  if (e.touches && e.touches.length > 0) {
    xPos = e.touches[0].clientX; // getting current mouseX position
    yPos = e.touches[0].clientY; // getting current mouseY position
  } else {
    xPos = e.offsetX; // getting current mouseX position
    yPos = e.offsetY; // getting current mouseY position
  }
  isDrawing = true;
  mouseDown = true;
  prevMouseX = xPos; // passing current mouseX position as prevMouseX value
  prevMouseY = yPos; // passing current mouseY position as prevMouseY value
  ctx.beginPath(); // creating new path to draw
  ctx.lineWidth = selectedTool === "eraser" ? eraserWidth : brushWidth; // Set line width based on selected tool
  ctx.lineCap = "round"; // Set line cap to round for smoother lines
  ctx.lineJoin = "round"; // Set line join to round for smoother lines
  ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor; // Set stroke style based on selected tool
  ctx.fillStyle = selectedTool === "eraser" ? "#fff" : selectedColor; // Set fill style based on selected tool
  ctx.moveTo(xPos, yPos);
  saveState(undoStack, 10);
};

const drawing = (e) => {
  if (!isDrawing || !selectedTool) return; // if isDrawing is false or no tool is selected, return from here
  let xPos, yPos;
  if (e.touches && e.touches.length > 0) {
    xPos = e.touches[0].clientX; // getting current mouseX position
    yPos = e.touches[0].clientY; // getting current mouseY position
  } else {
    xPos = e.offsetX; // getting current mouseX position
    yPos = e.offsetY; // getting current mouseY position
  }

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.lineCap = "round"; // Set line cap to round for smoother lines
    ctx.lineJoin = "round"; // Set line join to round for smoother lines
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineWidth = selectedTool === "eraser" ? eraserWidth : brushWidth; // Update line width based on selected tool
    ctx.lineTo(xPos, yPos); // creating line according to the mouse pointer
    ctx.stroke(); // drawing/filling line with color
    ctx.beginPath(); // Start a new path to avoid connecting lines
    ctx.moveTo(xPos, yPos); // Move to the current mouse position
  } else if (selectedTool === "rectangle") {
    drawRect(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else {
    drawTriangle(e);
  }
};

export { canvas, startDraw, drawing, setIsDrawing, setMouseDown };
