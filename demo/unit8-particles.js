"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Particle System
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Stats */

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer, stats;
var cameraControls;

var clock = new THREE.Clock();

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	//renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0x0, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// STATS

	stats = new Stats();
	stats.setMode( 0 );
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	stats.domElement.children[ 0 ].children[ 0 ].style.color = "#aaa";
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[ 1 ].style.display = "none";

	// CAMERA
	camera = new THREE.PerspectiveCamera( 55, canvasRatio, 2, 8000 );
	camera.position.set( 10, 5, 15 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,0,0);

	fillScene();
}

function fillScene() {
	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0x000000, 0.0004 );

	var geometry = new THREE.Geometry();

	for ( var i = 0; i < 8000; i ++ ) {

		var vertex = new THREE.Vector3();
		// accept the point only if it's in the sphere
		do {
			vertex.x = 2000 * Math.random() - 1000;
			vertex.y = 2000 * Math.random() - 1000;
			vertex.z = 2000 * Math.random() - 1000;
		} while ( vertex.length() > 1000 );

		geometry.vertices.push( vertex );

	}

	var disk = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/disc.png' );
	var material = new THREE.ParticleBasicMaterial(
		{ size: 35, sizeAttenuation: false, map: disk, transparent: true } );
	material.color.setHSL( 0.9, 0.2, 0.6 );

	var particles = new THREE.ParticleSystem( geometry, material );
	particles.sortParticles = true;
	scene.add( particles );
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	renderer.render(scene, camera);
	stats.update();
}

init();
animate();
