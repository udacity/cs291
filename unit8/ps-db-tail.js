"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Add a tail feather to the drinking bird
////////////////////////////////////////////////////////////////////////////////
/*global THREE, $ */

var camera, scene, renderer;
var cameraControls;
var bevelRadius = 1.9;
var clock = new THREE.Clock();
var cube, sphere, cylinder;

function createTail() {
	// Student: add the tail texture here
	// texture is located at /media/img/cs291/textures/feather.png
	var tail = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100, 1, 1 ),
		new THREE.MeshLambertMaterial(
			{ side: THREE.DoubleSide } ) );

	// I need the order to be X rotation before Y, so set the order to YZX;
	// note that, as usual, the order is read right to left.
	tail.eulerOrder = 'YZX';
	tail.scale.y = 2;
	tail.rotation.x = 40.0 * Math.PI / 180;
	tail.rotation.y = 90.0 * Math.PI / 180;
	tail.position.x = 120;
	tail.position.y = 250;

	return tail;
}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xAAAAAA, 3000, 5000 );

	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) );
	var light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
	light.position.set( 200, 500, 500 );
	scene.add( light );
	light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
	light.position.set( -200, -100, -400 );
	scene.add( light );

	// Bird
	var bird = new THREE.Object3D();
	createDrinkingBird( bird );
	scene.add( bird );

}

function createSupport( bsupport ) {
	var legMaterial = new THREE.MeshPhongMaterial( { shininess: 4 } );
	legMaterial.color.setHex( 0xAdA79b );
	legMaterial.specular.setRGB( 0.5, 0.5, 0.5 );
	legMaterial.ambient.copy( legMaterial.color );

	var footMaterial = new THREE.MeshPhongMaterial( { color: 0x960f0b, shininess: 30 } );
	footMaterial.specular.setRGB( 0.5, 0.5, 0.5 );
	footMaterial.ambient.copy( footMaterial.color );

	// base
	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 20+64+110, 4, 2*77+12, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 4/2;	// half of height
	cube.position.z = 0;	// centered at origin
	bsupport.add( cube );

	// feet
	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 20+64+110, 52, 6, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = 77 + 6/2;	// offset 77 + half of depth 6/2
	bsupport.add( cube );

	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 20+64+110, 52, 6, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	bsupport.add( cube );

	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 64, 104, 6, bevelRadius ), footMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104/2;
	cube.position.z = 77 + 6/2;	// negative offset 77 + half of depth 6/2
	bsupport.add( cube );

	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 64, 104, 6, bevelRadius ), footMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104/2;
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	bsupport.add( cube );

	// legs
	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 60, 282+4, 4, bevelRadius ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104 + 282/2 - 2;
	cube.position.z = 77 + 6/2;	// negative offset 77 + half of depth 6/2
	bsupport.add( cube );

	cube = new THREE.Mesh(
		new THREE.BeveledBlockGeometry( 60, 282+4, 4, bevelRadius ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104 + 282/2 - 2;
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	bsupport.add( cube );
}

// Body of the bird - body and the connector of body and head
function createBody(bbody) {
	var bodyMaterial = new THREE.MeshPhongMaterial( { shininess: 100 } );
	bodyMaterial.color.setRGB( 31/255, 86/255, 169/255 );
	bodyMaterial.specular.setRGB( 0.5, 0.5, 0.5 );
	bodyMaterial.ambient.copy( bodyMaterial.color );

	var glassMaterial = new THREE.MeshPhongMaterial( { color: 0x0, specular: 0xFFFFFF, shininess: 100, opacity: 0.3, transparent: true } );
	glassMaterial.ambient.copy( glassMaterial.color );

	var crossbarMaterial = new THREE.MeshPhongMaterial( { color: 0x808080, specular: 0xFFFFFF, shininess: 400 } );
	crossbarMaterial.ambient.copy( crossbarMaterial.color );

	// body
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 104/2, 32, 16, 0, Math.PI * 2, Math.PI/2, Math.PI ), bodyMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160;
	sphere.position.z = 0;
	bbody.add( sphere );

	// cap for top of hemisphere
	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 104/2, 104/2, 0, 32 ), bodyMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160;
	cylinder.position.z = 0;
	bbody.add( cylinder );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 12/2, 12/2, 390 - 100, 32 ), bodyMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390/2 - 100;
	cylinder.position.z = 0;
	bbody.add( cylinder );

	// glass stem
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 116/2, 32, 16 ), glassMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160;
	sphere.position.z = 0;
	bbody.add( sphere );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 24/2, 24/2, 390, 32 ), glassMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390/2;
	cylinder.position.z = 0;
	bbody.add( cylinder );

	// crossbar
	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 5, 5, 200, 32 ), crossbarMaterial );
	cylinder.position.set( 0, 360, 0 );
	cylinder.rotation.x = 90 * Math.PI / 180.0;
	bbody.add( cylinder );
	var tail = createTail();
	bbody.add(tail);
}

