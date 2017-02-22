/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var PerspectiveCamera = THREEAPP.Class.create('PerspectiveCamera', null, ['Plugin'])

	.proto('provides', 'camera')

	.ctor(function (app)
	{

		// http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera
		app.camera = new THREE.PerspectiveCamera(
			this.options.fov || 65,
			( app.width / app.height ),
			this.options.near || 1e-6,
			this.options.far || 1e20
		);

		// add delta offset to avoid some bugs
		app.camera.position.x = 0.00000000001;

		// update whenever app is resized
		app.listen('resized', function () {
			// update camera aspect ratio and projection
			app.camera.aspect = app.width / app.height;
			app.camera.updateProjectionMatrix();
		});

	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.PerspectiveCamera', PerspectiveCamera);

// EO private scope
})(THREE, THREEAPP);
