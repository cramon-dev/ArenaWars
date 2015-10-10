var renderer;
var scene; // Container for objects we want to render
var camera; // Determines what we will see when we render the scene
var stats;
var control;

function init() {
	// create a scene that will hold all of our elements
	// such as objects, cameras, and lights
	scene = new THREE.Scene();

	// create a camera which defines where we're looking at
	camera = new THREE.PerspectiveCamera(45,
		(window.innerWidth / window.innerHeight), 0.1, 1000);
	// posiiton and point the camera to the center

	camera.position.x = 15;
	camera.position.y = 16;
	camera.position.z = 13;
	camera.lookAt(scene.position);

	// create a renderer, set the background color and size
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x000000, 1.0);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// create a cube and add it to the scene
	var cubeGeometry = new THREE.BoxGeometry(
		10 * Math.random(),
		10 * Math.random(),
		10 * Math.random());

	var cubeMaterial = new THREE.MeshNormalMaterial();
	var cube = new THREE.Mesh(cubeGeometry,
		cubeMaterial);
	cube.name = 'cube';
	scene.add(cube);

	// add the output of the renderer to the html element
	document.body.appendChild(renderer.domElement);

	// Create stats object and append it to the HTML
	stats = createStats();
	document.body.appendChild(stats.domElement);

	// Create control object
	control = new function() {
		this.rotationSpeed = 0.005;
		this.scale = 1;
	};

	function reqListener () {
		console.log(this.responseText);
	}

	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", reqListener);
	oReq.open("GET", "http://localhost:3000/api/cramon");
	oReq.send();

	addControls(control);

	// call the render function
	render();
}

function render() {
	requestAnimationFrame(render);

	var obj = scene.getObjectByName('cube');
	obj.rotation.x += control.rotationSpeed;
	obj.scale.set(control.scale, control.scale, control.scale);
	renderer.render(scene, camera);
	stats.update();
}

function createStats() {
	var stats = new Stats();
	stats.setMode(0); // 0 shows frames rendered in the last second, 1 shows ms required to render the last frame

	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0';
	stats.domElement.style.top = '0';

	return stats;
}

function addControls(controlObject) {
	var gui = new dat.GUI();
	gui.add(controlObject, 'rotationSpeed', -0.1, 0.1);
	gui.add(controlObject, 'scale', 0.01, 2);
}

window.onload = init;