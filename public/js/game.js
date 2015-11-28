var scene, socket, camera, renderer, controls, container, 
        username, gameState, clock, stats, mouseX, mouseY,
            isWalking, walkAnim, hudContainer, hudCamera, hudScene,
                enemy;
var WIDTH = 1280;
var HEIGHT = 720;
var AXIS_CAM_DISTANCE = 300;
var AXIS_CAM_WIDTH = 200;
var AXIS_CAM_HEIGHT = 200;
var keyState = {};

Physijs.scripts.worker = '../js/libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';


window.resetGame = function() {
    scene = null;
    renderer = null;
    camera = null;
    console.log('resetting scene..');
}

// Initialize functions

function initMenu() {
    gameState = GameState.IN_MENU;
    window.showMenu();
    window.hideLobby();
}

function initLobby() {
    gameState = GameState.IN_GAME_LOBBY;
    window.hideMenu();
    window.showLobby();
}

function initGame(name) {
    window.hideMenu();
    window.hideLobby();

    setupStats();

    username = name.value;
    gameState = GameState.IN_MENU;
    clock = new THREE.Clock();
    socket = io.connect('/');
    socket.on('statusMessage', updateStatusMessage);
    socket.on('updateClient', updateGameClient);
    socket.on('gameOver', gameOver);
    socket.on('startGame', startGame);

	scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -50, 0));

	camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 2000);
	camera.position.x = -200;
	camera.position.y = 200;
	camera.position.z = 50;
	camera.lookAt(scene.position);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0x333F47, 1);
    renderer.autoClear = false;

    var light = new THREE.PointLight(0xFFFFFF);
    scene.add(light);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.noPan = true;

    container = document.getElementById('gameContainer');
    container.appendChild(renderer.domElement);

    createHud();
    addSky();
    addPlayerAndTerrain();
    setupKeyControls();

    // Event listeners

    document.addEventListener('mousemove', detectMouseMovement, false);
    camera.addEventListener('collision', cameraCollision);
    window.addEventListener('resize', function() {
        // Resize the canvas whenever the browser window resizes
        var newWidth = window.innerWidth - 100;
        var newHeight = window.innerHeight - 56;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });

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

function setupStats() {
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'relative';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById('stats').appendChild(stats.domElement);
}

function createHud() {
    var HUD_WIDTH = 1280;
    var HUD_HEIGHT = 720;
    hudContainer = document.createElement('div');
    hudContainer.setAttribute('style', 'width: 1280px; height: 720px');
    document.body.appendChild(hudContainer);

    hudCamera = new THREE.OrthographicCamera(
        HUD_WIDTH / - 2, HUD_WIDTH / 2, HUD_HEIGHT / 2,
        HUD_HEIGHT / - 2, -500, 1000);
    hudCamera.position.x = 0;
    hudCamera.position.y = 0;
    hudCamera.position.z = 0;

    hudScene = new THREE.Scene();
    var spriteMaterial = new THREE.SpriteMaterial({
        map: THREE.ImageUtils.loadTexture('../js/assets/textures/sampleHud.png')
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(0, 0, 10);
    sprite.scale.set(HUD_WIDTH, HUD_HEIGHT, 1);
    hudScene.add(sprite);
}

function addSky() {
    var imagePrefix = "../js/assets/textures/skybox/skyrender000";
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry(1750, 1750, 1750); // Set this to just below the camera's draw distance

    var materialArray = [];
    for (var i = 0; i < 6; i++) {
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + (i + 1) + imageSuffix),
            side: THREE.BackSide
        }));
    }
        
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);
}

