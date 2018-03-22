/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// class constructor
	function Class (klass, base)
	{
		// must not be called, but ctor proto is needed
		// throw Error("cannot instantiate static class");
	}
	// EO class constructor

	// method: initialize
	function initialize ()
	{
		// duplicates are often unavoidable
		// best example is THREE.Object3D
		var seen = {}, ctors = this.ctor;
		// execute all constructors once
		for (var i = 0; i < ctors.length; i++) {
			if (seen[ctors[i]]) continue;
			ctors[i].apply(this, arguments);
			seen[ctors[i]] = true;
		}
		// local access var
		var inits = this.init;
		// enable the wait method
		this.__proto__.wait = wait;
		// then call init for all mixins
		for (var i = 0; i < inits.length; i++) {
			if (seen[inits[i]]) continue;
			inits[i].apply(this, arguments);
			seen[inits[i]] = true;
		}
	}
	// EO initialize

	// method: startup
	// tests if we are ready first
	// invokes handlers once we are
	function startup ()
	{
		// assert that we have no pendings
		if (this.pending > 0) return this;
		// remove the wait method
		delete this.__proto__.wait;
		// execute all ready events (mixins and base)
		for (var i = 0; i < this.ready.length; i++) {
			this.ready[i].apply(this, arguments);
		}
		// listeners is part of events!?
		if (this.listeners) {
			var readies = this.listeners.ready || [];
			for (var i = 0; i < readies.length; i++) {
				readies[i].apply(this, arguments);
			}
		}
		// remove temporary flag
		delete this.pending;
		// set status flag
		this.isReady = true;
		// chainable
		return this;
	}
	// EO startup

	// bread and butter mixin function
	function mixin (klass, base, mixins)
	{

		if (!base) base = THREEAPP.Class;
		// upgrade single mixin to an array
		if (!Array.isArray(mixins)) mixins = [mixins];
		// error out to catch missing mixins
		if (!mixins) throw Error("Undefined mixin!");
		// create mandatory arrays
		if (!klass.prototype.ctor)
			klass.prototype.ctor = [];
		if (!klass.prototype.init)
			klass.prototype.init = [];
		if (!klass.prototype.ready)
			klass.prototype.ready = [];
		if (!klass.prototype.defaults)
			klass.prototype.defaults = {};
		if (!klass.prototype.listeners)
			klass.prototype.listeners = {};

		// check for valid mixins
		// resolve strings to classes
		if (mixins && mixins.length) {
			for (var i = 0, L = mixins.length; i < L; i++) {
				// hard assert that all mixins are loaded
				if (!(mixins[i])) throw Error('Undefined mixin!');
				// mixins may optionally be strings (remove?)
				if (!(mixins[i] instanceof Function)) {
					var resolved = THREEAPP(mixins[i]);
					if (typeof resolved == 'undefined') {
						throw Error('Unknown mixin: ' + mixins[i]);
					}
					mixins[i] = resolved;
				}
			}
		}

		// listeners is part of events!?
		// copy listeners to our own prototype
		// ToDo: unsure if this is still needed
		// intention: stop inheritance sharing
		klass.prototype.listeners = THREEAPP.extend
			(true, {}, klass.prototype.listeners);

		// copy everyting from mixins to final class
		for (var i = 0; i < mixins.length; i ++) {
			// mixin stuff from source class
			THREEAPP.mixin(klass, mixins[i]);
		}
		// mixin stuff from base class
		THREEAPP.mixin(klass, base);

		// can only have one base class (last counts)
		// this line enables the instanceof functionality
		// in this sense JS does not have true polymorphism
		if (base) klass.prototype.__proto__ = base.prototype;

		// declare a few chainable prototype helper functions
		// these are used to construct the actual class definition
		// functions are called on the prototype of a class to extend it
		// this is an example of the neat/evil extensibility of javascript!

		// create a static function on the klass namespace (has no `this`!)
		klass.static = function (name, fn) { klass[name] = fn; return this; };
		// create a regular method that gets passed a valid object instace as `this`
		klass.method = function (name, fn) { klass.prototype[name] = fn; return this; };

		// not very happy with this solution, but it works reasonable (use by service)
		klass.proto = function (name, arg) { klass.prototype[name](arg); return this; };

		// add default options to the class (different mixins might overwrite each other)
		klass.defaults = function (obj) { THREEAPP.extend(klass.prototype.defaults, obj); return this; };

		// register main setup functions for the three different life-cycle stages
		klass.ctor = function (fn) { klass.prototype.ctor.push(fn); return this; };
		klass.init = function (fn) { klass.prototype.init.push(fn); return this; };
		klass.ready = function (fn) { klass.prototype.ready.push(fn); return this; };


		// register event listeners
		// listeners is part of events!?
		klass.listen = function (name, fn, prio) {
			var listeners = klass.prototype.listeners;
			if (!listeners[name]) listeners[name] = [];
			if (prio != null) fn.prio = prio;
			listeners[name].push(fn);
			// dispatch late registered ready events
			if (name == "ready" && this.isReady) {
				fn.call(this);
			}
			return this;
		};
		// return function
		return klass;

	}

	// static function to create a new class
	Class.create = function ()
	{
		// name is optional first argument (shift aways to get to other args)
		var name = typeof arguments[0] == 'string' ? [].shift.call(arguments) : null;
		// get the additional arguments (init with usefull defaults)
		var base = arguments[0] || Class, mixins = arguments[1] || [];
		// create new constructor
		var Klass = function () {
			// waiting promises
			this.pending = 0;
			// instance options (defaults are shared)
			this.options = THREEAPP.extend ({}, this.defaults);
			// call all init functions
			initialize.apply(this, arguments);
			// tests if anything is pending
			startup.apply(this, arguments);
		}
		// give the function a name (there is some cost attached to eval)
		// there is no other way and it helps debugging in the console a lot!
		if (name) {
			// catch and ignore possible errors since this step is optional (debug only)
			try { eval("Klass = " + Klass.toString().replace(/\(\)/, ' ' + name + '()')); }
			catch (err) { console.warn("Could not eval new fn body\n" + err + "\n" + klass); }
		}
		// let me be known on prototype
		Klass.prototype.name = name;
		// dispatch to the bread and butter mixin fn
		return mixin.call(Class, Klass, base, mixins);
	}

	// static function to create a new mixin
	// var Mixin = Class.mixin(['a','b'])
	Class.mixin = function (mixins)
	{
		// base constructor
		var klass = function () {
			// must not be called, but ctor proto is needed
			// errors out if you try to instantiate a mixin
			throw Error("Can't instantiate mixins");
		}
		// dispatch to the bread and butter mixin fn
		if (arguments.length < 1) mixins = [];
		return mixin.call(Class, klass, null, mixins);
	}

	// static function to create virtual mixin
	Class.virtual = function (base, mixins)
	{
		// ensure valid defaults
		if (arguments.length == 0) base = Class;
		if (!base) throw Error("Undefined virtual base!");
		// virtual constructor
		var klass = function () {
			// must not be called, but ctor proto is needed
			throw Error("cannot instantiate virtual class");
		}
		// upgrade single mixin to an array
		if (arguments.length < 2) mixins = [];
		// dispatch to the bread and butter mixin fn
		return mixin.call(Class, klass, base, mixins);
	}


	// method: wait
	// disabled after ready!
	function wait (promise)
	{
		var obj = this;
		// one more pending
		obj.pending ++;
		// continuation fn
		function resolve () {
			// decrement and check
			obj.pending -= 1;
			// has own check
			startup.apply(obj);
		}
		// bail out hard
		function reject (err) {
			throw err;
		}
		// developer assertion (forgot to load deps?)
		if (!promise) throw Error('Invalid wait call');

		// register class observers via listen
		if (typeof promise.listen == "function") {
			promise.listen('ready', resolve);
		}
		// register generic promise observers
		else if (typeof promise.then == "function") {
			promise.then(resolve, reject);
		}
		// throw if passed object is invalid
		else throw Error("Invalid wait promise");
		// return chainable result
		return startup.apply(obj);
	}
	// EO initialize

	// Explicitly set the constructor again
	Class.prototype.constructor = Class;

	// assign class to global namespace
	THREEAPP('Class', Class);

// EO private scope
})(THREE, THREEAPP);
