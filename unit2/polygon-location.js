"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Polygon Location Exercise
// Your task is to write a function that will take 2 arguments:
//   sides - how many edges the polygon has.
//   location - location of the center of the polygon as a THREE.Vector3.
// Return the mesh that defines the minimum number of triangles necessary
// to draw the polygon.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document*/

let camera, scene, renderer;
let windowScale;

function PolygonGeometry(sides, location) {
	let geo = new THREE.Geometry();

	// generate vertices
	for ( let pt = 0 ; pt < sides; pt++ )
	{
		// Add 90 degrees so we start at +Y axis, rotate counterclockwise around
		let angle = (Math.PI/2) + (pt / sides) * 2 * Math.PI;

		let x = Math.cos( angle );
		let y = Math.sin( angle );

		// Save the vertex location
		geo.vertices.push( new THREE.Vector3( x, y, 0.0 ) );
	}

	// generate faces
	for ( let face = 0 ; face < sides-2; face++ )
	{
		// this makes a triangle fan, from the first +Y point around
		geo.faces.push( new THREE.Face3( 0, face+1, face+2 ) );
	}
	// done: return it.
	return geo;
}

function init() {
	document.body.style.margin = "0";
	document.body.style.padding = "0";
	document.body.style.overflow = "hidden";

	let canvasWidth = document.documentElement.clientWidth;
	let canvasHeight = document.documentElement.clientHeight;

	let canvasRatio = canvasWidth / canvasHeight;
	// scene
	scene = new THREE.Scene();

	// Camera: Y up, X right, Z up
	windowScale = 8;
	let windowWidth = windowScale * canvasRatio;
	let windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2,
		windowHeight / 2, windowHeight / - 2, 0, 40 );

	let focus = new THREE.Vector3( 3,3,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt(focus);

	renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

}
function showGrids() {
	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
	Coordinates.drawAxes({axisLength:4,axisOrientation:"x",axisRadius:0.02});
	Coordinates.drawAxes({axisLength:3,axisOrientation:"y",axisRadius:0.02});
}
function addToDOM() {
	let container = document.getElementById('container');
	let canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function render() {
	renderer.render( scene, camera );
}

// Main body of the script
try {
	init();
	showGrids();
	let geo = PolygonGeometry(6, new THREE.Vector3( 3, 4, 0 ));
	let material = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.FrontSide } );
	let mesh = new THREE.Mesh( geo, material );
	scene.add( mesh );
	addToDOM();
	render();
} catch(e) {
	let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
