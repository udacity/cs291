"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Smooth shading exercise: change program to make sphere look smooth
////////////////////////////////////////////////////////////////////////////////
/*global THREE, window, document, $*/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let ambientLight, light;

function init() {
	document.body.style.margin = "0";
	document.body.style.padding = "0";
	document.body.style.overflow = "hidden";

	let canvasWidth = document.documentElement.clientWidth;
	let canvasHeight = document.documentElement.clientHeight;

	let canvasRatio = canvasWidth / canvasHeight;

	// CAMERA

	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 80000 );
	camera.position.set( -300, 300, -1000 );
	camera.lookAt(0,0,0);
	// LIGHTS

	ambientLight = new THREE.AmbientLight( 0xFFFFFF );

	light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
	light.position.set( -800, 900, 300 );

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	let container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);

}

function createBall() {
	let material = new THREE.MeshLambertMaterial( { color: 0x80FC66} );
	let ka = 0.4;
	material.ambient.setRGB( material.color.r * ka, material.color.g * ka, material.color.b * ka );
	let sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 400, 64, 32 ), material );
	return sphere;
}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	scene.add( ambientLight );
	scene.add( light );

	let ball = createBall();
	scene.add( ball );

	//Coordinates.drawGround({size:1000});
	//Coordinates.drawGrid({size:1000,scale:0.01});
	//Coordinates.drawAllAxes({axisLength:500,axisRadius:1,axisTess:4});
}

function addToDOM() {
	let container = document.getElementById('container');
	let canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function animate() {

	window.requestAnimationFrame( animate );
	render();

}

function render() {
	let delta = clock.getDelta();
	cameraControls.update(delta);

	renderer.render( scene, camera );

}

try {
	init();
	fillScene();
	addToDOM();
	animate();
} catch(e) {
	let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
