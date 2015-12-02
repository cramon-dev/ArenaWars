var scene, socket, camera, renderer, controls, container, 
        username, playerStats, clientId, enemy, enemyName, gameState, clock, stats, 
            mouseX, mouseY, isWalking, walkAnim, hudContainer, hudCamera, hudScene;
var timeInterval = 0;
var WIDTH = 1280;
var HEIGHT = 720;
var AXIS_CAM_DISTANCE = 300;
var AXIS_CAM_WIDTH = 200;
var AXIS_CAM_HEIGHT = 200;
var keyState = {};

Physijs.scripts.worker = '../js/libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';


window.resetGame = function() {
    // scene = null;
    // renderer = null;
    // camera = null;
    document.getElementById('gameContainer').innerHtml = null;
    console.log('resetting scene..');
}

// Initialize functions

function initMenu() {
    gameState = GameState.IN_MENU;
    window.showMenu();
    window.hideLobby();
}

function initLobby(name) {
    socket = io.connect('/');
    socket.on('setClientId', setClientId);
    socket.on('startGame', startGame);
    username = (name) ? (username = name) : (username = window.username);
    socket.emit('searchForMatch', username);

    gameState = GameState.IN_GAME_LOBBY;
    window.hideMenu();
    window.showLobby();
}

function readyToStart(data) {
    socket.emit('startGame', { ready: true, username: username,
        character: data.prof.value, stats: { strength: 40, vitality: 40, finesse: 40 }, 
            weapon1: data.weapon1.value, weapon2: data.weapon2.value });
}

function initGame() {
    window.hideMenu();
    window.hideLobby();
    gameState = GameState.GAME_IN_PROGRESS;

    // setupStats();

    gameState = GameState.IN_MENU;
    clock = new THREE.Clock();
    socket.on('statusMessage', updateStatusMessage);
    socket.on('updateClient', updateGameClient);
    socket.on('gameOver', gameOver);

	scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -50, 0));

	camera = new THREE.TargetCamera(45, WIDTH / HEIGHT, 0.1, 4000);
	// camera.position.x = -200;
	// camera.position.y = 200;
	// camera.position.z = 350;
    camera.position.x = -28;
    camera.position.y = 28;
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
    var skyGeometry = new THREE.CubeGeometry(3750, 3750, 3750); // Set this to just below the camera's draw distance

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

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/human_rigged_walk_unparent.json", function (model) {
        var mat = new THREE.MeshLambertMaterial({color: 0xFFFFFF, skinning: true});
        var mesh = new THREE.SkinnedMesh(model, mat);

        walkAnim = new THREE.Animation(mesh, model.animations[0]);
        // animation.play();

        // mesh.scale.set(7, 7, 7);
        // mesh.position.y = 75;
        // mesh.position.z = -350;
        mesh.position.y = 15;
        mesh.position.z = -50;
        // mesh.rotation.set(0, 0, 0);
        // mesh.rotateY(Math.PI);
        mesh.name = 'player';
        scene.add(mesh);

        camera.addTarget({
            name: 'camTarget',
            targetObject: mesh,
            // cameraPosition: new THREE.Vector3(0, 30, 50),
            cameraPosition: new THREE.Vector3(0, 5, 10),
            fixed: false,
            stiffness: 1,
            matchRotation: true
        });

        camera.rotation.y = mesh.rotation.y + Math.PI;
        camera.setTarget('camTarget');

        mesh.addEventListener('collision', boxCollision);

        var terrainTexture = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('../js/assets/textures/terrainv3_final.png'),  // specify and load the texture
            colorAmbient: [0.480000026226044, 0.480000026226044, 0.480000026226044],
            colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
            colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
        });

        var loader = new THREE.JSONLoader();
        loader.load("../js/assets/models/terrainv3.json", function(geometry) {
            // Add ground
            var ground = new Physijs.BoxMesh(
                geometry,
                terrainTexture,
                0
            );

            ground.name = 'ground';
            ground.scale.x = 107;
            ground.scale.y = 107;
            ground.scale.z = 107;
            ground.position.y = -100;
            scene.add(ground);
            animate();
        }, "../js/assets/textures/terrainv3_final.png");
    });
}

