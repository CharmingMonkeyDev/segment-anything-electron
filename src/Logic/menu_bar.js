// import menuLogo from "../Icons/menu-logo.png";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-but");
  const menuOption = document.getElementById("menu-panel");
  var popup = document.getElementById("popup");
  const aboutBtns = document.getElementById("about");

  menuOption.style.display = "none";
  // menuButton.style.background = `url(${menuLogo}) no-repeat center center`;

  menuButton.addEventListener("click", () => handleButtonClick(menuOption));
  aboutBtns.addEventListener("click", () => openAboutSection());

  function openAboutSection() {
    popup.style.display = "flex";
  }

  function handleButtonClick(panel) {
    if (panel.style.display === "flex") {
      panel.style.display = "none";
    } else {
      panel.style.display = "flex";
    }
  }
});
