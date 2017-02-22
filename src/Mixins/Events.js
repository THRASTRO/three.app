/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// sort listener functions
	// supports prio property
	function prioSort(a, b)
	{
		return (b.prio || 0) - (a.prio || 0);
	}

	// create a new (augmented) class
	var Events = THREEAPP.Class.mixin(['Options'])

	// copy some object over
	.ctor(function ctor(app, options) {
		// inherit listeners from prototype (make a copy)
		// if (options && options.listeners) debugger;
		this.listeners = THREEAPP.extend(true, {}, this.listeners, this.options.listeners);
		// status object to defer only once
		this.deferred = {};
	})

	// register listener for an event
	.method('listen', function listen(name, fn) {
		// invoke late registered ready event handler
		if (name == "ready" && this.isReady) fn.call(this);
		// make sure event already has an array
		if (!this.listeners.hasOwnProperty(name))
			this.listeners[name] = [];
		// get listeners array for the event
		var listeners = this.listeners[name];
		// check if function is already known
		var idx = listeners.indexOf(fn);
		// only add unique listeners
		if (idx == -1) listeners.push(fn);
		// sort by priorities
		listeners.sort(prioSort);
	})

	// invoke all listeners (synchronous)
	.method('invoke', function invoke(name) {
		var self = this; // scope closure
		var args = Array.prototype.slice.call(arguments, 1);
		var listeners = self.listeners[name];
		var i = 0, L = listeners ? listeners.length : 0;
		for (; i < L; i++) listeners[i].apply(self, args);
		self.deferred[name] = false;
	})

	// trigger all listeners (asynchronous)
	// call multiple times, execute only once
	.method('trigger', function trigger(name) {
		var self = this; // scope closure
		if (!self.deferred[name]) { // only once
			var args = Array.prototype.slice.call(arguments, 1);
			self.deferred[name] = window.setTimeout(function() {
				var listeners = self.listeners[name];
				var i = 0, L = listeners ? listeners.length : 0;
				for (; i < L; i++) listeners[i].apply(self, args);
				self.deferred[name] = false;
			}, 0);
		}
	})

	// end of class
	;

	// assign class to global namespace
	THREEAPP('Events', Events);

// EO private scope
})(THREE, THREEAPP);
