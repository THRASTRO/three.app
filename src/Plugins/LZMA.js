/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
	https://github.com/mgreter/js-lzma
	https://github.com/jcmellado/js-lzma
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var LZMA = THREEAPP.Class.create('LZMA', null, ['Plugin'])

	.proto('provides', 'lzma')

	.ctor(function (app) {
		// simply create one manager
		// hardcoded to three workers ATM
		app.wlzma = new WLZMA.Manager(3);
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.LZMA', LZMA);

// EO private scope
})(THREE, THREEAPP);
