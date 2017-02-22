/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	function resize(app)
	{
		app.resize(
			window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			window.window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		);
	}

	var AutoSize = THREEAPP.Class.create('AutoSize', null, ['Plugin'])

	.ctor(function (app)
	{
		var resizer = function() { resize(app); };
		addEventListener('resize', resizer, true);
		resize(app); // initial call
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.AutoSize', AutoSize);

// EO private scope
})(THREE, THREEAPP);
