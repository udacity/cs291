"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// anisotropic shading
////////////////////////////////////////////////////////////////////////////////
/*global THREE, requestAnimationFrame, dat */

var camera, scene, renderer;

var cameraControls;

var effectController;

var clock = new THREE.Clock();

var teapotSize = 600;

var tess = -1;	// force initialization

var ambientLight, light;
var teapot;
var phongBalancedMaterial;

//try {
	init();
	animate();
// }
// catch(e) {
//  console.log(e);
// }

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	var container = document.getElementById('container');

	// LIGHTS

	ambientLight = new THREE.AmbientLight(0x333333); // 0.2

	light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	light.position.set(700, 3000, 1200);

	// RENDERER

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex(0xAAAAAA, 1.0);

	container.appendChild(renderer.domElement);

	renderer.gammaInput = true;
	renderer.gammaOutput = true;


	// CAMERA

	camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 80000);
	camera.position.set(-1246, 35, -439);

	// CONTROLS

	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0, -436, 0);

	// MATERIALS
	// Note: setting per pixel off does not affect the specular highlight;
	// it affects only whether the light direction is recalculated each pixel.
	var materialColor = new THREE.Color();
	materialColor.setRGB(1.0, 0.8, 0.6);

	phongBalancedMaterial = createShaderMaterial("phongBalanced", light, ambientLight);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);
	phongBalancedMaterial.side = THREE.DoubleSide;

	fillScene();

	// GUI

	setupGui();
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
					value: 0.52
				},
				uKs: {
					type: "f",
					value: 0.35
				},
				shininess: {
					type: "f",
					value: 100.0
				},
				uFresnelScale: {
					type: "f",
					value: 5.0
				},
				uUseFresnel: {
					type: "f",
					value: 1.0
				}
			}
		}

	};

	var shader = shaderTypes[id];

	var u = THREE.UniformsUtils.clone(shader.uniforms);

	// this line will load a shader that has an id of "vertex" from the .html file
	var vs = ["varying vec3 vNormal;",
"varying vec3 vViewPosition;",
"",
"void main() {",
"",
	"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
	"vNormal = normalize( normalMatrix * normal );",
	"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
	"vViewPosition = -mvPosition.xyz;",
"}"].join("\n");
	// this line will load a shader that has an id of "fragment" from the .html file
	var fs = ["uniform vec3 uMaterialColor;",
"uniform vec3 uSpecularColor;",
"",
"uniform vec3 uDirLightPos;",
"uniform vec3 uDirLightColor;",
"",
"uniform vec3 uAmbientLightColor;",
"",
"uniform float uKd;",
"uniform float uKs;",
"uniform float shininess;",
"",
"uniform float uFresnelScale;",
"",
"uniform float uUseFresnel;	// KISS - three.js doesn't support bool for GLSL, AFAIK",
"",
"varying vec3 vNormal;",
"varying vec3 vViewPosition;",
"",
"// for Blinn-Phong you want to pass in the H vector, the",
"// perfect mirror microfacet direction. Otherwise pass in N.",
"// See http://en.wikipedia.org/wiki/Schlick%27s_approximation for formula",
"// R0 is ((1-n2)/(1+n2))^2, e.g. for skin (from GPU Gems 3):",
"// Index of refraction of 1.4 gives ((1-1.4)/(1+1.4))^2 = 0.028",
"float fresnelReflectance( vec3 L, vec3 H, float R0 ) {",
	"float base = 1.0 - dot( L, H );",
	"float exponential = pow( base, 5.0 );",
	"return R0 + (1.0 - R0) * exponential;",
"}",
"",
"void main() {",
"",
	"// ambient",
	"gl_FragColor = vec4( uAmbientLightColor, 1.0 );",
"",
	"// compute direction to light",
	"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
	"vec3 lVector = normalize( lDirection.xyz );",
"",
	"vec3 normal = normalize( vNormal );",
"	",
	"// diffuse: N * L. Normal must be normalized, since it's interpolated.",
	"float diffuse = max( dot( normal, lVector ), 0.0);",
"",
	"gl_FragColor.rgb += uKd * uMaterialColor * uDirLightColor * diffuse;",
"",
	"// This can give a hard termination to the highlight, but it's better than some weird sparkle.",
	"if (diffuse > 0.0) {",
"",
		"// specular: N * H to a power. H is light vector + view vector",
		"vec3 viewPosition = normalize( vViewPosition );",
		"vec3 pointHalfVector = normalize( lVector + viewPosition );",
		"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
		"float specular = pow( pointDotNormalHalf, shininess );",
		"specular *= (2.0 + shininess)/8.0;",
"		",
		"vec3 sc = uDirLightColor * uSpecularColor * uKs * specular; ",
		"if ( uUseFresnel != 0.0 ) {",
			"// Since Fresnel dims the specular considerably except at a shallow angle,",
			"// adjust by a fudge factor. We're not dealing with an energy-conserving",
			"// illumination model here.",
			"specular *= uFresnelScale * fresnelReflectance( lVector, pointHalfVector, 0.028 );",
		"}",
		"gl_FragColor.rgb += uKd * uMaterialColor * uDirLightColor * diffuse;",
		"gl_FragColor.rgb += diffuse * uDirLightColor * uSpecularColor * uKs * specular;",
	"}",
"}"].join("\n");

	var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });

	material.uniforms.uDirLightPos.value = light.position;
	material.uniforms.uDirLightColor.value = light.color;

	material.uniforms.uAmbientLightColor.value = ambientLight.color;
	return material;

}

