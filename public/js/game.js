var scene, socket, camera, renderer, controls, container, 
        roomId, username, playerStats, clientId, enemyPos, enemy, gameState, clock, 
            stats, mouseX, mouseY, walkAnim, hudContainer, hudCamera, hudScene,
                isPlayer1, player1Pos, player2Pos;
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
    if(!socket) {
        socket = io.connect('/');
        socket.on('setClientId', setClientId);
        socket.on('startGame', startGame);
        socket.on('statusMessage', updateStatusMessage);
        socket.on('updateClient', updateGameClient);
        socket.on('gameOver', gameOver);
    }

    username = (name) ? (username = name) : (username = window.username);
    window.username = username;
    socket.emit('searchForMatch', username);

    gameState = GameState.IN_GAME_LOBBY;
    window.hideMenu();
    window.showLobby();
}

function readyToStart(data) {
    var strength = parseInt(data.stats.strength.innerHTML);
    var finesse = parseInt(data.stats.finesse.innerHTML);
    var vitality = parseInt(data.stats.vitality.innerHTML);
    socket.emit('startGame', { ready: true, username: username, character: data.prof.value, 
        stats: { strength: strength, vitality: vitality, finesse: finesse }, 
            weapon1: data.weapon1.value });
    // When I'm ready to enable weapon swapping, I'll include weapon 2 again
}

function initGame() {
    window.hideMenu();
    window.hideLobby();
    gameState = GameState.GAME_IN_PROGRESS;

    // setupStats();

    clock = new THREE.Clock();

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

    // createHud();
    // addSky();
    // addModels();
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

    addResources();
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

function addResources() {
    addSky()
        .then(function(result) {
            return addPlayer();
        })
        .then(function(result) {
            return addTerrain();
        })
        .then(function(result) {
            return addWeapon();
        })
        .then(function(result) {
            console.log('All done loading resources');
            window.showGameUI();
            animate();
        })
        .catch(function(error) {
            console.log('error occurred: ' + error);
        });
}

function addSky() {
    var deferred = Q.defer();

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

    deferred.resolve('skybox successfully added');

    return deferred.promise;
}

function addPlayer() {
    var deferred = Q.defer();

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/human.json", function (model) {
        var mat = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({color: 0xFFFFFF}),
            0,
            0
        );
        var mesh = new Physijs.BoxMesh(model, mat);
        var enemyMesh = new Physijs.BoxMesh(model, mat);

        mesh.scale.set(0.5, 0.5, 0.5);
        enemyMesh.scale.set(0.5, 0.5, 0.5);
        if(isPlayer1) {
            mesh.position.x = player1Pos.x;
            mesh.position.y = player1Pos.y;
            mesh.position.z = player1Pos.z;
            enemyMesh.position.x = player2Pos.x;
            enemyMesh.position.y = player2Pos.y;
            enemyMesh.position.z = player2Pos.z;
            // mesh.rotateY(Math.PI);
            enemyMesh.rotateY(Math.PI);
        }
        else {
            mesh.position.x = player2Pos.x;
            mesh.position.y = player2Pos.y;
            mesh.position.z = player2Pos.z;
            enemyMesh.position.x = player1Pos.x;
            enemyMesh.position.y = player1Pos.y;
            enemyMesh.position.z = player1Pos.z;
            mesh.rotateY(Math.PI);
        }

        mesh.name = 'player';
        scene.add(mesh);

        enemyMesh.name = 'enemy';
        scene.add(enemyMesh);

        camera.addTarget({
            name: 'camTarget',
            targetObject: mesh,
            // cameraPosition: new THREE.Vector3(0, 30, 50),
            cameraPosition: new THREE.Vector3(0, -5, 25),
            cameraRotation: new THREE.Vector3(0, Math.PI, 0),
            fixed: false,
            stiffness: 1,
            matchRotation: true
        });
        camera.setTarget('camTarget');

        mesh.addEventListener('collision', boxCollision);

        deferred.resolve('players loaded');
    });

    return deferred.promise;
}

