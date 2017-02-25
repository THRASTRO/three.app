/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// implement as void function
	function loaded ( resource, data )
	{
		var L = resource.cbs.length;
		// store result on resources
		for (var i = 0; i < L; i++) {
			// store received data on asset
			resource.cbs[i].assets[2] = resource;
			// resolve optional promise
			if (resource.cbs[i].resolve)
			{ resource.cbs[i].resolve(); }
			// mark resource as complete
			resource.complete = true;
			// attach the result
			resource.data = data;
		}
	}

	function loadError()
	{
		this.invoke(
			'fetch.error', {}
		);
	}

	function loadStart()
	{
		var loader = this.loader;
		// only init once
		if (++ loader.completed == 1) {
			// trigger an event on the viewport
			this.trigger('prefetch.complete', this.loader);
			this.trigger('fetch.complete', this.loader);
		}
		else {
			// trigger an event on the viewport
			this.trigger('fetch.complete', this.loader);
		}
	}

	function loadStep(args) {
		var loader = this.loader;
		loader.filesTotal = args[2];
		loader.filesLoaded = args[1];
		this.trigger(
			'fetch.progress', {
				filesTotal: loader.filesTotal,
				filesLoaded: loader.filesLoaded,
				bytesTotal: loader.bytesTotal,
				bytesLoaded: loader.bytesLoaded
			}
		);
	}

	// progress updates asset info
	function progress (obj, asset, evt)
	{
		var loader = this.loader;
		// add total file size once
		if (asset.total == 0) {
			asset.total = evt.total;
			loader.bytesTotal += evt.total;
			loader.filesTotal += 1;
		}
		// increment loaded stats by delta of asset
		loader.bytesLoaded += evt.loaded - asset.loaded;

		// update singleton values
		asset.loaded = evt.loaded;

		// trigger the download progress
		// ToDo: throttle for better fps?
		this.trigger(
			'fetch.progress', {
				filesTotal: loader.filesTotal,
				filesLoaded: loader.filesLoaded,
				bytesTotal: loader.bytesTotal,
				bytesLoaded: loader.bytesLoaded
			}
		);

	}

	var Loader = THREEAPP.Class.create('Loader', null, ['Plugin'])

	.proto('provides', 'loader')

	.ctor(function (app) {
		// scope for closures
		var loader = this;
		app.loader = loader;
		// ready status
		loader.completed = 0;
		// init statistics
		loader.filesTotal = 0;
		loader.filesLoaded = 0;
		loader.bytesTotal = 0;
		loader.bytesLoaded = 0;
		// register event handlers
		app.listen('loader.step', loadStep);
		app.listen('loader.start', loadStart);
		app.listen('loader.error', loadError);
		app.listen('loader.complete', loaded);
		app.listen('loader.progress', progress);
	})

	.init(function (app) {
		// create shared loading manager instance
		app.manager = new THREE.LoadingManager(
			function () { app.invoke('loader.start', arguments); },
			function () { app.invoke('loader.step', arguments); },
			function () { app.invoke('loader.error', arguments); }
		);
		// create back reference
		app.manager.app = app;
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Loader', Loader);

// EO private scope
})(THREE, THREEAPP);
