/*global document $ renderer THREE scene Q*/
var Grading = {
	input: document.getElementById("container"),
	imgelement: document.createElement("img"),

	setupBaseScene:function(params) {
		params = params || {};
		// should use this for comparison
		//<canvas width="861" height="494"></canvas>
	},
	makeScreenshot:function() {
		var img = false;
		if (renderer !== undefined) {
			img = renderer.domElement.toDataURL("image/png");
		}
		return img;
	},
	getBaseData:function(params) {
		params = params || {};
	},
	getImageData:function(params) {
		console.log("getting image data for: " +params.img);
		var deferred = Q.defer();
		var output = document.getElementById("grading");
		
		params = params || {};
		var img = params.img !== undefined ? params.img:false;
		var image = this.imgelement;
		if (image && img) {
			$(image).one("load", function() {
				var canvas = output.getElementsByTagName('canvas');
				if (canvas.length>0) {
					output.removeChild(canvas[0]);
				}
				canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				output.appendChild(canvas);
				var ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0);
				params.data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
				params.w = canvas.width;
				params.h = canvas.height;
				//output.removeChild(canvas);
				deferred.resolve(params);				
			}).attr("src", img);
		} else {
			console.log("could not load " + params.img);
			deferred.reject("Could not load image");
		}
		return deferred.promise;
		
	},
	compareImages:function(params) {
		params = params || {};
		//console.log("width = " + params.width);
		var data1 = params.data1 !== undefined ? params.data1:false;
		var data2 = params.data2 !== undefined ? params.data2:false;
		var variance = params.variance !== undefined ? params.variance:10;
		var tolerance = params.tolerance !== undefined ? params.tolerance: 0.01;

		if (!data1 || !data2) {
			return false;
		}
		var output = document.getElementById("grading");
		var canvas = output.getElementsByTagName('canvas');
		if (canvas.length>0) {
			canvas = canvas[0];
		} else {
			console.log("canvas does not exist");
		}
		var ctx = canvas.getContext('2d');

		var n = 0;
		var image = ctx.getImageData(0, 0, params.width, params.height);
		var pixel = image.data;
		var correct = true;
		var diff = 0;
		for (var i = 0; i < data1.length; i+=4) {
			correct = true;
			for (var p = 0; p < 4; p++) {
				diff = Math.abs(data1[i+p]-data2[i+p]);
				if (diff > variance) {
					correct = false;
				}
			}
			p = 0;
			for (p = 0; p < 3; p++) {
				if (correct) {
					pixel[i+p] = 255;
				} else {
					n = n+1;
					pixel[i+p] = 0;
				}
			}
		}
		image.data = pixel;
		ctx.putImageData(image, 0, 0);
		// because array length contains RGB+alpha we multiply by 3/4
		// to get actual length of meaningful data
		image_size = data1.length*0.75;
		// ratio of incorrect pixels vs all
		correctness = n/image_size;
		console.log("correctness: " +correctness);
		return {"result":(correctness<tolerance), "diff":correctness};
	},
	gradeTestCase: function(params) {
		initScene(params.v);
		var img1 = Grading.makeScreenshot();
		var img2 = params.image;
		var imgTarget = window.open('', 'For grading script');
		imgTarget.document.write('<img src="'+img1+'"/>');
		imgTarget.document.write('<img src="'+img2+'"/>');

		var tolerance = params.tolerance !== undefined ? params.tolerance: 0.01;
		var grade = Grading.getImageData({"img":img1})
			.then(function (d1) {
				return Grading.getImageData({"img":img2})
				.then(function (d2) {
					var params = {"data1":d1.data, 
								"data2":d2.data, 
								"width": d1.w, 
								"height": d1.h,
								"tolerance": tolerance};
					return Grading.compareImages(params);
				});
			})
			.then(function (r) {
				return {"passes":r.result,
						"difference":r.diff, 
						"type":params.t, 
						"function":params.f, 
						"case":params.v
					};
			});
		return grade;
	},
	cleanup: function(correct) {
		if (correct !== true) {
			// if submission is wrong, remove original canvas
			// and leave difference image up
			var c = document.getElementById("container");
			var original = c.getElementsByTagName("canvas")[0];
			c.removeChild(original);
			$(".dg.ac").remove();

		} else {
			var output = document.getElementById("grading");
			var canvas = output.getElementsByTagName('canvas');
			if (canvas.length > 0) {
				for (var c=0; c< canvas.length;c++) {
					output.removeChild(canvas[c]);
				}
			} else {
				output.removeChild(canvas);
			}
		}
	}
};