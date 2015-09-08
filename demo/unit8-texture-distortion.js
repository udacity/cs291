"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Adjust textured upper corners demo
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, document, window, dat*/

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

var ulX = 0;
var ulY = 1;
var ulU = 0;
var ulV = 1;

var urX = 1;
var urY = 1;
var urU = 1;
var urV = 1;

var crateTexture;
var gridTexture;
var mapleTexture;
var featherTexture;

var material = [];
var mtlName = 'grid';
var wireMaterial;

var gui;

var showPoly = false;

function fillScene() {
	scene = new THREE.Scene();

	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	Coordinates.drawGrid({size:100,scale:1,orientation:"z",offset:-0.01});
	Coordinates.drawAxes({axisLength:2.1,axisOrientation:"x",axisRadius:0.004,offset:-0.01});
	Coordinates.drawAxes({axisLength:2.1,axisOrientation:"y",axisRadius:0.004,offset:-0.01});

	var myPolygon = new SquareGeometry();
	var polygonObject = new THREE.Mesh( myPolygon, material[mtlName] );
	scene.add(polygonObject);

	if ( effectController.showPoly )
	{
		polygonObject = new THREE.Mesh( myPolygon, wireMaterial );
		scene.add(polygonObject);
	}
}

function SquareGeometry() {
	var geo = new THREE.Geometry();

	// generate vertices
	geo.vertices.push( new THREE.Vector3( 0.0, 0.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( 1.0, 0.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( urX, urY, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( ulX, ulY, 0.0 ) );

	var uvs = [];
	uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
	uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
	uvs.push( new THREE.Vector2( urU, urV ) );
	uvs.push( new THREE.Vector2( ulU, ulV ) );

	// generate faces
	geo.faces.push( new THREE.Face3( 0, 1, 2 ) );
	geo.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[1], uvs[2] ] );
	geo.faces.push( new THREE.Face3( 0, 2, 3 ) );
	geo.faceVertexUvs[ 0 ].push( [ uvs[0], uvs[2], uvs[3] ] );

	// done: return it.
	return geo;
}

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// Camera: Y up, X right, Z up
	camera = new THREE.PerspectiveCamera( 1.1, canvasRatio, 10, 200 );
	camera.position.set( 0.8,0.6, 100 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0.8,0.6,0);

	// TEXTURES
	crateTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/crate.gif' );
	crateTexture.wrapS = THREE.RepeatWrapping; crateTexture.wrapT = THREE.RepeatWrapping;
	gridTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/ash_uvgrid01.jpg');
	gridTexture.wrapS = THREE.RepeatWrapping; gridTexture.wrapT = THREE.RepeatWrapping;
	mapleTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/maple.png' );
	mapleTexture.wrapS = THREE.RepeatWrapping; mapleTexture.wrapT = THREE.RepeatWrapping;
	featherTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/feather.png' );
	featherTexture.wrapS = THREE.RepeatWrapping; featherTexture.wrapT = THREE.RepeatWrapping;

	// MATERIALS
	material.crate = new THREE.MeshBasicMaterial( { map: crateTexture } );
	material.grid = new THREE.MeshBasicMaterial( { map: gridTexture } );
	material.maple = new THREE.MeshBasicMaterial( { map: mapleTexture, transparent: true } );
	material.feather = new THREE.MeshBasicMaterial( { map: featherTexture, transparent: true } );

	wireMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x00FF00 } );

	fillScene();
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.reset )
	{
		effectController.ulX = 0.1;
		effectController.ulY = 1;
		effectController.ulU = 0.1;
		effectController.ulV = 1;

		effectController.urX = 1;
		effectController.urY = 1;
		effectController.urU = 1;
		effectController.urV = 1;

		effectController.reset = false;

		// Iterate over all controllers
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
	}
	if ( ulX !== effectController.ulX ||
		ulY !== effectController.ulY ||
		ulU !== effectController.ulU ||
		ulV !== effectController.ulV ||
		urX !== effectController.urX ||
		urY !== effectController.urY ||
		urU !== effectController.urU ||
		urV !== effectController.urV ||
		showPoly !== effectController.showPoly ||
		mtlName !== effectController.mtlName )
	{
		ulX = effectController.ulX;
		ulY = effectController.ulY;
		ulU = effectController.ulU;
		ulV = effectController.ulV;
		urX = effectController.urX;
		urY = effectController.urY;
		urU = effectController.urU;
		urV = effectController.urV;
		showPoly = effectController.showPoly;
		mtlName = effectController.mtlName;
		fillScene();
	}

	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {

		ulX: 0.1,
		ulY: 1,
		ulU: 0.1,
		ulV: 1,

		urX: 1,
		urY: 1,
		urU: 1,
		urV: 1,

		showPoly: false,

		mtlName: 'grid',

		reset: false
	};

	gui = new dat.GUI();
	gui.add( effectController, "ulX", -0.5, 0.5 ).name("upper left X");
	gui.add( effectController, "ulY",  0.5, 1.5 ).name("upper left Y");
	gui.add( effectController, "ulU", -4.0, 0.5 ).name("upper left U");
	gui.add( effectController, "ulV",  0.5, 5.0 ).name("upper left V");
	gui.add( effectController, "urX",  0.5, 1.5 ).name("upper right X");
	gui.add( effectController, "urY",  0.5, 1.5 ).name("upper right Y");
	gui.add( effectController, "urU",  0.5, 5.0 ).name("upper right U");
	gui.add( effectController, "urV",  0.5, 5.0 ).name("upper right V");
	gui.add( effectController, "showPoly" ).name("show polygon");
	gui.add( effectController, "mtlName", ['crate','grid','maple','feather'] ).name("texture image");
	gui.add( effectController, "reset" ).name("reset");
}

setupGui();
init();
effectController.reset = true;
animate();
