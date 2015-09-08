"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Tessellation demo
////////////////////////////////////////////////////////////////////////////////
/*global THREE, dat, window, document*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var ambientLight, light;
var tess = 3;	// force initialization
var wire;
var flat;
var sphere;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// CAMERA

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );
	camera.position.set( -300, 300, -1500 );
	camera.lookAt(0,0,0);
	// LIGHTS

	ambientLight = new THREE.AmbientLight( 0xFFFFFF );

	light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
	light.position.set( -800, 900, 300 );

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// EVENTS
	window.addEventListener( 'resize', onWindowResize, false );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	scene.add( ambientLight );
	scene.add( light );

	fillScene();
	// GUI
	setupGui();
}

function setupGui() {
	effectController = {
		newTess: 6,
		newFlat: false,
		newWire: false
	};
	var gui = new dat.GUI();
	gui.add(effectController, "newTess", [2,3,4,5,6,8,10,12,16,24,32] ).name("Tessellation Level");
	gui.add( effectController, "newFlat" ).name("Flat Shading");
	gui.add( effectController, "newWire" ).name("Show wireframe only");
}
var material1 = new THREE.MeshLambertMaterial( { color: 0xFFFF00, shading: THREE.FlatShading } );
var ka = 0.4;
material1.ambient.setRGB( material1.color.r * ka, material1.color.g * ka, material1.color.b * ka );
var material2 = new THREE.MeshLambertMaterial( { color: 0xFFFF00} );
material2.ambient.setRGB( material2.color.r * ka, material2.color.g * ka, material2.color.b * ka );
var material3 = new THREE.MeshLambertMaterial( { color: 0xFFFF00, wireframe: true } );

function fillScene() {

	var material = wire ? material3 : (flat ? material1 : material2 );
	
	if ( sphere !== undefined ) {

		sphere.geometry.dispose();
		scene.remove( sphere );
					
	}

	sphere = new THREE.Mesh(new THREE.SphereGeometry( 400, tess*2, tess ), material);

	scene.add( sphere );

	//Coordinates.drawGround({size:1000});
	//Coordinates.drawGrid({size:1000,scale:0.01});
	//Coordinates.drawAllAxes({axisLength:500,axisRadius:1,axisTess:4});
}

// EVENT HANDLERS

function onWindowResize() {

	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	renderer.setSize( canvasWidth, canvasHeight );

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();
}

//

function animate() {

	window.requestAnimationFrame( animate );
	render();

}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	if ( effectController.newTess !== tess || effectController.newFlat !== flat || effectController.newWire !== wire)
	{
		tess = effectController.newTess;
		flat = effectController.newFlat;
		wire = effectController.newWire;

		fillScene();
	}
	renderer.render( scene, camera );

}



init();
animate();

