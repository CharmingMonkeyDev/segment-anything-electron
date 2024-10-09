import { disableMovementRotate } from "../3d-draw/controlPanel";
import {
  openCharacterDialog,
  openFileAssetsDialog,
  openCharacterOpenposeDialog,
} from "../js/viewportControls";

document.addEventListener("DOMContentLoaded", () => {
  const plusBar = document.getElementById("plus-bar");
  const assetBar = document.getElementById("asset-bar");
  const sceneBar = document.getElementById("scene-bar");
  const plusButton = document.getElementById("plus-main");
  const assetButton = document.getElementById("asset-main");
  const sceneButton = document.getElementById("scene-main");
  const brushButton = document.getElementById("brush");
  const eraserButton = document.getElementById("eraser");
  const layerButton = document.getElementById("layerButton");
  const createAssetButton = document.getElementById("createAsset");
  const galleryAssetButton = document.getElementById("galleryAsset");
  const sceneMenuButton = document.getElementById("sceneMenuButton");
  const sceneGalleryButton = document.getElementById("sceneGalleryButton");
  const motionSceneButton = document.getElementById("motionSceneButton");
  const brushProperties = document.getElementById("brush-properties");
  const eraserProperties = document.getElementById("eraser-properties");
  const layerProperties = document.getElementById("layer-properties");
  const characterButton = document.querySelector(".select-character");
  const characterOpenposeButton = document.querySelector(
    ".select-character-openpose"
  );
  const secondBruchButton = document.querySelector(".secondbrush");
  const secondEraserButton = document.querySelector(".seconderaser");
  const videoElement = document.getElementById("video-openpose");

  const createAssetProperties = document.getElementById(
    "create-asset-properties"
  );
  const galleryProperties = document.getElementById("gallery-properties");
  const sceneGalleryProperties = document.getElementById(
    "scene-gallery-properties"
  );
  const galleryCharacterProperties = document.getElementById(
    "gallery-character-properties"
  );
  const galleryCharacterOpenposeProperties = document.getElementById(
    "gallery-character-openpose-properties"
  );

  const sceneProperties = document.getElementById("scene-properties");
  const scenePropertiesButtons = document.getElementById(
    "scene-properties-buttons"
  );
  const motionSceneButtons = document.getElementById("motion-scene-buttons");

  if (plusBar && assetBar && sceneBar) {
    plusBar.style.display = "none";
    assetBar.style.display = "none";
    sceneBar.style.display = "none";
    brushProperties.style.display = "none";
    eraserProperties.style.display = "none";
    createAssetProperties.style.display = "none";
    galleryProperties.style.display = "none";
    layerProperties.style.display = "none";
    galleryCharacterProperties.style.display = "none";
    galleryCharacterOpenposeProperties.style.display = "none";
    sceneProperties.style.display = "none";
    sceneGalleryProperties.style.display = "none";
    scenePropertiesButtons.style.direction = "none";
  } else {
    console.error("One or more elements not found");
  }

  plusButton.addEventListener("click", () =>
    handleButtonClick(plusButton, plusBar)
  );
  assetButton.addEventListener("click", () =>
    handleButtonClick(assetButton, assetBar)
  );
  sceneButton.addEventListener("click", () =>
    handleButtonClick(sceneButton, sceneBar)
  );
  brushButton.addEventListener("click", () => propertiesPanel(brushButton));
  secondBruchButton.addEventListener("click", () => {
    propertiesPanel(brushButton);
  });
  // secondBruchButton.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  //   sceneProperties.style.display = "flex";
  //   galleryCharacterProperties.style.display = "none";
  //   brushProperties.style.display = "none";
  //   eraserProperties.style.display = "none";
  // });
  secondEraserButton.addEventListener("click", () =>
    propertiesPanel(eraserButton)
  );
  // secondEraserButton.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  //   sceneProperties.style.display = "flex";
  //   galleryCharacterProperties.style.display = "none";
  //   brushProperties.style.display = "none";
  //   eraserProperties.style.display = "none";
  // });
  eraserButton.addEventListener("click", () => propertiesPanel(eraserButton));
  createAssetButton.addEventListener("click", () =>
    propertiesPanel(createAssetButton)
  );
  galleryAssetButton.addEventListener("click", () => {
    openFileAssetsDialog();
    return propertiesPanel(galleryAssetButton);
  });
  characterButton.addEventListener("click", () => {
    console.log("clicked");
    openCharacterDialog();
    return propertiesPanel(characterButton);
  });
  characterOpenposeButton.addEventListener("click", () => {
    console.log("clicked");
    openCharacterOpenposeDialog();
    return propertiesPanel(characterOpenposeButton);
  });
  // characterButton.addEventListener("contextmenu", (e) => {
  //   e.preventDefault();
  //   sceneProperties.style.display = "flex";
  //   galleryCharacterProperties.style.display = "none";
  //   brushProperties.style.display = "none";
  //   eraserProperties.style.display = "none";
  // });
  sceneMenuButton.addEventListener("click", () =>
    propertiesPanel(sceneMenuButton)
  );
  sceneGalleryButton.addEventListener("click", () =>
    propertiesPanel(sceneGalleryButton)
  );
  motionSceneButton.addEventListener("click", () =>
    propertiesPanel(motionSceneButton)
  );
  layerButton.addEventListener("click", () => propertiesPanel(layerButton));

  function propertiesPanel(button) {
    if (button === brushButton) {
      motionSceneButtons.style.display = "none";
      galleryCharacterProperties.style.display = "none";
      brushProperties.style.display =
        brushProperties.style.display === "flex" ? "none" : "flex";
      eraserProperties.style.display = "none";
      layerProperties.style.display = "none";
      disableMovementRotate();
    }
    if (button === eraserButton) {
      motionSceneButtons.style.display = "none";
      galleryCharacterProperties.style.display = "none";
      brushProperties.style.display = "none";
      eraserProperties.style.display =
        eraserProperties.style.display === "flex" ? "none" : "flex";
      layerProperties.style.display = "none";
      disableMovementRotate();
    }
    if (button === layerButton) {
      brushProperties.style.display = "none";
      eraserProperties.style.display = "none";

      layerProperties.style.display =
        layerProperties.style.display === "flex" ? "none" : "flex";
    }
    if (button === createAssetButton) {
      galleryProperties.style.display = "none";
      createAssetProperties.style.display =
        createAssetProperties.style.display === "flex" ? "none" : "flex";
    }
    if (button === galleryAssetButton) {
      createAssetProperties.style.display = "none";
      galleryProperties.style.display =
        galleryProperties.style.display === "flex" ? "none" : "flex";
    }
    if (button === characterButton) {
      sceneProperties.style.display = "none";
      brushProperties.style.display = "none";
      eraserProperties.style.display = "none";
      galleryCharacterProperties.style.display =
        galleryCharacterProperties.style.display === "flex" ? "none" : "flex";
    }
    if (button === characterOpenposeButton) {
      console.log("hi");
      galleryCharacterOpenposeProperties.style.display =
        galleryCharacterOpenposeProperties.style.display === "flex"
          ? "none"
          : "flex";
    }
    if (button === sceneMenuButton) {
      sceneGalleryProperties.style.display = "none";
      motionSceneButtons.style.display = "none";
      scenePropertiesButtons.style.display =
        scenePropertiesButtons.style.display === "flex" ? "none" : "flex";
    }
    if (button === sceneGalleryButton) {
      motionSceneButtons.style.display = "none";
      scenePropertiesButtons.style.display = "none";

      sceneGalleryProperties.style.display =
        sceneGalleryProperties.style.display === "flex" ? "none" : "flex";
    }
    if (button === motionSceneButton) {
      sceneGalleryButton.style.display = "none";
      scenePropertiesButtons.style.display = "none";
      sceneGalleryProperties.style.display = "none";
      motionSceneButtons.style.display =
        motionSceneButtons.style.display === "flex" ? "none" : "flex";
    }
  }

  function handleButtonClick(button, bar) {
    const bars = [plusBar, assetBar, sceneBar];
    const panels = [
      brushProperties,
      eraserProperties,
      createAssetProperties,
      galleryProperties,
      // sceneProperties,
      scenePropertiesButtons,
      sceneGalleryProperties,
      galleryCharacterProperties,
      galleryCharacterOpenposeProperties,
      layerProperties,
    ];
    const buttons = [
      plusButton,
      assetButton,
      sceneButton,
      brushButton,
      eraserButton,
    ];

    if (bar.style.display === "flex") {
      bar.style.display = "none";
      button.classList.remove("clicked");
    } else {
      bars.forEach((b) => (b.style.display = "none"));
      panels.forEach((b) => (b.style.display = "none"));
      buttons.forEach((b) => b.classList.remove("clicked"));
      bar.style.display = "flex";
      button.classList.add("clicked");
    }

    // Hide properties panel when clicking plus, asset, or scene button
    if (
      button === plusButton ||
      button === assetButton ||
      button === sceneButton
    ) {
      brushProperties.style.display = "none";
      eraserProperties.style.display = "none";
      sceneGalleryButton.style.display = "flex";
      createAssetProperties.style.display = "none";
      galleryProperties.style.display = "none";
      motionSceneButtons.style.display = "none";
      scenePropertiesButtons.style.display = "none";
      sceneGalleryProperties.style.display = "none";
      galleryCharacterProperties.style.display = "none";
      galleryCharacterOpenposeProperties.style.display = "none";
      layerProperties.style.display = "none";
      videoElement.style.display = "none";
    }
  }
});