// Head of the bird - head + hat
function createHead(bhead) {
	var headMaterial = new THREE.MeshLambertMaterial( );
	headMaterial.color.r = 104/255;
	headMaterial.color.g = 1/255;
	headMaterial.color.b = 5/255;
	headMaterial.ambient.copy( headMaterial.color );

	var hatMaterial = new THREE.MeshPhongMaterial( { shininess: 100 } );
	hatMaterial.color.r = 24/255;
	hatMaterial.color.g = 38/255;
	hatMaterial.color.b = 77/255;
	hatMaterial.specular.setRGB( 0.5, 0.5, 0.5 );
	hatMaterial.ambient.copy( hatMaterial.color );

	var eyeMaterial = new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x303030, shininess: 4 } );
	eyeMaterial.ambient.copy( eyeMaterial.color );

	// head
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 104/2, 32, 16 ), headMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160 + 390;
	sphere.position.z = 0;
	bhead.add( sphere );

	// hat
	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 142/2, 142/2, 10, 32 ), hatMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10/2;
	cylinder.position.z = 0;
	bhead.add( cylinder );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 80/2, 80/2, 70, 32 ), hatMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10 + 70/2;
	cylinder.position.z = 0;
	bhead.add( cylinder );

	// nose
	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 6, 14, 70, 32 ), headMaterial );
	cylinder.position.set( -70, 530, 0 );
	cylinder.rotation.z = 90 * Math.PI / 180.0;
	bhead.add( cylinder );

	// eyes
	var sphGeom = new THREE.SphereGeometry( 10, 32, 16 );

	// left eye
	sphere = new THREE.Mesh( sphGeom, eyeMaterial );
	sphere.position.set( -48, 560, 0 );
	var eye = new THREE.Object3D();
	eye.add( sphere );
	eye.rotation.y = 20 * Math.PI / 180.0;
	bhead.add( eye );

	// right eye
	sphere = new THREE.Mesh( sphGeom, eyeMaterial );
	sphere.position.set( -48, 560, 0 );
	eye = new THREE.Object3D();
	eye.add( sphere );
	eye.rotation.y = -20 * Math.PI / 180.0;
	bhead.add( eye );
}

function createDrinkingBird(bbird) {
	var support = new THREE.Object3D();
	var body = new THREE.Object3D();
	var head = new THREE.Object3D();

	// MODELS
	// base + legs + feet
	createSupport(support);

	// body + body/head connector
	createBody(body);

	// head + hat
	createHead(head);

	// make moving piece

	var bodyhead = new THREE.Object3D();
	bodyhead.add(body);
	bodyhead.add(head);

	bbird.add(support);
	bbird.add(bodyhead);
}

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 35, canvasRatio, 1, 8000 );
	camera.position.set( -220, 820, -1260 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,270,0);

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
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	renderer.render(scene, camera);
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
