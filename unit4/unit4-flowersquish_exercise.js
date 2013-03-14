////////////////////////////////////////////////////////////////////////////////
// Flower petal improvement: scale and re-orient the petals to look better
////////////////////////////////////////////////////////////////////////////////

/*global THREE, Coordinates, $, document, window, dat */

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );

	var light = new THREE.DirectionalLight( 0xffffff, 1.0 );
	light.position.set( 200, 400, 500 );
	
	var light2 = new THREE.DirectionalLight( 0xffffff, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	if (ground) {
		Coordinates.drawGround({size:10000});		
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
	
	var petalMaterial = new THREE.MeshLambertMaterial( { color: 0xCC5920 } );
	
	var flowerHeight = 200;
	
	var petalLength = 120;
	
	var cylGeom = new THREE.CylinderGeometry( 15, 0, petalLength, 32 );
		
	var flower = new THREE.Object3D();
	
	/////////
	// student: add code here to make 24 petals, radiating around the sphere.
	// Scales, rotates, and positions on the cylinder and petals are needed.
	var cylinder = new THREE.Mesh( cylGeom, petalMaterial );
	var petal = new THREE.Object3D();
	petal.add( cylinder );

	flower.add( petal );
	
	/////////
	
	var stamenMaterial = new THREE.MeshLambertMaterial( { color: 0x333310 } );
	var stamen = new THREE.Mesh( 
		new THREE.SphereGeometry( 20, 32, 16 ), stamenMaterial );
	stamen.position.y = flowerHeight;	// move to flower center
	flower.add( stamen );

	var stemMaterial = new THREE.MeshLambertMaterial( { color: 0x339424 } );
	var stem = new THREE.Mesh( 
		new THREE.CylinderGeometry( 10, 10, flowerHeight, 32 ), stemMaterial );
	stem.position.y = flowerHeight/2;	// move from ground to stamen
	flower.add( stem );

	scene.add( flower );
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
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 10000 );
	camera.position.set( -510, 540, 100 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,200,0);
	
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
	
	renderer.render(scene, camera);
}



function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes
	};

	var gui = new dat.GUI();
	var h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");
}

function takeScreenshot() {
	effectController.newGround = true, effectController.newGridX = false, effectController.newGridY = false, effectController.newGridZ = false, effectController.newAxes = false;
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