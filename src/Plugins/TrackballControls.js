/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var TrackballControls = THREEAPP.Class.create('TrackballControls', null, ['Plugin'])

	.proto('requires', 'camera')
	.proto('requires', 'renderer')

	.ctor(function (app)
	{
		// initialize the (custom) trackball controls (connect camera and renderer)
		app.controls = new THREE.TrackballControls(app.camera, app.renderer.domElement);
		// call control update before rendering a frame
		app.listen('preframe', function () { app.controls.update(); });
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.TrackballControls', TrackballControls);

// EO private scope
})(THREE, THREEAPP);



