"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Add a specular texture
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, $ */

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
var teapotSize = 400;

function createMaterial() {
	// MATERIALS
	// Student: use the texture '/media/img/cs291/textures/water.jpg'
	var material = new THREE.MeshPhongMaterial( { shininess: 50 } );
	material.color.setHSL( 0.09, 0.46, 0.2 );
	material.ambient.copy( material.color );
	material.specular.setHSL( 0.09, 0.46, 1.0 );

	return material;
}

function fillScene() {
	scene = new THREE.Scene();
	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x333333 ) );
	var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
	light.position.set( 200, 300, 500 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
	light.position.set( -200, -100, -400 );
	scene.add( light );

	var material = createMaterial();
	var teapot = new THREE.Mesh(
		new THREE.TeapotGeometry( teapotSize,
			8, true, true, true, true, true ),
		material );

	scene.add( teapot );
}

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;

	// CAMERA

	camera = new THREE.PerspectiveCamera( 45, canvasWidth/ canvasHeight, 100, 20000 );
	camera.position.set( -222, 494, 1746 );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, -160, 0);

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

	requestAnimationFrame( animate );
	render();

}

function render() {
	var delta = clock.getDelta();
	cameraControls.update( delta );

	renderer.render( scene, camera );
}


try {
	init();
	fillScene();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
