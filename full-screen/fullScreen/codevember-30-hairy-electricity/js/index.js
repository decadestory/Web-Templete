var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,
    mouseX = 0,
    mouseY = 0,
    windowHalfX = SCREEN_WIDTH / 2,
    windowHalfY = SCREEN_HEIGHT / 2,
    SEPARATION = 50,
    AMOUNTX = 50,
    AMOUNTY = 50,
    camera, scene, renderer;

var lines, line, particles, particle, count = 0;

init();
animate();

function init() {
    var container, separation = 1000,
        amountX = 100,
        amountY = 100;
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1000);
    camera.position.z = 700;
    camera.position.y = 400;
    scene = new THREE.Scene();
    particles = new Array();
    lines = new Array();
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild(renderer.domElement);
    // particles
    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial({
        color: 0xfefefe,
        program: function(context) {
            context.beginPath();
            context.arc(0, 0, 0.3, 0, PI2, true);
            context.fill();
        }
    });

    for (var i = 0; i < 1500; i++) {
        posX = -1 + Math.random() * 2;
        posY = -1 + Math.random() * 2;
        posZ = -1 + Math.random() * 2;
        
        particle = particles[i++] = new THREE.Sprite(material);
        particle.position.x = posX;
        particle.position.y = posY;
        particle.position.z = posZ;
        particle.position.normalize();
        particle.position.multiplyScalar(Math.random() * 10 + 450);
        particle.scale.multiplyScalar(2);
        
        scene.add(particle);

        geometry = new THREE.Geometry();

        vertex = new THREE.Vector3(
            posX,
            posY,
            posZ
        );
        vertex.normalize();
        vertex.multiplyScalar(450);
        geometry.vertices.push(vertex);
        
        vertex2 = vertex.clone();
        vertex2.multiplyScalar(Math.random() * 1 + 2);
        geometry.vertices.push(vertex2);

        line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
            color: 0xf45383,
            linewidth: Math.random() * (1.2 - 0.1) + 0.1,
            opacity: Math.random() * (.9 - 0.1) + 0.1
        }));
        line.scale.multiplyScalar(-.3);

        scene.add(line);
    }

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    var i = 0;
    for (var i = 0; i < 1500; i++) {
        particle = particles[i++];
        particle.position.z = (Math.sin((i + count) * 0.7) * 40) + (Math.sin((i + count) * 0.2) * 60);
        particle.scale.x = particle.scale.y = (Math.sin((i + count) * 0.3) + 1) * 4 + (Math.sin((i + count) * 0.5) + 1) * 4;
    }
    camera.position.x += (camera.position.x) * .05;
    camera.position.y += (100 - camera.position.y) * .05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    count += 0.1;
}