function addPlayerAndTerrain() {
    // // Old plane code
    // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    // var plane = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), material);
    // plane.rotation.x = 90 * (Math.PI / 180);
    // plane.position.y = -10;
    // plane.name = 'ground';
    // scene.add(plane);

    var ground;// = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

    ground = new Physijs.BoxMesh(
        new THREE.CubeGeometry(850, 4, 850),
        new THREE.MeshBasicMaterial(),
        0
    );

    ground.name = 'ground';
    ground.position.y = -25;
    ground.position.x = -150;
    scene.add(ground);

    // var loader = new THREE.JSONLoader();
    // loader.load('../js/assets/models/human.json', function(geometry) {
    //     var meshMaterial = Physijs.createMaterial(
    //         new THREE.MeshNormalMaterial(),
    //         0,
    //         0
    //     );

    //     var mesh = new Physijs.BoxMesh(
    //         geometry, 
    //         meshMaterial
    //     );

    //     mesh.name = 'player';
    //     mesh.position.y = 100;
    //     scene.add(mesh);

    //     mesh.addEventListener('collision', boxCollision);

    //     socket.emit('searchForMatch', username);

    //     gameState = GameState.GAME_IN_PROGRESS; // change game state to game in progress 

    //     animate();
    // });

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/human_rigged_walk.json", function (model) {
        var mat = new THREE.MeshLambertMaterial({color: 0xFFFFFF, skinning: true});
        // var mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        var mesh = new THREE.SkinnedMesh(model, mat);
        // var mesh = new Physijs.BoxMesh(
        //     model,
        //     mat
        // );

        walkAnim = new THREE.Animation(mesh, model.animations[0]);
        // animation.play();

        mesh.scale.set(7, 7, 7);
        mesh.position.y = 0;
        mesh.name = 'player';
        scene.add(mesh);

        mesh.addEventListener('collision', boxCollision);

        socket.emit('searchForMatch', username);

        // gameState = GameState.GAME_IN_PROGRESS; // change game state to game in progress 

        animate();
        // render();
    });

    // // Physics objects
    // var boxMaterial = Physijs.createMaterial(
    //     new THREE.MeshNormalMaterial(),
    //     0, // Friction
    //     0 // Restitution/bounciness
    // );

    // box = new Physijs.BoxMesh(
    //     new THREE.CubeGeometry(15, 15, 15),
    //     boxMaterial
    // );

    // box.name = 'player';
    // box.position.y = 200;
    // box.position.x = -150;
    // box.rotation.z = 90;
    // box.rotation.y = 50;
    // scene.add(box);

    // var terrainTexture = new THREE.MeshLambertMaterial({
    //     map: THREE.ImageUtils.loadTexture('../js/assets/textures/terrain.png'),  // specify and load the texture
    //     colorAmbient: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    //     colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
    //     colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
    // });

    // var terrainTexture = new THREE.MeshLambertMaterial({ color: 0xCDCDCD });

    // var loader = new THREE.JSONLoader();
    // loader.load("../js/assets/models/terrain.json", function(geometry) {
    //     // Physics objects
    //     var boxMaterial = Physijs.createMaterial(
    //         new THREE.MeshNormalMaterial(),
    //         0, // Friction
    //         0 // Restitution/bounciness
    //     );

    //     box = new Physijs.BoxMesh(
    //         new THREE.CubeGeometry(15, 15, 15),
    //         boxMaterial
    //     );

    //     box.name = 'player';
    //     box.position.y = 200;
    //     box.position.x = -150;
    //     box.rotation.z = 90;
    //     box.rotation.y = 50;
    //     scene.add(box);

    //     var box2Material = Physijs.createMaterial(
    //         new THREE.MeshBasicMaterial({
    //             color: 0xAF0000
    //         }),
    //         0,
    //         0
    //     );

    //     box2 = new Physijs.BoxMesh(
    //         new THREE.CubeGeometry(15, 15, 15),
    //         box2Material
    //     );

    //     box2.name = 'evilbox';
    //     box2.position.y = 40;
    //     box2.position.x = 10
    //     box2.rotation.z = 90;
    //     box2.rotation.y = 50;
    //     // scene.add(box2);

    //     // Add ground
    //     var ground = new Physijs.BoxMesh(
    //         geometry,
    //         terrainTexture,
    //         0
    //     );

    //     ground.position.y = -25;
    //     ground.name = 'ground';
    //     ground.scale.x = 250;
    //     ground.scale.y = 250;
    //     ground.scale.z = 250;
    //     ground.position.y = -200;
    //     scene.add(ground);

    //     // var ground;// = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());

    //     // ground = new Physijs.BoxMesh(
    //     //     new THREE.CubeGeometry(150, 5, 150),
    //     //     new THREE.MeshBasicMaterial(),
    //     //     0
    //     // );

    //     // ground.name = 'ground';
    //     // ground.position.y = -25;
    //     // scene.add(ground);

    //     box.addEventListener('collision', boxCollision);

    //     socket.emit('searchForMatch', username);

    //     gameState = GameState.GAME_IN_PROGRESS; // change game state to game in progress 

    //     animate();
    // }, "../js/assets/textures/texturev1.png");


    // box.addEventListener('collision', boxCollision);

    // socket.emit('searchForMatch', username);

    // gameState = GameState.GAME_IN_PROGRESS; // change game state to game in progress 

    // animate();
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
    var time = clock.getElapsedTime();
    var delta = clock.getDelta();
    if(gameState == GameState.GAME_IN_PROGRESS) {
        if(time >= 2 && document.getElementById('statusMessage')) {
        //     var message = document.getElementById('statusMessage');
        //     message.parentNode.removeChild(message);
            document.getElementById('statusMessage').remove();
        }
    }

    THREE.AnimationHandler.update(delta);

    // window.delta = delta;

    setTimeout(function() {
        requestAnimationFrame(animate);
        stats.update();
    }, 1000 / 30);

    scene.simulate();
    controls.update();

    var player = scene.getObjectByName('player');

    // var relativeCameraOffset = new THREE.Vector3(0,20,30); // originally 0, 50, 100
    // var cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);

    // camera.position.x = cameraOffset.x;
    // camera.position.y = cameraOffset.y;
    // camera.position.z = cameraOffset.z;
    camera.lookAt(player.position);

    gameLoop(delta);
    render();
}

