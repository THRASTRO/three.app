/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Tween = THREEAPP.Class.create('Tween', null, ['Plugin'])

	.proto('provides', 'tween')

	.ready(function (app)
	{
		app.listen('preframe', function ()
		{
			TWEEN.update();
		})
	})

	// assign class to global namespace
	THREEAPP('Plugin.Tween', Tween);

// EO private scope
})(THREE, THREEAPP);

