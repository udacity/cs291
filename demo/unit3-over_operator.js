"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Over operator for blending and how it works
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = false;
var sourceMaterial, destMaterial;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( -2000, 140, 0 );
	
	scene.add(light);
	
	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( 2000, 140, 0 );
	
	scene.add(light2);

	if (ground) {
		Coordinates.drawGround({size:10000, color:0xE5E566});		
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
	
	destMaterial = new THREE.MeshLambertMaterial( { color: 0xE5E566 } );

	sourceMaterial = new THREE.MeshLambertMaterial( { color: 0xE53319, opacity: 0.7, transparent: true } );

	// block
	var cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 10, 50, 150 ), destMaterial );
	cube.position.x = 30;
	scene.add( cube );
	
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 10, 150, 50 ), sourceMaterial );
	cube.position.x = -30;
	scene.add( cube );
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

	// CAMERA
	camera = new THREE.PerspectiveCamera( 13, canvasRatio, 1, 10000 );
	camera.position.set( -800, 0, 0 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,0,0);
	
	fillScene();
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	sourceMaterial.color.setRGB( effectController.sred, effectController.sgreen, effectController.sblue );
	sourceMaterial.opacity = effectController.alpha;
	
	destMaterial.color.setRGB( effectController.dred, effectController.dgreen, effectController.dblue );
	
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

	var gui = new dat.GUI();
	gui.add( effectController, "alpha", 0.0, 1.0, 0.025).name("Alpha");
	var h = gui.addFolder( "Source color" );

	h.add( effectController, "sred", 0.0, 1.0, 0.025 ).name("red");
	h.add( effectController, "sgreen", 0.0, 1.0, 0.025 ).name("green");
	h.add( effectController, "sblue", 0.0, 1.0, 0.025 ).name("blue");
	
	h = gui.addFolder( "Destination color" );

	h.add( effectController, "dred", 0.0, 1.0, 0.025 ).name("red");
	h.add( effectController, "dgreen", 0.0, 1.0, 0.025 ).name("green");
	h.add( effectController, "dblue", 0.0, 1.0, 0.025 ).name("blue");
}

function takeScreenshot() {
	init();
	render();
	var img1 = renderer.domElement.toDataURL("image/png");
	camera.position.set( -1000, 140, 0 );
	render();
	var img2 = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img1+'"/><img src="'+img2+'"/>');
}

init();
setupGui();
animate();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});