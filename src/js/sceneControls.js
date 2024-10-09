function openSceneMenu() {
  var x = document.getElementById("sceneMenu");
  var y = document.getElementById("sceneButton");
  var a = document.getElementById("sketchMenu");
  var b = document.getElementById("sketchButton");
  x.style.display = "block";
  y.style.display = "none";
  a.style.display = "none";
  b.style.display = "block";
}

function closeSceneMenu() {
  var x = document.getElementById("sceneMenu");
  var y = document.getElementById("sceneButton");
  var z = document.getElementById("sketchMenu");

  x.style.display = "none";
  y.style.display = "block";
  z.style.display = "none";
}

function openSketchMenu() {
  var x = document.getElementById("sketchMenu");
  var y = document.getElementById("sketchButton");
  var a = document.getElementById("sceneMenu");
  var b = document.getElementById("sceneButton");

  x.style.display = "block";
  y.style.display = "none";
  a.style.display = "none";
  b.style.display = "none";
}

function closeSketchMenu() {
  var x = document.getElementById("sketchMenu");
  var y = document.getElementById("sketchButton");
  var a = document.getElementById("sceneMenu");
  var b = document.getElementById("sceneButton");

  x.style.display = "none";
  y.style.display = "block";
  a.style.display = "none";
  b.style.display = "none";
}
