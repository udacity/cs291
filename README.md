cs291
=====

Interactive 3D Graphics class code

Take the class at https://www.udacity.com/course/cs291

IMPORTANT: to run the demo and exercise code in Units 8-10 locally on your own machine, for Chrome you need to add "--allow-file-access-from-files" to your shortcut to enable the use of textures on your machine. Make sure all Chrome processes in the Task Manager are shut down before restarting Chrome with this option. Note that even rebooting won't assure this - chrome.exe processes will often occur on startup. You have to kill these by hand and then run your shortcut. See http://www.chrome-allow-file-access-from-file.com/ for more details.

If you work on exercises with textures locally and then submit your work, you'll need to change one more line at the top of the exercise, something like this:

`var path = "/";	// STUDENT: set to "" to run on your computer, "/" for submitting code to Udacity`

Do as the comment says.

=======
Note: three.js itself is constantly evolving. What we use here is a snapshot of the r56 revision of three.js in lib/three.min.js and lib/three.js.

You can see the [full migration guide](https://github.com/mrdoob/three.js/wiki/Migration) for all changes from version to version.

Changes that affect this code base, between the current three.js code, r58, and this repository's, r56:
* renderer.setClearColorHex should be changed to renderer.setClearColor (this is not backwards compatible).
* OrbitAndPanControls.js: use OrbitAndPanControls.new.js for three.js r58 on.

