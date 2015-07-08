"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Ornament axis/angle exercise: add three more cylinders to the ornament
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var bCube = true;
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = false;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	var cylinderMaterial = new THREE.MeshPhongMaterial( { color: 0xD1F5FD, specular: 0xD1F5FD, shininess: 100 } );

	// get two diagonally-opposite corners of the cube and compute the
	// cylinder axis direction and length
	var maxCorner = new THREE.Vector3(  1, 1, 1 );
	var minCorner = new THREE.Vector3( -1,-1,-1 );
	// note how you can chain one operation on to another:
	var cylAxis = new THREE.Vector3().subVectors( maxCorner, minCorner );
	var cylLength = cylAxis.length();

	// take dot product of cylAxis and up vector to get cosine of angle
	cylAxis.normalize();
	var theta = Math.acos( cylAxis.dot( new THREE.Vector3(0,1,0) ) );
	// or just simply theta = Math.acos( cylAxis.y );

	// YOUR CODE HERE
	var cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 0.2, 0.2, cylLength, 32 ), cylinderMaterial );
	var rotationAxis = new THREE.Vector3(1,0,-1);
	// makeRotationAxis wants its axis normalized
	rotationAxis.normalize();
	// don't use position, rotation, scale
	cylinder.matrixAutoUpdate = false;
	cylinder.matrix.makeRotationAxis( rotationAxis, theta );
	scene.add( cylinder );

}

function drawHelpers() {
	if (ground) {
		Coordinates.drawGround({size:100});
	}
	if (gridX) {
		Coordinates.drawGrid({size:100,scale:1});
	}
	if (gridY) {
		Coordinates.drawGrid({size:100,scale:1, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:100,scale:1, orientation:"z"});
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:5,axisRadius:0.01,axisTess:50});
	}

	if (bCube) {
		var cubeMaterial = new THREE.MeshLambertMaterial(
			{ color: 0xFFFFFF, opacity: 0.7, transparent: true } );
		var cube = new THREE.Mesh(
			new THREE.CubeGeometry( 2, 2, 2 ), cubeMaterial );
		scene.add( cube );
	}
}

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, canvasRatio, 1, 10000 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	camera.position.set( -7, 7, 2 );
	cameraControls.target.set(0,0,0);

}

function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newCube !== bCube || effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		bCube = effectController.newCube;
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

		newCube: bCube,
		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes
	};

	var gui = new dat.GUI();
	gui.add( effectController, "newCube").name("Show cube");
	gui.add( effectController, "newGridX").name("Show XZ grid");
	gui.add( effectController, "newGridY" ).name("Show YZ grid");
	gui.add( effectController, "newGridZ" ).name("Show XY grid");
	gui.add( effectController, "newGround" ).name("Show ground");
	gui.add( effectController, "newAxes" ).name("Show axes");
}

try {
	init();
	fillScene();
	setupGui();
	drawHelpers();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}

