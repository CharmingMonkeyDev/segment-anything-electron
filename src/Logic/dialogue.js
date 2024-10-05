// const { shell } = require('electron');
document.addEventListener("DOMContentLoaded", function () {
  var popup = document.getElementById("popup");
  var closeButton = document.getElementById("close-button");
  var currentVersion = document.getElementById("currentversion");
  var versionMessage = document.getElementById("version-message");
  var updateButton = document.getElementById("update-button");

  updateButton.style.display = "none";
  // Close the popup when the close button is clicked
  closeButton.addEventListener("click", function () {
    popup.style.display = "none";
  });

  //   // Function to fetch version from API and compare with metadata version
  //   function checkVersion() {
  //     fetch(
  //       "https://rmhfunncqzrridcwwquo.supabase.co/functions/v1/godot_version_api"
  //     )
  //       .then((response) => response.text())
  //       .then((apiVersion) => {
  //         var [apiMajor, apiMinor, apiRelease] = apiVersion.split(".");

  //         var isSameVersion =
  //           metadataVersion.major === apiMajor &&
  //           metadataVersion.minor === apiMinor &&
  //           metadataVersion.release === apiRelease;

  //       })
  //       .catch((error) => {
  //         versionMessage.textContent = `Error checking version: ${error}`;
  //       });

  (async () => {
    const { isSameVersion, apiVersion } =
      await window.electronAPI.checkVersion();

    if (!isSameVersion) {
        versionMessage.textContent = `A new version is available: ${apiVersion}`;
        updateButton.style.display = "flex";
        // Show the popup when the application starts
        //popup.style.display = "flex";
    }
  })();

  // Redirect to update URL when update button is clicked
  updateButton.addEventListener("click", function () {
    window.open("https://www.yusha.ai/", "_blank"); // Replace with your update URL
  });
});
