/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// called when we actually want to allocate
	// new buffers (limits probably changed).
	function allocate()
	{
		// get options from objects
		var L = this.items.length,
		    aL = this.tbuffers.allocated,
		    HL = this.options.hardLimit,
		    INC = this.options.increment,
		    cmds = this.api.cmds;
		// check if we got items
		if (L == 0) return;
		// increase aL until we have enough room
		while (L > aL) aL = Math.min(HL, Math.max(10, aL) * INC);
		// create result buffers (array of buffer arrays)
		var results = [], backups = [], shareds = [],
			rsizes = this.api.results || [],
			shsizes = this.api.shared || [];
		for (var i = 0; i < rsizes.length; i ++) {
			var size = isNaN(rsizes[i]) ? rsizes[i].length : rsizes[i];
			var alloc = size < 0 ? - size : size * aL;
			results[i] = new Float32Array(alloc);
			backups[i] = new Float32Array(alloc);
		}
		for (var i = 0; i < shsizes.length; i ++) {
			var size = isNaN(shsizes[i]) ? shsizes[i].length : shsizes[i];
			var alloc = size < 0 ? - size : size;
			shareds[i] = new Float32Array(alloc);
		}
		// lookup command if it's a string
		if (typeof cmds == "string") {
			var tasker = this.tasker;
			cmds = tasker.PLUGINS[cmds].id;
		}
		// re-allocate buffers
		this.tbuffers = {
			size: L,
			busy: false,
			stale: false,
			allocated: aL,
			results: results,
			backups: backups,
			shareds: shareds,
			uniforms: new Float32Array(this.api.uniforms),
			args: new Float32Array(this.api.args * aL),
			cmds: isNaN(cmds) ? new Float32Array(aL) : cmds
		}
	}

	// create a new (augmented) mixin (inherit group)
	var Batch = THREEAPP.Class.virtual(THREEAPP.Group)

	// constructor
	.ctor(function ctor() {

		// parent worker
		this.worker = null;
		// pending in tasker
		this.queued = false;
		// start empty
		this.tbuffers = {
			size: 0,
			busy: false,
			stale: true,
			allocated: 0,
			results: [],
			backups: [],
			shareds: [],
			uniforms: [],
			args: [],
		};
	})

	// return a fresh buffer object
	.method('buffers', function buffers(obj) {
		// refresh if it's stale
		if (this.tbuffers.stale) {
			// if (this.worker) debugger;
			allocate.call(this);
			// do not re-allocate
			this.tbuffers.stale = false;
			// update values in buffer
			this.invoke('syncArguments');
			// store number of synced items
			this.tbuffers.size = this.items.length;
		}
		// return fresh buffers
		return this.tbuffers;
	})

	// called from tasker when done
	// sync results to items/objects
	.listen('calculated', function calculated(worker) {
		var buffers = this.tbuffers,
		    results = buffers.results;
		if (!buffers.stale) this.invoke('syncResults');
		buffers.tstamp = Date.now() - this.tasker.t_start;
	})

	.listen('resized', function () {
		// mark buffers for refresh
		this.tbuffers.stale = true;
	})

	// end
	;

	// assign class to global namespace
	THREEAPP('Batch', Batch);

})(THREE, THREEAPP);
