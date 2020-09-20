"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Cylinder creation: add glue code to make point-to-point cylinders
// Your task is to modify the createCylinderFromEnds function
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat, $*/
let camera, scene, renderer;
let cameraControls, effectController;
let clock = new THREE.Clock();
let gridX = true;
let gridY = false;
let gridZ = false;
let axes = true;
let ground = true;

/**
* Returns a THREE.Mesh cone (CylinderGeometry) going from top to bottom positions
* @param material - THREE.Material
* @param radius - the radius of the capsule's cylinder
* @param top, bottom - THREE.Vector3, top and bottom positions of cone
* @param segmentsWidth - tessellation around equator, like radiusSegments in CylinderGeometry
* @param openEnded - whether the ends of the cone are generated; true means they are not
*/
function createCylinderFromEnds( material, radiusTop, radiusBottom, top, bottom, segmentsWidth, openEnded)
{
	// defaults
	segmentsWidth = (segmentsWidth === undefined) ? 32 : segmentsWidth;
	openEnded = (openEnded === undefined) ? false : openEnded;

	// Dummy settings, replace with proper code:
	let cylAxis = new THREE.Vector3();
	cylAxis.subVectors(top, bottom);
	let length = cylAxis.length();

	let center = new THREE.Vector3();
	center.addVectors(top, bottom);
	center.divideScalar(2.0);

	let cylGeom = new THREE.CylinderGeometry( radiusTop, radiusBottom, length, segmentsWidth, 1, openEnded );
	let cyl = new THREE.Mesh( cylGeom, material );

	// pass in the cylinder itself, its desired axis, and the place to move the center.
	makeLengthAngleAxisTransform( cyl, cylAxis, center );

	return cyl;
}

// Transform cylinder to align with given axis and then move to center
function makeLengthAngleAxisTransform( cyl, cylAxis, center )
{
	cyl.matrixAutoUpdate = false;

	// From left to right using frames: translate, then rotate; TR.
	// So translate is first.
	cyl.matrix.makeTranslation( center.x, center.y, center.z );

	// take cross product of cylAxis and up vector to get axis of rotation
	let yAxis = new THREE.Vector3(0,1,0);
	// Needed later for dot product, just do it now;
	// a little lazy, should really copy it to a local Vector3.
	cylAxis.normalize();
	let rotationAxis = new THREE.Vector3();
	rotationAxis.crossVectors( cylAxis, yAxis );
	if ( rotationAxis.length() < 0.000001 )
	{
		// Special case: if rotationAxis is just about zero, set to X axis,
		// so that the angle can be given as 0 or PI. This works ONLY
		// because we know one of the two axes is +Y.
		rotationAxis.set( 1, 0, 0 );
	}
	rotationAxis.normalize();

	// take dot product of cylAxis and up vector to get cosine of angle of rotation
	let theta = -Math.acos( cylAxis.dot( yAxis ) );
	//cyl.matrix.makeRotationAxis( rotationAxis, theta );
	let rotMatrix = new THREE.Matrix4();
	rotMatrix.makeRotationAxis( rotationAxis, theta );
	cyl.matrix.multiply( rotMatrix );
}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	let ambientLight = new THREE.AmbientLight( 0x222222 );

	let light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );

	let light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );

	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	// TEST MATERIALS AND OBJECTS
	let redMaterial = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
	let greenMaterial = new THREE.MeshLambertMaterial( { color: 0x00FF00 } );
	let blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
	let grayMaterial = new THREE.MeshLambertMaterial( { color: 0x808080 } );

	let yellowMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFF00 } );
	let cyanMaterial = new THREE.MeshLambertMaterial( { color: 0x00FFFF } );
	let magentaMaterial = new THREE.MeshLambertMaterial( { color: 0xFF00FF } );

	let radiusTop = 50;
	let radiusBottom = 0;
	let segmentsWidth = 32;
	let openEnded = false;
	let cylinder;

	// along Y axis
	cylinder = new createCylinderFromEnds( greenMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 0, 300, 0 ),
		new THREE.Vector3( 0, 0, 0 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// along X axis
	cylinder = new createCylinderFromEnds( redMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 300, 0, 0 ),
		new THREE.Vector3( 0, 0, 0 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// along Z axis
	cylinder = new createCylinderFromEnds( blueMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 0, 0, 300 ),
		new THREE.Vector3( 0, 0, 0 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// along XYZ axis
	cylinder = new createCylinderFromEnds( grayMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 200, 200, 200 ),
		new THREE.Vector3( 0, 0, 0 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// along -Y axis, translated in XYZ
	cylinder = new createCylinderFromEnds( yellowMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 50, 100, -200 ),
		new THREE.Vector3( 50, 300, -200 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// along X axis, from top of previous cylinder
	cylinder = new createCylinderFromEnds( cyanMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 50, 300, -200 ),
		new THREE.Vector3( 250, 300, -200 ),
		segmentsWidth, openEnded );
	scene.add( cylinder );

	// continue from bottom of previous cylinder
	cylinder = new createCylinderFromEnds( magentaMaterial,
		radiusTop, radiusBottom,
		new THREE.Vector3( 250, 300, -200 ),
		new THREE.Vector3( -150, 100, 0 ),
		segmentsWidth );	// try openEnded default to false
	scene.add( cylinder );
}

function init() {
	document.body.style.margin = "0";
	document.body.style.padding = "0";
	document.body.style.overflow = "hidden";

	let canvasWidth = document.documentElement.clientWidth;
	let canvasHeight = document.documentElement.clientHeight;

	let canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 10000 );
	camera.position.set( -528, 513, 92 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,200,0);

}

function addToDOM() {
	let container = document.getElementById('container');
	let canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function drawHelpers() {
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
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	let delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();
		drawHelpers();
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

	let gui = new dat.GUI();
	let h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");
}

try {
	init();
	fillScene();
	drawHelpers();
	setupGui();
	addToDOM();
	animate();
} catch(e) {
	let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}

