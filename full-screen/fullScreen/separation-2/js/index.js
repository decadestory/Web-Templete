var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cw = canvas.width = window.innerWidth,
  cx = cw / 2;
var ch = canvas.height = window.innerHeight,
  cy = ch / 2;
var requestId = null;
ctx.lineWidth = 1;
var hue = 210;

var rad = Math.PI / 180;
var particles = [];
var num = 140;
var maxDist = 100;

function Particle(x, y, i) {
  this.pos = new Vector(x, y);
  this.vel = new Vector(randomIntFromInterval(-2, 2), randomIntFromInterval(-2, 2));
  this.acc = new Vector(0, 0);
  this.maxSpeed = 3;
  this.maxForce = .1;
  this.r = 10;
  this.hue = hue;

  this.update = function() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  this.edges = function(i) {
    if (this.pos.x > cw + this.r) {
      this.pos.x = -this.r;
    }
    if (this.pos.y > ch + this.r) {
      this.pos.y = -this.r;
    }
    if (this.pos.x < -this.r) {
      this.pos.x = cw + this.r;
    }
    if (this.pos.y < -this.r) {
      this.pos.y = ch + this.r;
    }
  }

  this.draw = function() {

    this.hue = map(this.pos.x + this.pos.y, 0, cw, 0, 360);
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r / 2, 0, 2 * Math.PI);
    ctx.fillStyle = "hsla(" + this.hue + ", 80%,70%,1)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r * 1.8, 0, 2 * Math.PI);
    ctx.fillStyle = "hsla(" + this.hue + ", 80%,70%,.3)";
    ctx.fill();
    ctx.strokeStyle = "hsla(" + this.hue + ", 80%,50%,1)";
    ctx.stroke();
  }

  this.applyForce = function(force) {
    this.acc.add(force);
  }

  this.align = function() {
    var sum = new Vector(0, 0);
    var count = 0;
    for (var i = 0; i < particles.length; i++) {

      var d = dist(this.pos, particles[i].pos);
      if (d > 0 && d < 25) {
        sum.add(particles[i].vel);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      this.steer = sum.sub(this.vel);
      this.applyForce(this.steer);
    }
  }

  this.separate = function() {
    var desiredSeparation = this.r * 4;
    var sum = new Vector(0, 0);
    var count = 0;

    for (var i = 0; i < particles.length; i++) {

      var d = dist(this.pos, particles[i].pos);
      if (d > 0 && d < desiredSeparation) {
        var diff = this.pos.copy().sub(particles[i].pos.copy());
        diff.normalize();
        diff.div(d); // weight by distance
        sum.add(diff);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      this.steer = sum.sub(this.vel);
      this.steer.limit(this.maxForce)
      this.applyForce(this.steer);
    }
  }

}

for (var i = 0; i < num; i++) {
  var p = new Particle(Math.random() * cw, Math.random() * ch);
  particles.push(p);
}

function Draw() {
  requestId = window.requestAnimationFrame(Draw);
  
  ctx.clearRect(0, 0, cw, ch);

  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.separate()
    p.edges(i);
    p.update();
    p.draw();
    connect(i);
  }

}

var Init = function() {
  if (requestId) {
    window.cancelAnimationFrame(requestId);
    requestId = null;
  }
  cw = canvas.width = window.innerWidth,
    cx = cw / 2;
  ch = canvas.height = window.innerHeight,
    cy = ch / 2;

  Draw();
}

window.setTimeout(function() {
  Init();
  window.addEventListener('resize', Init, false);
}, 15);

function connect(i) {

  for (var j = i; j < particles.length; j++) {
    var partdist = dist(particles[i].pos, particles[j].pos);
    if (partdist < maxDist) {
      ctx.beginPath();
      ctx.moveTo(particles[i].pos.x, particles[i].pos.y);
      ctx.lineTo(particles[j].pos.x, particles[j].pos.y);
      var alp = map(partdist, 0, maxDist, 1, 0);
      ctx.strokeStyle = "hsla(" + particles[i].hue + ",80%,70%," + alp + ")";
      ctx.stroke();
    }
  }
}

function randomIntFromInterval(mn, mx) {
  return ~~(Math.random() * (mx - mn + 1) + mn);
}

function dist(p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function map(n, a, b, _a, _b) {
  var d = b - a;
  var _d = _b - _a;
  var u = _d / d;
  return _a + n * u;
}