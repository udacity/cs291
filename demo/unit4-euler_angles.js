"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Euler angle demo: order of rotation application is Z, Y, X in three.js
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var rings = true;
var airplane;
var ringx,ringy,ringz;

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

	if (rings) {
		createAllRings();
	}

	var planeMaterial = new THREE.MeshPhongMaterial( { color: 0x95E4FB, specular: 0x505050, shininess: 100 } );

	airplane = new THREE.Object3D();

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 15, 32, 16 ), planeMaterial );
	// nose
	sphere.rotation.x = 90 * Math.PI/180;
	sphere.scale.y = 3.0;
	sphere.position.y = 0;
	sphere.position.z = 70;
	airplane.add( sphere );

	var cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 15, 15, 180, 32 ), planeMaterial );
	// body
	cylinder.rotation.x = 90 * Math.PI/180;
	cylinder.position.y = 0;
	cylinder.position.z = -20;
	airplane.add( cylinder );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 20, 20, 250, 32 ), planeMaterial );
	// wing
	cylinder.scale.x = 0.2;
	cylinder.rotation.z = 90 * Math.PI/180;
	cylinder.position.y = 5;
	airplane.add( cylinder );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 15, 15, 100, 32 ), planeMaterial );
	// tail wing
	cylinder.scale.x = 0.2;
	cylinder.rotation.z = 90 * Math.PI/180;
	cylinder.position.y = 5;
	cylinder.position.z = -90;
	airplane.add( cylinder );

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 10, 15, 40, 32 ), planeMaterial );
	// tail
	cylinder.scale.x = 0.15;
	cylinder.rotation.x = -10 * Math.PI/180;
	cylinder.position.y = 20;
	cylinder.position.z = -96;
	airplane.add( cylinder );

	scene.add( airplane );

}

function createAllRings() {
	//create Rings
	ringx = createRing(200,0xFF0000,'x');
	ringy = createRing(175,0x00FF00,'y');
	ringz = createRing(150,0x0000FF,'z');

	//set up rotation hierarchy - assuming x -> y -> z intrinsic
	ringy.add(ringz);
	ringx.add(ringy);

	scene.add(ringx);
}

function createRing(radius,color,axis) {
	var sphere_radius = 12;

	var ringMaterial = new THREE.MeshLambertMaterial({color: color});

	//create ring shape
	var circleMesh = new THREE.Mesh(
		new THREE.TorusGeometry(radius,5,6,50),
		ringMaterial
	);

	var sphereMesh = new THREE.Mesh(
		new THREE.SphereGeometry(sphere_radius,12,10),
		ringMaterial
		);
	sphereMesh.position.x = radius;

	var composite = new THREE.Object3D();
	composite.add(circleMesh);
	composite.add(sphereMesh);
	// composite.add(coneMesh);

	if (axis === 'x') {
		composite.rotation.y = Math.PI/2;
	} else if (axis === 'y') {
		composite.rotation.x = Math.PI/2;
	}

	var ringObj = new THREE.Object3D();
	ringObj.add(composite);

	return ringObj;

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
	camera.position.set( -668, 474, 210 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,0,0);

	fillScene();

}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newAxes !== axes || effectController.newRings !== rings)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		axes = effectController.newAxes;
		rings = effectController.newRings;

		fillScene();
	}

	airplane.rotation.x = effectController.ex * Math.PI/180;	// pitch
	airplane.rotation.y = effectController.ey * Math.PI/180;	// yaw
	airplane.rotation.z = effectController.ez * Math.PI/180;	// roll

	ringx.rotation.x = airplane.rotation.x;
	ringy.rotation.y = airplane.rotation.y;
	ringz.rotation.z = airplane.rotation.z;

	renderer.render(scene, camera);
}



function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newAxes: axes,
		newRings: rings,

		ex: 0.0,
		ey: 0.0,
		ez: 0.0
	};

	var gui = new dat.GUI();
	var h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newAxes" ).name("Show axes");
	h.add( effectController, "newRings").name("Show rings");
	h = gui.addFolder("Euler angles");
	h.add(effectController, "ez", -180.0, 180.0, 0.025).name("Euler z");
	h.add(effectController, "ey", -180.0, 180.0, 0.025).name("Euler y");
	h.add(effectController, "ex", -180.0, 180.0, 0.025).name("Euler x");
}

function takeScreenshot() {
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