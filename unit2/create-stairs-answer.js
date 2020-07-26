"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
////////////////////////////////////////////////////////////////////////////////
// Staircase exercise
// Your task is to complete the model for simple stairs
// Using the provided sizes and colors, complete the staircase
// and reach the Gold Cup!
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window, dat*/

let camera, scene, renderer;
let cameraControls, effectController;
let clock = new THREE.Clock();
let gridX = false;
let gridY = false;
let gridZ = false;
let axes = false;
let ground = true;

function createStairs() {

    // MATERIALS
    let stepMaterialVertical = new THREE.MeshLambertMaterial({
        color: 0xA85F35
    });
    let stepMaterialHorizontal = new THREE.MeshLambertMaterial({
        color: 0xBC7349
    });

    let stepWidth = 500;
    let stepSize = 200;
    let stepThickness = 50;
    // height from top of one step to bottom of next step up
    let verticalStepHeight = stepSize;
    let horizontalStepDepth = stepSize * 2;

    let stepHalfThickness = stepThickness / 2;

    // +Y direction is up
    // Define the two pieces of the step, vertical and horizontal
    // THREE.CubeGeometry takes (width, height, depth)
    let stepVertical = new THREE.CubeGeometry(stepWidth, verticalStepHeight, stepThickness);
    let stepHorizontal = new THREE.CubeGeometry(stepWidth, stepThickness, horizontalStepDepth);
    let stepMesh;
	let x = 0;
	let y = 0;
	let z = 0

    for (let i = 0; i < 6; i++) {
		// Make and position the vertical part of the step
		stepMesh = new THREE.Mesh(stepVertical, stepMaterialVertical);
		// The position is where the center of the block will be put.
		// You can define position as THREE.Vector3(x, y, z) or in the following way:
		stepMesh.position.x = 0;			// centered at origin
		stepMesh.position.y = verticalStepHeight / 2 + y;	// half of height: put it above ground plane
		stepMesh.position.z = z;			// centered at origin
		scene.add(stepMesh);

		// Make and position the horizontal part
		stepMesh = new THREE.Mesh(stepHorizontal, stepMaterialHorizontal);
		stepMesh.position.x = 0;
		// Push up by half of horizontal step's height, plus vertical step's height
		stepMesh.position.y = stepThickness / 2 + verticalStepHeight + y;
		// Push step forward by half the depth, minus half the vertical step's thickness
		stepMesh.position.z = horizontalStepDepth / 2 - stepHalfThickness + z;
		scene.add(stepMesh);

		y += verticalStepHeight + stepThickness;
		z += horizontalStepDepth - stepThickness;
	}
}

function createCup() {
    let cupMaterial = new THREE.MeshLambertMaterial({color: 0xFDD017});
    // THREE.CylinderGeometry takes (radiusTop, radiusBottom, height, segmentsRadius)
    let cupGeo = new THREE.CylinderGeometry(200, 50, 400, 32);
    let cup = new THREE.Mesh(cupGeo, cupMaterial);
    cup.position.x = 0;
    cup.position.y = 1725;
    cup.position.z = 1925;
    scene.add(cup);
    cupGeo = new THREE.CylinderGeometry(100, 100, 50, 32);
    cup = new THREE.Mesh(cupGeo, cupMaterial);
    cup.position.x = 0;
    cup.position.y = 1525;
    cup.position.z = 1925;
    scene.add(cup);
}

function init() {
    let canvasWidth = 846;
    let canvasHeight = 494;
    // For grading the window is fixed in size; here's general code:
    //let canvasWidth = window.innerWidth;
    //let canvasHeight = window.innerHeight;
    let canvasRatio = canvasWidth / canvasHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColorHex(0xAAAAAA, 1.0);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 40000);
    camera.position.set(-700, 500, -1600);
    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    cameraControls.target.set(0, 600, 0);

    // Camera(2) for testing has following values:
    // camera.position.set( 1225, 2113, 1814 );
    // cameraControls.target.set(-1800,180,630);

    fillScene();
}

function addToDOM() {
    let container = document.getElementById('container');
    let canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}

function fillScene() {
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 3000, 6000);
    // LIGHTS
    let ambientLight = new THREE.AmbientLight(0x222222);
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(200, 400, 500);

    let light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light2.position.set(-400, 200, -300);

    scene.add(ambientLight);
    scene.add(light);
    scene.add(light2);

    if (ground) {
        Coordinates.drawGround({size: 1000});
    }
    if (gridX) {
        Coordinates.drawGrid({size: 1000, scale: 0.01});
    }
    if (gridY) {
        Coordinates.drawGrid({size: 1000, scale: 0.01, orientation: "y"});
    }
    if (gridZ) {
        Coordinates.drawGrid({size: 1000, scale: 0.01, orientation: "z"});
    }
    if (axes) {
        Coordinates.drawAllAxes({axisLength: 300, axisRadius: 2, axisTess: 50});
    }
    createCup();
    let stairs = createStairs();
    scene.add(stairs);
}

//

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    if (effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes) {
        gridX = effectController.newGridX;
        gridY = effectController.newGridY;
        gridZ = effectController.newGridZ;
        ground = effectController.newGround;
        axes = effectController.newAxes;

        fillScene();
    }
    renderer.render(scene, camera);
}

function setupGui() {

    effectController = {

        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: axes
    };

    let gui = new dat.GUI();
    gui.add(effectController, "newGridX").name("Show XZ grid");
    gui.add(effectController, "newGridY").name("Show YZ grid");
    gui.add(effectController, "newGridZ").name("Show XY grid");
    gui.add(effectController, "newGround").name("Show ground");
    gui.add(effectController, "newAxes").name("Show axes");
}


try {
    init();
    setupGui();
    addToDOM();
    animate();
} catch (e) {
    let errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    $('#container').append(errorReport + e);
}
