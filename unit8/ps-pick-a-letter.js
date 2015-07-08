"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Pick a letter, or actually - the number 1
// Edit the UV values in the SquareGeometry function
// to select the number "1" from the texture.
// Only the array 'uvs' should be modified.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window*/

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

function SquareGeometry() {
	var geo = new THREE.Geometry();

	// generate vertices
	geo.vertices.push( new THREE.Vector3( 0.0, 0.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( 1.0, 0.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( 1.0, 1.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( 0.0, 1.0, 0.0 ) );

	// Change this array to select the correct part of the texture
	var uvs = [];
	uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
	uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
	uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
	uvs.push( new THREE.Vector2( 0.0, 1.0 ) );

	// generate faces
	geo.faces.push( new THREE.Face3( 0, 1, 2 ) );
	geo.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2] ] );
	geo.faces.push( new THREE.Face3( 0, 2, 3 ) );
	geo.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[2], uvs[3] ] );
	// done: return it.
	return geo;
}

function fillScene() {
	scene = new THREE.Scene();

	var myPolygon = new SquareGeometry();
	var myTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/lettergrid.png' );
	var myPolygonMaterial = new THREE.MeshBasicMaterial( { map: myTexture } );
	var polygonObject = new THREE.Mesh( myPolygon, myPolygonMaterial );
	scene.add(polygonObject);
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
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

	// Camera: Y up, X right, Z up
	camera = new THREE.PerspectiveCamera( 1, canvasRatio, 50, 150 );
	camera.position.set( 0.5, 0.5, 100 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0.5,0.5,0);

}

function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function drawHelpers() {
	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	Coordinates.drawGrid({size:100,scale:1,orientation:"z",offset:-0.01});
	Coordinates.drawAxes({axisLength:2.1,axisOrientation:"x",axisRadius:0.004,offset:-0.01});
	Coordinates.drawAxes({axisLength:2.1,axisOrientation:"y",axisRadius:0.004,offset:-0.01});
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {

		alpha: 0.7,
		sred:   0xE5/255,
		sgreen: 0x33/255,
		sblue:  0x19/155,

		dred:   0xE5/255,
		dgreen: 0xE5/255,
		dblue:  0x66/255
	};

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
