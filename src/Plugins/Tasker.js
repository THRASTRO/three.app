/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Tasker = THREEAPP.Class.create('Tasker', null, ['Plugin'])

	.proto('provides', 'tasker')

	// object constructor
	.ctor(function (app, options) {

		// just create and attach tasker instance
		app.tasker = new THREEAPP.Tasker(app, options);

	})
	// EO ctor

	.init(function (app) {
		this.wait(app.tasker);
	})

	// EO Class
	;

	// assign class to global namespace
	THREEAPP('Plugin.Tasker', Tasker);

// EO private scope
})(THREE, THREEAPP);
