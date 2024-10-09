import * as THREE from "three";
import { ArcballControls } from "./ArcballControls.js";
import { GLTFLoader } from "./GLTFLoader.js";

function extractParametersFromCamera(camera) {
  let parameters = {};
  parameters.position = camera.position.clone();
  parameters.up = camera.up.clone();
  parameters.forward = camera.getWorldDirection(new THREE.Vector3());
  parameters.zoom = camera.zoom;
  parameters.fov = camera.fov;
  return parameters;
}

function applyParametersToCamera(parameters, camera) {
  camera.position.set(
    parameters.position.x,
    parameters.position.y,
    parameters.position.z
  );
  camera.up.set(parameters.up.x, parameters.up.y, parameters.up.z);
  camera.lookAt(parameters.position.clone().add(parameters.forward));
  camera.zoom = parameters.zoom;
  camera.fov = parameters.fov;
  camera.updateProjectionMatrix();
}

function init3DView(canvas) {
  var state = {};
  state.sceneElement = canvas;
  state.camera = new THREE.PerspectiveCamera(
    75,
    state.sceneElement.clientWidth / state.sceneElement.clientHeight,
    0.1,
    1000
  );
  state.renderer = new THREE.WebGLRenderer({ canvas: state.sceneElement });
  state.renderer.setClearColor(new THREE.Color(0.5, 0.5, 0.5));
  state.scene = new THREE.Scene();
  state.controls = new ArcballControls(state.camera, state.renderer.domElement);
  state.currentContent = undefined;
  state.scene.add(new THREE.AmbientLight(0x808080));
  setLightPosition(state, 0, 0, -1);

  const height = 700;

  function animate(height) {
    const width = state.sceneElement.clientWidth;
    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.render(state.scene, state.camera);
    requestAnimationFrame(() => animate(height));
  }
  animate(height);
  return state;
}

function resetCamera(state) {
  let bbox = new THREE.Box3();
  bbox.expandByObject(state.currentContent);
  const centre = bbox.min.clone().lerp(bbox.max, 0.5);
  const radius = bbox.min.distanceTo(bbox.max);
  state.camera.position.set(centre.x, centre.y, centre.z - 2 * radius);
  state.camera.up.set(0, 1, 0);
  state.camera.lookAt(centre);
  state.controls.update();
}

function updateContent(state, content) {
  if (state.currentContent) state.scene.remove(state.currentContent);
  state.currentContent = content;
  state.scene.add(state.currentContent);

  // Apply custom skeleton
  resetCamera(state);

  // Add skeleton helper
  if (content.skeleton) {
    const helper = new THREE.SkeletonHelper(content);
    helper.material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 20,
    }); // Red color
    state.scene.add(helper);
  }
}

function createBone(name, start, end) {
  const bone = new THREE.Bone();
  bone.name = name;
  bone.position.set(...start);
  const endBone = new THREE.Bone();
  endBone.position.set(...end);
  bone.add(endBone);
  return bone;
}

