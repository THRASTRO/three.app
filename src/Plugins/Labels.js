/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Labels = THREEAPP.Class.create('Labels', null, ['Plugin'])

	.proto('provides', 'labels')

	.ctor(function (app) {
		// simply create one manager
		app.labels = new THREEAPP.Labels(app);
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Labels', Labels);

// EO private scope
})(THREE, THREEAPP);
