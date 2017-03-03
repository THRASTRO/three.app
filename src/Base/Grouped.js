/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) mixin
	var Grouped = THREEAPP.Class.create('Grouped', null, ['Events', 'Options'])

	// constructor
	.ctor(function(app, options) {
		// start empty
		this.length = 0;
		this.groups = [];
		this.current = null;
		this.compacting = false;
	})

	// default settings
	.defaults({
		softLimit: 3,
		hardLimit: 2000,
		increment: 8,
		compact: 0.75
	})

	// add object to a free group
	.method('add', function (obj) {
		var self = this;
		// increase count
		self.length += 1;
		// check active group
		if (self.current) {
			// append to active group until full
			if (self.current.belowHardLimit()) {
				self.current.add(obj);
				return self;
			}
			// check if any other group has space now
			for (var i = 0; i < self.groups.length; i++) {
				if (self.groups[i].belowHardLimit()) {
					self.current = self.groups[i];
					self.current.add(obj);
					return self;
				}
			}
		}
		// or create a new group instance
		self.current = new self.options.ctor(
			self.app, self.options // re-use opts
		);
		// store new group on ourself
		self.groups.push(self.current);
		// add object to the group
		self.current.add(obj);
		// Decouple tasker from group
		self.current.trigger('enable');
		// chainable
		return self;
	})

	// you may want to overload this
	// ToDo: maybe add hooks instead
	.method('delete', function (obj) {
		// search in groups
		// index is fastest
		var n = 0, idx = -1;
		if (isNaN(obj)) {
			// find group containing given object
			for (var n = 0; n < this.groups.length; n ++) {
				if ((idx = this.groups[n].indexOf(obj)) > -1) break;
			}
			// use index
			obj = idx;
		}
		// resolve index
		else {
			// print warning on console
			if (obj < 0 || obj >= this.length) {
				console.warn('access out of bound');
			}
			// find group and local offset
			while (n < this.groups.length) {
				if (obj < this.groups[n].length) break;
				obj -= this.groups[n].length; n += 1;
			}
		}
		// do nothing if index is out of bound
		if (n == this.groups.length) return
		// delegate to group
		this.groups[n].delete(obj);
		// check if group is empty now
		if (this.groups[n].length == 0) {
			// mark the group as been removed
			this.groups[n].removed = true;
			// Decouple tasker from group
			this.groups[n].trigger('disable');
			// remove group completely
			this.groups.splice(n, 1);
		}
		// decrease counter
		this.length -= 1;

		// abort if already running
		if (this.compacting) return;
		// auto compact multiple groups if not yet started
		if (this.options.compact && this.groups.length > 2) {
			// calculate ratio of average items per groups
			var ratio = this.length / this.options.hardLimit;
			var minima = this.groups.length * this.options.compact;
			// start compact if average is below a certain ratio
			if (ratio < minima) this.compact(75);
		}
	})

	// merge groups to reduce needed groups
	.method('compact', function (speed, n) {
		// timeout closure
		var self = this;
		// offset is optional
		if (isNaN(n)) n = 0;
		// flag to run only once
		this.compacting = true;
		// process all groups
		while (n < this.groups.length) {
			// look for a group to fill up
			if (this.groups[n].belowHardLimit()) {
				// move items until group is full
				while (this.groups[n].belowHardLimit()) {
					var L = this.groups.length - 1;
					var idx = this.groups[L].length - 1;
					var item = this.groups[L].items[idx];
					if (idx == -1 || L == n) break;
					// swap object group
					this.groups[L].delete(idx);
					this.groups[n].add(item);
					// check if old group now empty
					if (this.groups[L].length == 0) {
						// mark the group as been removed
						this.groups[L].removed = true;
						// Decouple tasker from group
						this.groups[L].trigger('disable');
						// remove group completely
						this.groups.splice(L, 1);
					}
				}
				// schedule next group
				if (!isNaN(speed)) {
					setTimeout(function () {
						self.compact(speed, n);
					}, speed);
				}
				// abort for now
				break;
			}
			// skip full group
			n += 1;
		}
		// we are done for now
		this.compacting = false;
	})

	// end
	;

	// assign global namespace
	THREEAPP('Grouped', Grouped)

})(THREE, THREEAPP);
