import * as THREE from "three";
import { TransformControls } from "./transformControls.js";
import { saveState } from "./undoredo";
import "./eventHandlers";
import "./controlPanel";
import CameraControls from "camera-controls";
import { brushWidth, eraserWidth, selectedColor } from "./eventHandlers";
import { gsap } from "gsap";
import {
  addPlaneToLayerList,
  displayFrames,
  layerList,
  setSelectedLayerIdx,
} from "./layerList";
import { disableMovementRotate } from "./controlPanel";
import { cameraList } from "./cameraList.js";

CameraControls.install({ THREE: THREE });

const container = document.getElementById("myNDIV");

let scene,
  camera,
  renderer,
  plane,
  raycaster,
  mouse,
  cameraControls,
  transformControls;
let canvas, ctx;
let clock = new THREE.Clock();
let isDrawing = false;
let userMovement = false;
let selectedTool = null;
const SCALE_FACTOR = 0.5;
let prevMouseX, prevMouseY;

init();
animate();
displayFrames();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: document.getElementById("3dview"),
  });
  renderer.setSize(container?.offsetWidth, container?.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.mode = "combined";
  scene.add(transformControls);

  cameraControls = new CameraControls(camera, renderer.domElement);
  cameraControls.dampingFactor = 20;
  cameraControls.draggingDampingFactor = 200;
  cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
  cameraControls.mouseButtons.wheel = CameraControls.ACTION.ROTATE;
  cameraControls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  cameraControls.mouseButtons.right = CameraControls.ACTION.ZOOM;
  cameraControls.touches.one = CameraControls.ACTION.NONE;
  cameraControls.maxDistance = 1000;
  cameraControls.minDistance = 1.5;
  cameraControls.enabled = userMovement;

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
      cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.code === "AltLeft") {
      cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE;
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.code === "AltLeft") {
      cameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
    }
  });

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  // createPlaneInFront();

  // Event Listeners
  renderer.domElement.addEventListener("mousedown", onMouseDown);
  renderer.domElement.addEventListener("mousemove", onMouseMove);
  renderer.domElement.addEventListener("mouseup", onMouseUp);
  renderer.domElement.addEventListener("mouseleave", onMouseUp);

  window.addEventListener("resize", onWindowResize);
}

// 3d canvas handlers
function onMouseDown(event) {
  if (!userMovement && !cameraControls.enabled) {
    if (transformControls.dragging) return;
    const intersects = getIntersectedObjects(event);
    if (intersects) {
      const { type, data } = intersects;
      if (type === "plane") {
        transformControls.detach();
        plane = data.plane;
        canvas = data.canvas;
        ctx = canvas.getContext("2d");
        isDrawing = true;
        saveState();
        startDraw(event);
      }
      if (type === "camera") {
        transformControls.attach(data.parent || data);
      }
    } else {
      transformControls.detach();
    }
  }
}

function getIntersectedObjects(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.set(x, y);
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects([
    ...layerList.map((layer) => layer.plane),
    ...cameraList,
  ]);
  if (intersects.length > 0) {
    let intersect = intersects[0].object;

    while (intersect.parent) {
      if (intersect.isPlane) {
        const intersectedLayer = layerList.find(
          (layer) => layer.plane.uuid === intersect.uuid
        );
        return { type: "plane", data: intersectedLayer };
      }

      if (intersect.isCameraObject) {
        return { type: "camera", data: intersect };
      }
      intersect = intersect.parent;
    }
  }

  return null;
}

function getIntersectedPlane(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.set(x, y);
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    layerList.map((layer) => layer.plane)
  );

  const filteredIntersects = intersects.filter(
    (intersect) => intersect.object.isMesh
  );

  if (filteredIntersects.length > 0) {
    const intersect = filteredIntersects[0];
    const intersectedLayer = layerList.find(
      (layer) => layer.plane.uuid === intersect.object.uuid
    );
    return intersectedLayer;
  }

  return null;
}

function onMouseMove(event) {
  const intersectedPlane = getIntersectedPlane(event);

  layerList.forEach((layer) => {
    const cornerMarkers = layer.plane.userData.cornerMarkers;
    if (cornerMarkers) {
      if (
        intersectedPlane &&
        layer.plane.uuid === intersectedPlane.plane.uuid
      ) {
        cornerMarkers.forEach((marker) => {
          gsap.to(marker.material, { duration: 0.3, opacity: 1 });
        });
      } else {
        cornerMarkers.forEach((marker) => {
          gsap.to(marker.material, { duration: 0.3, opacity: 0 });
        });
      }
    }
  });

  if (isDrawing) {
    draw(event);
  }
}

function onMouseUp() {
  isDrawing = false;
}

function startDraw(event) {
  if (!selectedTool) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.set(x, y);
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(plane);
  const intersect = intersects.find((intersect) => intersect.object.isMesh);

  if (intersect) {
    const uv = intersect.uv;

    const x = uv.x * canvas.width;
    const y = (1 - uv.y) * canvas.height;

    if (!isDrawing) {
      prevMouseX = x;
      prevMouseY = y;
      return;
    }

    ctx.strokeStyle = isEraser() ? "#ffffff" : selectedColor;
    ctx.lineWidth = isEraser() ? eraserWidth : brushWidth * SCALE_FACTOR;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    prevMouseX = x;
    prevMouseY = y;

    plane.material.map.needsUpdate = true;
  }
}

