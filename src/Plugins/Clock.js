/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Clock = THREEAPP.Class.create('Clock', null, ['Plugin'])

	.proto('provides', 'time')
	.proto('provides', 'clock')

	.ctor(function (app)
	{

		// time in ticks
		app.time = 0;

		// create a new clock instance
		app.clock = new THREE.Clock(false);
		// clock speed (external)
		app.clock.speed = 1 / 3600;

		// event handlers for clock start/stop
		app.listen('clock.pause', function () {
			app.clock.stop();
			app.clock.paused = true;
			app.trigger('clock.adjusted');
		})
		app.listen('clock.resume', function () {
			app.clock.start();
			app.clock.paused = false;
			app.trigger('clock.adjusted');
		})

		// event handlers for clock speed
		app.listen('clock.faster', function () {
			app.clock.speed *= 2;
			app.trigger('clock.adjusted');
		});
		app.listen('clock.slower', function () {
			app.clock.speed /= 2;
			app.trigger('clock.adjusted');
		});

		// reverse gear for time
		app.listen('clock.reverse', function () {
			app.clock.speed *= -1;
			app.trigger('clock.adjusted');
		});

		// reset to run sync with real time
		app.listen('clock.reset', function () {
			app.clock.speed = 1 / 3600;
			app.trigger('clock.adjusted');
		})

		app.listen('preframe', function () {
			var dtime = app.clock.getDelta();
			app.time += dtime * app.clock.speed;
		})

		app.clock.setSpeed = function (speed) {
			app.clock.speed = speed;
			app.trigger('clock.adjusted');
		};

	})

	.ready(function (app)
	{
		// start once ready?
		app.clock.start();
		app.clock.paused = false;
		// trigger once on startup
		app.trigger('clock.adjusted');
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Clock', Clock);

// EO private scope
})(THREE, THREEAPP);