function loadGltf(state, path) {
  new GLTFLoader().load(path, (gltf) => {
    const model = gltf.scene;
    let skinnedMesh;
    // Adding a skeleton manually based on the provided structure
    const bones = {};
    bones["Body"] = createBone("Body", [0, -0.25, 0], [0, 0.35, 0]);
    bones["Head"] = createBone("Head", [0, 0.1, 0], [0, 0.3, 0]);

    bones["Arm.L"] = createBone("Arm.L", [0, 0.1, 0], [-0.25, 0, 0]);
    bones["Hand.L"] = createBone("Hand.L", [-0.25, 0.1, 0], [-0.25, 0, 0]);

    bones["Arm.R"] = createBone("Arm.R", [0, 0.1, 0], [0.25, 0, 0]);
    bones["Hand.R"] = createBone("Hand.R", [0.25, 0.1, 0], [0.25, 0, 0]);

    bones["Leg.L"] = createBone("Leg.L", [0, -0.25, 0], [-0.05, -0.25, 0]);
    bones["Leg.R"] = createBone("Leg.R", [0, -0.25, 0], [0.05, -0.25, 0]);

    bones["Foot.L"] = createBone("Foot.L", [-0.05, -0.5, 0], [-0.05, -0.25, 0]);
    bones["Foot.R"] = createBone("Foot.R", [0.05, -0.5, 0], [0.05, -0.25, 0]);

    // Set bone hierarchy
    setBoneHierarchy(bones);
    // Creating skeleton from bones
    const skeleton = new THREE.Skeleton(Object.values(bones));

    model.traverse((child) => {

      if (child.isSkinnedMesh) {
        child.bind(skeleton);
      }
    });

    const boneContainer = new THREE.Group();
    boneContainer.add(bones["Body"]);
    boneContainer.add(bones["Head"]);
    boneContainer.add(bones["Arm.R"]);
    boneContainer.add(bones["Hand.R"]);
    boneContainer.add(bones["Arm.L"]);
    boneContainer.add(bones["Hand.L"]);
    boneContainer.add(bones["Leg.L"]);
    boneContainer.add(bones["Foot.L"]);
    boneContainer.add(bones["Leg.R"]);
    boneContainer.add(bones["Foot.R"]);

    model.add(boneContainer);
    model.add(...Object.values(bones));
    // Assign the skeleton to the content for the helper
    model.skeleton = skeleton;
    state.bones = bones;

    updateContent(state, model);
    document.addEventListener("keydown", (event) => {
      if (event.key === "r") {
        console.log("hi");
        // Rotate Hand.R bone'
        const bone = state.bones["Hand.R"];

        if (bone) {
          bone.rotation.x += 0.1;
          bone.rotation.y += 0.1;

          bone.rotation.z += 0.1;

          state.controls.update();
          state.renderer.render(state.scene, state.camera);
        } else {
          console.error("nothing");
        }
      }
    });
  });
}

function setBoneHierarchy(bones) {
  bones["Head"].parent = bones["Body"];

  bones["Leg.L"].parent = bones["Body"];
  bones["Foot.L"].parent = bones["Leg.L"];

  bones["Arm.L"].parent = bones["Body"];
  bones["Hand.L"].parent = bones["Arm.L"];

  bones["Leg.R"].parent = bones["Body"];
  bones["Foot.R"].parent = bones["Leg.R"];

  bones["Arm.R"].parent = bones["Body"];
  bones["Hand.R"].parent = bones["Arm.R"];
}

// function addBoneLabels(state, bones) {
//   bones.forEach((bone) => {
//     const label = createTextSprite(bone.name);
//     label.position.copy(bone.position);
//     bone.add(label);
//   });
// }
function setLightPosition(state, x, y, z) {
  if (state.light) state.scene.remove(state.light);
  state.light = new THREE.DirectionalLight(0xffffff);
  state.light.position.set(x, y, z);
  state.scene.add(state.light);
}

function makeScreenshot(state, cameraParameters) {
  let camera = state.camera.clone();
  if (cameraParameters) applyParametersToCamera(cameraParameters, camera);
  state.renderer.render(state.scene, camera);
  let link = document.createElement("a");
  link.download = "screenshot.png";
  link.href = state.sceneElement.toDataURL();
  state.renderer.render(state.scene, state.camera);
  link.click();
  link.remove();
}

function getCurrentCameraParameters(state) {
  return extractParametersFromCamera(state.camera);
}

function setCurrentCameraParameters(state, parameters) {
  applyParametersToCamera(parameters, state.camera);
  state.renderer.render(state.scene, state.camera);
  state.controls.update();
}

export {
  init3DView,
  getCurrentCameraParameters,
  loadGltf,
  makeScreenshot,
  resetCamera,
  setCurrentCameraParameters,
  setLightPosition,
  updateContent,
};
