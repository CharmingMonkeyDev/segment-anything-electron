import "./css/main.css";
import "../src/StyleSheet/dialogue.css";
import "../src/StyleSheet/login.css";
import "../src/StyleSheet/tool_bar.css";
import "../src/StyleSheet/coloris.css";
import "../src/StyleSheet/Menu_bar.css";

import "./3d-draw/sketch";
import "./Logic/coloris";
import "./Logic/dialogue";
import "./Logic/login";
import "./Logic/tool_bar";
import "./Logic/menu_bar";
import "./Logic/tooltip";
import "./filmstrip";
// import "./resizer";
import "./js/animationControls";
import "./js/cubeMapControls";
import "./js/drawingControls";
import "./js/sceneControls";
import "./js/viewportControls";
import "./js/segmentControls"; 

Coloris({
  previewElement: false,
  theme: "polaroid",
  themeMode: "dark", // Set to dark mode
  alpha: false, // Disable alpha support
  swatches: [
    // Add swatches for preset colors
    "#264653",
    "#2a9d8f",
    "#e9c46a",
    "#f4a261",
    "#e76f51",
    "#d62828",
    "#023e8a",
    "#0077b6",
    "#0096c7",
    "#00b4d8",
    "#48cae4",
  ],
  format: "hex", // Set the format of the color code
  inline: false, // Display as a popover
  focusInput: true, // Focus the input when the color picker is opened
});

const rightSidebar = document.querySelector(".right-sidebar");
const toggleButton = document.getElementById("toggle-sidebar");
let isCollapsed = false;

toggleButton?.addEventListener("click", function () {
  if (isCollapsed) {
    rightSidebar.style.width = "15%";
    toggleButton.textContent = "Collapse";
  } else {
    rightSidebar.style.width = "0";
    toggleButton.textContent = "Expand";
  }
  isCollapsed = !isCollapsed;
});
