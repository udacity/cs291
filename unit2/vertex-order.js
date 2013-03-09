////////////////////////////////////////////////////////////////////////////////
// Vertex Order Exercise                                                      //
// Your task is to determine the problem and fix the vertex drawing order.    //
// Check the function someObject()                                            //
// and correct the code that starts at line 17.                               //
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window*/

var camera, scene, renderer;
var windowScale;

function someObject () {
	var material, geometry, mesh;
	material = new THREE.MeshBasicMaterial( { 
		color: 0xF6831E, side: THREE.FrontSide 
	} );
	geometry = new THREE.Geometry();
	
	// Student: some data below must be fixed 
	// for both triangles to appear !
	geometry.vertices.push( new THREE.Vector3( 3, 3, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 7, 3, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 7, 7, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 3, 7, 0 ) );
	
	geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	geometry.faces.push( new THREE.Face3( 2, 0, 3 ) );
	
	mesh = new THREE.Mesh( geometry, material );
	
	scene.add( mesh );
}

function init() {
	//  Setting up some parameters
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;
	// scene
	scene = new THREE.Scene();

	// Camera: Y up, X right, Z up
	windowScale = 10;
	var windowWidth = windowScale * canvasRatio;
	var windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2,
		windowHeight / 2, windowHeight / - 2, 0, 40 );
	
	var focus = new THREE.Vector3( 5,4,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt( focus );

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xffffff, 1.0 );
	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
	Coordinates.drawAxes({axisLength:11,axisOrientation:"x",axisRadius:0.04});
	Coordinates.drawAxes({axisLength:9,axisOrientation:"y",axisRadius:0.04});

}

function render() {
	renderer.render( scene, camera );
}

function takeScreenshot() {
	init();
	someObject();
	render();
	var img = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img+'"/>');
}

// Main body of the script

init();
someObject();
render();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});