function render() {
    renderer.render(scene, camera);
    renderer.render(hudScene, hudCamera);
}

function gameLoop(delta) {
    detectMovement(delta);
    detectSkillUse();
    detectGameOver();

    // Disable controls until player finishes typing in text box?
    if(keyState[89]) {
        console.log('bring up text box');
    }
}


// Socket.IO listeners

function updateStatusMessage(data) {
    var text2 = document.createElement('div');
    text2.setAttribute('id', 'statusMessage');
    text2.style.position = 'absolute';
    text2.style.fontSize = '48';
    text2.style.color = 'red';
    text2.innerHTML = data.text;
    text2.style.top = 300 + 'px';
    text2.style.left = 300 + 'px';
    document.body.appendChild(text2);
}

function updateGameClient(data) {
    console.log(data);
}

function gameOver(data) {
    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.style.fontSize = '48';
    text2.style.color = 'red';
    text2.innerHTML = data.text;
    text2.style.top = 300 + 'px';
    text2.style.left = 300 + 'px';
    document.body.appendChild(text2);
}

function startGame() {
    gameState = GameState.GAME_IN_PROGRESS;
    console.log('start game');
}

// Game loop functions

function detectMovement(delta) {
    var player = scene.getObjectByName('player');
    var oldPosition = { position: player.position, rotation: player.rotation };
    
    if (keyState[65]) {
        // A - Turn left
        player.__dirtyRotation = true;
        player.rotation.y += (delta * 45 * Math.PI / 180);
    }

    if (keyState[68]) {
        // D - Turn right
        player.__dirtyRotation = true;
        player.rotation.y -= (delta * 45 * Math.PI / 180);
    }
    
    if (keyState[87]) {
        // W - Move forward
        isWalking = !isWalking;
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


    if(isWalking) {
        walkAnim.play();
    }
    else {
        walkAnim.stop();
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
        if(!scene.getObjectByName('aoeTarget')) {
            console.log('Draw aoe target cursor');
            var material = new THREE.MeshBasicMaterial({
                color: 0x0000ff
            });

            var radius = 5;
            var segments = 32; //<-- Increase or decrease for more resolution I guess

            var circleGeometry = new THREE.CircleGeometry(radius, segments);              
            var circle = new THREE.Mesh(circleGeometry, material);
            circle.name = 'aoeTarget';
            circle.position.x = mouseX;
            circle.position.z = mouseY;
            scene.add(circle);
        }
        else {
            console.log(scene.getObjectByName('aoeTarget'));
        }
    }
        

    if(keyState[53]) {
        skillUsed = 'classAbility_1';
    }

    if(keyState[54]) {
        skillUsed = 'classAbility_2';
    }

    if(keyState[70]) {
        skillUsed = 'classMechanic_1';
        socket.emit('startGame', { ready: true });
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

function detectGameOver() {
    // if player health hits 0, game over
}

function detectMouseMovement(event) {
    mouseX = event.clientX - (WIDTH / 2);
    mouseY = event.clientY - (HEIGHT / 2);
    // console.log('X: ' + mouseX + '  Y: ' + mouseY);
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

window.onload = initMenu;