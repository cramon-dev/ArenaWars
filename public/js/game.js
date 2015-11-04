var scene, socket, camera, renderer, controls, container, axes, axesContainer, axisScene, axisCamera, axisRenderer, username;
var WIDTH = 1600;
var HEIGHT = 900;
var AXIS_CAM_DISTANCE = 300;
var AXIS_CAM_WIDTH = 200;
var AXIS_CAM_HEIGHT = 200;
var keyState = {};

Physijs.scripts.worker = '../js/libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';

function updateStatusMessage(data) {
    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.style.width = 400;
    text2.style.height = 400;
    text2.style.color = '0xFFFFFF';
    text2.innerHTML = data.text;
    text2.style.top = 200 + 'px';
    text2.style.left = 200 + 'px';
    document.body.appendChild(text2);
}

function init(name) {
    username = name.value;
    socket = io.connect('/');
    socket.on('statusMessage', updateStatusMessage);

	scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -50, 0));
    axisScene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.x = -200;
	camera.position.y = 200;
	camera.position.z = 50;
	camera.lookAt(scene.position);
    camera.addEventListener('collision', cameraCollision);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0x333F47, 1);	

	// Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function() {
    	var newWidth = window.innerWidth;
    	var newHeight = window.innerHeight;
		renderer.setSize(newWidth, newHeight);
		camera.aspect = newWidth / newHeight;
		camera.updateProjectionMatrix();
    });

    var light = new THREE.PointLight(0xFFFFFF);
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.noPan = true;

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    // Old plane code
    // var plane = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), material);
    // plane.rotation.x = 90 * (Math.PI / 180);
    // plane.position.y = -10;
    // plane.name = 'terrain';
    // scene.add(plane);

    addPlayerAndTerrain();

    setupKeyControls();
    initAxesCam(); // Use this to create a camera that 

  //   var loader = new THREE.JSONLoader();
  //   loader.load("../js/assets/models/deformity.json", function(geometry) {
  //       var mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
  //       mesh.name = 'player';
  //       scene.add(mesh);
  //   	// // var material = new THREE.MeshPhongMaterial({color:0x0099AF});
  //   	// var material = new THREE.MeshNormalMaterial();
  //   	// mesh = new THREE.Mesh(geometry, material);
  //   	// console.log('Model loaded');
  //   	// scene.add(mesh);

		// // var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
		// // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, map: texture} );
		// // var plane = new THREE.Mesh( geometry, material );
		// // scene.add( plane );

		// // // var material = new THREE.MeshPhongMaterial({color:0x0099AF});
		// // THIS MIGHT NOT BE WORKING BECAUSE I SHOULD APPLY THE TEXTURE IN BLENDER
		// // AS IN, I NEED TO MAP UVs MYSELF AND ADD THE TEXTURE TO THE MODEL BEFORE EXPORTING FROM BLENDER
  //   	// var material = new THREE.MeshLambertMaterial({map:texture});
  //   	// mesh = new THREE.Mesh(geometry, material);
  //   	// console.log('Model loaded');
  //   	// scene.add(mesh);

  //       setupKeyControls();
  //       initAxesCam();
  //   }, null);
}

function initAxesCam() {
    axesContainer = document.getElementById('inset');

    axisRenderer = new THREE.WebGLRenderer();
    axisRenderer.setClearColor(0xFFFFFF, 0);
    axisRenderer.setSize(AXIS_CAM_WIDTH, AXIS_CAM_HEIGHT);
    axesContainer.appendChild(axisRenderer.domElement);

    axisScene = new THREE.Scene();

    axisCamera = new THREE.PerspectiveCamera(50, AXIS_CAM_WIDTH / AXIS_CAM_HEIGHT, 1, 1000);
    axisCamera.up = camera.up;

    axes = new THREE.AxisHelper(100);
    axisScene.add(axes);
}

function addPlayerAndTerrain() {
    // var terrainTexture = new THREE.MeshLambertMaterial({
    //     map: THREE.ImageUtils.loadTexture('../js/assets/textures/terrain.png'),  // specify and load the texture
    //     colorAmbient: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    //     colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    //     colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
    // });

    var terrainTexture = new THREE.MeshLambertMaterial({ color: 0xCDCDCD });

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/terrain.json", function(geometry) {
        // Physics objects
        var boxMaterial = Physijs.createMaterial(
            new THREE.MeshNormalMaterial(),
            0, // Friction
            0 // Restitution/bounciness
        );

        box = new Physijs.BoxMesh(
            new THREE.CubeGeometry(15, 15, 15),
            boxMaterial
        );

        box.name = 'player';
        box.position.y = 200;
        box.position.x = -150;
        box.rotation.z = 90;
        box.rotation.y = 50;
        scene.add(box);

        var box2Material = Physijs.createMaterial(
            new THREE.MeshBasicMaterial({
                color: 0xAF0000
            }),
            0,
            0
        );

        box2 = new Physijs.BoxMesh(
            new THREE.CubeGeometry(15, 15, 15),
            box2Material
        );

        box2.name = 'evilbox';
        box2.position.y = 40;
        box2.position.x = 10
        box2.rotation.z = 90;
        box2.rotation.y = 50;
        // scene.add(box2);

        // Add ground
        var ground = new Physijs.BoxMesh(
            geometry,
            terrainTexture,
            0
        );

        ground.position.y = -25;
        ground.name = 'ground';
        ground.scale.x = 250;
        ground.scale.y = 250;
        ground.scale.z = 250;
        ground.position.y = -200;
        scene.add(ground);

        // var ground;// = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

        // ground = new Physijs.BoxMesh(
        //     new THREE.CubeGeometry(150, 5, 150),
        //     new THREE.MeshBasicMaterial(),
        //     0
        // );

        // ground.name = 'ground';
        // ground.position.y = -25;
        // scene.add(ground);

        box.addEventListener('collision', boxCollision);

        socket.emit('searchForMatch', { id: 1093249, username: username });

        animate();
    }, "../js/assets/textures/texturev1.png");
}

