"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Change angle of light to see how effect decreases with angle
////////////////////////////////////////////////////////////////////////////////

/*global THREE, requestAnimationFrame, dat, window, document*/

var camera, scene, renderer;
var cameraControls;
var ec;
var clock = new THREE.Clock();
var light1, light2, light3;
var ground, lightMesh;
var angle = 0;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );
	camera.position.set( 0, 0, 100 );

	light1 = new THREE.SpotLight();
	light1.color.setRGB(1, 0, 0);
	light1.position.set( -100*Math.sin(angle * Math.PI/180), 0, 100*Math.cos(angle * Math.PI/180) );
	light1.angle = 0.1;
	light1.exponent = 0;
	light1.target.position.set( 0, 0, 0 );

	var lightMaterial = new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true});
	var lightSpot = new THREE.SphereGeometry( 2, 32, 16 );
	lightMesh = new THREE.Mesh( lightSpot, lightMaterial );
	lightMesh.position.x = light1.position.x;
	lightMesh.position.z = light1.position.z;


	// GROUND
	var gg = new THREE.PlaneGeometry( 75, 75, 5, 5 );
	var gm = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide} );
	gm.specular.setRGB(0,0,0);
	var wire = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true });

	ground = new THREE.SceneUtils.createMultiMaterialObject(gg, [gm, wire]);
	//ground = new THREE.Mesh( gg, gm );
	ground.position.y = -0.1;
	//ground.add(new THREE.AxisHelper(100));
	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// EVENTS

	window.addEventListener( 'resize', onWindowResize, false );

	// CONTROLS

	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);

	fillScene();
	// GUI
	setupGui();

}

// EVENT HANDLERS

function onWindowResize() {

	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	renderer.setSize( canvasWidth, canvasHeight );

	camera.aspect = canvasWidth/ canvasHeight;
	camera.updateProjectionMatrix();

}

function setupGui() {

	ec = {

		angle: angle
	};

	var gui = new dat.GUI();
	var element = gui.add( ec, "angle", 0.0, 90.0 ).step(0.1);
	element.name("Light angle");
}


//

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	var delta = clock.getDelta();

	cameraControls.update( delta );
	if ( ec.angle !== 0)
	{
		light1.position.set( -100*Math.sin(ec.angle * Math.PI/180), 0, 100*Math.cos(ec.angle * Math.PI/180) );
		lightMesh.position.x = light1.position.x;
		lightMesh.position.z = light1.position.z;
	}
	renderer.render( scene, camera );

}

function fillScene() {
	scene = new THREE.Scene();

	// LIGHTS
	scene.add( light1 );
	scene.add( light2 );
	scene.add( light3 );

	scene.add( ground );
	scene.add(lightMesh);
	//Coordinates.drawGrid({size:75,scale:0.1, orientation:"z"});

}

init();
animate();