function setupGui() {

	effectController = {

		shininess: 100.0,
		ka: 0.2,
		kd: 0.52,
		ks: 0.35,
		fresnelScale: 5.0,
		useFresnel: true,

		hue: 0.09,
		saturation: 0.78,
		lightness: 0.49,

		lhue: 0.04,
		lsaturation: 0.0,
		llightness: 0.7,

		// bizarrely, if you initialize these with negative numbers, the sliders
		// will not show any decimal places.
		lx: 0.65,
		ly: 0.43,
		lz: 0.35,
		newTess: 10
	};

	var h;

	var gui = new dat.GUI();

	// material (attributes)

	h = gui.addFolder("Material control");

	h.add(effectController, "shininess", 1.0, 1000.0, 1.0).name("shininess");
	h.add(effectController, "ka", 0.0, 1.0, 0.025).name("Ka");
	h.add(effectController, "kd", 0.0, 1.0, 0.025).name("Kd");
	h.add(effectController, "ks", 0.0, 1.0, 0.025).name("Ks");
	h.add(effectController, "useFresnel");
	h.add(effectController, "fresnelScale", 0.0, 50.0, 0.025).name("Fresnel scale");
	h.add(effectController, "newTess", [2,3,4,5,6,8,10,12,16,24,32] ).name("Tessellation Level");

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

	if (effectController.newTess !== tess ) {
		tess = effectController.newTess;

		fillScene();
	}

	phongBalancedMaterial.uniforms.shininess.value = effectController.shininess;
	phongBalancedMaterial.uniforms.uKd.value = effectController.kd;
	phongBalancedMaterial.uniforms.uKs.value = effectController.ks;
	phongBalancedMaterial.uniforms.uUseFresnel.value = effectController.useFresnel ? 1.0 : 0.0;
	phongBalancedMaterial.uniforms.uFresnelScale.value = effectController.fresnelScale;

	var materialColor = new THREE.Color();
	materialColor.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
	phongBalancedMaterial.uniforms.uMaterialColor.value.copy(materialColor);

	// always non-metallic for Schlick formula (non-conductive)
	// http://en.wikipedia.org/wiki/Schlick%27s_approximation
	materialColor.setRGB(1, 1, 1);
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
		new THREE.TeapotGeometry(teapotSize, tess, true, true, true, true), phongBalancedMaterial);
	teapot.position.y = -teapotSize;

	scene.add(teapot);
}