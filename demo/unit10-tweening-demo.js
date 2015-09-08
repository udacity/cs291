"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Tweening demo
// tutorial: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window, Stats, TWEEN*/

var path = "";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity

var camera, scene, renderer, stats;
var cameraControls;
var clock = new THREE.Clock();

var cylinder, sphere, cube;

var bevelRadius = 1.9;	// TODO: 2.0 causes some geometry bug.

var headlight;

var bird;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0x0, 1.0 );
	renderer.shadowMapEnabled = true;

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 35, canvasWidth/ canvasHeight, 1, 4000 );
	camera.position.set( -657, 220, 1120 );

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,310,0);

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

	fillScene();
}

function fillScene() {
	scene = new THREE.Scene();
	//scene.fog = new THREE.Fog( 0x0, 2000, 4000 );

	// LIGHTS
	scene.add( new THREE.AmbientLight( 0x222222 ) );

	headlight = new THREE.PointLight( 0xFFFFFF, 1.0 );
	scene.add( headlight );

	var light = new THREE.SpotLight( 0xFFFFFF, 1.0 );
	light.position.set( -600, 1200, 300 );
	light.angle = 20 * Math.PI / 180;
	light.exponent = 1;
	light.target.position.set( 0, 200, 0 );
	light.castShadow = true;

	scene.add( light );

	var lightSphere = new THREE.Mesh(
		new THREE.SphereGeometry( 10, 12, 6 ),
		new THREE.MeshBasicMaterial() );
	lightSphere.position.copy( light.position );

	scene.add( lightSphere );

	///////////////////////

	// GROUND

	// put grid lines every 10000/100 = 100 units
	var solidGround = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000 ),
		new THREE.MeshPhongMaterial({ color: 0xFFFFFF,
			// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
			// the grid do not have z-fighting with the grid:
			// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
			// Units == 4 is a fixed amount to move back, and 4 is usually a good value
			polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
		}));
	solidGround.rotation.x = -Math.PI / 2;
	solidGround.receiveShadow = true;

	scene.add( solidGround );

	var ground = new THREE.Mesh(
		new THREE.PlaneGeometry( 10000, 10000, 100, 100 ),
		new THREE.MeshBasicMaterial( { color: 0x0, wireframe: true } ) );
	ground.rotation.x = - Math.PI / 2;

	scene.add( ground );

	//////////////////////////////
	// Glass
	var glass = createGlass(260);
	glass.position = new THREE.Vector3( -245, 125, 0);
	scene.add(glass);

	//////////////////////////////
	// Bird
	bird = new THREE.Object3D();
	createDrinkingBird( bird );

	scene.add( bird );

	// TWEEN
	// tutorial: http://learningthreejs.com/blog/2011/08/17/tweenjs-for-smooth-animation/
	var updateBird = function(){
		bird.animated.rotation.z = current.z;
	};
	var current = { z: 0 };

	var drinkingRotation = { z: 103 * Math.PI/180 };
	var backRotation = { z: -22 * Math.PI/180 };
	var wobbleRotation = { z: 22 * Math.PI/180 };
	var back2Rotation = { z: -8 * Math.PI/180 };

	var tweenForward = new TWEEN.Tween(current).to(drinkingRotation, 3000 );
	tweenForward.onUpdate(updateBird);
	tweenForward.easing(TWEEN.Easing.Cubic.In);

	// don't do anything: drink
	var tweenPause = new TWEEN.Tween(current).to(drinkingRotation, 500 );
	tweenPause.onUpdate(updateBird);

	var tweenBackward = new TWEEN.Tween(current).to(backRotation, 1200);
	tweenBackward.onUpdate(updateBird);
	tweenBackward.easing(TWEEN.Easing.Quadratic.InOut);

	var tweenWobble = new TWEEN.Tween(current).to(wobbleRotation, 1000);
	tweenWobble.onUpdate(updateBird);
	tweenWobble.easing(TWEEN.Easing.Quadratic.InOut);

	var tweenBackward2 = new TWEEN.Tween(current).to(back2Rotation, 900);
	tweenBackward2.onUpdate(updateBird);
	tweenBackward2.easing(TWEEN.Easing.Quadratic.InOut);

	// have one call the other next, and back
	tweenForward.chain( tweenPause );
	tweenPause.chain( tweenBackward );
	tweenBackward.chain( tweenWobble );
	tweenWobble.chain( tweenBackward2 );
	tweenBackward2.chain( tweenForward );

	// get this chain going
	tweenForward.start();
}

function createGlass(height) {
	var cupMaterial = new THREE.MeshPhongMaterial( { color: 0x0, specular: 0xFFFFFF, shininess: 100, opacity: 0.3, transparent: true } );
	var waterMaterial = new THREE.MeshLambertMaterial( {
		color: 0x1F8BAF
		//opacity: 0.7,
		//transparent: true
	} );

	var glassGeometry = new THREE.CylinderGeometry(120, 100, height, 32);
	var glassMesh = new THREE.Mesh( glassGeometry, cupMaterial );
	var glassObject = new THREE.Object3D();
	glassObject.add(glassMesh);

	var glassWater = new THREE.Mesh( new THREE.CylinderGeometry(120, 100, height, 32), waterMaterial);
	glassWater.scale = new THREE.Vector3(0.9, 0.85, 0.9);
	glassWater.position = new THREE.Vector3(0, -10, 0);
	glassObject.add(glassWater);
	return glassObject;
}


// Supporting frame for the bird - base + legs + feet
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

function createTail() {
	// solution
	var tailTexture = THREE.ImageUtils.loadTexture( path + 'media/img/cs291/textures/feather.png' );
	var tail = new THREE.Mesh(
		new THREE.PlaneGeometry( 100, 100, 1, 1 ),
		new THREE.MeshLambertMaterial(
			{ map: tailTexture, side: THREE.DoubleSide, transparent: true } ) );

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

	// Student: change pivot point
	// pivotHeight is the height of the crossbar
	var pivotHeight = 360;
	body.position.y = -pivotHeight;
	head.position.y = -pivotHeight;
	bodyhead.position.y = pivotHeight;

	// add field for animated part, for simplicity
	bbird.animated = bodyhead;

	bbird.add(support);
	bbird.add(bodyhead);

	// go through all objects and set the meshes (only)
	// so that they cast shadows
	bbird.traverse( function ( object ) {
		if ( object instanceof THREE.Mesh ) {
			object.castShadow = true;
			object.receiveShadow = true;
		}
	} );

}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	headlight.position.copy( camera.position );
	stats.update();
	TWEEN.update();
	renderer.render(scene, camera);
}

init();
animate();
