"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Helix: replace spheres with capsules (cheese logs)
// Your task is to modify the createHelix function
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window, dat, $*/

var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;

/**
* Returns a THREE.Object3D helix going from top to bottom positions
* @param material - THREE.Material
* @param radius - radius of helix itself
* @param tube - radius of tube
* @param radialSegments - number of capsules around a full circle
* @param tubularSegments - tessellation around equator of each tube
* @param height - height to extend, from *center* of tube ends along Y axis
* @param arc - how many times to go around the Y axis; currently just an integer
* @param clockwise - if true, go counterclockwise up the axis
*/
function createHelix( material, radius, tube, radialSegments, tubularSegments, height, arc, clockwise )
{
	// defaults
	tubularSegments = (tubularSegments === undefined) ? 32 : tubularSegments;
	arc = (arc === undefined) ? 1 : arc;
	clockwise = (clockwise === undefined) ? true : clockwise;

	var helix = new THREE.Object3D();

	var top = new THREE.Vector3();

	var sine_sign = clockwise ? 1 : -1;

	///////////////
	// YOUR CODE HERE: remove spheres, use capsules instead, going from point to point.
	//
	var sphGeom = new THREE.SphereGeometry( tube, tubularSegments, tubularSegments/2 );
	for ( var i = 0; i <= arc*radialSegments ; i++ )
	{
		// going from X to Z axis
		top.set( radius * Math.cos( i * 2*Math.PI / radialSegments ),
		height * (i/(arc*radialSegments)) - height/2,
		sine_sign * radius * Math.sin( i * 2*Math.PI / radialSegments ) );

		var sphere = new THREE.Mesh( sphGeom, material );
		sphere.position.copy( top );

		helix.add( sphere );
	}
	///////////////

	return helix;
}

/**
* Returns a THREE.Object3D cylinder and spheres going from top to bottom positions
* @param material - THREE.Material
* @param radius - the radius of the capsule's cylinder
* @param top, bottom - THREE.Vector3, top and bottom positions of cone
* @param segmentsWidth - tessellation around equator, like radiusSegments in CylinderGeometry
* @param openTop, openBottom - whether the end is given a sphere; true means they are not
*/
function createCapsule( material, radius, top, bottom, segmentsWidth, openTop, openBottom )
{
	// defaults
	segmentsWidth = (segmentsWidth === undefined) ? 32 : segmentsWidth;
	openTop = (openTop === undefined) ? false : openTop;
	openBottom = (openBottom === undefined) ? false : openBottom;

	// get cylinder height
	var cylAxis = new THREE.Vector3();
	cylAxis.subVectors( top, bottom );
	var length = cylAxis.length();

	// get cylinder center for translation
	var center = new THREE.Vector3();
	center.addVectors( top, bottom );
	center.divideScalar( 2.0 );

	// always open-ended
	var cylGeom = new THREE.CylinderGeometry( radius, radius, length, segmentsWidth, 1, 1 );
	var cyl = new THREE.Mesh( cylGeom, material );

	// pass in the cylinder itself, its desired axis, and the place to move the center.
	makeLengthAngleAxisTransform( cyl, cylAxis, center );

	var capsule = new THREE.Object3D();
	capsule.add( cyl );
	if ( !openTop || !openBottom ) {
		// instance geometry
		var sphGeom = new THREE.SphereGeometry( radius, segmentsWidth, segmentsWidth/2 );
		if ( !openTop ) {
			var sphTop = new THREE.Mesh( sphGeom, material );
			sphTop.position.set( top.x, top.y, top.z );
			capsule.add( sphTop );
		}
		if ( !openBottom ) {
			var sphBottom = new THREE.Mesh( sphGeom, material );
			sphBottom.position.set( bottom.x, bottom.y, bottom.z );
			capsule.add( sphBottom );
		}
	}

	return capsule;

}

// Transform cylinder to align with given axis and then move to center
function makeLengthAngleAxisTransform( cyl, cylAxis, center )
{
	cyl.matrixAutoUpdate = false;

	// From left to right using frames: translate, then rotate; TR.
	// So translate is first.
	cyl.matrix.makeTranslation( center.x, center.y, center.z );

	// take cross product of cylAxis and up vector to get axis of rotation
	var yAxis = new THREE.Vector3(0,1,0);
	// Needed later for dot product, just do it now;
	// a little lazy, should really copy it to a local Vector3.
	cylAxis.normalize();
	var rotationAxis = new THREE.Vector3();
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
	var theta = -Math.acos( cylAxis.dot( yAxis ) );
	//cyl.matrix.makeRotationAxis( rotationAxis, theta );
	var rotMatrix = new THREE.Matrix4();
	rotMatrix.makeRotationAxis( rotationAxis, theta );
	cyl.matrix.multiply( rotMatrix );
}

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

	// TEST MATERIALS AND OBJECTS
	var redMaterial = new THREE.MeshLambertMaterial( { color: 0xFF0000 } );
	var greenMaterial = new THREE.MeshLambertMaterial( { color: 0x00FF00 } );
	var blueMaterial = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
	var grayMaterial = new THREE.MeshLambertMaterial( { color: 0x808080 } );

	var yellowMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFF00 } );
	var cyanMaterial = new THREE.MeshLambertMaterial( { color: 0x00FFFF } );
	var magentaMaterial = new THREE.MeshLambertMaterial( { color: 0xFF00FF } );

	var radius = 60;
	var tube = 10;
	var radialSegments = 24;
	var height = 300;
	var segmentsWidth = 12;
	var arc = 2;

	var helix;
	helix = createHelix( redMaterial, radius, tube, radialSegments, segmentsWidth, height, arc, true );
	helix.position.y = height/2;
	scene.add( helix );

	helix = createHelix( greenMaterial, radius/2, tube, radialSegments, segmentsWidth, height, arc, false );
	helix.position.y = height/2;
	scene.add( helix );

	// DNA
	helix = createHelix( blueMaterial, radius, tube/2, radialSegments, segmentsWidth, height, arc, false );
	helix.position.y = height/2;
	helix.position.z = 2.5 * radius;
	scene.add( helix );

	helix = createHelix( blueMaterial, radius, tube/2, radialSegments, segmentsWidth, height, arc, false );
	helix.rotation.y = 120 * Math.PI / 180;
	helix.position.y = height/2;
	helix.position.z = 2.5 * radius;
	scene.add( helix );

	helix = createHelix( grayMaterial, radius, tube/2, radialSegments, segmentsWidth, height/2, arc, true );
	helix.position.y = height/2;
	helix.position.x = 2.5 * radius;
	scene.add( helix );

	helix = createHelix( yellowMaterial, 0.75*radius, tube/2, radialSegments, segmentsWidth, height, 4*arc, false );
	helix.position.y = height/2;
	helix.position.x = 2.5 * radius;
	helix.position.z = -2.5 * radius;
	scene.add( helix );

	helix = createHelix( cyanMaterial, 0.75*radius, 4*tube, radialSegments, segmentsWidth, height, 2*arc, false );
	helix.position.y = height/2;
	helix.position.x = 2.5 * radius;
	helix.position.z = 2.5 * radius;
	scene.add( helix );

	helix = createHelix( magentaMaterial, radius, tube, radialSegments, segmentsWidth, height, arc, true );
	helix.rotation.x = 45 * Math.PI / 180;
	helix.position.y = height/2;
	helix.position.z = -2.5 * radius;
	scene.add( helix );
}

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: false } );
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
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
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

	var gui = new dat.GUI();
	var h = gui.addFolder("Grid display");
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
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
