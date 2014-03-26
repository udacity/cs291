/*global THREE, scene*/
var Coordinates = {
	drawGrid:function(params) {
		params = params || {};
		var size = params.size !== undefined ? params.size:100;
		var scale = params.scale !== undefined ? params.scale:0.1;
		var orientation = params.orientation !== undefined ? params.orientation:"x";
		var grid = new THREE.Mesh(
			new THREE.PlaneGeometry(size, size, size * scale, size * scale),
			new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true }) 
			);
		// Yes, these are poorly labeled! It would be a mess to fix.
		// What's really going on here:
		// "x" means "rotate 90 degrees around x", etc.
		// So "x" really means "show a grid with a normal of Y"
		//    "y" means "show a grid with a normal of X"
		//    "z" means (logically enough) "show a grid with a normal of Z"
		if (orientation === "x") {
			grid.rotation.x = - Math.PI / 2;
		} else if (orientation === "y") {
			grid.rotation.y = - Math.PI / 2;
		} else if (orientation === "z") {
			grid.rotation.z = - Math.PI / 2;
		}

		scene.add(grid);
	},
	drawGround:function(params) {
		params = params || {};
		var size = params.size !== undefined ? params.size:100;
		var color = params.color !== undefined ? params.color:0xFFFFFF;
		var ground = new THREE.Mesh(
			new THREE.PlaneGeometry(size, size),
			// When we use a ground plane we use directional lights, so illuminating
			// just the corners is sufficient.
			// Use MeshPhongMaterial if you want to capture per-pixel lighting:
			// new THREE.MeshPhongMaterial({ color: color, specular: 0x000000,
			new THREE.MeshLambertMaterial({ color: color,
				// polygonOffset moves the plane back from the eye a bit, so that the lines on top of
				// the grid do not have z-fighting with the grid:
				// Factor == 1 moves it back relative to the slope (more on-edge means move back farther)
				// Units == 4 is a fixed amount to move back, and 4 is usually a good value
				polygonOffset: true, polygonOffsetFactor: 1.0, polygonOffsetUnits: 4.0
			}));
		ground.rotation.x = - Math.PI / 2;
		scene.add(ground);
	},
	drawAxes:function(params) {
		// x = red, y = green, z = blue  (RGB = xyz)
		params = params || {};
		var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
		var axisLength = params.axisLength !== undefined ? params.axisLength:11;
		var axisTess = params.axisTess !== undefined ? params.axisTess:48;
		var axisOrientation = params.axisOrientation !== undefined ? params.axisOrientation:"x";

		var axisMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, side: THREE.DoubleSide });
		var axis = new THREE.Mesh(
			new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
			axisMaterial
			);
		if (axisOrientation === "x") {
			axis.rotation.z = - Math.PI / 2;
			axis.position.x = axisLength/2-1;
		} else if (axisOrientation === "y") {
				axis.position.y = axisLength/2-1;
		}
		
		scene.add( axis );
		
		var arrow = new THREE.Mesh(
			new THREE.CylinderGeometry(0, 4*axisRadius, 8*axisRadius, axisTess, 1, true), 
			axisMaterial
			);
		if (axisOrientation === "x") {
			arrow.rotation.z = - Math.PI / 2;
			arrow.position.x = axisLength - 1 + axisRadius*4/2;
		} else if (axisOrientation === "y") {
			arrow.position.y = axisLength - 1 + axisRadius*4/2;
		}

		scene.add( arrow );

	},
	drawAllAxes:function(params) {
		params = params || {};
		var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
		var axisLength = params.axisLength !== undefined ? params.axisLength:11;
		var axisTess = params.axisTess !== undefined ? params.axisTess:48;

		var axisXMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
		var axisYMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
		var axisZMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
		axisXMaterial.side = THREE.DoubleSide;
		axisYMaterial.side = THREE.DoubleSide;
		axisZMaterial.side = THREE.DoubleSide;
		var axisX = new THREE.Mesh(
			new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
			axisXMaterial
			);
		var axisY = new THREE.Mesh(
			new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
			axisYMaterial
			);
		var axisZ = new THREE.Mesh(
			new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
			axisZMaterial
			);
		axisX.rotation.z = - Math.PI / 2;
		axisX.position.x = axisLength/2-1;

		axisY.position.y = axisLength/2-1;
		
		axisZ.rotation.y = - Math.PI / 2;
		axisZ.rotation.z = - Math.PI / 2;
		axisZ.position.z = axisLength/2-1;

		scene.add( axisX );
		scene.add( axisY );
		scene.add( axisZ );

		var arrowX = new THREE.Mesh(
			new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
			axisXMaterial
			);
		var arrowY = new THREE.Mesh(
			new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
			axisYMaterial
			);
		var arrowZ = new THREE.Mesh(
			new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
			axisZMaterial
			);
		arrowX.rotation.z = - Math.PI / 2;
		arrowX.position.x = axisLength - 1 + axisRadius*4/2;

		arrowY.position.y = axisLength - 1 + axisRadius*4/2;

		arrowZ.rotation.z = - Math.PI / 2;
		arrowZ.rotation.y = - Math.PI / 2;
		arrowZ.position.z = axisLength - 1 + axisRadius*4/2;

		scene.add( arrowX );
		scene.add( arrowY );
		scene.add( arrowZ );

	}

};