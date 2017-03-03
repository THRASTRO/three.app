/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Scheduler = THREEAPP.Class.create('Scheduler', null, ['Plugin'])

	.proto('provides', 'scheduler')
	
	// object constructor
	.ctor(function ctor(app) {

		// just create and attach tasker instance
		app.scheduler = new THREEAPP.Scheduler(app);

	})
	// EO ctor

	// attach listeners
	.init(function init(app) {
		// create handler function
		function postframe() {
			app.scheduler.frame();
		}
		// re-schedule completed bands
		app.listen('postframe', postframe)
	})
	// EO init

	// EO Class
	;

	// assign class to global namespace
	THREEAPP('Plugin.Scheduler', Scheduler);

// EO private scope
})(THREE, THREEAPP);
