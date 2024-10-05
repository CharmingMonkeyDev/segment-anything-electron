import { generateFilmstrip } from "../filmstrip";
import {
  canvas,
  drawing,
  setIsDrawing,
  setMouseDown,
  startDraw,
} from "./drawingControls";

const generateAnimation = document.querySelector(".generate-animation"),
  generateAnimationBackground = document.querySelector(
    ".generate-animation-background"
  ),
  generateOpenpose = document.querySelector(".generate-open-pose");
async function getSkeletonMakeResult() {
  
  await window.electronAPI.folderDialog();

  window.electronAPI.makeAnimation();
}
generateAnimation.addEventListener("click", () => {
  getSkeletonMakeResult();
});
generateAnimationBackground.addEventListener("click", () => {
  window.electronAPI.selectBackground();
});
generateOpenpose.addEventListener("click", () => {
  window.electronAPI.openPose();
})
console.log(canvas, "canvas");
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", drawing);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("mouseup", () => {
  setIsDrawing(false);
  setMouseDown(false); // Reset mouseDown when mouse button is released
});
canvas.addEventListener("mouseleave", () => setIsDrawing(false));
canvas.addEventListener("mouseenter", (e) => {
  if (e.buttons !== 1) return; // Only resume drawing if left mouse button is down
  startDraw(e); // Continue drawing if left mouse button is down
});
let videoFile = null;
let videoDuration = 0;
let audioFile = null;
let audioDuration = 0;
document.getElementById("video_opener").onchange = (event) => {
  videoFile = event.target.files[0];
  rangeInput.disabled = false;
  const video = document.createElement("video");
  video.onloadedmetadata = () => {
    videoDuration = video.duration;
    generateFilmstrip(videoDuration, videoFile, 20, 0, null, null);
  };
  video.src = URL.createObjectURL(videoFile);
};
document.getElementById("audio_opener").onchange = (event) => {
  audioFile = event.target.files[0];
  const audio = document.createElement("audio");
  audio.onloadedmetadata = () => {
    audioDuration = audio.duration;
    // generateAudioStrip(duration, audioFile);
  };
  audio.src = URL.createObjectURL(audioFile);
};
const rangeInput = document.getElementById("rangeInput");

const rangeValue = document.getElementById("rangeValue");

rangeInput.addEventListener("click", function (e) {
  const newValue = Math.round(
    (e.offsetX / this.offsetWidth) * (this.max - this.min) + parseInt(this.min)
  );
  this.value = newValue;
  rangeValue.innerText = this.value;
  generateFilmstrip(
    videoDuration,
    videoFile,
    (this.value / 100) * 20,
    0,
    null,
    null
  );
});

document.getElementById("mergeav")?.addEventListener("click", () => {
  mergeAV();
});
function mergeAV() {
  if (videoFile == null || audioFile == null) {
    window.electronAPI.notification("error");
  } else {
    if (videoDuration >= audioDuration) {
      window.electronAPI.executeFFmpeg(
        videoFile.path,
        audioFile.path,
        "./assets/output.mp4",
        1
      );
    } else {
      window.electronAPI.executeFFmpeg(
        videoFile.path,
        audioFile.path,
        "./assets/output.mp4",
        0
      );
    }
  }
}
const openCameraButton = document.getElementById('open-camera');
const startRecordingButton = document.getElementById('start-recording');
const stopRecordingButton = document.getElementById('stop-recording');
const videoElement = document.getElementById('video');

let mediaRecorder;
let chunks = [];

openCameraButton.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    videoElement.style.display = 'block';
    startRecordingButton.style.display = 'block';
    openCameraButton.style.display = 'none';
  } catch (error) {
    console.error('Error accessing the camera:', error);
  }
});

startRecordingButton.addEventListener('click', () => {
  mediaRecorder = new MediaRecorder(videoElement.srcObject);
  mediaRecorder.ondataavailable = (event) => {
    chunks.push(event.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/mp4' });
    
    const reader = new FileReader();
    reader.onload = () => {
        const arrayBuffer = reader.result;
        window.electronAPI.saveCamera(arrayBuffer);
        chunks = [];
    };
    reader.readAsArrayBuffer(blob);
};
  mediaRecorder.start();
  startRecordingButton.style.display = 'none';
  stopRecordingButton.style.display = 'block';
});

stopRecordingButton.addEventListener('click', () => {
  mediaRecorder.stop();
  videoElement.style.display = 'none';
  stopRecordingButton.style.display = 'none';
  startRecordingButton.style.display = 'none';
  openCameraButton.style.display = 'block';
});
