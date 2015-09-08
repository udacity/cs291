"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Magnification demo
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

var texture = [];

var material = [];
var mtlName = 'checker 2x2';
var wireMaterial;

var wrapVal = THREE.RepeatWrapping;

var magName = 'nearest';
var magVal = THREE.NearestFilter;

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

function setFilters() {

	// MATERIALS
	for (var name in texture)
	{
		if (texture.hasOwnProperty(name)) {
			texture[name].magFilter = magVal;
			// turn off minification to show problem
			texture[name].minFilter = THREE.NearestFilter;
			texture[name].wrapS = wrapVal; texture[name].wrapT = wrapVal;
			// if you change filtering, you need to signal that texture needs update
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
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	//renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer = new THREE.WebGLRenderer( );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// Camera: Y up, X right, Z up
	camera = new THREE.PerspectiveCamera( 1, canvasRatio, 1, 2000 );
	camera.position.set( 30, 32, 90 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0.75,0.5,0);

	wireMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x00FF00 } );

	// TEXTURES
	// If you change the magnify mode, you must reload texture?
	texture['checker 1x1 (gray)'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker1x1.png' );
	texture['checker 2x2'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker2x2.png' );
	texture['checker 4x4'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker4x4.png' );
	texture['checker 8x8'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker8x8.png' );
	texture['checker 16x16'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker16x16.png' );
	texture['checker 32x32'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker32x32.png' );
	texture['checker 64x64'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker64x64.png' );
	texture['checker 128x128'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker128x128.png' );
	texture['checker 256x256'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker256x256.png' );
	texture['checker 512x512'] = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/checker512x512.png' );

	setFilters();

	for (var name in texture)
	{
		if (texture.hasOwnProperty(name)) {
			texture[name].repeat.set( effectController.repeat, effectController.repeat );
			material[name] = new THREE.MeshBasicMaterial( { map: texture[name], side:THREE.DoubleSide } );
		}
	}

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
	if ( magName !== effectController.magnification )
	{
		magName = effectController.magnification;
		refill = true;

		if ( effectController.magnification === 'nearest' )
		{
			magVal = THREE.NearestFilter;
		} else
		{
			magVal = THREE.LinearFilter;
		}

		setFilters();
	}

	if ( refill ||
		showPoly !== effectController.showPoly ||
		mtlName !== effectController.mtlName )
	{
		showPoly = effectController.showPoly;
		mtlName = effectController.mtlName;
		fillScene();
	}

	for (var name in texture)
	{
		if (texture.hasOwnProperty(name)) {
			//texture[name].offset.set( effectController.offset, effectController.offset );
			texture[name].repeat.set( effectController.repeat, effectController.repeat );
		}
	}

	camera.fov = 1/effectController.zoom;
	camera.updateProjectionMatrix();
	renderer.render(scene, camera);
}

function resetGui() {
	effectController.magnification = 'nearest';
	effectController.zoom = 1;
	effectController.repeat = 3;

	effectController.showPoly = false;

	effectController.mtlName = 'checker 2x2';

	effectController.reset = false;
}

function setupGui() {
	effectController = {
		// Actually, resetGui sets the values, use that for defaults
		magnification: 'nearest',
		zoom: 1,
		repeat: 3,

		showPoly: false,

		mtlName: 'checker 2x2',

		reset: false
	};

	resetGui();

	gui = new dat.GUI();
	gui.add( effectController, "magnification", ['nearest','linear'] ).name("magnification");
	gui.add( effectController, "repeat", 0.0, 10.0 ).name("texture repeat");
	gui.add( effectController, "zoom", 0.2, 5.0 ).name("zoom");
	gui.add( effectController, "showPoly" ).name("show polygon");
	gui.add( effectController, "mtlName", ['checker 2x2','checker 4x4','checker 8x8','checker 16x16','checker 32x32','checker 64x64','checker 128x128','checker 256x256','checker 512x512'] ).name("texture image");
	gui.add( effectController, "reset" ).name("reset");
}

setupGui();
init();
animate();
