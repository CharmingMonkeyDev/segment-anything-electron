import data from "../tooltips.json";

document.addEventListener("DOMContentLoaded", () => {
  let currentLanguage = "en";

  function loadTooltips(language) {
    const tooltips = document.querySelectorAll(".tooltip");
    tooltips.forEach((tooltip) => {
      const key = tooltip.getAttribute("data-tooltip");
      tooltip.setAttribute("data-tooltip-text", data[language][key].text);
      tooltip.setAttribute("data-alignment", data[language][key].alignment);
    });
  }

  document.getElementById("toggle-lang").addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "ko" : "en";
    loadTooltips(currentLanguage);
  });

  loadTooltips(currentLanguage);
});
