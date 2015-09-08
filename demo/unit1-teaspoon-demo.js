"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Newell Teaspoon demo
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, dat, window */

var camera, scene, renderer;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var teaspoonSize = 400;
var ambientLight, light, particleLight;
var tess = -1;	// force initialization
var wire;
var flat;
var phong;
var flatGouraudMaterial, flatPhongMaterial, gouraudMaterial, phongMaterial, wireMaterial;
var teaspoon;

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	// CAMERA

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 80000 );
	camera.position.set( -600, 550, 1000 );

	// LIGHTS

	ambientLight = new THREE.AmbientLight( 0x333333 );	// 0.2

	light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	// direction is set in GUI

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// EVENTS

	window.addEventListener( 'resize', onWindowResize, false );

	// CONTROLS

	cameraControls = new THREE.TrackballControls( camera, renderer.domElement );
	cameraControls.target.set(0, 0, 0);


	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var materialColor = new THREE.Color();
	materialColor.setRGB( 1.0, 0.8, 0.6 );
	flatGouraudMaterial = createShaderMaterial( "gouraud", light, ambientLight );
	flatGouraudMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	flatGouraudMaterial.shading = THREE.FlatShading;
	flatGouraudMaterial.side = THREE.DoubleSide;

	flatPhongMaterial = createShaderMaterial( "phong", light, ambientLight );
	flatPhongMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	flatPhongMaterial.shading = THREE.FlatShading;
	flatPhongMaterial.side = THREE.DoubleSide;

	gouraudMaterial = createShaderMaterial( "gouraud", light, ambientLight );
	gouraudMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	gouraudMaterial.side = THREE.DoubleSide;

	phongMaterial = createShaderMaterial( "phong", light, ambientLight );
	phongMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	phongMaterial.side = THREE.DoubleSide;

	wireMaterial = new THREE.MeshBasicMaterial( { color: 0xFFCC99, wireframe: true } ) ;

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS

	scene.add( ambientLight );
	scene.add( light );
	scene.add( particleLight );
	// GUI
	setupGui();

}

// EVENT HANDLERS

function onWindowResize() {

	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;

	renderer.setSize( canvasWidth, canvasHeight );

	camera.aspect = canvasWidth/ canvasHeight;
	camera.updateProjectionMatrix();

}

function setupGui() {

	effectController = {

		shininess: 100.0,
		ka: 0.2,
		kd: 0.7,
		ks: 0.7,
		metallic: false,

		hue:		0.53,
		saturation: 0.01,
		lightness:  0.9,

		lhue:        0.04,
		lsaturation: 0.01,	// so that fractions will be shown
		llightness:  1.0,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.32,
		ly: 0.39,
		lz: 0.7,
		newTess: 6,
		newFlat: false,
		newPhong: true,
		newWire: false
	};

	var h;

	var gui = new dat.GUI();

	// material (attributes)

	h = gui.addFolder( "Material control" );

	h.add( effectController, "shininess", 1.0, 400.0, 1.0 ).name("m_shininess");
	h.add( effectController, "ka", 0.0, 1.0, 0.025 ).name("m_ka");
	h.add( effectController, "kd", 0.0, 1.0, 0.025 ).name("m_kd");
	h.add( effectController, "ks", 0.0, 1.0, 0.025 ).name("m_ks");
	h.add( effectController, "metallic" );

	// material (color)

	h = gui.addFolder( "Material color" );

	h.add( effectController, "hue", 0.0, 1.0, 0.025 ).name("m_hue");
	h.add( effectController, "saturation", 0.0, 1.0, 0.025 ).name("m_saturation");
	h.add( effectController, "lightness", 0.0, 1.0, 0.025 ).name("m_lightness");

	// light (point)

	h = gui.addFolder( "Light color" );

	h.add( effectController, "lhue", 0.0, 1.0, 0.025 ).name("hue");
	h.add( effectController, "lsaturation", 0.0, 1.0, 0.025 ).name("saturation");
	h.add( effectController, "llightness", 0.0, 1.0, 0.025 ).name("lightness");

	// light (directional)

	h = gui.addFolder( "Light direction" );

	h.add( effectController, "lx", -1.0, 1.0, 0.025 ).name("x");
	h.add( effectController, "ly", -1.0, 1.0, 0.025 ).name("y");
	h.add( effectController, "lz", -1.0, 1.0, 0.025 ).name("z");

	h = gui.addFolder( "Tessellation control" );
	h.add(effectController, "newTess", [2,3,4,5,6,8,10,12,16,24,32] ).name("Tessellation Level");
	h.add( effectController, "newFlat" ).name("Flat Shading");
	h.add( effectController, "newPhong" ).name("Use Phong");
	h.add( effectController, "newWire" ).name("Show wireframe only");
}


