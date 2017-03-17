/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) mixin
	var Group = THREEAPP.Class.mixin(['Events', 'Options'])

	// constructor
	.ctor(function(app, options) {
		// start empty
		this.items = [];
		this.length = 0;
	})

	// default settings
	.defaults({
		softLimit: 8,
		hardLimit: 2000,
		increment: 2,
	})

	.method('belowSoftLimit', function (obj) {
		return this.items.length < this.options.softLimit;
	})
	.method('belowHardLimit', function (obj) {
		return this.items.length < this.options.hardLimit;
	})

	// you may want to overload this
	// ToDo: maybe add hooks instead
	.method('delete', function (obj) {
		// convert object to index
		if (isNaN(obj)) { obj = this.items.indexOf(obj); }
		if (obj < 0 || obj > this.items.length) {
			throw "cannot remove unknown group item"
		}
		// keep reference for now
		var item = this.items[obj];
		// splice the item away
		this.items.splice(obj, 1);
		// decrease size
		this.length -= 1;
		// trigger deferred
		this.trigger('decrease');
		// trigger single event
		this.invoke('deleted', item);
		// trigger generic hock
		this.trigger('resizing');
	})

	// you may want to overload this
	// ToDo: maybe add hooks instead
	.method('add', function (obj) {

		// maybe space is available
		if (this.belowSoftLimit()) {
			// add object to items
			this.items.push(obj);
			// increment size
			this.length += 1;
			// trigger deferred
			this.trigger('increase');
		}
		else if (this.belowHardLimit()) {
			// add object to items
			this.items.push(obj);
			// adjust the softlimit by increasing until hard limit
			this.options.softLimit *= this.options.increment || 2;
			if (this.options.softLimit > this.options.hardLimit) {
				this.options.softLimit = this.options.hardLimit;
			}
			// increment size
			this.length += 1;
			// call synchronous
			// mark buffer stale
			this.invoke('resize');
		}
		// or we reached a hard limit
		else {
			// check hard limit before calling add ...
			throw Error("group reached hard limit");
		}
		// trigger single event
		this.invoke('inserted', obj);
		// trigger generic hock
		this.trigger('resizing');
	})

	.listen('resizing', function () {
		// trigger only when ready
		if (!this.isReady) return
		// triggers again on ready!
		this.trigger('resized');
	})

	.listen('ready', function () {
		// dispatch resized to init
		this.trigger('resized');
	})

	// end
	;

	// assign global namespace
	THREEAPP('Group', Group)

})(THREE, THREEAPP);
