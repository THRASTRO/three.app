/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var UI = THREEAPP.Class.create('UI', null, ['Plugin'])

	.proto('provides', 'ui')

	.ctor(function (app)
	{
		var ui = this;
		// triggers on first check
		ui.frames = 9999;
		// render to interface on post-event
		app.listen('postframe', function () {
			// increment frame count
			if (++ ui.frames > 6) {
				// reset counter
				ui.frames = 0;
				// trigger deferred
				app.trigger('update-ui');
			}
		})
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.UI', UI);

// EO private scope
})(THREE, THREEAPP);
