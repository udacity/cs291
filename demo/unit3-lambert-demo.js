"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
/*global THREE, requestAnimationFrame, document, window, dat*/
var camera, scene, renderer;

var cameraControls;

var effectController;

var clock = new THREE.Clock();

var ambientLight, light;
var sphere, material;

init();
animate();

function init() {

	// CAMERA

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );
	camera.position.set( -1000, 450, -1300 );

	// SCENE

	scene = new THREE.Scene();

	scene.add( camera );

	// LIGHTS

	ambientLight = new THREE.AmbientLight( 0xffffff );
	scene.add( ambientLight );

	light = new THREE.DirectionalLight( 0xffffff, 1.0 );
	light.position.set( -620, 390, 100 );

	scene.add( light );
	
	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );


	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// CONTROLS

	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);
	
	// MATERIAL
	material = new THREE.MeshLambertMaterial( { color: 0x80fc66 } );
	var ka = 0.4;
	material.ambient.setRGB( material.color.r * ka, material.color.g * ka, material.color.b * ka );

	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 400, 64, 32 ), material );
	
	scene.add( sphere );
	
	// GUI

	setupGui();
}

function setupGui() {

	effectController = {
	
	Ka: 0.3,
	Kd: 0.7,

	Hue:    0.09,
	Saturation: 0.46,
	Lightness:    1.0

	};

	var gui = new dat.GUI();

	// material (color)

	gui.add( effectController, "Hue", 0.0, 1.0 );
	gui.add( effectController, "Saturation", 0.0, 1.0 );
	gui.add( effectController, "Lightness", 0.0, 1.0 );

	// material (attributes)

	gui.add( effectController, "Ka", 0.0, 1.0 );
	gui.add( effectController, "Kd", 0.0, 1.0 );

}

//

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	var delta = clock.getDelta();
	
	cameraControls.update( delta );
	
	var materialColor = new THREE.Color();
	materialColor.setHSL( effectController.Hue, effectController.Saturation, effectController.Lightness * effectController.Kd );
	material.color.copy( materialColor );
	materialColor.setHSL( effectController.Hue, effectController.Saturation, effectController.Lightness * effectController.Ka );
	material.ambient.copy( materialColor );
	
	renderer.render( scene, camera );

}