function boxCollision(otherObj, relativeVelocity, relativeRotation, contactNormal) {
    console.log('collision');
    console.log(otherObj);
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
    var player = scene.getObjectByName('player');

    var delta = clock.getDelta();
    if(gameState == GameState.GAME_IN_PROGRESS) {
        if(time >= 2 && document.getElementById('statusMessage')) {
            document.getElementById('statusMessage').remove();
        }
    }

    THREE.AnimationHandler.update(delta);

    setTimeout(function() {
        requestAnimationFrame(animate);
        // stats.update();
    }, 1000 / 30);

    scene.simulate();
    controls.update();

    // player.translateY(-5.25);
    camera.update();

    gameLoop(delta, player);
    render();
}

function render() {
    renderer.render(scene, camera);
    renderer.render(hudScene, hudCamera);
}

function gameLoop(delta, player) {
    console.log('timeInterval: ' + timeInterval);
    timeInterval += (clock.getDelta() * 100);

    if(timeInterval >= 1) {
        console.log('Update server with position');
        socket.emit('updatePosition', { username: username, 
            position: { x: player.position.x, y: player.position.y, z: player.position.z } });
        timeInterval = 0;
    }

    // console.log(clock.elapsedTime);
    // console.log(clock.oldTime);

    drawEnemy();
    detectMovement(delta);
    detectSkillUse();
    detectGameOver();

    // // Disable controls until player finishes typing in text box?
    // if(keyState[89]) {
    //     console.log('bring up text box');
    // }
}


// Game loop functions

function drawEnemy() {

}

function detectMovement(delta) {
    var player = scene.getObjectByName('player');
    var oldPosition = { position: player.position, rotation: player.rotation };
    
    if (keyState[65]) {
        // A - Turn left
        player.__dirtyRotation = true;
        player.rotation.y += 0.15;
    }

    if (keyState[68]) {
        // D - Turn right
        player.__dirtyRotation = true;
        player.rotation.y -= 0.15;
    }
    
    if (keyState[87]) {
        // W - Move forward
        isWalking = !isWalking;
        player.__dirtyPosition = true;
        console.log(playerStats.movementSpeed);
        player.translateZ(playerStats.movementSpeed);
    }
    
    if (keyState[83]) {
        // S - Move backward
        player.__dirtyPosition = true;
        player.translateZ(-(playerStats.movementSpeed / 3));
    }

    if(keyState[81]) {
        // Q - Strafe left
        player.__dirtyPosition = true;
        player.translateX(playerStats.movementSpeed / 2.5);
    }

    if(keyState[69]) {
        // E - Strafe right
        player.__dirtyPosition = true;
        player.translateX(-(playerStats.movementSpeed / 2.5));
    }


    if(isWalking) {
        console.log('Is walking');
        walkAnim.play();
    }
    else {
        isWalking = !isWalking;
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
        socket.emit('playerUseSkill', { player: username, enemy: enemyName, skill: skillUsed, hitEnemy: true });
    }
}

function detectGameOver() {
    // if player health hits 0, game over
}

function detectMouseMovement(event) {
    mouseX = event.clientX - (WIDTH / 2);
    mouseY = event.clientY - (HEIGHT / 2);
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

function setClientId(data) {
    console.log('My client id: ' + data.id);
    clientId = data.id;
}

function lobbyJoined(data) {
    // enemyName = data.
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

function startGame(data) {
    if(clientId == data.player1.id) {
        console.log('I am player 1');
        playerStats = data.player1;
    }
    else {
        console.log('I am player 2');
        playerStats = data.player2;
    }
    console.log(data);
    console.log(playerStats);
    console.log('start game');
    initGame();
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