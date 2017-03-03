/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create new virtual class (inherit THREE.Object3D)
	var LOD = THREEAPP.Class.virtual(THREEAPP.Object3D, ['Events'])

	// constructor
	.ctor(function(app, options) {
		this.lod = [];
	})

	.ready(function (app) {

		app.lods.push(this);

		this.trigger('lod');
		
	})

	// invoked by global watcher
	.listen('lod', function() {
		var self = this;
		// is there anything to do?
		if (this.current != this.level) {
			if (this.level == -1) {
			}
			// create levels on demand
			// show level when loaded
			else {
				// instance not yet created?
				if (!this.lod[this.level]) {
					// get lod options for wanted level
					var opts = this.options.lod[this.level];
					var resources = {}; // fill from template
					for (var key in this.options.resources) {
						var r = this.options.resources[key];
						resources[key] = [r[0], THREEAPP.tmpl(r[1], opts)];
					}
					// mix options for current level of detail
					opts = THREEAPP.extend({}, this.options, opts, {
						resources: resources, container: this,
						// listeners: { ready: [function () { self.trigger('lod'); }] }
					});

					// invoke constructor for actual object
					this.lod[this.level] = new this.options.ctor(this.app, opts);

	//				debugger;
				}
					// check if instance is ready yet
				if (this.lod[this.level].isReady) {
					// check if previous object exists
					if (this.lod[this.current]) {
						// debugger;
						// remove previousely added object
						this.remove(this.lod[this.current]);
					}
					// add ready object for lod
					this.add(this.lod[this.level]);
					/*
					this.lod[this.level].position.x = 0;
					this.lod[this.level].position.y = 0;
					this.lod[this.level].position.z = 0;
					*/
					// update current state
					this.current = this.level;
				}
			}
		}
		// debugger;
	});
	
	// end
	;


	// assign class to global namespace
	THREEAPP('LOD', LOD);

})(THREE, THREEAPP);