//

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	var delta = clock.getDelta();

	cameraControls.update( delta );
	if ( effectController.newTess !== tess || effectController.newFlat !== flat || effectController.newPhong !== phong || effectController.newWire !== wire)
	{
		tess = effectController.newTess;
		flat = effectController.newFlat;
		phong = effectController.newPhong;
		wire = effectController.newWire;

		fillScene();
	}

	flatGouraudMaterial.uniforms.shininess.value = effectController.shininess;
	flatPhongMaterial.uniforms.shininess.value = effectController.shininess;
	gouraudMaterial.uniforms.shininess.value = effectController.shininess;
	phongMaterial.uniforms.shininess.value = effectController.shininess;

	flatGouraudMaterial.uniforms.uKd.value = effectController.kd;
	flatPhongMaterial.uniforms.uKd.value = effectController.kd;
	gouraudMaterial.uniforms.uKd.value = effectController.kd;
	phongMaterial.uniforms.uKd.value = effectController.kd;

	flatGouraudMaterial.uniforms.uKs.value = effectController.ks;
	flatPhongMaterial.uniforms.uKs.value = effectController.ks;
	gouraudMaterial.uniforms.uKs.value = effectController.ks;
	phongMaterial.uniforms.uKs.value = effectController.ks;

	var materialColor = new THREE.Color();
	materialColor.setHSL( effectController.hue, effectController.saturation, effectController.lightness );
	flatGouraudMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	flatPhongMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	gouraudMaterial.uniforms.uMaterialColor.value.copy( materialColor );
	phongMaterial.uniforms.uMaterialColor.value.copy( materialColor );

	if ( !effectController.metallic )
	{
		materialColor.setRGB(1,1,1);
	}
	flatGouraudMaterial.uniforms.uSpecularColor.value.copy( materialColor );
	flatPhongMaterial.uniforms.uSpecularColor.value.copy( materialColor );
	gouraudMaterial.uniforms.uSpecularColor.value.copy( materialColor );
	phongMaterial.uniforms.uSpecularColor.value.copy( materialColor );

	// Ambient's actually controlled by the light for this demo - TODO fix
	ambientLight.color.setHSL( effectController.hue, effectController.saturation, effectController.lightness * effectController.ka );

	light.position.set( effectController.lx, effectController.ly, effectController.lz );
	light.color.setHSL( effectController.lhue, effectController.lsaturation, effectController.llightness );
	renderer.render( scene, camera );

}

function createShaderMaterial( id, light, ambientLight ) {

	var shader = THREE.ShaderTypes[ id ];

	var u = THREE.UniformsUtils.clone( shader.uniforms );

	var vs = shader.vertexShader;
	var fs = shader.fragmentShader;

	var material = new THREE.ShaderMaterial( { uniforms: u, vertexShader: vs, fragmentShader: fs } );

	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;

	material.uniforms.uAmbientLightColor.value = ambientLight.color;

	return material;

}

function fillScene() {

	// Coordinates.drawAllAxes({axisLength:1000,axisRadius:5,axisTess:50});
	if ( teaspoon !== undefined ) {

		teaspoon.geometry.dispose();
		scene.remove( teaspoon );
					
	}

	teaspoon = new THREE.Mesh(
		new THREE.TeaspoonGeometry( teaspoonSize, tess ),
		wire ? wireMaterial : (
		flat ?
			( phong ? flatPhongMaterial : flatGouraudMaterial ) :
			( phong ? phongMaterial : gouraudMaterial ) ));

	scene.add( teaspoon );
}

init();
animate();






