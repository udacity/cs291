////////////////////////////////////////////////////////////////////////////////
// RGB additive color demo  (unit 3)
////////////////////////////////////////////////////////////////////////////////

/*global THREE, requestAnimationFrame, dat, window, document*/

var camera, scene, renderer;
var cameraControls;
var ec;
var clock = new THREE.Clock();
var light1, light2, light3;
var ground;
var intensityRed = 1;
var intensityGreen = 1;
var intensityBlue = 1;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// CAMERA
	camera = new THREE.PerspectiveCamera( 34, window.innerWidth / window.innerHeight, 1, 80000 );
	camera.position.set( 0, 0, 400 );

	var overlap = 1.3;
	light1 = new THREE.SpotLight();
	light1.color.setRGB(intensityRed, 0, 0);
	light1.position.set( 0, 50/overlap, 1000 );
	light1.angle = 0.08;
	light1.exponent = 0;
	light1.target.position.set( 0, 50/overlap, 0 );

	light2 = new THREE.SpotLight();
	light2.color.setRGB(0, intensityGreen, 0);
	light2.position.set( -61/overlap, -50/overlap, 1000 );
	light2.exponent = 0;
	light2.target.position.set( -61/overlap, -50/overlap, 0 );
	light2.angle = 0.08;

	light3 = new THREE.SpotLight();
	light3.color.setRGB(0, 0, intensityBlue);
	light3.position.set( 61/overlap, -50/overlap, 1000 );
	light3.exponent = 0;
	light3.target.position.set( 61/overlap, -50/overlap, 0 );
	light3.angle = 0.08;

	//  GROUND

	var gg = new THREE.PlaneGeometry( 270, 250, 2*270, 2*250 );
	var gm = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } );
	//gm.specular.setRGB(0,0,0);

	ground = new THREE.Mesh( gg, gm );

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

		red: intensityRed,
		green: intensityGreen,
		blue: intensityBlue
	};

	var gui = new dat.GUI();
	var element = gui.add( ec, "red", 0.0, 1.0 ).step(0.1);
	element.name("Red intensity");
	element = gui.add( ec, "green", 0.0, 1.0 ).step(0.1);
	element.name("Green intensity");
	element = gui.add( ec, "blue", 0.0, 1.0 ).step(0.1);
	element.name("Blue intensity");
}


//

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	var delta = clock.getDelta();

	cameraControls.update( delta );
	if ( ec.red !== intensityRed || ec.green !== intensityGreen || ec.blue !== intensityBlue)
	{
		light1.intensity = ec.red;
		light2.intensity = ec.green;
		light3.intensity = ec.blue;
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


}

init();
animate();






