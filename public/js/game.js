var scene, camera, renderer, controls, container, axes, axesContainer, axisScene, axisCamera, axisRenderer;
var WIDTH = 1600;
var HEIGHT = 900;
var AXIS_CAM_DISTANCE = 300;
var AXIS_CAM_WIDTH = 200;
var AXIS_CAM_HEIGHT = 200;
var keyState = {};

function init() {
	scene = new THREE.Scene();
    axisScene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
	camera.position.x = 15;
	camera.position.y = 16;
	camera.position.z = 13;
	camera.lookAt(scene.position);

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
    light.position.set(-100, 200, 100);
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.noPan = true;


    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/terrainv2.json", function(geometry) {
        var material = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('../js/assets/textures/texturev1.png'),  // specify and load the texture
            colorAmbient: [0.480000026226044, 0.480000026226044, 0.480000026226044],
            colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
            colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
        });
    	// var mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'player';
    	scene.add(mesh);

        // // Rendering robot
        // var mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        // mesh.name = 'player';
        // scene.add(mesh);
    	// // var material = new THREE.MeshPhongMaterial({color:0x0099AF});
    	// var material = new THREE.MeshNormalMaterial();
    	// mesh = new THREE.Mesh(geometry, material);
    	// console.log('Model loaded');
    	// scene.add(mesh);

		// var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
		// var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, map: texture} );
		// var plane = new THREE.Mesh( geometry, material );
		// scene.add( plane );

		// // var material = new THREE.MeshPhongMaterial({color:0x0099AF});
		// THIS MIGHT NOT BE WORKING BECAUSE I SHOULD APPLY THE TEXTURE IN BLENDER
		// AS IN, I NEED TO MAP UVs MYSELF AND ADD THE TEXTURE TO THE MODEL BEFORE EXPORTING FROM BLENDER
    	// var material = new THREE.MeshLambertMaterial({map:texture});
    	// mesh = new THREE.Mesh(geometry, material);
    	// console.log('Model loaded');
    	// scene.add(mesh);

        setupKeyControls();
        initAxesCam();
    }, null);
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

    animate();
}

function animate() {    
	requestAnimationFrame(animate);

    // update();
	controls.update();

    gameLoop();
    render();
}

function render() {
    console.log('Render');
    axisCamera.position.copy(camera.position);
    axisCamera.position.sub(controls.target);
    axisCamera.position.setLength(AXIS_CAM_DISTANCE);
    axisCamera.lookAt(axisScene.position);

    renderer.render(scene, camera);
    axisRenderer.render(axisScene, axisCamera);
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
    
    if (keyState[65]) {
        // A - Turn left
        player.rotation.y += 0.10;
    }

    if (keyState[68]) {
        // D - Turn right
        player.rotation.y -= 0.10;
    }
    
    if (keyState[87]) {
        // W - Move forward
        player.position.x += 0.75;
    }
    
    if (keyState[83]) {
        // S - Move backward
        player.position.x -= 0.55;
    }

    if(keyState[81]) {
        // Q - Strafe left
        player.position.z -= 0.55;
    }

    if(keyState[69]) {
        // E - Strafe right
        player.position.z += 0.55;
    }
}

function detectSkillUse() {
    if(keyState[49]) {
        console.log('use weapon skill 1');
    }

    if(keyState[50]) {
        console.log('use weapon skill 2');
    }
    
    if(keyState[51]) {
        console.log('use weapon skill 3');
    }
    
    if(keyState[52]) {
        console.log('use healing ability');
    }

    if(keyState[53]) {
        console.log('use class skill 1');
    }

    if(keyState[54]) {
        console.log('use class skill 2');
    }

    if(keyState[70]) {
        console.log('use class mechanic');
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

window.onload = init;