////////////////////////////////////////////////////////////////////////////////
// Draw a Square Exercise                                                     //
// Your task is to complete the function square (at line 28).                 //
// The function takes 4 arguments - coordinates x1, y1, x2, y2                //
// for the square and returns a geometry object (THREE.Geometry())            //
// that defines a square at the provided coordinates.                         //
////////////////////////////////////////////////////////////////////////////////
/*global THREE Coordinates $ document window*/

var camera, scene, renderer;
var windowScale;

function exampleTriangle() {
	// This code demonstrates how to draw a triangle
	var triangle = new THREE.Geometry();
	triangle.vertices.push( new THREE.Vector3( 1, 1, 0 ) );
	triangle.vertices.push( new THREE.Vector3( 3, 1, 0 ) );
	triangle.vertices.push( new THREE.Vector3( 3, 3, 0 ) );
	
	triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );

	return triangle;
}

function drawSquare(x1, y1, x2, y2) {

	var square = new THREE.Geometry();
	// Your code goes here

	// don't forget to return the geometry!	The following line is required!
	return square;
}

function init() {
	//  Set up some parameters
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	// scene
	scene = new THREE.Scene();

	// Camera: Y up, X right, Z up
	windowScale = 12;
	var windowWidth = windowScale * canvasRatio;
	var windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2, windowHeight / 2, windowHeight / - 2, 0, 40 );
	
	var focus = new THREE.Vector3( 5,5,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 20;
	camera.lookAt(focus);

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xffffff, 1.0 );
	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );
}

function render() {
	renderer.render( scene, camera );
}

function takeScreenshot() {
	init();
	var triangle_material = new THREE.MeshBasicMaterial( { color: 0x2685AA, side: THREE.DoubleSide } );
	var triangle_geometry = exampleTriangle();
	var tmesh = new THREE.Mesh( triangle_geometry, triangle_material );
	scene.add(tmesh);
	var material = new THREE.MeshBasicMaterial( { color: 0xF6831E, side: THREE.DoubleSide } );
	var geometry = drawSquare(2,3,8,9);
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
	render();
	var img = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img+'"/>');
}

// Main body of the script

init();
Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
Coordinates.drawAxes({axisLength:11,axisOrientation:"x",axisRadius:0.04});
Coordinates.drawAxes({axisLength:11,axisOrientation:"y",axisRadius:0.04});
var triangleMaterial = new THREE.MeshBasicMaterial( 
	{ color: 0x2685AA, side: THREE.DoubleSide } 
	);
var triangleGeometry = exampleTriangle();
var triangleMesh = new THREE.Mesh( triangleGeometry, triangleMaterial );
scene.add(triangleMesh);
var square_material = new THREE.MeshBasicMaterial( { 
	color: 0xF6831E, 
	side: THREE.DoubleSide 
} );
var square_geometry = drawSquare(3,5,7,9);
var square_mesh = new THREE.Mesh(square_geometry, square_material);
scene.add(square_mesh);
render();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});