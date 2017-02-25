/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) class
	var MonitorCPU = THREEAPP.Class.create('MonitorCPU', null, ['Plugin'])

	.proto('requires', 'tasker')

	.ready(function (app) {

		// optional CPU monitor
		var monitor = new StatsCPU(app.tasker);
		app.viewport.appendChild(monitor.domElement);
		app.listen('preframe', function () { monitor.begin(); }, -99999);
		app.listen('postframe', function () { monitor.end(); }, +99999);

	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.MonitorCPU', MonitorCPU);

// EO private scope
})(THREE, THREEAPP);
