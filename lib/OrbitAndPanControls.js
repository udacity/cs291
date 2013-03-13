/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 *
 * TODO: finish touch controls so it can be used on smartphones.
 */
/*global THREE */

THREE.OrbitAndPanControls = function ( object, domElement ) {

	THREE.EventDispatcher.call( this );

	this.enabled = true;

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.target = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;
	
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.panLeft = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get X column of matrix
		panOffset.set( te[0], te[1], te[2] );
		panOffset.multiplyScalar(-distance);
		
		pan.add( panOffset );

	};

	this.panUp = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get Y column of matrix
		panOffset.set( te[4], te[5], te[6] );
		panOffset.multiplyScalar(distance);
		
		pan.add( panOffset );
	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale /= dollyScale;

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale *= dollyScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.target );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
		
		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set(0,0,0);

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) { return; }

		if ( !scope.userRotate ) { return; }

		event.preventDefault();

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );
			
		} else if ( event.button === 2 ) {

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) { return; }

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / scope.domElement.width * scope.userRotateSpeed );
			scope.rotateUp( Math.PI * rotateDelta.y / scope.domElement.height * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.PAN ) {

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );

			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();
			if ( scope.object.fov !== undefined )
			{
				// half of the fov is center to top of screen
				targetDistance *= Math.tan( (scope.object.fov/2) * Math.PI / 180.0 );
			}
			
			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * panDelta.x * targetDistance / scope.domElement.height );
			scope.panUp( 2 * panDelta.y * targetDistance / scope.domElement.height );

			panStart.copy( panEnd );

		} else if ( state === STATE.DOLLY ) {

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		}

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) { return; }

		if ( ! scope.userRotate ) { return; }

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		
		state = STATE.NONE;
	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false ) { return; }

		if ( ! scope.userZoom ) { return; }

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

	}
	
	function touchstart( event ) {

		if ( scope.enabled === false ) { return; }

		/* TODO, innards of mouse begin here
		switch ( event.touches.length ) {

			case 1:
				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.clientX, event.clientY );
				_state = STATE.TOUCH_ROTATE;
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				state = STATE.TOUCH_DOLLY;

				dollyStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				
				// classier would be to take both points for a multitouch stretch thing:
				//var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				//var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				//_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
				break;

			case 3:
				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				state = STATE.NONE;

		}
		*/
	}

	function touchmove( event ) {

		if ( scope.enabled === false ) { return; }

		event.preventDefault();
		event.stopPropagation();

		/* TODO, innards of mouse move here
		switch ( event.touches.length ) {

			case 1:
				_rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy )
				break;

			case 3:
				_panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				_state = STATE.NONE;

		}
		*/

	}

	function touchend( event ) {

		if ( scope.enabled === false ) { return; }

		/* from trackball. I don't think we need anything.
		switch ( event.touches.length ) {

			case 1:
				_rotateStart = _rotateEnd = _this.getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:
				_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;
				break;

			case 3:
				_panStart = _panEnd = _this.getMouseOnScreen( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

		}
		*/

		state = STATE.NONE;
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

};
