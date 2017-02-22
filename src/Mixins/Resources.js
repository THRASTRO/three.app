/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var resources = {};

	// if you get "prefetch not a function"
	// you probably calling it too early
	// only available after constructor
	// actual load starts on object init
	function prefetch (obj)
	{
		for (var name in obj) {
			this.resources[name] = obj[name]
		}
	}

	// mixin function to get asset
	// only available after ready
	function asset (name, def) {
		// return default if not existing
		if (!this.assets[name]) return def;
		// return the shared asset
		return this.assets[name][2].data;
	}

	// create new mixin class
	var Resources = THREEAPP.Class.mixin(['Options', 'Events'])

	// constructor
	.ctor(function(app, options) {

		// loaded assets
		this.assets = {};
		// add prefetch method
		this.prefetch = prefetch;
		// expose shared object
		app.resources = resources;
		// copy static class resources to instance
		// may add or change resources for instances
		this.resources = jQuery.extend({}, this.resources, this.options.resources);
		// hook up event listener to complete resource loading
		app.listen('loader.complete', function (resource, data)
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
		});

	})

	.init(function (app) {

		var self = this;
		var assets = self.resources;
		for (var name in assets) {
			// type is first array item
			var type = assets[name][0];
			// url is second array item
			var url = assets[name][1];
			// further items are internal
			// shared accross instances
			this.assets[name] = assets[name];
			// check if we already load that url
			// loading same url with different types
			// is not supported, aka undefined behavior
			if (app.resources[url]) {
				// initialize defaults and store references
				var asset = { obj: this, assets: assets[name] };
				// maybe the asset was already loaded
				if (app.resources[url].complete) {
					// attach data to other object (why copy?)
					assets[name][2] = app.resources[url];
					// next asset
					continue;
				}
				// the whole loader chain will be async!
				this.wait(new Promise(function (resolve, reject) {
					// attach promise handlers
					asset.reject = reject;
					asset.resolve = resolve;
					// register another handler
					app.resources[url].cbs.push(asset);
				}));
				// next asset
				continue;
			}
			// otherwise add asset to our loader queue
			var type = type.substr(0, 1).toUpperCase(), loader;
			if (type == 'S') loader = new THREE.TextLoader( app.manager );
			else if (type == 'I') loader = new THREE.ImageLoader( app.manager );
			else if (type == 'T') loader = new THREE.BlobLoader( app.manager );
			else if (type == 'J') loader = new THREE.JsonLoader( app.manager );
			else if (type == 'A') loader = new THREE.ArrayLoader( app.manager );
			else if (type == 'B') loader = new THREE.BlobLoader( app.manager );
			else if (type == 'R') loader = new THREE.BinaryLoader( app.manager );
			else if (type == 'O') loader = new THREE.ObjectLoader( app.manager );
			else if (type == 'L') loader = new THREE.OBJLoader( app.manager );
			else throw('Unknown loader type for resource');
			// initialize defaults and store references
			var asset = { obj: this, assets: assets[name] };
			// the whole loader chain will be async!
			this.wait(new Promise(function (resolve, reject) {
				// attach promise handlers
				asset.reject = reject;
				asset.resolve = resolve;
				// create status object on initial/first load
				app.resources[url] = { total: 0, loaded: 0, cbs: [asset] };
				// invoke the choosen loader implementation
				(function (type, url, resource) {
					// no way around a closure
					var onProgress = function (evt) {
						app.invoke('loader.progress', self, resource, evt);
					}
					// official texture loader creates an image tag
					// there seems no way to get load size this way
					// I really hope browser caching kicks in, since
					// we first load it via ajax and then again via
					// the official THREE.js way (creating img tag)
					if (type == 'T') {
						loader.load( url, function () {
							loader = new THREE.TextureLoader( app.manager );
							loader.load( url, function (data) {
								if (type == 'T') { app.loader.texLoaded += 1; }
								app.invoke('loader.complete', resource, data);
							}, onProgress, reject);
							app.loader.texLoading += 1;
						}, onProgress, reject);
					}
					// all other loader report size
					else {
						loader.load( url, function (data) {
							app.invoke('loader.complete', resource, data);
						}, onProgress, reject);
					}
				})(type, url, app.resources[url]);
			}));
		}
	})

	.ready(function () {
		// add asset method
		this.asset = asset;
	})

	.listen('ready', function () {
		if (this.options.container) {
			this.options.container.add(this);
		}
	})

	// end
	;

	// assign class to global namespace
	THREEAPP('Resources', Resources);

})(THREE, THREEAPP);
