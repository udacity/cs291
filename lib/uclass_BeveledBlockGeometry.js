/**
 * @author Eric Haines / http://erichaines.com/
 *
 * Make a block with beveled edges, to catch highlights.
 *
 * TODO: bug when bevel >= depth/2 (or width/2, or height/2)
 */
/*global THREE */

THREE.BeveledBlockGeometry = function ( width, height, depth, bevel, widthSegments, heightSegments, depthSegments ) {
	"use strict";

	THREE.Geometry.call( this );

	var scope = this;

	this.width = width;
	this.height = height;
	this.depth = depth;
	
	this.bevel = bevel || 0;

	this.widthSegments = widthSegments || 1;
	this.heightSegments = heightSegments || 1;
	this.depthSegments = depthSegments || 1;

	var width_half = this.width / 2;
	var height_half = this.height / 2;
	var depth_half = this.depth / 2;
	
	var adjWidth = this.width - this.bevel*2;
	var adjHeight = this.height - this.bevel*2;
	var adjDepth = this.depth - this.bevel*2;

	if ( adjDepth > 0 && adjHeight > 0 ) {
		buildPlane( 'z', 'y', - 1, - 1, adjDepth, adjHeight, width_half, 0 ); // px
		buildPlane( 'z', 'y',   1, - 1, adjDepth, adjHeight, - width_half, 0 ); // nx
	}
	if ( adjWidth > 0 && adjDepth > 0 ) {
		buildPlane( 'x', 'z',   1,   1, adjWidth, adjDepth, height_half, 0 ); // py
		buildPlane( 'x', 'z',   1, - 1, adjWidth, adjDepth, - height_half, 0 ); // ny
	}
	if ( adjWidth > 0 && adjHeight > 0 ) {
		buildPlane( 'x', 'y',   1, - 1, adjWidth, adjHeight, depth_half, 0 ); // pz
		buildPlane( 'x', 'y', - 1, - 1, adjWidth, adjHeight, - depth_half, 0 ); // nz
	}
	
	// bevels
	if ( this.bevel > 0 )
	{
		if ( adjWidth < 0 ) { adjWidth = 0; }
		if ( adjHeight < 0 ) { adjHeight = 0; }
		if ( adjDepth < 0 ) { adjDepth = 0; }
		var adjHalfWidth = adjWidth / 2;
		var adjHalfHeight = adjHeight / 2;
		var adjHalfDepth = adjDepth / 2;
		
		// 12 edges
		// -Y face neighbors
		buildBevelSide( 'x', -adjHalfWidth, -height_half, -adjHalfDepth,  adjHalfWidth, -adjHalfHeight, -depth_half, 0, -1, 0, 0, 0, -1 ); 
		buildBevelSide( 'x',  adjHalfWidth, -height_half,  adjHalfDepth, -adjHalfWidth, -adjHalfHeight,  depth_half, 0, -1, 0, 0, 0, 1  ); 
		buildBevelSide( 'z', -adjHalfWidth, -height_half,  adjHalfDepth,  -width_half, -adjHalfHeight, -adjHalfDepth, 0, -1, 0, -1, 0, 0  ); 
		buildBevelSide( 'z',  adjHalfWidth, -height_half, -adjHalfDepth,   width_half, -adjHalfHeight,  adjHalfDepth, 0, -1, 0, 1, 0, 0  ); 
		// +Y face neighbors
		buildBevelSide( 'x',  adjHalfWidth, height_half, -adjHalfDepth, -adjHalfWidth, adjHalfHeight, -depth_half, 0, 1, 0, 0, 0, -1 ); 
		buildBevelSide( 'x', -adjHalfWidth, height_half,  adjHalfDepth,  adjHalfWidth, adjHalfHeight,  depth_half, 0, 1, 0, 0, 0, 1  ); 
		buildBevelSide( 'z', -adjHalfWidth, height_half, -adjHalfDepth,  -width_half, adjHalfHeight, adjHalfDepth, 0, 1, 0, -1, 0, 0  ); 
		buildBevelSide( 'z',  adjHalfWidth, height_half,  adjHalfDepth,   width_half, adjHalfHeight,  -adjHalfDepth, 0, 1, 0, 1, 0, 0  );
		// Y side face neighbors
		buildBevelSide( 'y',  -width_half,  adjHalfHeight, -adjHalfDepth, -adjHalfWidth, -adjHalfHeight, -depth_half, -1, 0, 0, 0, 0, -1 ); 
		buildBevelSide( 'y',  -width_half, -adjHalfHeight,  adjHalfDepth, -adjHalfWidth,  adjHalfHeight,  depth_half, -1, 0, 0, 0, 0, 1 ); 
		buildBevelSide( 'y',   width_half, -adjHalfHeight, -adjHalfDepth,  adjHalfWidth,  adjHalfHeight, -depth_half, 1, 0, 0, 0, 0, -1 ); 
		buildBevelSide( 'y',   width_half,  adjHalfHeight,  adjHalfDepth,  adjHalfWidth, -adjHalfHeight,  depth_half, 1, 0, 0, 0, 0, 1 );

		// 8 corners
		buildBevelCorners( adjHalfWidth, width_half, adjHalfHeight, height_half, adjHalfDepth, depth_half );
	}
	
	function buildPlane( u, v, udir, vdir, width, height, depth, materialIndex ) {

		var w, ix, iy,
		gridX = scope.widthSegments,
		gridY = scope.heightSegments,
		width_half = width / 2,
		height_half = height / 2,
		offset = scope.vertices.length;

		if ( ( u === 'x' && v === 'y' ) || ( u === 'y' && v === 'x' ) ) {

			w = 'z';

		} else if ( ( u === 'x' && v === 'z' ) || ( u === 'z' && v === 'x' ) ) {

			w = 'y';
			gridY = scope.depthSegments;

		} else if ( ( u === 'z' && v === 'y' ) || ( u === 'y' && v === 'z' ) ) {

			w = 'x';
			gridX = scope.depthSegments;

		}

		var gridX1 = gridX + 1,
		gridY1 = gridY + 1,
		segment_width = width / gridX,
		segment_height = height / gridY,
		normal = new THREE.Vector3();

		normal[ w ] = depth > 0 ? 1 : - 1;

		for ( iy = 0; iy < gridY1; iy ++ ) {

			for ( ix = 0; ix < gridX1; ix ++ ) {

				var vector = new THREE.Vector3();
				vector[ u ] = ( ix * segment_width - width_half ) * udir;
				vector[ v ] = ( iy * segment_height - height_half ) * vdir;
				vector[ w ] = depth;

				scope.vertices.push( vector );

			}

		}

		for ( iy = 0; iy < gridY; iy++ ) {

			for ( ix = 0; ix < gridX; ix++ ) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * ( iy + 1 );
				var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = ( ix + 1 ) + gridX1 * iy;

				var face = new THREE.Face4( a + offset, b + offset, c + offset, d + offset );
				// not needed? We don't compute others: face.normal.copy( normal );
				face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
				face.materialIndex = materialIndex;

				scope.faces.push( face );
				scope.faceVertexUvs[ 0 ].push( [
							new THREE.Vector2( ix / gridX, 1 - iy / gridY ),
							new THREE.Vector2( ix / gridX, 1 - ( iy + 1 ) / gridY ),
							new THREE.Vector2( ( ix + 1 ) / gridX, 1- ( iy + 1 ) / gridY ),
							new THREE.Vector2( ( ix + 1 ) / gridX, 1 - iy / gridY )
						] );
			}
		}
	}
	
	function buildBevelSide( longSide, xlo, ylo, zlo, xhi, yhi, zhi, xn1, yn1, zn1, xn2, yn2, zn2 ) {
		
		var vector;
		var offset = scope.vertices.length;
		
		vector = new THREE.Vector3(xlo,ylo,zlo);
		scope.vertices.push( vector );
		if ( longSide === 'x' ) {
			vector = new THREE.Vector3(xlo,yhi,zhi);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xhi,yhi,zhi);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xhi,ylo,zlo);
			scope.vertices.push( vector );
		}
		else if ( longSide === 'y' ) {
			vector = new THREE.Vector3(xhi,ylo,zhi);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xhi,yhi,zhi);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xlo,yhi,zlo);
			scope.vertices.push( vector );
		}
		else {
			vector = new THREE.Vector3(xhi,yhi,zlo);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xhi,yhi,zhi);
			scope.vertices.push( vector );
			vector = new THREE.Vector3(xlo,ylo,zhi);
			scope.vertices.push( vector );
		}

		var face = new THREE.Face4( offset, offset+1, offset+2, offset+3 );
		var vnorm1 = new THREE.Vector3( xn1, yn1, zn1 );
		var vnorm2 = new THREE.Vector3( xn2, yn2, zn2 );
		face.vertexNormals.push( vnorm1.clone(), vnorm2.clone(), vnorm2.clone(), vnorm1.clone() );
		face.materialIndex = 0;

		scope.faces.push( face );
		// these are certainly wrong
		scope.faceVertexUvs[ 0 ].push( [
					new THREE.Vector2( 0, 0 ),
					new THREE.Vector2( 0, 1 ),
					new THREE.Vector2( 1, 1 ),
					new THREE.Vector2( 1, 0 )
				] );
	}

	function buildBevelCorners( xah, xh, yah, yh, zah, zh ) {
		
		var vector;
		var offset = scope.vertices.length;
		
		var count = 0;
		for ( var i = 0; i < 2; i++ ) {
			var xsign = i ? 1 : -1;
			for ( var j = 0; j < 2; j++ ) {
				var ysign = j ? 1 : -1;
				for ( var k = 0; k < 2; k++ ) {
					var zsign = k ? 1 : -1;
					
					// first vertex
					vector = new THREE.Vector3(xsign*xh,ysign*yah,zsign*zah);
					scope.vertices.push( vector );
					var vnorm1 = new THREE.Vector3(xsign,0,0);
					
					vector = new THREE.Vector3(xsign*xah,ysign*yh,zsign*zah);
					scope.vertices.push( vector );
					var vnorm2 = new THREE.Vector3(0,ysign,0);
					
					vector = new THREE.Vector3(xsign*xah,ysign*yah,zsign*zh);
					scope.vertices.push( vector );
					var vnorm3 = new THREE.Vector3(0,0,zsign);
					
					var face;
					face = new THREE.Face3( offset, offset+1, offset+2 );

					if ( xsign * ysign * zsign === 1 )
					{
						face = new THREE.Face3( offset, offset+1, offset+2 );
						face.vertexNormals.push( vnorm1, vnorm2, vnorm3 );
					}
					else
					{
						face = new THREE.Face3( offset+2, offset+1, offset );
						face.vertexNormals.push( vnorm3, vnorm2, vnorm1 );
					}
					face.materialIndex = 0;

					scope.faces.push( face );
					// these are certainly wrong
					scope.faceVertexUvs[ 0 ].push( [
								new THREE.Vector2( 0, 0 ),
								new THREE.Vector2( 0, 1 ),
								new THREE.Vector2( 1, 1 )
							] );

					offset += 3;

					count++;
				}
			}
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.mergeVertices();

};

THREE.BeveledBlockGeometry.prototype = Object.create( THREE.Geometry.prototype );