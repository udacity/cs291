"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Adjust textured rectangle demo
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat*/

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

var uX = 1;
var uY = 1;
var uU = 1;
var uV = 1;

var crateTexture;
var gridTexture;
var mapleTexture;
var featherTexture;
var darkamTexture;

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
	geo.vertices.push( new THREE.Vector3( uX, 0.0, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( uX, uY, 0.0 ) );
	geo.vertices.push( new THREE.Vector3( 0.0, uY, 0.0 ) );

	var uvs = [];
	uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
	uvs.push( new THREE.Vector2( uU, 0.0 ) );
	uvs.push( new THREE.Vector2( uU, uV ) );
	uvs.push( new THREE.Vector2( 0.0, uV ) );

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
	darkamTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/darkam.png' );
	darkamTexture.wrapS = THREE.RepeatWrapping; darkamTexture.wrapT = THREE.RepeatWrapping;

	// MATERIALS
	material.crate = new THREE.MeshBasicMaterial( { map: crateTexture } );
	material.grid = new THREE.MeshBasicMaterial( { map: gridTexture } );
	material.maple = new THREE.MeshBasicMaterial( { map: mapleTexture, transparent: true } );
	material.feather = new THREE.MeshBasicMaterial( { map: featherTexture, transparent: true } );
	material.darkam = new THREE.MeshBasicMaterial( { map: darkamTexture } );

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
		// TODO: defect with dat.gui is that the 0's sliders don't show up correctly.
		effectController.uX = 1;
		effectController.uY = 1;
		effectController.uU = 1;
		effectController.uV = 1;

		effectController.reset = false;

		// Iterate over all controllers
		for (var i in gui.__controllers) {
			if (gui.__controllers.hasOwnProperty(i)) {
				gui.__controllers[i].updateDisplay();
			}
		}
	}
	if ( uX !== effectController.uX ||
		uY !== effectController.uY ||
		uU !== effectController.uU ||
		uV !== effectController.uV ||
		showPoly !== effectController.showPoly ||
		mtlName !== effectController.mtlName )
	{
		uX = effectController.uX;
		uY = effectController.uY;
		uU = effectController.uU;
		uV = effectController.uV;
		showPoly = effectController.showPoly;
		mtlName = effectController.mtlName;
		fillScene();
	}

	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {

		uX: 1,
		uY: 1,
		uU: 1,
		uV: 1,

		showPoly: false,

		mtlName: 'grid',

		reset: false
	};

	gui = new dat.GUI();
	gui.add( effectController, "uX", 0.0, 1.5 ).name("right X");
	gui.add( effectController, "uY", 0.0, 1.5 ).name("upper Y");
	gui.add( effectController, "uU", 0.0, 3.0 ).name("right U");
	gui.add( effectController, "uV", 0.0, 3.0 ).name("upper V");
	gui.add( effectController, "showPoly" ).name("show polygon");
	gui.add( effectController, "mtlName", ['crate','grid','maple','feather','darkam'] ).name("texture image");
	gui.add( effectController, "reset" ).name("reset");
}

setupGui();
init();
animate();
