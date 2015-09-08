"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// anisotropic shading
// Your task is to change the fragment shader, and only that
// Edit the file named fragment.glsl in the tab above.
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, dat, $ */

var camera, scene, renderer;
var cameraControls;
var effectController;
var clock = new THREE.Clock();
var teapotSize = 600;
var tess = 7, newTess = tess;
var tessLevel = [2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32];
var ambientLight, light;
var teapot;
var phongBalancedMaterial;

function init() {
	var canvasWidth = 846;
	var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	//var canvasWidth = window.innerWidth;
	//var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// LIGHTS

	ambientLight = new THREE.AmbientLight(0x333333); // 0.2

	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(700, 3000, 1200);

	// RENDERER

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex(0xAAAAAA, 1.0);

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// CAMERA
	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 80000);
	camera.position.set(-560, 840, -240);

	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0, -360, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var materialColor = new THREE.Color();
	materialColor.setRGB(1.0, 0.8, 0.6);

	phongBalancedMaterial = createShaderMaterial("phongBalanced", light, ambientLight);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongBalancedMaterial.side = THREE.DoubleSide;

}

function loadShader(shadertype) {
	return document.getElementById(shadertype).textContent;
}

function createShaderMaterial(id, light, ambientLight) {

	var shaderTypes = {

		'phongBalanced' : {

			uniforms: {

				"uDirLightPos":	{ type: "v3", value: new THREE.Vector3() },
				"uDirLightColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

				"uAmbientLightColor": { type: "c", value: new THREE.Color( 0x050505 ) },

				"uMaterialColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },
				"uSpecularColor": { type: "c", value: new THREE.Color( 0xFFFFFF ) },

				uKd: {
					type: "f",
					value: 0.7
				},
				uKs: {
					type: "f",
					value: 0.3
				},
				shininess: {
					type: "f",
					value: 100.0
				},
				uGroove: {
					type: "f",
					value: 1.0
				}
			}
		}

	};

	var shader = shaderTypes[id];

	var u = THREE.UniformsUtils.clone(shader.uniforms);

	// this line will load a shader that has an id of "vertex" from the .html file
	var vs = loadShader("vertex");
	// this line will load a shader that has an id of "fragment" from the .html file
	var fs = loadShader("fragment");

	var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;

	material.uniforms.uAmbientLightColor.value = ambientLight.color;

	return material;

}

function setupGui() {

	effectController = {

		shininess: 50.0,
		groove: 0.5,
		ka: 0.2,
		kd: 0.4,
		ks: 0.35,
		metallic: false,

		hue: 0.09,
		saturation: 0.46,
		lightness: 0.7,

		lhue: 0.04,
		lsaturation: 0.0,
		llightness: 0.7,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.65,
		ly: 0.43,
		lz: 0.35
	};

	var h;

	var gui = new dat.GUI();

	// material (attributes)

	h = gui.addFolder("Material control");

	h.add(effectController, "shininess", 1.0, 100.0, 1.0).name("shininess");
	h.add(effectController, "groove", 0.0, 2.0, 0.025).name("groove");
	h.add(effectController, "ka", 0.0, 1.0, 0.025).name("m_ka");
	h.add(effectController, "kd", 0.0, 1.0, 0.025).name("m_kd");
	h.add(effectController, "ks", 0.0, 1.0, 0.025).name("m_ks");
	h.add(effectController, "metallic");
	// TODO: add tess for tessellation

	// material (color)

	h = gui.addFolder("Material color");

	h.add(effectController, "hue", 0.0, 1.0, 0.025).name("m_hue");
	h.add(effectController, "saturation", 0.0, 1.0, 0.025).name("m_saturation");
	h.add(effectController, "lightness", 0.0, 1.0, 0.025).name("m_lightness");

	// light (point)

	h = gui.addFolder("Light color");

	h.add(effectController, "lhue", 0.0, 1.0, 0.025).name("hue");
	h.add(effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation");
	h.add(effectController, "llightness", 0.0, 1.0, 0.025).name("lightness");

	// light (directional)

	h = gui.addFolder("Light direction");

	h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x");
	h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y");
	h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z");

}

//

function animate() {

	requestAnimationFrame(animate);
	render();

}

function render() {

	var delta = clock.getDelta();

	cameraControls.update(delta);

	if (newTess !== tess ) {
		tess = newTess;

		fillScene();
	}

	phongBalancedMaterial.uniforms.shininess.value = effectController.shininess;
	phongBalancedMaterial.uniforms.uGroove.value = effectController.groove;
	phongBalancedMaterial.uniforms.uKd.value = effectController.kd;
	phongBalancedMaterial.uniforms.uKs.value = effectController.ks;

	var materialColor = new THREE.Color();
	materialColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);

	if (!effectController.metallic) {
		materialColor.setRGB(1, 1, 1);
	}
	phongBalancedMaterial.uniforms.uSpecularColor.value.copy(materialColor);

	// Ambient is just material's color times ka, light color is not involved
	ambientLight.color.setHSL(effectController.hue, effectController.saturation, effectController.lightness * effectController.ka);

	light.position.set(effectController.lx, effectController.ly, effectController.lz);

	light.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);

	renderer.render(scene, camera);

}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x808080, 2000, 4000);

	scene.add(ambientLight);
	scene.add(light);

	teapot = new THREE.Mesh(
		new THREE.TeapotGeometry(teapotSize, tessLevel[tess], false, true, false), phongBalancedMaterial);
	teapot.position.y = -teapotSize;

	scene.add(teapot);
}

function addToDOM() {
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

try {
	init();
	fillScene();
	setupGui();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}
