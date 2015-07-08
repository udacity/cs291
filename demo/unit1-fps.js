"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// FPS demo
// Use the slider to adjust FPS an see how that changes the responsiveness
// of the scene.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, Stats, dat, window, document */

var container, camera, scene, renderer, stats;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var teapotSize = 400;
var ambientLight, light, light2;
var teapot;
var newTime = 0, oldTime = 0;

function setupGui() {

	effectController = {
		fps: 6.0
	};

	var gui = new dat.GUI();

	var element = gui.add( effectController, "fps", 1.0, 60.0 ).step(1.0);
	element.name("FPS");
}

function addToDOM() {
	container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 80000 );
	camera.position.set( -800, 700, 1600 );

	// SCENE
	scene = new THREE.Scene();

	// LIGHTS
	ambientLight = new THREE.AmbientLight( 0x222222 );
	scene.add( ambientLight );

	light = new THREE.DirectionalLight( 0xFFFFFF, 0.8 );
	light.position.set( 320, 390, 700 );
	scene.add( light );

	light2 = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );
	light2.position.set( -720, -190, -300 );
	scene.add( light2 );

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	addToDOM();
	// STATS
	stats = new Stats();
	stats.setMode( 1 );
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var lambertMaterial = new THREE.MeshLambertMaterial( { color: 0xb00505 } );
	lambertMaterial.side = THREE.DoubleSide;

	// to test texturing, uncomment the following four lines
	//var path = "/";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity
	//var texture = THREE.ImageUtils.loadTexture( path + 'textures/ash_uvgrid01.jpg' );
	//texture.anisotropy = renderer.getMaxAnisotropy();
	//flatGouraudMaterial = new THREE.MeshLambertMaterial( { map: texture } );

	teapot = new THREE.Mesh(
		new THREE.TeapotGeometry( teapotSize, 8, true, true, true, true ),
		lambertMaterial );

	scene.add( teapot );

	// GUI
	setupGui();
}

function render() {

	var delta = clock.getDelta();

	cameraControls.update( delta );

	newTime += delta;

	// fudge factor: 0.95 correlates closer to true frame rate numbers;
	// basically, there's some friction as far as timing goes, and this adjusts for it.
	var frameTime = 0.95/effectController.fps;
	if ( effectController.fps > 59.9 )
	{
		// At 60 FPS, simply go as fast as possible;
		// Not doing so can force a frame time that is less than 60 FPS.
		frameTime = 0;
	}

	if ( newTime > oldTime + frameTime )
	{
		oldTime = newTime;
		renderer.render( scene, camera );
		stats.update();
	}
}

function animate() {

	requestAnimationFrame( animate );
	render();

}

init();
animate();