function draw(event) {
  if (!selectedTool) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  mouse.set(x, y);

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(plane);
  const intersect = intersects.find((intersect) => intersect.object.isMesh);
  if (intersect) {
    const uv = intersect.uv;

    const x = uv.x * canvas.width;
    const y = (1 - uv.y) * canvas.height;

    if (!isDrawing) {
      prevMouseX = x;
      prevMouseY = y;
      return;
    }

    ctx.strokeStyle = isEraser() ? "#ffffff" : selectedColor;
    ctx.lineWidth = isEraser() ? eraserWidth : brushWidth * SCALE_FACTOR;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = isEraser()
      ? "destination-out"
      : "source-over";

    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();

    prevMouseX = x;
    prevMouseY = y;

    plane.material.map.needsUpdate = true;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const delta = clock.getDelta();
  let hasCameraControlsUpdated = cameraControls.update(delta);

  transformControls.setSize(
    (2 / transformControls.worldPosition.distanceTo(camera.position)) *
      Math.min((1.9 * Math.tan((Math.PI * camera.fov) / 360)) / camera.zoom, 7)
  );
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

function isEraser() {
  return selectedTool === "eraser";
}

function setSelectedTool(val) {
  selectedTool = val;
}

function clearEntireCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clearing whole canvas
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
  plane.material.map.needsUpdate = true;
}

function setUserMovement(val) {
  userMovement = val;
  cameraControls.enabled = val;
}

function createCornerMarkers(plane) {
  const segmentLength = 0.3;
  const segmentColor = 0xff0000;
  const cornerLineSegments = [];

  const corners = [
    new THREE.Vector3(
      -plane.geometry.parameters.width / 2,
      -plane.geometry.parameters.height / 2,
      0
    ),
    new THREE.Vector3(
      plane.geometry.parameters.width / 2,
      -plane.geometry.parameters.height / 2,
      0
    ),
    new THREE.Vector3(
      plane.geometry.parameters.width / 2,
      plane.geometry.parameters.height / 2,
      0
    ),
    new THREE.Vector3(
      -plane.geometry.parameters.width / 2,
      plane.geometry.parameters.height / 2,
      0
    ),
  ];

  corners.forEach((corner, index) => {
    const verticalStart = corner.clone();
    const verticalEnd = corner.clone();
    const horizontalStart = corner.clone();
    const horizontalEnd = corner.clone();

    switch (index) {
      case 0:
        verticalEnd.y += segmentLength;
        horizontalEnd.x += segmentLength;
        break;
      case 1:
        verticalEnd.y += segmentLength;
        horizontalEnd.x -= segmentLength;
        break;
      case 2:
        verticalEnd.y -= segmentLength;
        horizontalEnd.x -= segmentLength;
        break;
      case 3:
        verticalEnd.y -= segmentLength;
        horizontalEnd.x += segmentLength;
        break;
    }

    const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
      verticalStart,
      verticalEnd,
    ]);
    const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
      horizontalStart,
      horizontalEnd,
    ]);
    const material = new THREE.LineBasicMaterial({
      color: segmentColor,
      transparent: true,
      opacity: 0,
    });

    const verticalLine = new THREE.Line(verticalGeometry, material);
    const horizontalLine = new THREE.Line(horizontalGeometry, material);

    plane.add(verticalLine);
    plane.add(horizontalLine);
    cornerLineSegments.push(verticalLine, horizontalLine);
  });

  return cornerLineSegments;
}

function createPlaneInFront() {
  canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  ctx = canvas.getContext("2d");
  // ctx.fillStyle = "rgb(191, 191, 191, 0.35)";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const geometry = new THREE.PlaneGeometry(6.5, 3);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  });
  plane = new THREE.Mesh(geometry, material);
  plane.isPlane = true;
  const cornerMarkers = createCornerMarkers(plane);
  plane.userData.cornerMarkers = cornerMarkers;

  setSelectedLayerIdx(layerList.length);

  addPlaneToLayerList({ plane: plane, canvas: canvas });

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  plane.position.copy(camera.position).add(forward.multiplyScalar(1.5));

  plane.quaternion.copy(camera.quaternion);
  scene.add(plane);
}

function moveCameraToFacePlane() {
  const planePosition = new THREE.Vector3();
  const planeQuaternion = new THREE.Quaternion();

  plane.getWorldPosition(planePosition);
  plane.getWorldQuaternion(planeQuaternion);

  const newCameraPosition = planePosition
    .clone()
    .add(new THREE.Vector3(0, 0, 2).applyQuaternion(planeQuaternion));

  // Disable camera controls
  disableMovementRotate();

  gsap.to(camera.position, {
    duration: 1,
    x: newCameraPosition.x,
    y: newCameraPosition.y,
    z: newCameraPosition.z,
  });

  gsap.to(camera.quaternion, {
    duration: 1,
    x: planeQuaternion.x,
    y: planeQuaternion.y,
    z: planeQuaternion.z,
    w: planeQuaternion.w,
  });

  cameraControls.setLookAt(
    newCameraPosition.x,
    newCameraPosition.y,
    newCameraPosition.z,
    planePosition.x,
    planePosition.y,
    planePosition.z,
    true
  );
}

function setLayerPlane(idx) {
  plane = layerList[idx].plane;
  canvas = layerList[idx].canvas;
  ctx = canvas.getContext("2d");
}

export {
  brushWidth,
  eraserWidth,
  selectedColor,
  canvas,
  ctx,
  plane,
  renderer,
  cameraControls,
  userMovement,
  camera,
  scene,
  transformControls,
  setUserMovement,
  isEraser,
  clearEntireCanvas,
  setSelectedTool,
  createPlaneInFront,
  setLayerPlane,
  moveCameraToFacePlane,
};