function addTerrain() {
    var deferred = Q.defer();

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

        var walkableGround = new Physijs.BoxMesh(
            new THREE.CubeGeometry(1550, 4, 1550),
            new THREE.MeshLambertMaterial({ color: 0xFFFFFF }),
            0
        );

        walkableGround.name = 'ground';
        walkableGround.visible = false;
        walkableGround.position.y = 8;
        // walkableGround.position.x = -150;
        scene.add(walkableGround);

        ground.name = 'ground';
        ground.scale.x = 110;
        ground.scale.y = 110;
        ground.scale.z = 110;
        ground.position.y = -100;
        scene.add(ground);

        deferred.resolve('terrain loaded');
    }, "../js/assets/textures/terrainv3_final.png");

    return deferred.promise;
}

function addWeapon() {
    var deferred = Q.defer();

    var loader = new THREE.JSONLoader();
    loader.load("../js/assets/models/weapons/greatsword_final.json", function(geometry) {
        var mat = new THREE.MeshBasicMaterial({color: 0x4D4D4D});
        var greatsword = new THREE.Mesh(geometry, mat);
        var player = scene.getObjectByName('player');

        greatsword.name = 'greatsword';
        // greatsword.x = 0;
        // greatsword.position.y = 20;
        // greatsword.position.z = 50;
        player.add(greatsword);
        scene.add(greatsword);

        deferred.resolve('greatsword loaded');
    }, null);

    return deferred.promise;
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
    // if(gameState == GameState.GAME_IN_PROGRESS) {
    //     if(time >= 2 && document.getElementById('statusMessage')) {
    //         document.getElementById('statusMessage').remove();
    //     }
    // }

    if(gameState == GameState.GAME_IN_PROGRESS) {
        THREE.AnimationHandler.update(delta);

        setTimeout(function() {
            requestAnimationFrame(animate);
            // stats.update();
        }, 1000 / 30);

        scene.simulate();
        controls.update();

        camera.update();

        gameLoop(delta, player);
        render();
    }
}

function render() {
    renderer.render(scene, camera);
    // renderer.render(hudScene, hudCamera);
}

function gameLoop(delta, player) {
    timeInterval += (clock.getDelta() * 100);

    if(timeInterval >= 1) {
        socket.emit('updatePosition', { roomId: roomId, isPlayer1: isPlayer1, username: username, 
            position: { x: player.position.x, y: player.position.y, z: player.position.z } });
        timeInterval = 0;
    }

    // console.log(clock.elapsedTime);
    // console.log(clock.oldTime);

    // updateEnemy();
    // detectWeaponCollision();
    detectMovement(delta);
    detectSkillUse();

    // // Disable controls until player finishes typing in text box?
    // if(keyState[89]) {
    //     console.log('bring up text box');
    // }
}


// Game loop functions

// function updateEnemy() {

// }

function detectMovement(delta) {
    var player = scene.getObjectByName('player');
    // var oldPosition = { position: player.position, rotation: player.rotation };
    
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
        // isWalking = !isWalking;
        player.__dirtyPosition = true;
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


    // if(isWalking) {
    //     walkAnim.play();
    // }
    // else {
    //     isWalking = !isWalking;
    //     walkAnim.stop();
    // }

    // var newPosition = { position: player.position, rotation: player.rotation };

    // if(oldPosition.position != newPosition.position || oldPosition.rotation != newPosition.rotation) {
    //     console.log('Player moved');
    //     socket.emit('playerMoved', { oldPosition: oldPosition, newPosition: newPosition });
    // }
}

// function detectWeaponCollision() {
//     // socket.emit('playerHit', { roomId: roomId, enemyId: enemy.id, username: enemy.username, damage: 100 });
// }

