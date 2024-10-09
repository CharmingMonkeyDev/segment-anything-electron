import { canvas, ctx, plane } from "./sketch";

let undoBtn = document.getElementById("undo"),
  redoBtn = document.getElementById("redo");
let undoStack = [];
let redoStack = [];

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

function saveState() {
  if (undoStack.length >= 10) {
    undoStack.shift();
  }
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0;
}

function clearStacks() {
  undoStack = [];
  redoStack = [];
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const previousState = undoStack.pop();
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      plane.material.map.needsUpdate = true;
    };
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const nextState = redoStack.pop();
    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      plane.material.map.needsUpdate = true;
    };
  }
}

export { saveState, clearStacks };
