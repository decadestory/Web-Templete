	if (!Detector.webgl) Detector.addGetWebGLMessage();

	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;

	var renderer, container, stats;

	var camera, scene;
	var cameraOrtho, sceneRenderTarget;

	var uniformsNoise, uniformsNormal,
	  heightMap, normalMap,
	  quadTarget;

	var directionalLight, pointLight;

	var terrain;

	var specularMap;

	var textureCounter = 0;

	var animDelta = 0,
	  animDeltaDir = -1;
	var lightVal = 0,
	  lightDir = 1;

	var clock = new THREE.Clock();

	var morph, morphs = [];

	var updateNoise = true;

	var animateTerrain = false;

	var textMesh1;
	var diffuseTexture1,
	  diffuseTexture2,
	  detailTexture;

	var pars = {
	  minFilter: THREE.LinearFilter,
	  magFilter: THREE.LinearFilter,
	  format: THREE.RGBFormat
	};


    container = document.getElementById('container');

	  // SCENE (FINAL)

	  scene = new THREE.Scene();
	  scene.fog = new THREE.Fog(0x050505, 2000, 4000);

	  // RENDERER

	  renderer = new THREE.WebGLRenderer();
	  renderer.setClearColor(scene.fog.color);
	  renderer.setPixelRatio(window.devicePixelRatio);
	  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	  renderer.shadowMap.enabled = true;
	  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	  container.appendChild(renderer.domElement);

	  //

	  renderer.gammaInput = true;
	  renderer.gammaOutput = true;


	  // SCENE (RENDER TARGET)

	  sceneRenderTarget = new THREE.Scene();

	  cameraOrtho = new THREE.OrthographicCamera(SCREEN_WIDTH / -2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / -2, -10000, 10000);
	  cameraOrtho.position.z = 100;

	  sceneRenderTarget.add(cameraOrtho);


	specularMap = new THREE.WebGLRenderTarget(2048, 2048, pars);
	specularMap.texture.generateMipmaps = false;

	var mlib = {};
	var loader = new THREE.TextureLoader();
	loader.crossOrigin = '';
	loader.load("http://crossorigin.me/http://www.radiolights.com/CODEPEN/b-grasslight-big2.jpg", function(texture) {
	  diffuseTexture1 = texture;
	  loadTextures();
	  applyShader(THREE.LuminosityShader, diffuseTexture1, specularMap);
	});

	loader.load("http://crossorigin.me/http://www.radiolights.com/CODEPEN/b-backgrounddetailed62.jpg", function(texture) {
	  diffuseTexture2 = texture;
	  loadTextures();
	});

	loader.load("http://crossorigin.me/http://www.radiolights.com/CODEPEN/b-grasslight-big-nm2.jpg", function(texture) {
	  detailTexture = texture;
	  loadTextures();
	});


	function init() {
    


	  // CAMERA

	  camera = new THREE.PerspectiveCamera(40, SCREEN_WIDTH / SCREEN_HEIGHT, 2, 4000);
	  camera.position.set(-1200, 800, 1200);
    
    console.log(camera);

	  controls = new THREE.OrbitControls(camera);
	  controls.target.set(0, 0, 0);

	  controls.rotateSpeed = 1.0;
	  controls.zoomSpeed = 1.2;
	  controls.panSpeed = 0.8;
	  controls.maxPolarAngle = 90 * Math.PI / 180;

	  controls.keys = [65, 83, 68];


	  // LIGHTS

	  scene.add(new THREE.AmbientLight(0x556380));

	  directionalLight = new THREE.DirectionalLight(0x8d4a23, 0.12);
	  directionalLight.position.set(1500, 3000, 0);
	  directionalLight.castShadow = true;
	  directionalLight.shadowCameraNear = 50;
	  directionalLight.shadowCameraFar = 10000;
	  directionalLight.shadowCameraLeft = -2000;
	  directionalLight.shadowCameraRight = 2000;
	  directionalLight.shadowCameraTop = 2000;
	  directionalLight.shadowCameraBottom = -2000;
	  directionalLight.shadowMapWidth = 1024;
	  directionalLight.shadowMapHeight = 1024;
	  //directionalLight.shadowCameraVisible = true;

	  scene.add(directionalLight);

	  pointLight = new THREE.PointLight(0x594b1d, 4, 4000);
	  pointLight.position.set(1000, 0, 0);
	  scene.add(pointLight);

	  // HEIGHT + NORMAL MAPS

	  var normalShader = THREE.NormalMapShader;

	  var rx = 256,
	    ry = 256;

	  heightMap = new THREE.WebGLRenderTarget(rx, ry, pars);
	  heightMap.texture.generateMipmaps = false;

	  normalMap = new THREE.WebGLRenderTarget(rx, ry, pars);
	  normalMap.texture.generateMipmaps = false;

	  uniformsNoise = {

	    time: {
	      type: "f",
	      value: 1.0
	    },
	    scale: {
	      type: "v2",
	      value: new THREE.Vector2(1.5, 1.5)
	    },
	    offset: {
	      type: "v2",
	      value: new THREE.Vector2(0, 0)
	    }

	  };

	  uniformsNormal = THREE.UniformsUtils.clone(normalShader.uniforms);

	  uniformsNormal.height.value = 0.05;
	  uniformsNormal.resolution.value.set(rx, ry);
	  uniformsNormal.heightMap.value = heightMap;

	  var vertexShader = document.getElementById('vertexShader').textContent;

	  // TEXTURES
	  diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
	  diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
	  detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
	  specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

	  // TERRAIN SHADER

	  var params = [
	    ['heightmap', document.getElementById('fragmentShaderNoise').textContent, vertexShader, uniformsNoise, false],
	    ['normal', normalShader.fragmentShader, normalShader.vertexShader, uniformsNormal, false],
	  ];

	  for (var i = 0; i < params.length; i++) {

	    material = new THREE.ShaderMaterial({
	      uniforms: params[i][3],
	      vertexShader: params[i][2],
	      fragmentShader: params[i][1],
	      lights: params[i][4],
	      fog: true
	    });

	    mlib[params[i][0]] = material;

	  }

	  var plane = new THREE.PlaneBufferGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);

	  quadTarget = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
	    color: 0x000000
	  }));
	  quadTarget.position.z = -500;
	  sceneRenderTarget.add(quadTarget);

	  // TERRAIN MESH

	  var geometryTerrain = new THREE.PlaneBufferGeometry(6000, 6000, 256, 256);

	  THREE.BufferGeometryUtils.computeTangents(geometryTerrain);

	  terrain = new THREE.Mesh(geometryTerrain, new THREE.MeshLambertMaterial({
	    color: 0xe2c5be,
	    map: diffuseTexture1,
	    aoMap: detailTexture,
	    lightMap: diffuseTexture1,
	  }));

	  terrain.position.set(0, -125, 0);
	  terrain.rotation.x = -Math.PI / 2;
	  terrain.visible = true;
	  terrain.receiveShadow = true;
	  scene.add(terrain);



	  // EVENTS

	  onWindowResize();

	  window.addEventListener('resize', onWindowResize, false);

	  // COMPOSER

	  renderer.autoClear = false;

	  renderTargetParameters = {
	    minFilter: THREE.LinearFilter,
	    magFilter: THREE.LinearFilter,
	    format: THREE.RGBFormat,
	    stencilBuffer: false
	  };

	  renderTarget = new THREE.WebGLRenderTarget(SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters);
	  renderTarget.texture.generateMipmaps = false;

	  effectBloom = new THREE.BloomPass(0.6);
	  var effectBleach = new THREE.ShaderPass(THREE.BleachBypassShader);

	  hblur = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
	  vblur = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);

	  var bluriness = 6;

	  hblur.uniforms['h'].value = bluriness / SCREEN_WIDTH;
	  vblur.uniforms['v'].value = bluriness / SCREEN_HEIGHT;

	  hblur.uniforms['r'].value = vblur.uniforms['r'].value = 0.5;

	  effectBleach.uniforms['opacity'].value = 0.65;

	  composer = new THREE.EffectComposer(renderer, renderTarget);

	  var renderModel = new THREE.RenderPass(scene, camera);

	  vblur.renderToScreen = true;

	  composer = new THREE.EffectComposer(renderer, renderTarget);

	  composer.addPass(renderModel);

	  composer.addPass(effectBloom);
	  //composer.addPass( effectBleach );

	  composer.addPass(hblur);
	  composer.addPass(vblur);

	  var size = 3000;
	  for (i = 0; i < 200; i += 1) {
	    addTree(-size / 2 + Math.random() * size, -size / 2 + Math.random() * size);
	  }

	  var loader = document.getElementById('loader');
	  loader.style.display = 'none';

	  var canvas = document.getElementsByTagName('canvas');
	  canvas[0].style.opacity = '1';
	}

	function addTree(x, z) {
	  var group = new THREE.Object3D();

	  // radiusAtTop, radiusAtBottom, height, segmentsAroundRadius, segmentsAlongHeight,
	  var geo = new THREE.CylinderGeometry(15, 20, 150, 6, 4);
	  var mat = new THREE.MeshPhongMaterial({
	    color: 0xe66f73,
	    shading: THREE.FlatShading
	  });

	  var shape = new THREE.Mesh(geo, mat);
	  shape.position.set(0, -50, 0);
	  shape.castShadow = true;
	  shape.receiveShadow = true;
	  group.add(shape);

	  var size = Math.round(Math.random());
	  var s = 0.3 + Math.random() * 0.7;

	  //top colors
	  var r2 = 246;
	  var g2 = 205;
	  var b2 = 118;

	  //bottom colors
	  var r1 = 253;
	  var g1 = 240;
	  var b1 = 205;

	  var l = 5 + size;

	  for (i = 0; i < l; i += 1) {

	    var r = r1 + (i / l) * (r2 - r1);
	    var g = g1 + (i / l) * (g2 - g1);
	    var b = b1 + (i / l) * (b2 - b1);

	    c = new THREE.Color(r / 255, g / 255, b / 255); //0xf6ce76;

	    // pyramid
	    var geo = new THREE.CylinderGeometry(i * 5, 50 + (i * 10), 75, 5, 5);
	    var mat = new THREE.MeshPhongMaterial({
	      color: c,
	      shading: THREE.FlatShading
	    });

	    if (i > 0) {
	      rot = -0.05 + Math.random() * 0.1;
	    } else {
	      rot = 0;
	    }

	    var shape = new THREE.Mesh(geo, mat);
	    shape.position.set(0, 150 - (i * 35), 0);
	    shape.rotation.set(rot, 0, rot);
	    shape.castShadow = true;
	    shape.receiveShadow = true;
	    group.add(shape);

	  }

	  var y = 0 - ((1 - s) * 150);
	  group.position.set(x, y, z);
	  group.scale.set(s, s, s);
	  scene.add(group);

	}

	function onWindowResize(event) {

	  SCREEN_WIDTH = window.innerWidth;
	  SCREEN_HEIGHT = window.innerHeight;

	  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	  camera.updateProjectionMatrix();

	}

	function applyShader(shader, texture, target) {

	  var shaderMaterial = new THREE.ShaderMaterial({

	    fragmentShader: shader.fragmentShader,
	    vertexShader: shader.vertexShader,
	    uniforms: THREE.UniformsUtils.clone(shader.uniforms)

	  });

	  shaderMaterial.uniforms["tDiffuse"].value = texture;

	  var sceneTmp = new THREE.Scene();

	  var meshTmp = new THREE.Mesh(new THREE.PlaneBufferGeometry(SCREEN_WIDTH, SCREEN_HEIGHT), shaderMaterial);
	  meshTmp.position.z = -500;

	  sceneTmp.add(meshTmp);

	  renderer.render(sceneTmp, cameraOrtho, target, true);

	}

	//

	function loadTextures() {

	  textureCounter += 1;
    
	  if (textureCounter == 3) {

	    init();
	    animate();

	  }

	}

	//

	function animate() {

	  requestAnimationFrame(animate);

	  render();

	}

	function render() {

	  var delta = clock.getDelta();

	  if (terrain) {

	    controls.update();

	    var time = Date.now() * 0.001;

	    var fLow = 0.1,
	      fHigh = 0.6;

	    lightVal = THREE.Math.clamp(lightVal + 0.5 * delta * lightDir, fLow, fHigh);

	    var valNorm = (lightVal - fLow) / (fHigh - fLow);

	    scene.fog.color.setHSL(2.6, 0.1, lightVal);

	    renderer.setClearColor(scene.fog.color);

	    directionalLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.1, 1.15);
	    pointLight.intensity = THREE.Math.mapLinear(valNorm, 0, 1, 0.9, 1.5);

	    if (updateNoise) {

	      animDelta = THREE.Math.clamp(animDelta + 0.00075 * animDeltaDir, 0, 0.05);

	      quadTarget.material = mlib["heightmap"];
	      renderer.render(sceneRenderTarget, cameraOrtho, heightMap, true);

	      quadTarget.material = mlib["normal"];
	      renderer.render(sceneRenderTarget, cameraOrtho, normalMap, true);
	    }

	    composer.render(0.1);
	  }

	}