function boxCollision(otherObj, relativeVelocity, relativeRotation, contactNormal) {
    if(otherObj.name == 'ground') {
        console.log('Ground collision');
    }
    else if(otherObj.name == 'evilbox') {
        console.log('An evil box!');
    }
}

function cameraCollision(otherObj, relativeVelocity, relativeRotation, contactNormal) {
    if(otherObj.name == 'ground') {
        console.log('Camera has collided with the ground');
    }
}

function animate() {
	requestAnimationFrame(animate);
    scene.simulate();

    // update();
    controls.update();

    var player = scene.getObjectByName('player');

    // var relativeCameraOffset = new THREE.Vector3(0,50,200);
    // var cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);

    // camera.position.x = cameraOffset.x;
    // camera.position.y = cameraOffset.y;
    // camera.position.z = cameraOffset.z;
    camera.lookAt(player.position);

    gameLoop();
    render();
}

function render() {
    // axisCamera.position.copy(camera.position);
    // axisCamera.position.sub(controls.target);
    // axisCamera.position.setLength(AXIS_CAM_DISTANCE);
    // axisCamera.lookAt(axisScene.position);

    renderer.render(scene, camera);
    // axisRenderer.render(axisScene, axisCamera);
    // camera.lookAt(player.position);
}

function gameLoop() {
    detectMovement();
    detectSkillUse();

    // Disable controls until player finishes typing in text box?
    if(keyState[84]) {
        console.log('bring up text box');
    }
}


// Game loop functions

function detectMovement() {
    var player = scene.getObjectByName('player');
    var oldPosition = { position: player.position, rotation: player.rotation };
    
    if (keyState[65]) {
        // A - Turn left
        player.__dirtyRotation = true;
        player.rotation.y += 0.10;
    }

    if (keyState[68]) {
        // D - Turn right
        player.__dirtyRotation = true;
        player.rotation.y -= 0.10;
    }
    
    if (keyState[87]) {
        // W - Move forward
        player.__dirtyPosition = true;
        player.position.x += 1;
    }
    
    if (keyState[83]) {
        // S - Move backward
        player.__dirtyPosition = true;
        player.position.x -= 0.75;
    }

    if(keyState[81]) {
        // Q - Strafe left
        player.__dirtyPosition = true;
        player.position.z -= 0.85;
    }

    if(keyState[69]) {
        // E - Strafe right
        player.__dirtyPosition = true;
        player.position.z += 0.85;
    }

    var newPosition = { position: player.position, rotation: player.rotation };

    if(oldPosition.position != newPosition.position || oldPosition.rotation != newPosition.rotation) {
        console.log('Player moved');
        socket.emit('playerMoved', { oldPosition: oldPosition, newPosition: newPosition });
    }
}

function detectSkillUse() {
    var player = scene.getObjectByName('player'); // Make player invisible for testing purposes
    var skillUsed;

    if(keyState[49]) {
        skillUsed = 'weap_1';
        player.visible ? player.visible = false : player.visible = true;
        console.log(player.visible);
    }

    if(keyState[50]) {
        skillUsed = 'weap_2';
    }
    
    if(keyState[51]) {
        skillUsed = 'weap_3';
    }
    
    if(keyState[52]) {
        skillUsed = 'heal';
    }

    if(keyState[53]) {
        skillUsed = 'classAbility_1';
    }

    if(keyState[54]) {
        skillUsed = 'classAbility_2';
    }

    if(keyState[70]) {
        skillUsed = 'classMechanic_1';
    }

    // These four only used by sorcerer
    if(keyState[82]) {
        skillUsed = 'classMechanic_2';
    }

    if(keyState[84]) {
        skillUsed = 'classMechanic_3';
    }

    if(keyState[71]) {
        skillUsed = 'classMechanic_4';
    }

    if(keyState[72]) {
        skillUsed = 'classMechanic_5';
    }


    if(skillUsed) {
        socket.emit('playerUseSkill', { skill: skillUsed });
    }
}


// Set up key event handlers
function setupKeyControls() {
    window.addEventListener('keydown', function(e) {
        keyState[e.keyCode || e.which] = true;
    }, true);

    window.addEventListener('keyup', function(e) {
        keyState[e.keyCode || e.which] = false;
    }, true);
}

// init();

// window.onload = init;