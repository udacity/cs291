"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Texture animation
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat, $*/

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();

var uX = 1;
var uY = 1;
var uU = 1;
var uV = 1;

var texture = [];

var material = [];
var mtlName = 'grid';
var wireMaterial;

var wrapName = 'repeat';
var wrapVal = THREE.RepeatWrapping;

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

function setWrap() {
	for (var name in texture)
	{
		if (texture.hasOwnProperty(name)) {
			texture[name].wrapS = wrapVal; texture[name].wrapT = wrapVal;
			// if you change wrap mode, you need to signal that texture needs update
			texture[name].needsUpdate = true;
		}
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
	camera = new THREE.PerspectiveCamera( 1, canvasRatio, 10, 200 );
	camera.position.set( 0.75, 0.5, 100 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0.75,0.5,0);

	wireMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x00FF00 } );

	// TEXTURES
	texture.crate = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/crate.gif' );
	texture.grid = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/ash_uvgrid01.jpg');
	//texture['maple'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/maple.png' );
	//texture['feather'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/feather.png' );
	texture.water = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/water.jpg' );
	texture.concrete = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/concrete.jpg' );
	texture.letterR = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/r_border.png' );

	// MATERIALS
	for (var name in texture)
	{
		if (texture.hasOwnProperty(name)) {
			material[name] = new THREE.MeshBasicMaterial( { map: texture[name], side:THREE.DoubleSide } );
		}
	}

	setWrap();

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
		resetGui();
		// Iterate over all controllers
		for (var i in gui.__controllers) {
			if (gui.__controllers.hasOwnProperty(i)) {
				gui.__controllers[i].updateDisplay();
			}
		}
	}

	var refill = false;
	if ( wrapName !== effectController.wrap )
	{
		wrapName = effectController.wrap;
		refill = true;

		if ( effectController.wrap === 'repeat' )
		{
			wrapVal = THREE.RepeatWrapping;
		} else if ( effectController.wrap === 'mirrored repeat' )
		{
			wrapVal = THREE.MirroredRepeatWrapping;
		} else
		{
			wrapVal = THREE.ClampToEdgeWrapping;
		}

		setWrap();
	}

	if ( refill ||
		showPoly !== effectController.showPoly ||
		mtlName !== effectController.mtlName )
	{
		showPoly = effectController.showPoly;
		mtlName = effectController.mtlName;
		fillScene();
	}

	texture[effectController.mtlName].repeat.set(
		effectController.repeat, effectController.repeat );

	// Student:
	// Transform the texture here to move downwards at
	// a rate of one copy of the texture per second.

	renderer.render(scene, camera);
}

function resetGui() {
	effectController = {

		wrap: 'repeat',
		repeat: 3,

		showPoly: false,

		mtlName: 'water',

		reset: false
	};
}

function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function setupGui() {

	resetGui();

	gui = new dat.GUI();
	gui.add( effectController, "wrap", ['repeat', 'mirrored repeat', 'clamp to edge'] ).name("wrap mode");
	gui.add( effectController, "repeat", 0.0, 10.0 ).name("texture repeat");
	gui.add( effectController, "showPoly" ).name("show polygon");
	gui.add( effectController, "mtlName", ['crate','grid','water','concrete','letterR'] ).name("texture image");
	gui.add( effectController, "reset" ).name("reset");
}

try {
	setupGui();
	init();
	fillScene();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