function detectSkillUse() {
    var player = scene.getObjectByName('player'); // Make player invisible for testing purposes
    var weapon = scene.getObjectByName('greatsword');
    var skillUsed;

    if(keyState[49]) {
        skillUsed = 'weap_1';
        // if(weapon.rotation.x == (Math.PI / 4)) {
        //     console.log('Rotate weapon back');
        //     weapon.rotateX(-(Math.PI / 4));
        // }
        // else {
        //     console.log('Rotate weapon forwards');
            weapon.rotateX(Math.PI / 4);
            if(weapon.rotation.x == (Math.PI / 4)) {
                weapon.rotateX(-(Math.PI / 4));
            }
        // }
        // player.visible ? player.visible = false : player.visible = true;
    }

    if(keyState[50]) {
        skillUsed = 'weap_2';
    }
    
    if(keyState[51]) {
        skillUsed = 'weap_3';
    }
    
    if(keyState[52]) {
        skillUsed = 'heal';
        // if(!scene.getObjectByName('aoeTarget')) {
        //     console.log('Draw aoe target cursor');
        //     var material = new THREE.MeshBasicMaterial({
        //         color: 0x0000ff
        //     });

        //     var radius = 5;
        //     var segments = 32; //<-- Increase or decrease for more resolution I guess

        //     var circleGeometry = new THREE.CircleGeometry(radius, segments);              
        //     var circle = new THREE.Mesh(circleGeometry, material);
        //     circle.name = 'aoeTarget';
        //     circle.position.x = mouseX;
        //     circle.position.z = mouseY;
        //     scene.add(circle);
        // }
        // else {
        //     console.log(scene.getObjectByName('aoeTarget'));
        // }
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
        console.log('skill used');
        // if weapon collision detected, emit player hit
        socket.emit('skillUsed', { roomId: roomId, enemyId: enemy.id, 
            player: username, enemy: enemy.username, skill: skillUsed, damage: 1000, hitEnemy: true });
        // console.log('skill used');
        // socket.emit('playerHit', { roomId: roomId, enemyId: enemy.id, username: enemy.username, damage: 100 });
        // socket.emit('playerUseSkill', { player: username, enemy: enemyName, skill: skillUsed, hitEnemy: true });
        skillUsed = null;
    }
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
    var enemyMesh = scene.getObjectByName('enemy');
    var position = new THREE.Vector3();
    position.getPositionFromMatrix(enemyMesh.matrixWorld);

    if(isPlayer1) {
        window.updateHealth(data.player1, data.player2);
    }
    else {
        window.updateHealth(data.player2, data.player1);
    }

    var oldX = position.x;
    var oldY = position.y;
    var oldZ = position.z;
    var difX, difY, difZ;
    console.log('old position: ' + position);

    if(isPlayer1) {
        difX = (data.player2.position.x - oldX);
        difY = (data.player2.position.y - oldY);
        difZ = (data.player2.position.z - oldZ); 
    }
    else {
        difX = (data.player1.position.x - oldX);
        difY = (data.player1.position.y - oldY);
        difZ = (data.player1.position.z - oldZ);
    }

    console.log('dif x: ' + difX);
    console.log('dif y: ' + difY);
    console.log('dif z: ' + difZ);

    enemyMesh.translateX(difX);
    enemyMesh.translateY(difY);
    enemyMesh.translateZ(difZ);
}

function setClientId(data) {
    clientId = data.clientId;
    roomId = data.roomId;
}

function lobbyJoined(data) {
    // enemyName = data.
}

function gameOver(data) {
    // var text2 = document.createElement('div');
    // // text2.style.position = 'absolute';
    // text2.style.position = 'relative';
    // text2.style.left = '50%';
    // text2.style += 'text-align: center;';
    // text2.style.fontSize = '48';
    // text2.style.color = 'red';
    // text2.innerHTML = data.text;
    // // text2.style.top = 300 + 'px';
    // // text2.style.left = 300 + 'px';
    // document.body.appendChild(text2);

    gameState = GameState.GAME_OVER;
    console.log(data);
    window.hideGameUI();
    window.showGameOver();
}

function startGame(data) {
    console.log(data);
    player1Pos = data.player1.position;
    player2Pos = data.player2.position;

    if(clientId == data.player1.id) {
        isPlayer1 = true;
        playerStats = data.player1;
        enemy = { id: data.player2.id, username: data.player2.username };
    }
    else {
        isPlayer1 = false;
        playerStats = data.player2;
        enemy = { id: data.player1.id, username: data.player1.username };
    }

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