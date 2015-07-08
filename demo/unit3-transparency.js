"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Transparency demo, showing problems of multiple transparent objects
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = true;
var movingCube;
var movingSphere;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );
	
	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	if (ground) {
		Coordinates.drawGround({size:10000, color:0xF8E7BE});		
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
	
	var faceMaterial = new THREE.MeshLambertMaterial( { color: 0x0087E6, opacity: 0.7, transparent: true } );

	
	var cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 0, 80, 130, 32 ), faceMaterial );
	cylinder.position.x = 40;
	cylinder.position.y = 65;
	cylinder.position.z = 180;
	scene.add( cylinder );
	
	var sphere = new THREE.Mesh( 
		new THREE.SphereGeometry( 70, 32, 16 ), faceMaterial );
	sphere.position.x = -30;
	sphere.position.y = 70;
	sphere.position.z = -180;
	scene.add( sphere );

	var movingSphereMaterial = new THREE.MeshLambertMaterial( { color: 0xE53319 } );
	movingSphereMaterial.color.r *= 0.3;
	movingSphereMaterial.color.g *= 0.3;
	movingSphereMaterial.color.b *= 0.3;
	movingSphere = new THREE.Mesh( 
		new THREE.SphereGeometry( 5, 32, 16 ), movingSphereMaterial );
	movingSphere.position.x = 130;
	movingSphere.position.y = 100;
	scene.add( movingSphere );

	var movingBoxMaterial = new THREE.MeshLambertMaterial( { color: 0xE53319, opacity: 0.7, transparent: true } );
	// , side: THREE.DoubleSide
	movingCube = new THREE.Mesh( 
		new THREE.CubeGeometry( 200, 50, 100 ), movingBoxMaterial );
	movingCube.position.x = 130;
	movingCube.position.y = 100;
	scene.add( movingCube );
	
	var sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xE5E566 } );
	sphereMaterial.color.r *= 0.3;
	sphereMaterial.color.g *= 0.3;
	sphereMaterial.color.b *= 0.3;
	sphere = new THREE.Mesh( 
		new THREE.SphereGeometry( 5, 32, 16 ), sphereMaterial );
	sphere.position.x = 0;
	sphere.position.y = 100;
	scene.add( sphere );

	var boxMaterial = new THREE.MeshLambertMaterial( { color: 0xE5E566, opacity: 0.7, transparent: true } );
	// , side: THREE.DoubleSide
	var cube = new THREE.Mesh( 
	new THREE.CubeGeometry( 50, 100, 200 ), boxMaterial );
	cube.position.x = 0;
	cube.position.y = 100;
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
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, canvasRatio, 1, 10000 );
	camera.position.set( -420, 400, 100 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,100,0);
	
	fillScene();

}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();
	}
	movingSphere.position.x = effectController.x;
	movingCube.position.x = effectController.x;
	renderer.render(scene, camera);
}



function setupGui() {

	effectController = {

		x: 130,
		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes
	};

	var gui = new dat.GUI();
	gui.add( effectController, "x", -150, 150, 0.25).name("X position");
	//gui.add( effectController, "newGridX").name("Show XZ grid");
	//gui.add( effectController, "newGridY" ).name("Show YZ grid");
	//gui.add( effectController, "newGridZ" ).name("Show XY grid");
	//gui.add( effectController, "newGround" ).name("Show ground");
	//gui.add( effectController, "newAxes" ).name("Show axes");
}

function takeScreenshot() {
	effectController.newGround = true;
	effectController.newGridX = false;
	effectController.newGridY = false;
	effectController.newGridZ = false;
	effectController.newAxes = false;
	init();
	render();
	var img1 = renderer.domElement.toDataURL("image/png");
	camera.position.set( 400, 500, -800 );
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