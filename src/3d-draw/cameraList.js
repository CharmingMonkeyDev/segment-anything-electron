import cameraTexture from "./3d-assets/camera.png";
import { camera, renderer, scene } from "./sketch";
import * as THREE from "three";

let cameraList = [];
const textureLoader = new THREE.TextureLoader();

function createCameraHelperGroup(texture) {
  const group = new THREE.Group();

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
  const plane = new THREE.Mesh(planeGeometry, material);
  plane.isCameraObject = true;

  const pyramidGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    0, 0, 0, -0.3, 0.3, 0.75, 0.3, 0.3, 0.75, 0.3, -0.3, 0.75, -0.3, -0.3, 0.75,
    -0.3, 0.3, 0.75,
  ]);

  pyramidGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );
  pyramidGeometry.setIndex([0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1]);

  const pyramidWireframe = new THREE.LineSegments(
    pyramidGeometry,
    new THREE.LineBasicMaterial({ color: 0xff0000 })
  );

  group.add(plane);
  group.add(pyramidWireframe);

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const groupPosition = camera.position.clone().add(forward.multiplyScalar(2));
  group.position.copy(groupPosition);
  group.quaternion.copy(camera.quaternion);
  return { group, plane };
}

function addCameraToScene() {
  textureLoader.load(cameraTexture, function (texture) {
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const cameraHelperGroup = createCameraHelperGroup(texture);

    scene.add(cameraHelperGroup.group);
    cameraList.push(cameraHelperGroup.plane);
  });
}

export { addCameraToScene, cameraList };
