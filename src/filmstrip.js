function generateFilmstrip(
  duration,
  videoFile,
  zoomValue,
  folderNum,
  durationTimes,
  durationCounts
) {
  const timelineContainer = document.createElement("div");
  timelineContainer.classList.add("timeline-container");
  timelineContainer.classList.add("d-flex");
  timelineContainer.style.width = "max-content";

  const audiolineContainer = document.createElement("div");
  audiolineContainer.classList.add("audioline-container");
  audiolineContainer.classList.add("d-flex");
  audiolineContainer.style.width = "max-content";
  const filmstripContainer = document.getElementById("filmstrip-container");
  const containerWidth = filmstripContainer.clientWidth;

  // Calculate the interval in seconds based on the zoom value
  const intervalInSec = Math.ceil(100 / zoomValue);
  // console.log("intervalInSec", intervalInSec);
  // Calculate the number of intervals to display on the timeline
  const numIntervals =
    Math.ceil(duration / intervalInSec) || Math.ceil(containerWidth / 100);
  let totalWidth = getTotalWidth(
    numIntervals,
    duration % intervalInSec,
    intervalInSec,
    containerWidth
  );

  const intervalWidth = 100; // Width of each interval (in pixels)

  // Create the timeline bar and add it to the timeline container
  const timelineBar = document.createElement("div");
  timelineBar.style.left = "100px";
  timelineBar.classList.add("timeline-bar");
  const audiolineBar = document.createElement("div");
  audiolineBar.classList.add("audioline-bar");
  timelineBar.style.width = `${totalWidth}px`; // Adjust width as needed
  audiolineBar.style.width = `${totalWidth}px`; // Adjust width as needed
  timelineBar.style.height = "20px"; // Adjust height as needed
  // timelineBar.style.background = "#FFE079";
  timelineBar.style.marginTop = "10px";
  audiolineBar.style.height = "20px"; // Adjust height as needed
  // audiolineBar.style.background = "#FFA196";
  audiolineBar.style.marginTop = "10px";
  audiolineBar.style.marginBottom = "10px";
  if (videoFile) {
    timelineBar.style.background = "#FFE079";
    timelineBar.style.border = "none";
    audiolineBar.style.background = "#FFA196";
    audiolineBar.style.border = "none";
  }
  makeDraggableEndpoint(timelineBar, timelineContainer, true, 0); // for the timeline bar
  makeDraggableEndpoint(audiolineBar, audiolineContainer, true, 0);

  audiolineContainer.appendChild(audiolineBar);
  timelineContainer.appendChild(timelineBar);

  makeDraggableEndpoint(
    timelineBar,
    timelineContainer,
    false,
    numIntervals * 100
  ); // for the timeline bar
  makeDraggableEndpoint(
    audiolineBar,
    audiolineContainer,
    false,
    numIntervals * 100
  );

  // timelineBar.addEventListener("click", (event) => {
  //   const offsetX = event.clientX - timelineBar.getBoundingClientRect().left;
  //   removeCurrentPreview();
  //   createGreenBar(
  //     offsetX,
  //     videoFile,
  //     zoomValue,
  //     timelineBar.offsetLeft,
  //     timelineBar.offsetWidth,
  //     duration
  //   );
  // });

  const ruler = document.createElement("div");
  ruler.classList.add("ruler");
  ruler.style.display = "flex";
  ruler.style.marginTop = "0px";
  ruler.style.width = "max-content";
  // console.log("numIntervals", numIntervals);
  const rulerIntervalCount = Math.ceil(totalWidth / 100);
  // console.log("rulerIntervalCount", rulerIntervalCount);
  const rulerIntervalRemainder = totalWidth % 100;
  for (let i = 0; i < rulerIntervalCount; i++) {
    // console.log("i", i);
    const interval = document.createElement("p");
    interval.classList.add("interval");
    // Calculate the time label for each interval
    const time = i * intervalInSec;
    interval.textContent = time.toString();
    if (i == rulerIntervalCount - 1) {
      // console.log("rulerIntervalRemainder", rulerIntervalRemainder);
      interval.style.width = `${
        (intervalWidth * rulerIntervalRemainder) / intervalWidth
      }px`;
    } else {
      interval.style.width = `${intervalWidth}px`;
    }
    interval.style.fontSize = "10px"; // Set font size to 12px (adjust as needed)
    // }
    ruler.appendChild(interval);
  }

  ruler.addEventListener("click", (event) => {
    const offsetX = event.clientX - (ruler.getBoundingClientRect().left + 10); // 10 is the left padding
    removeCurrentPreview();
    createGreenBar(
      offsetX,
      videoFile,
      zoomValue,
      timelineBar.offsetLeft,
      timelineBar.offsetWidth,
      duration
    );
  });

  // Display the timeline container in the HTML document

  filmstripContainer.innerHTML = "";
  filmstripContainer.appendChild(ruler);
  if (folderNum != 0) {
    filmstripContainer.appendChild(
      skeletonContainer("Skeleton", zoomValue, durationTimes, durationCounts)
    );
  }
  filmstripContainer.appendChild(timelineContainer);

  generatePreviewFrames(duration, videoFile, zoomValue, containerWidth);
  filmstripContainer.appendChild(audiolineContainer);
}
function skeletonContainer(context, zoomValue, durationTimes, durationCounts) {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.marginTop = "-20px";
  container.classList.add("skeleton-container");
  // let length = 0;
  durationTimes.map((durationtime, i) => {
    const headBar = document.createElement("div");
    headBar.classList.add("skeleton-bar");
    headBar.style.width = `${durationtime * zoomValue + 5}px`; // Adjust width as needed
    headBar.style.height = "20px";
    headBar.style.marginTop = "10px";
    headBar.style.borderRadius = "5px";
    headBar.style.position = "relative";
    headBar.dataset.key = i;

    // const roundLeft = createRound();
    const roundRight = createRound();

    // roundLeft.style.left = "0";
    roundRight.style.right = "0";

    // headBar.appendChild(roundLeft);
    headBar.appendChild(roundRight);

    roundRight.addEventListener("click", () => {
      let imageEdit = document.querySelector(".image-edit");
      let frameCount = document.querySelector(".frame-count");
      let frameDuration = document.querySelector(".frame-duration");
      imageEdit.checked = false;
      frameCount.value = durationCounts[headBar.dataset.key];
      frameDuration.value = durationTimes[headBar.dataset.key];
      localStorage.setItem("frameNumber", headBar.dataset.key);
      // You can add any other logic you want to handle when the headBar is clicked
    });
    // headBar.appendChild(line);
    container.appendChild(headBar);
  });
  return container;
}

