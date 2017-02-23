/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Background = THREEAPP.Class.create('Background', null, ['Plugin'])

	.proto('requires', 'renderer')
	.proto('provides', 'background')

	.ctor(function (app)
	{
		// init background scene
		app.bg = app.options.bg ?
		         new app.options.bg(app)
		         : new THREE.Scene(app);

		// listen to render events
		app.listen('render', function bg() {
			app.invoke('render-background');
			app.renderer.render( app.bg, app.camera );
		}, + 99) // run early (before scene)

	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Background', Background);

// EO private scope
})(THREE, THREEAPP);
