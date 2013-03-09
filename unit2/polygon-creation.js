////////////////////////////////////////////////////////////////////////////////
// Polygon Creation Exercise
// Your task is to complete the function PolygonGeometry(sides)
// which takes 1 argument:
//   sides - how many edges the polygon has.
// Return the mesh that defines the minimum number of triangles necessary
// to draw the polygon.
// Radius of the polygon is 1. Center of the polygon is at 0, 0.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var windowScale;

function PolygonGeometry(sides) {
	var geo = new THREE.Geometry();
	
	// generate vertices
	for ( var pt = 0 ; pt < sides; pt++ )
	{
		// Add 90 degrees so we start at +Y axis, rotate counterclockwise around
		var angle = (Math.PI/2) + (pt / sides) * 2 * Math.PI;

		var x = Math.cos( angle );
		var y = Math.sin( angle );
		
		// Save the vertex location - fill in the code

	}

	// Write the code to generate minimum number of faces for the polygon.

	// return the geometry object
	return geo;
}

function init() {
	//  Setting up some parameters
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	// scene
	scene = new THREE.Scene();

	// Camera: Y up, X right, Z up
	windowScale = 4;
	var windowWidth = windowScale * canvasRatio;
	var windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2, windowHeight / 2, windowHeight / - 2, 0, 40 );
	
	var focus = new THREE.Vector3( 0,1,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt(focus);

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xffffff, 1.0 );
	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
	Coordinates.drawAxes({axisLength:4,axisOrientation:"x",axisRadius:0.02});
	Coordinates.drawAxes({axisLength:3,axisOrientation:"y",axisRadius:0.02});
}

function render() {
	renderer.render( scene, camera );
}

function takeScreenshot() {
	init();
	var pgon1 = PolygonGeometry(7);
	var pgon1Mat = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.FrontSide } );
	var mesh = new THREE.Mesh( pgon1, pgon1Mat );
	scene.add( mesh );
	render();
	var img = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img+'"/>');
}

// Main body of the script

init();
var pgon1t = PolygonGeometry(5);
var pgon1Matt = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.FrontSide } );
var mesht = new THREE.Mesh( pgon1t, pgon1Matt );
scene.add( mesht );
render();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});