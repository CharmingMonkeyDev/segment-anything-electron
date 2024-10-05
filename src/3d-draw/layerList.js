import { moveCameraToFacePlane, scene, setLayerPlane } from "./sketch";

let layerList = [];
let selectedLayerIdx = 0;

function setSelectedLayerIdx(val) {
  selectedLayerIdx = val;
}

function addPlaneToLayerList(planeObj) {
  let newLayerObj = { ...planeObj, visible: true };
  if (layerList.length === 0) {
    newLayerObj.id = 1;
  } else {
    newLayerObj.id = layerList[layerList.length - 1].id + 1;
  }
  layerList.push(newLayerObj);
}

async function displayFrames() {
  const frameListdiv = document.getElementById("framelist");
  frameListdiv.innerHTML = "";
  if (layerList.length === 0) {
    frameListdiv.innerHTML = "Click on brush Icon to create Layer";
  }
  layerList.forEach((frame, index) => {
    const div = document.createElement("div");
    div.classList.add("framelistdiv");

    const input = document.createElement("input");
    input.type = "radio";
    input.id = `frame_${index + 1}`;
    input.name = "select_frame";
    input.value = `Frame ${index + 1}`; // assuming frame is a string or can be converted to string
    input.classList.add("customradio");
    if (index === selectedLayerIdx) {
      input.checked = true;
    }

    input.addEventListener("click", () => {
      if (input.checked) {
        selectedLayerIdx = index;
        setLayerPlane(index);
        moveCameraToFacePlane();
      }
    });

    const label = document.createElement("label");
    label.htmlFor = `frame_${index + 1}`;
    label.innerText = `Frame ${frame.id}`; // set the label text to frame

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
    deleteBtn.addEventListener("click", () => {
      if (layerList.length > 1) {
        const removedFrame = layerList.splice(index, 1)[0];
        if (removedFrame && removedFrame.plane) {
          scene.remove(removedFrame.plane);
          if (removedFrame.backgroundPlane) {
            scene.remove(removedFrame.backgroundPlane);
          }
        }
        if (index === selectedLayerIdx) {
          selectedLayerIdx = 0;
          setLayerPlane(selectedLayerIdx);
          moveCameraToFacePlane();
        }
        displayFrames();
      }
    });

    const visibilityBtn = document.createElement("button");
    visibilityBtn.innerHTML = frame.visible
      ? '<i class="fa fa-eye"></i>'
      : '<i class="fa fa-eye-slash"></i>';
    visibilityBtn.addEventListener("click", () => {
      frame.visible = !frame.visible;
      frame.plane.visible = frame.visible;
      if (frame.backgroundPlane) {
        frame.backgroundPlane.visible = frame.visible;
      }
      visibilityBtn.innerHTML = frame.visible
        ? '<i class="fa fa-eye"></i>'
        : '<i class="fa fa-eye-slash"></i>';
    });

    div.appendChild(input);
    div.appendChild(label);
    div.appendChild(deleteBtn);
    div.appendChild(visibilityBtn);

    frameListdiv.appendChild(div);
  });
}

export {
  selectedLayerIdx,
  layerList,
  addPlaneToLayerList,
  setSelectedLayerIdx,
  displayFrames,
};
