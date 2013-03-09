////////////////////////////////////////////////////////////////////////////////

/*global THREE */
var camera, scene, renderer;
var cameraControls;

var clock = new THREE.Clock();

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );
	
	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

	//  GROUND

	// put grid lines every 10000/100 = 100 units
	var solidGround = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshLambertMaterial( { color: 0xffffff } ) );
	solidGround.rotation.x = - Math.PI / 2;
	// cheat: offset by a small amount so grid is on top
	// TODO: better way in three.js? Polygon offset is used in WebGL.
	solidGround.position.y = -0.2;

	scene.add( solidGround );
	
	var ground = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( { color: 0x0, wireframe: true } ) );
	ground.rotation.x = - Math.PI / 2;

	scene.add( ground );

	//////////////////////////////
	// Student modifies this code:
	// MATERIALS
	var headMaterial = new THREE.MeshLambertMaterial( );
	headMaterial.color.r = 104/255;
	headMaterial.color.g = 1/255;
	headMaterial.color.b = 5/255;
				
	var hatMaterial = new THREE.MeshLambertMaterial( );
	hatMaterial.color.r = 24/255;
	hatMaterial.color.g = 38/255;
	hatMaterial.color.b = 77/255;
				
	var bodyMaterial = new THREE.MeshLambertMaterial( );
	bodyMaterial.color.setRGB( 31/255, 86/255, 169/255 );
				
	var legMaterial = new THREE.MeshLambertMaterial( );
	legMaterial.color.setHex( 0xAdA79b );
				
	var footMaterial = new THREE.MeshLambertMaterial( { color: 0x960f0b } );
				
	var sphere, cylinder, cube;
	
	var bevelRadius = 1.9;	// TODO: 2.0 causes some geometry bug.

	// MODELS
	// base
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 20+64+110, 4, 2*77+12, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 4/2;	// half of height
	cube.position.z = 0;	// centered at origin
	scene.add( cube );
				
	// feet
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 20+64+110, 52, 6, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = 77 + 6/2;	// offset 77 + half of depth 6/2
	scene.add( cube );
				
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 20+64+110, 52, 6, bevelRadius ), footMaterial );
	cube.position.x = -45;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 52/2;	// half of height
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	scene.add( cube );
				
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 64, 104, 6, bevelRadius ), footMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104/2;
	cube.position.z = 77 + 6/2;	// negative offset 77 + half of depth 6/2
	scene.add( cube );
				
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 64, 104, 6, bevelRadius ), footMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104/2;
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	scene.add( cube );
				
	// legs
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 60, 282+4, 4, bevelRadius ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104 + 282/2 - 2;
	cube.position.z = 77 + 6/2;	// negative offset 77 + half of depth 6/2
	scene.add( cube );
				
	cube = new THREE.Mesh( 
		new THREE.BeveledBlockGeometry( 60, 282+4, 4, bevelRadius ), legMaterial );
	cube.position.x = 0;	// centered on origin along X
	cube.position.y = 104 + 282/2 - 2;
	cube.position.z = -(77 + 6/2);	// negative offset 77 + half of depth 6/2
	scene.add( cube );
				
	// body
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 116/2, 32, 16 ), bodyMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160;
	sphere.position.z = 0;
	scene.add( sphere );

	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 24/2, 24/2, 390, 32 ), bodyMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
				
	// head
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 104/2, 32, 16 ), headMaterial );
	sphere.position.x = 0;
	sphere.position.y = 160 + 390;
	sphere.position.z = 0;
	scene.add( sphere );

	// hat
	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 142/2, 142/2, 10, 32 ), hatMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
				
	cylinder = new THREE.Mesh( 
		new THREE.CylinderGeometry( 80/2, 80/2, 70, 32 ), hatMaterial );
	cylinder.position.x = 0;
	cylinder.position.y = 160 + 390 + 40 + 10 + 70/2;
	cylinder.position.z = 0;
	scene.add( cylinder );
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
	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 4000 );
	camera.position.set( -1000, 450, -1300 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,300,0);
	
	fillScene();
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

init();
animate();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});