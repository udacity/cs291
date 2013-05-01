cs291
=====

Interactive 3D Graphics class code

Take the class at https://www.udacity.com/course/cs291
=======
Note: three.js itself is constantly evolving. What we use here is a snapshot of the r56 revision of three.js in lib/three.min.js and lib/three.js.

You can see the [full migration guide](https://github.com/mrdoob/three.js/wiki/Migration) for all changes from version to version.

Changes that affect this code base, between the current three.js code, r58, and this repository's, r56:
* renderer.setClearColorHex should be changed to renderer.setClearColor (this is not backwards compatible).
* OrbitAndPanControls.js: use OrbitAndPanControls.new.js for three.js r58 on.