// Function to create a round element
function createRound() {
  const round = document.createElement("div");
  round.classList.add("round");
  round.style.width = "10px";
  round.style.height = "10px";
  round.style.background = "#000";
  round.style.borderRadius = "50%";
  round.style.position = "absolute";
  round.style.top = "50%"; // Center vertically in headBar
  round.style.transform = "translateY(-50%)"; // Center vertically in headBar
  round.style.zIndex = "1"; // Ensure round elements are above other content
  return round;
}

function makeDraggableEndpoint(bar, container, isStart, leftpoint) {
  // console.log("leftpoint", leftpoint);
  let barLeft = 0;
  let barWidth = 0;

  const endpoint = document.createElement("div");
  endpoint.classList.add("endpoint");
  endpoint.style.width = `${10}px`;
  endpoint.style.height = `${20}px`; // Match the bar's height
  // endpoint.style.backgroundColor = "black";
  // endpoint.style.position = "absolute";
  endpoint.style.zIndex = "2"; // Ensure the endpoint is above the bar
  endpoint.style.cursor = "ew-resize"; // Set cursor to resize horizontally
  endpoint.style.left = `${leftpoint}px`;

  container.appendChild(endpoint);

  let isDragging = false;
  let initialX = 0;

  endpoint.addEventListener("mousedown", (event) => {
    isDragging = true;
    initialX = event.clientX;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      barLeft = bar.offsetLeft;
      barWidth = bar.offsetWidth;
      const deltaX = event.clientX - endpoint.offsetLeft;
      const deltaX1 = event.clientX - barLeft;

      if (isStart) {
        const newWidth = barWidth - deltaX;
        const newLeft = barLeft + deltaX1;
        bar.style.width = `${newWidth}px`;
        bar.style.marginLeft = `${newLeft}px`;
        endpoint.style.left = `${endpoint.offsetLeft + deltaX}px`;
      } else {
        const newWidth = barWidth + deltaX;
        bar.style.width = `${newWidth}px`;
        endpoint.style.left = `${endpoint.offsetLeft + deltaX}px`;
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

let currentGreenBar = null;

function createGreenBar(
  offsetX,
  videoFile,
  zoomValue,
  left_point,
  updated_width,
  video_duration
) {
  const timeInSeconds = ((100 / zoomValue) * offsetX) / 100;
  if (timeInSeconds > video_duration) {
    removeCurrentPreview();
    return;
  }

  // <i class="fa-solid fa-caret-down"></i>
  const greenBar = document.createElement("i");
  greenBar.className = "fa fa-caret-down";
  greenBar.style.position = "relative";
  // greenBar.style.width = "2px"; // Adjust width as needed
  // greenBar.style.height = "30px"; // Adjust height as needed
  greenBar.style.fontSize = "30px";
  greenBar.style.width = "0px";
  greenBar.style.color = "green";
  greenBar.style.left = `${offsetX - 8.5}px`;
  greenBar.style.marginTop = "-25px";
  greenBar.style.zIndex = 1;

  const timelineContainer = document.querySelector(".ruler");
  // append child at the beginning
  timelineContainer.insertBefore(greenBar, timelineContainer.firstChild);
  // timelineContainer.appendChild(greenBar);

  // Set the current green bar
  currentGreenBar = greenBar;
  // updated_width
  // console.log("check", offsetX);
  // console.log("updated_width", updated_width);
  // console.log("in sec", ((100 / zoomValue) * offsetX) / 100);

  previewVideoImage(
    timeInSeconds,
    videoFile,
    greenBar.style.left,
    zoomValue,
    left_point
  );
}

let currentPreviewElement = null;

function previewVideoImage(
  timeInSeconds,
  videoFile,
  previewLeft,
  zoomValue,
  left_point
) {
  const videoPreview = document.createElement("video");
  videoPreview.src = URL.createObjectURL(videoFile); // Set the source of the uploaded video
  videoPreview.style.width = "30%";
  videoPreview.style.height = "20%";
  videoPreview.style.position = "absolute"; // Position the video preview absolutely
  videoPreview.style.zIndex = "1"; // Ensure the video preview is above other elements

  videoPreview.onloadedmetadata = () => {
    const seekTime = timeInSeconds;

    videoPreview.currentTime = seekTime;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = videoPreview.videoWidth / 3;
    canvas.height = videoPreview.videoHeight / 3;

    videoPreview.onseeked = () => {
      context.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL(); // This data URL can be used to display or save the image

      const imgElement = document.createElement("img");
      imgElement.src = dataURL;
      imgElement.style.width = "150px"; // Adjust size as needed
      imgElement.style.height = "auto";
      imgElement.style.marginLeft = `${
        parseInt(previewLeft) - 75 - left_point
      }px`;
      imgElement.style.marginTop = "-50px";
      imgElement.style.opacity = 0.85;
      imgElement.style.zIndex = 100;
      imgElement.style.borderRadius = "10px";

      const timelineContainer = document.querySelector(".timeline-bar");
      timelineContainer.appendChild(imgElement);

      currentPreviewElement = imgElement;
    };

    videoPreview.currentTime = seekTime;
  };
}

function removeCurrentPreview() {
  if (currentGreenBar) {
    currentGreenBar.remove();
    currentGreenBar = null;
  }

  if (currentPreviewElement) {
    currentPreviewElement.remove();
    currentPreviewElement = null;
  }
}

function generatePreviewFrames(duration, videoFile, zoomValue, containerWidth) {
  // console.log("duration", duration);
  const previewFramesContainer = document.createElement("div");
  previewFramesContainer.classList.add("preview-frames-container");

  // Calculate the interval in seconds based on the zoom value
  const intervalInSec = Math.ceil(100 / zoomValue);
  // Calculate the number of intervals to display on the timeline
  let numIntervals =
    Math.ceil(duration / intervalInSec) || Math.ceil(containerWidth / 100);
  let totalWidth = getTotalWidth(
    numIntervals,
    duration % intervalInSec,
    intervalInSec,
    containerWidth
  );
  let hasPartialFrame = duration % intervalInSec > 0;

  // width for the partial frame
  const partialFrameWidth = (100 * (duration % intervalInSec)) / intervalInSec;

  previewFramesContainer.style.width = `${totalWidth}px`;
  previewFramesContainer.style.height = `${60}px`;

  // previewFramesContainer.style.background = `#FFDFAA`;
  // dashed border
  previewFramesContainer.style.border = "1px dashed #919191";
  previewFramesContainer.style.marginTop = "10px";
  previewFramesContainer.style.paddingTop = "2px";
  previewFramesContainer.style.marginLeft = "10px";

  previewFramesContainer.style.borderRadius = "10px";
  const filmstripContainer = document.getElementById("filmstrip-container");
  filmstripContainer.appendChild(previewFramesContainer);

  captureFramesSequentially(
    videoFile,
    Array.from({ length: numIntervals }, (_, i) => i * intervalInSec),
    previewFramesContainer,
    partialFrameWidth,
    hasPartialFrame
  );
}

// get the preview frames from the video sequentially
async function captureFramesSequentially(
  videoFile,
  timeOffsets,
  container,
  partialFrameWidth = 0,
  hasPartialFrame = false
) {
  for (let i = 0; i < timeOffsets.length; i++) {
    const canvas = await captureFrame(videoFile, i, timeOffsets[i], container);
    // create image container
    const imgContainer = document.createElement("div");
    imgContainer.style.display = "inline-block";
    imgContainer.className = `preview-frame-${i}`;
    imgContainer.style.height = "60px";
    imgContainer.style.borderRadius = "10px";
    imgContainer.style.overflow = "hidden";
    if (hasPartialFrame && i == timeOffsets.length - 1) {
      imgContainer.style.width = `${partialFrameWidth}px`;
    } else {
      imgContainer.style.width = "100px";
    }

    const imgElement = document.createElement("img");
    imgElement.src = canvas.toDataURL();
    imgElement.style.width = "100px";
    imgElement.style.height = "60px";
    imgContainer.appendChild(imgElement);
    container.appendChild(imgContainer);
  }
}

// capture a frame from the video at a specific time offset
async function captureFrame(videoFile, timeOffset) {
  return new Promise((resolve, reject) => {
    // Create a canvas for each preview frame
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Create a video element for preview
    const videoPreview1 = document.createElement("video");
    if (videoFile != null) {
      videoPreview1.src = URL.createObjectURL(videoFile);
    }
    videoPreview1.controls = false; // Hide video controls
    videoPreview1.style.display = "none"; // Hide video element

    videoPreview1.onloadedmetadata = () => {
      videoPreview1.currentTime = timeOffset;
    };

    videoPreview1.onseeked = () => {
      // Ensure the canvas dimensions match the video dimensions
      canvas.width = videoPreview1.videoWidth;
      canvas.height = videoPreview1.videoHeight;
      context.drawImage(videoPreview1, 0, 0, canvas.width, canvas.height);

      // Resolve the canvas element
      resolve(canvas);
    };

    videoPreview1.onerror = (e) => {
      reject(e);
    };

    // Append the hidden video element to the document to start loading
    document.body.appendChild(videoPreview1);
  });
}

function getTotalWidth(
  numPreviewFrames,
  remainder,
  frameDuration,
  containerWidth
) {
  const totalWidth = numPreviewFrames * 100 + (remainder * 100) / frameDuration;
  if (totalWidth > containerWidth - 40) {
    return totalWidth;
  } else return containerWidth - 40;
}

export { generateFilmstrip };
