document.addEventListener("DOMContentLoaded", async () => {
  let tensorFile;
  const inputFileElement = document.getElementById('image_test_opener');
  var tmpImg;
  var segmentCanvas = document.getElementById('drawingCanvas');
  const dType = 'float32'; // Adjust according to your tensor's data type
  // const modelUrl = 'sam_vit_h_4b8939_q.onnx';
  const modelUrl = 'sam_vit_b_01ec64_q.onnx';
  const ctx = segmentCanvas.getContext('2d');
  var loading = false;
  inputFileElement.addEventListener("change", async (e) => {
    loading = true;
    var files = e.target.files;
    if (files.length < 1) {
        alert('select a file...');
        return;
    }
    var file = files[0];
    console.log(file.path);
    var reader = new FileReader();
    reader.onload = async (e) => {  
      displayImage(e.target.result,  file.path);
    };
    reader.onerror = function (error) {
        console.error('File open failed:', error);
    };
    reader.readAsDataURL(file);
  });

  async function displayImage(url, filePath) {
    // const img = document.getElementById('segment-image-source');
    // img.src = url;
  
    tmpImg = new Image();
    tmpImg.style.width = "100%";
    tmpImg.style.height = "100%";
    tmpImg.onload = async () => {
      ctx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
  
      await ctx.drawImage(tmpImg, 0, 0, segmentCanvas.width, segmentCanvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, segmentCanvas.width, 0);
      gradient.addColorStop("0", "magenta");
      gradient.addColorStop("0.5", "blue");
      gradient.addColorStop("1.0", "red");
      ctx.font = "30px Verdana";
  
      // Fill with gradient
      ctx.fillStyle = gradient;
      // Step 5: Add the "Loading" text to the canvas
      const text = 'Segment Processing...';
      ctx.fillText(text, segmentCanvas.width / 2-200, segmentCanvas.height / 2);
      segmentCanvas.removeEventListener('click', () => {
        alert("Segment Processing");
      });
      tensorFile = await window.electronAPI.generateNpyFile({filePath: filePath});
      loading = false;
      ctx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
  
      await ctx.drawImage(tmpImg, 0, 0, segmentCanvas.width, segmentCanvas.height);
      console.log("*****************************" + tensorFile + "*****************************");
  
    }
    tmpImg.src = url;
    tmpImg.onerror = (err) => {
      console.error('Image scale error:', err);
    };
  }  
  segmentCanvas.addEventListener('click', async (event) => {   
    if (!tmpImg || !tmpImg.src || loading) return;
    var params = handleImageScale(tmpImg);
    var width = params.width;
    var height = params.height;
    var samScale = params.samScale;
    var imageScaleX = tmpImg ? tmpImg.width / segmentCanvas.offsetWidth : 1;
    var imageScaleY = tmpImg ? tmpImg.height / segmentCanvas.offsetHeight : 1;
    var rect = segmentCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    ctx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
    ctx.drawImage(tmpImg, 0, 0, segmentCanvas.width, segmentCanvas.height);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    var cx = x * imageScaleX;
    var cy = y * imageScaleY;
    var click = getClick(cx, cy);
    var clicks = [click];
    var results = await window.electronAPI.runInference({
      url: modelUrl,
      clicks: clicks,
      modelScale: {
        height: height,
        width: width,
        samScale: samScale
      },
      tensorFile: tensorFile,
      dType: dType
    });

    var {data, dim0, dim1} = results;
    var maskImage = imageDataToImage(arrayToImageData(data, dim0, dim1));
    maskImage.onload = (e) => {
      ctx.drawImage(maskImage, 0, 0, segmentCanvas.width, segmentCanvas.height);
    }
  });
});

const handleImageScale = (image) => {
  // Input images to SAM must be resized so the longest side is 1024
  const LONG_SIDE_LENGTH = 1024;
  let w = image.naturalWidth;
  let h = image.naturalHeight;
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { height: h, width: w, samScale };
};

const getClick = (x, y) => {
  const clickType = 1;
  return { x, y, clickType };
};

function arrayToImageData(input, width, height) {
  const [r, g, b, a] = [0, 114, 189, 128]; // the masks's blue color
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python
    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

// Use a Canvas element to produce an image from ImageData
function imageDataToImage(imageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}