/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Scene = THREEAPP.Class.create('Scene', null, ['Plugin'])

	.proto('provides', 'scene')

	.ctor(function (app)
	{
		// initialize main scene
		app.scene = app.options.scene ?
		            new app.options.scene(app)
		            : new THREE.Scene(app);
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Scene', Scene);

// EO private scope
})(THREE, THREEAPP);
