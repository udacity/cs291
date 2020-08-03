"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Flower exercise: make a flower
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat, $*/

let camera, scene, renderer;
let cameraControls, effectController;
let clock = new THREE.Clock();
let gridX = true;
let gridY = false;
let gridZ = false;
let axes = true;
let ground = true;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	let ambientLight = new THREE.AmbientLight( 0x222222 );

	let light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	let light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	// FLOWER
	let petalMaterial = new THREE.MeshLambertMaterial( { color: 0xCC5920 } );
	let flowerHeight = 200;
	let petalLength = 120;
	let cylGeom = new THREE.CylinderGeometry( 15, 0, petalLength, 32 );
	let flower = new THREE.Object3D();

	/////////
	// YOUR CODE HERE
	// add code here to make 24 petals, radiating around the sphere
	// Just rotates and positions on the cylinder and petals are needed.
	let cylinder = new THREE.Mesh( cylGeom, petalMaterial );
	let petal = new THREE.Object3D();
	petal.add( cylinder );

	flower.add( petal );

	// Rest of the flower
	let stamenMaterial = new THREE.MeshLambertMaterial( { color: 0x333310 } );
	let stamen = new THREE.Mesh(
		new THREE.SphereGeometry( 20, 32, 16 ), stamenMaterial );
	stamen.position.y = flowerHeight;	// move to flower center
	flower.add( stamen );

	let stemMaterial = new THREE.MeshLambertMaterial( { color: 0x339424 } );
	let stem = new THREE.Mesh(
		new THREE.CylinderGeometry( 10, 10, flowerHeight, 32 ), stemMaterial );
	stem.position.y = flowerHeight/2;	// move from ground to stamen
	flower.add( stem );

	scene.add( flower );

}


function init() {
	let canvasWidth = 846;
	let canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//let canvasWidth = window.innerWidth;
	//let canvasHeight = window.innerHeight;
	let canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 38, canvasRatio, 1, 10000 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	camera.position.set(-200, 400, 20);
	cameraControls.target.set(0,150,0);
	fillScene();

}

function addToDOM() {
	let container = document.getElementById('container');
	let canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function drawHelpers() {
	if (ground) {
		Coordinates.drawGround({size:10000});
	}
	if (gridX) {
		Coordinates.drawGrid({size:10000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	}
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	let delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();
		drawHelpers();
	}

	renderer.render(scene, camera);
}



function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes

	};

	let gui = new dat.GUI();
	let h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");

}


// this is the main action sequence
try {
	init();
	fillScene();
	drawHelpers();
	addToDOM();
	setupGui();
	animate();
} catch(e) {
	let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
