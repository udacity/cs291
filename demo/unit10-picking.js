"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Picking: pick object and change its color and place a sphere
////////////////////////////////////////////////////////////////////////////////

/*global THREE, document, window*/

// Mostly grabbed from http://mrdoob.github.com/three.js/examples/canvas_interactive_cubes.html
// Author unknown.

var camera, scene, projector, renderer;
var sphereMaterial;

var objects = [];
var headlight;

var sphereGeom;

var canvasWidth;
var canvasHeight;

init();
animate();

function init() {
	canvasWidth = window.innerWidth;
	canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	camera = new THREE.PerspectiveCamera( 70, canvasRatio, 1, 10000 );
	camera.position.set( 0, 300, 500 );

	scene = new THREE.Scene();

	headlight = new THREE.PointLight( 0xFFFFFF, 0.3 );

	scene.add( headlight );

	var light = new THREE.DirectionalLight( 0xFFFFFF, 0.6 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xFFFFFF, 0.6 );
	light.position.set( 0, 200, -300 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xFFFFFF, 0.4 );
	light.position.set( -400, -300, 200 );

	scene.add( light );

	var geometry = new THREE.CubeGeometry( 100, 100, 100 );

	for ( var i = 0; i < 10; i ++ ) {

		var object = new THREE.Mesh( geometry,
			new THREE.MeshLambertMaterial(
				{ color: Math.random() * 0xFFFFFF } )
				//, opacity: 0.5, transparent: true } ) );
			);

		// add a random box between -400 to +400
		object.position.x = Math.random() * 800 - 400;
		object.position.y = Math.random() * 800 - 400;
		object.position.z = Math.random() * 800 - 400;

		// make box randomly scale by 1 to 3x
		object.scale.x = Math.random() * 2 + 1;
		object.scale.y = Math.random() * 2 + 1;
		object.scale.z = Math.random() * 2 + 1;

		// probably not uniformly distributed rotations, but that's OK
		// See Arvo, "Graphics Gems 3", p. 117 for the right method.
		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;

		scene.add( object );

		objects.push( object );

	}

	sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xD0D0D0 } );

	projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xFFFFFF, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	sphereGeom = new THREE.SphereGeometry( 6, 12, 6 );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
}

function onDocumentMouseDown( event ) {

	//event.preventDefault();

	// Annoying nested window code: need to subtract offsets for nested windows.
	// This is not needed if you have just a single window filling the browser
	// var node = event.target || event.srcElement;
	// var mouseX = event.clientX - node.offsetLeft;
	// var mouseY = event.clientY - node.offsetTop;


	// getBoundingClientRect()
	//   gives the element's position relative to the browser's visible viewport.
	// clientX/Y
	//   gives the mouse position relative to the browser's visible viewport.
	//
	// we then just have to find the difference between the two
	// to get the mouse position in "canvas-space"
	var canvasPosition = renderer.domElement.getBoundingClientRect();
	var mouseX = event.clientX - canvasPosition.left;
	var mouseY = event.clientY - canvasPosition.top;

	// console.log(canvasPosition.left,canvasPosition.top);
	// console.log(mouseX,mouseY);

	/*
	while (node.offsetParent){
		node = node.offsetParent;
		mouseX -= node.offsetLeft;
		mouseY -= node.offsetTop;
	}*/

	/* the old way */
	/*
	var mouseVector = new THREE.Vector3(
		2 * ( mouseX / canvasWidth ) - 1,
		1 - 2 * ( mouseY / canvasHeight ), 0.5 );
	projector.unprojectVector( mouseVector, camera );

	var raycaster = new THREE.Raycaster( camera.position, mouseVector.sub( camera.position ).normalize() );
	*/

	/* the new way: simpler creation of raycaster */
	/* from tutorial: http://soledadpenades.com/articles/three-js-tutorials/object-picking/ */
	var mouseVector = new THREE.Vector3(
		2 * ( mouseX / canvasWidth ) - 1,
		1 - 2 * ( mouseY / canvasHeight ));

	// debug: console.log( "client Y " + event.clientY + ", mouse Y " + mouseY );

	var raycaster = projector.pickingRay( mouseVector.clone(), camera );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		intersects[ 0 ].object.material.color.setRGB( Math.random(), Math.random(), Math.random() );

		var sphere = new THREE.Mesh( sphereGeom, sphereMaterial );
		sphere.position = intersects[ 0 ].point;
		scene.add( sphere );
	}

	/*
	// Parse all the faces, for when you are using face materials
	for ( var i in intersects ) {
		intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xFFFFFF | 0x80000000 );
	}
	*/
}

//

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

var radius = 600;
var theta = 0;

function render() {

	theta += 0.1;

	camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
	camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
	camera.lookAt( scene.position );
	headlight.position.copy( camera.position );

	renderer.render( scene, camera );

}
