/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) class
	var MonitorGPU = THREEAPP.Class.create('MonitorGPU', null, ['Plugin'])

	.ready(function (app) {

		// optional GPU monitor
		var monitor = new StatsGPU();
		app.viewport.appendChild(monitor.domElement);
		app.listen('preframe', function () { monitor.begin(); });
		app.listen('postframe', function () { monitor.end(); });

	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.MonitorGPU', MonitorGPU);

// EO private scope
})(THREE, THREEAPP);
