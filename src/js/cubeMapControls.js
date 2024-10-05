function openCubeMap() {
  var x = document.getElementById("cubemap");
  var y = document.getElementById("cubemapButton");

  x.style.display = "block";
  y.style.display = "none";
}

function closeCubeMap() {
  var x = document.getElementById("cubemap");
  var y = document.getElementById("cubemapButton");

  x.style.display = "none";
  y.style.display = "block";
}
