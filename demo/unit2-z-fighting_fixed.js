"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Z-fighting demo
////////////////////////////////////////////////////////////////////////////////
/*global THREE, $, Coordinates, requestAnimationFrame*/

var camera, scene, renderer;
var cameraControls;
var clock = new THREE.Clock();
function drawDrinkingBird() {

	// MATERIALS
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xA00000 } );
	var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xF07020 } );
	var cylinderMaterial = new THREE.MeshLambertMaterial( { color: 0x0000D0 } );
	var legMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF } );
	
	var sphere, cylinder, cube;

	// MODELS
	// base
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 20+64+110, 4, 2*77 ), cubeMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 4/2;	// half of height
	cube.position.z = 0;	// centered at origin
	scene.add( cube );
	
	// left foot
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 20+64+110, 52, 6 ), cubeMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = 77 + 6/2;	// offset 77 + half of depth 6/2
	scene.add( cube );
	
	// left leg
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 64, 334, 6 ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 334/2 + 52;
	cube.position.z = 77 + 6/2;	// negative offset 77 + half of depth 6/2
	scene.add( cube );
	
	////////////////////////
	// What the student adds
	
	// right foot
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 20+64+110, 52, 6 ), cubeMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	scene.add( cube );
	
	// right leg
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 64, 334, 6 ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 334/2 + 52;
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	scene.add( cube );
	
	// body
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 116/2, 32, 16 ), sphereMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160;
	sphere.position.z = 0;
	scene.add( sphere );

	// head
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 104/2, 32, 16 ), sphereMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160 + 390;
	sphere.position.z = 0;
	scene.add( sphere );

	// head/body connector
	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 24/2, 24/2, 390, 32 ), cylinderMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
	
	// hat brim
	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 142/2, 142/2, 10, 32 ), cylinderMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
	
	// hat top
	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 80/2, 80/2, 70, 32 ), cylinderMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10 + 70/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
}

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	// SCENE
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) );
	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );
	scene.add( light );
	
	light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( -400, 200, -300 );
	scene.add( light );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( scene.fog.color, 1 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );


	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	camera.position.set( -330, 178, -400 );
	// CONTROLS
	// For this demo, unconstrained viewing is good, to allow other angles.
	cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
	// focus on the feet
	cameraControls.target.set(0,0,0);

	Coordinates.drawGround({size:10000});
	Coordinates.drawGrid({size:10000,scale:0.01});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
}

//

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.render(scene, camera);
}

function takeScreenshot() {
	init();
	drinkingBird = drawDrinkingBird();
	scene.add(drinkingBird);
	render();
	var img1 = renderer.domElement.toDataURL("image/png");
	camera.position.set( 400, 500, -800 );
	render();
	var img2 = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img1+'"/><img src="'+img2+'"/>');
}

init();
var drinkingBird = drawDrinkingBird();
scene.add(drinkingBird);
animate();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});