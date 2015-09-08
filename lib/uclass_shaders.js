"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
/**
 * @author Eric Haines / http://erichaines.com/
 *
 * Various useful shaders for the Udacity course "Interactive Rendering"
 * http://bit.ly/ericity
 */
/*global THREE */

THREE.ShaderTypes = {

'gouraud' : {

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

		"uniform vec3 uMaterialColor;",
		"uniform vec3 uSpecularColor;",

		"uniform vec3 uDirLightPos;",
		"uniform vec3 uDirLightColor;",

		"uniform vec3 uAmbientLightColor;",

		"uniform float uKd;",
		"uniform float uKs;",
		"uniform float shininess;",

		"varying vec3 vColor;",

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			"vec3 vNormal = normalize( normalMatrix * normal );",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec3 vViewPosition = -mvPosition.xyz;",

			"vColor = uAmbientLightColor * uMaterialColor;",

			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L
			"float diffuse = max( dot( vNormal, lVector ), 0.0);",

			"vColor += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( vNormal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",
			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"specular = 0.0;",
			"}",

			"vColor += uDirLightColor * uSpecularColor * specular;",
		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec3 vColor;",

		"void main() {",
			"gl_FragColor = vec4(vColor, 1.0);",
		"}"

	].join("\n")

},


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
			"gl_FragColor = vec4( uAmbientLightColor * uMaterialColor, 1.0 );",

			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L. Normal must be normalized, since it's interpolated.
			"vec3 normal = normalize( vNormal );",
			"float diffuse = max( dot( normal, lVector ), 0.0);",

			"gl_FragColor.xyz += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",
			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"specular = 0.0;",
			"}",

			"gl_FragColor.xyz += uDirLightColor * uSpecularColor * specular;",

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
			"gl_FragColor = vec4( uAmbientLightColor * uMaterialColor, 1.0 );",

			"vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
			"vec3 lVector = normalize( lDirection.xyz );",

			// diffuse: N * L. Normal must be normalized, since it's interpolated.
			"vec3 normal = normalize( vNormal );",
			"float diffuse = max( dot( normal, lVector ), 0.0);",

			"gl_FragColor.xyz += uKd * uMaterialColor * uDirLightColor * diffuse;",

			// specular: N * H to a power. H is light vector + view vector
			"vec3 viewPosition = normalize( vViewPosition );",
			"vec3 pointHalfVector = normalize( lVector + viewPosition );",
			"float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );",
			"float specular = uKs * pow( pointDotNormalHalf, shininess );",
			"specular *= (8.0 + shininess)/(8.0*3.14);",
			//"float specular = uKs * ((float)shininess + 8.0 ) * pow( pointDotNormalHalf, shininess ) / (8 * 3.14);",
			// however, if N * L is < 0, the light is below the horizon and should not affect the surface
			// This can give a hard termination to the highlight, but it's better than some weird sparkle.
			"if (diffuse <= 0.0) {",
				"specular = 0.0;",
			"}",

			"gl_FragColor.xyz += uDirLightColor * uSpecularColor * specular;",

		"}"

	].join("\n")

}

};
