window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

var c = document.createElement('canvas'),
ctx = c.getContext('2d'),
cw = c.width = window.innerWidth,
ch = c.height = window.innerHeight,
pi2 = Math.PI * 2,
rand = function(a,b){return ~~((Math.random()*(b-a+1))+a);},
things = [],
thingCount = 100,
Thing = function(i){
  this.vx = -(rand(10, 10000)/1000);
  this.vy = 0;
  this.x = rand(0, cw);
  this.y = ch/2 - Math.abs(this.vx)*8; 
  this.radius = Math.abs(this.vx*3);
  this.hue = 0;
  this.saturation = 0;
  this.lightness = 100;
  this.alpha = .65;
}

Thing.prototype = {
  update: function(){
    this.x += this.vx;
    this.y += this.vy;
    if(this.x - this.radius > cw){ this.x = -this.radius; }
    if(this.y - this.radius > ch){ this.y = -this.radius; }
    if(this.x + this.radius < 0){ this.x = cw + this.radius; }
    if(this.y + this.radius < 0){ this.y = ch + this.radius; }
  },
  render: function(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, pi2, false);  
    ctx.fillStyle = 'hsla('+this.hue+', '+this.saturation+'%, '+this.lightness+'%, '+this.alpha+')';
    ctx.fill();
  
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(1, .25);
    ctx.beginPath();
    ctx.arc(0, -this.vx*50, this.radius, 0, pi2, false);  
    ctx.fillStyle = 'hsla('+this.hue+', '+this.saturation+'%, 0%, '+this.alpha/8+')';
    ctx.fill();
    ctx.restore();
  }
}
  
var updateThings = function(){
	var i = things.length;
  while(i--){
  	things[i].update(); 
  }
}
      
var renderThings = function(){
  var i = things.length;
  while(i--){
  	things[i].render(); 
  } 
}

var loop = function(){
  requestAnimFrame(loop, c);
  ctx.clearRect(0, 0, cw, ch);
  updateThings();
  renderThings();
}
    
for(var i = 0; i < thingCount; i++){
  things.push(new Thing(i));    
}    

document.body.appendChild(c);
loop();