"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

/*global THREE, requestAnimationFrame, dat */
THREE.ShaderTypes = {

'phong' : {

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
		}
	},

	vertexShader: [

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vNormal = normalize( normalMatrix * normal );",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 uMaterialColor;",
		"uniform vec3 uSpecularColor;",

		"uniform vec3 uDirLightPos;",
		"uniform vec3 uDirLightColor;",

		"uniform vec3 uAmbientLightColor;",

		"uniform float uKd;",
		"uniform float uKs;",
		"uniform float shininess;",

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			// ambient
			"gl_FragColor = vec4( uAmbientLightColor, 1.0 );",

			// compute direction to light
			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L. Normal must be normalized, since it's interpolated.
			"vec3 normal = normalize( vNormal );",
			"float diffuse = max( dot( normal, lVector ), 0.0);",

			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"return;",
			"}",

			"gl_FragColor.rgb += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",

			"gl_FragColor.rgb += uDirLightColor * uSpecularColor * specular;",

		"}"

	].join("\n")

},

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
		}
	},

	vertexShader: [

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vNormal = normalize( normalMatrix * normal );",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 uMaterialColor;",
		"uniform vec3 uSpecularColor;",

		"uniform vec3 uDirLightPos;",
		"uniform vec3 uDirLightColor;",

		"uniform vec3 uAmbientLightColor;",

		"uniform float uKd;",
		"uniform float uKs;",
		"uniform float shininess;",

		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",

		"void main() {",

			// ambient
			"gl_FragColor = vec4( uAmbientLightColor, 1.0 );",

			// compute direction to light
			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L. Normal must be normalized, since it's interpolated.
			"vec3 normal = normalize( vNormal );",
			"float diffuse = max( dot( normal, lVector ), 0.0);",

			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"return;",
			"}",

			"gl_FragColor.rgb += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",
			"specular *= diffuse * (2.0 + shininess)/8.0;",

			"gl_FragColor.rgb += uDirLightColor * uSpecularColor * specular;",

		"}"

	].join("\n")

}

};
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var camera, scene, renderer;

var cameraControls;

var effectController;

var clock = new THREE.Clock();

var teapotSize = 400;

var tess = 5, newTess = tess;

var tessLevel = [2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32];

var phongBal = false;

var ambientLight, light;
var teapot;
var phongMaterial, phongBalancedMaterial;

init();
animate();

function init() {
	var container = document.getElementById('container');

	// CAMERA

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 80000);
	camera.position.set(-600, 550, 1300);

	// LIGHTS

	ambientLight = new THREE.AmbientLight(0x333333); // 0.2

	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(320, 390, 700);

	// RENDERER

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	renderer.setClearColorHex(0xAAAAAA, 1.0);

	container.appendChild(renderer.domElement);

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	// EVENTS

	window.addEventListener('resize', onWindowResize, false);

	// CONTROLS

	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0, 0, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var materialColor = new THREE.Color();
	materialColor.setRGB(1.0, 0.8, 0.6);

	phongMaterial = createShaderMaterial("phong", light, ambientLight);
	phongMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongMaterial.side = THREE.DoubleSide;

	phongBalancedMaterial = createShaderMaterial("phongBalanced", light, ambientLight);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongBalancedMaterial.side = THREE.DoubleSide;

	fillScene();

	// GUI

	setupGui();
}

function createShaderMaterial(id, light, ambientLight) {

	var shader = THREE.ShaderTypes[id];

	var u = THREE.UniformsUtils.clone(shader.uniforms);

	var vs = shader.vertexShader;
	var fs = shader.fragmentShader;

	var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;

	material.uniforms.uAmbientLightColor.value = ambientLight.color;

	return material;

}

// EVENT HANDLERS

function onWindowResize() {

	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

}

function setupGui() {

	effectController = {
		energyBalanced: true,

		shininess: 50.0,
		ka: 0.2,
		kd: 0.4,
		ks: 0.5,
		metallic: false,

		hue: 0.09,
		saturation: 0.46,
		lightness: 0.7,

		lhue: 0.04,
		lsaturation: 0.0,
		llightness: 0.7,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.32,
		ly: 0.39,
		lz: 0.7
	};

	var h;

	var gui = new dat.GUI();

	// material (attributes)
	gui.add(effectController, "energyBalanced").name("energy balanced");

	h = gui.addFolder("Material control");

	h.add(effectController, "shininess", 1.0, 100.0, 1.0).name("m_shininess");
	h.add(effectController, "ka", 0.0, 1.0, 0.025).name("Ka");
	h.add(effectController, "kd", 0.0, 1.0, 0.025).name("Kd");
	h.add(effectController, "ks", 0.0, 1.0, 0.025).name("Ks");
	h.add(effectController, "metallic");

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

	if (newTess !== tess || effectController.energyBalanced !== phongBal) {
		tess = newTess;
		phongBal = effectController.energyBalanced;

		fillScene();
	}

	phongMaterial.uniforms.shininess.value = effectController.shininess;
	phongBalancedMaterial.uniforms.shininess.value = effectController.shininess;
	phongMaterial.uniforms.uKd.value = effectController.kd;
	phongBalancedMaterial.uniforms.uKd.value = effectController.kd;
	phongMaterial.uniforms.uKs.value = effectController.ks;
	phongBalancedMaterial.uniforms.uKs.value = effectController.ks;

	var materialColor = new THREE.Color();
	materialColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
	phongMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);

	if (!effectController.metallic) {
		materialColor.setRGB(1, 1, 1);
	}
	phongMaterial.uniforms.uSpecularColor.value.copy(materialColor);
	phongBalancedMaterial.uniforms.uSpecularColor.value.copy(materialColor);

	// Light has no effect on ambient
	ambientLight.color.setHSL(effectController.hue, effectController.saturation, effectController.lightness * effectController.ka);

	light.position.set(effectController.lx, effectController.ly, effectController.lz);

	light.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);

	renderer.render(scene, camera);

}

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x808080, 2000, 4000);

	// LIGHTS

	scene.add(ambientLight);
	scene.add(light);

	teapot = new THREE.Mesh(
		new THREE.TeapotGeometry(teapotSize, tessLevel[tess], true, true, true, true),
			phongBal ? phongBalancedMaterial : phongMaterial);

	scene.add(teapot);
}
