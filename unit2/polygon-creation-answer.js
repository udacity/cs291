"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Polygon Creation Exercise
// Your task is to complete the function PolygonGeometry(sides)
// which takes 1 argument:
//   sides - how many edges the polygon has.
// Return the mesh that defines the minimum number of triangles necessary
// to draw the polygon.
// Radius of the polygon is 1. Center of the polygon is at 0, 0.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document*/

let camera, scene, renderer;
let windowScale;

function PolygonGeometry(sides) {
	let geo = new THREE.Geometry();

	// generate vertices
	for ( let pt = 0 ; pt < sides; pt++ )
	{
		// Add 90 degrees so we start at +Y axis, rotate counterclockwise around
		let angle = (Math.PI/2) + (pt / sides) * 2 * Math.PI;

		let x = Math.cos( angle );
		let y = Math.sin( angle );

		// YOUR CODE HERE
		//Save the vertex location - fill in the code
		geo.vertices.push( new THREE.Vector3( x, y, 0 ) );
		// if(pt >= 2)
		// {
		// 	geo.faces.push(new THREE.Face3(0,pt-1,pt));
		// }
	}

	// Write the code to generate minimum number of faces for the polygon.
	for (let pt = 2; pt < sides; pt++) {
		geo.faces.push( new THREE.Face3( 0 , pt - 1, pt) );
	}

	// Return the geometry object
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
	windowScale = 4;
	let windowWidth = windowScale * canvasRatio;
	let windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2, windowHeight / 2, windowHeight / - 2, 0, 40 );

	let focus = new THREE.Vector3( 0,1,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt(focus);

	renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
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
	let geo = PolygonGeometry(5);
	let material = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.FrontSide } );
	let mesh = new THREE.Mesh( geo, material );
	scene.add( mesh );
	addToDOM();
	render();
} catch(e) {
	let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
