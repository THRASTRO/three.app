/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var DATUI = THREEAPP.Class.create('DATUI', null, ['Plugin'])

	.proto('provides', 'datui')

	.ctor(function (app) {
		app.datui = new dat.GUI();
	})

	.init(function (app) {
		app.datui.close();
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.DATUI', DATUI);

// EO private scope
})(THREE, THREEAPP);
