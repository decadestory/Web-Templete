var ww, wh, renderer, scene, camera, strokes, balls;

function init() {

  ww = window.innerWidth;
  wh = window.innerHeight;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene"),
    antialias: true
  });
  renderer.setSize(ww, wh);
  renderer.setClearColor(0x1A1F2B);
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, ww / wh, 20, 10000);
  camera.position.set(0, 400, 400);
  scene.add(camera);

  var controls = new THREE.OrbitControls(camera);

  strokes = ballGeometry();
  ballsContainer = new THREE.Object3D();
  scene.add(ballsContainer);

  requestAnimationFrame(render);
  ballsContainer.add(new Ball().mesh);
  ballsContainer.add(new Ball().mesh);
  ballsContainer.add(new Ball().mesh);
  ballsContainer.add(new Ball().mesh);

  window.addEventListener("click", mouseClick);
  window.addEventListener("resize", onWindowResize);
}

function mouseClick(e){
  ballsContainer.add(new Ball().mesh);
}

function onWindowResize() {
  ww = window.innerWidth;
  wh = window.innerHeight;

  camera.aspect = ww / wh;
  camera.updateProjectionMatrix();

  renderer.setSize(ww, wh);
}

var colors = [0x30395C, 0x4A6491, 0x85A5CC , 0xD0E4F2];
function Ball() {
  var material = new THREE.LineBasicMaterial({
    color : colors[Math.floor(Math.random()*4)],
    transparent: true,
    opacity: 0
  });
  this.mesh = new THREE.LineSegments(strokes.clone(), material);
  this.mesh.position.x = (Math.random() - 0.5) * 2000;
  this.mesh.position.y = (Math.random() - 0.5) * 2000;
  this.mesh.position.z = (Math.random() - 0.5) * 2000;
  var size = Math.random() * 0.5 + 2;
  this.mesh.scale.set(size, size, size);

  this.vx = Math.random();
  this.vy = 0;
  this.vz = Math.random();

  var self = this;
  var ballAnim = new TimelineMax({
    onComplete: function() {
      ballsContainer.remove(self.mesh);
    }
  });
  ballAnim.to(self.mesh.material, 0.5, {
    opacity:0.4,
    ease : Power2.easeOut
  });
  ballAnim.to(this.mesh.position, Math.random() * 8 + 6, {
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 800,
    z: (Math.random() - 0.5) * 800,
    ease: Elastic.easeOut
  },"-=0.5")
  ballAnim.to(self.mesh.material, Math.random()*2+2, {
    opacity:0
  });

  return this;
}

function ballGeometry() {
  var planet = new THREE.Object3D();

  noise.seed(Math.random());
  var colorHue = Math.random() * 360;
  var colorRange = Math.random() * 100 + 20;
  var geometry = new THREE.Geometry();
  for (var x = 0; x < 2000; x++) {
    var lat = 2 * Math.PI * Math.random();
    var long = Math.acos(2 * Math.random() - 1);
    var u = Math.cos(long);
    var pos = {
      x: 50 * Math.sqrt(1 - (u * u)) * Math.cos(lat),
      y: 50 * Math.sqrt(1 - (u * u)) * Math.sin(lat),
      z: 50 * u
    };
    var vector = new THREE.Vector3(pos.x, pos.y, pos.z);
    vector.amount = 0;
    geometry.vertices.push(vector);
  }

  var segments = new THREE.Geometry();
  var color, perlin;
  for (var i = geometry.vertices.length - 1; i >= 0; i--) {
    var vector = geometry.vertices[i];
    for (var j = geometry.vertices.length - 1; j >= 0; j--) {
      if (vector.distanceTo(geometry.vertices[j]) < 10 && vector.amount < 10 && vector !== geometry.vertices[j]) {
        segments.vertices.push(vector);
        segments.vertices.push(geometry.vertices[j]);
        geometry.vertices[i].amount++;
        geometry.vertices[j].amount++;
      }
    }
  }

  return segments;
}

var nextBall = 600;
var prevA = 0;

function render(a) {
  requestAnimationFrame(render);

  if ((a - prevA) >= nextBall) {
    ballsContainer.add(new Ball().mesh);
    prevA = a;
  }

  ballsContainer.rotation.x += 0.002;
  ballsContainer.rotation.y += 0.002;
  ballsContainer.rotation.z += 0.002;

  renderer.render(scene, camera);
}

init();