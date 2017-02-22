/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var WebGLRenderer = THREEAPP.Class.create('WebGLRenderer', null, ['Plugin'])

	.proto('provides', 'renderer')

	.ctor(function (app)
	{

		// http://threejs.org/docs/#Reference/Renderers/WebGLRenderer
		app.renderer = new THREE.WebGLRenderer({
			sortObjects: true,
			antialias: true, // def: false
			precision: 'highp', // def: highp
			alpha: true, // def: false
			depth: true, // def: true
			stencil: true, // def: true
			premultipliedAlpha: true,
			preserveDrawingBuffer: true,
			logarithmicDepthBuffer: true, // def: false
			// make background transparent
			// clearAlpha: 0, clearColor: 0x000000,
		});
		// cannot set as an option!?
		app.renderer.autoClear = false;

		// hook into resized event
		app.listen('resized', function () {
			// set renderer size from app dimensions
			app.renderer.setSize(app.width, app.height);
		})
		// set initial size from app dimensions
		app.renderer.setSize(app.width, app.height);

		// attach the dom element
		app.viewport.appendChild(
			app.renderer.domElement
		);

		// listen to pre-render events
		app.listen('preframe', function () {
			app.renderer.clear();
		});

		// listen to main render events
		app.listen('render', function () {
			app.invoke('render-scene'); // synchronous
			app.renderer.render( app.scene, app.camera );
		})

	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.WebGLRenderer', WebGLRenderer);

// EO private scope
})(THREE, THREEAPP);
