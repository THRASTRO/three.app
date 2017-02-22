/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (module, THREE)
{
	"use strict";

	// preserve old stuff
	var preserve = module.THREEAPP;

	// declare global namespace
	function THREEAPP(name, obj)
	{
		// split the name (by dots) into parts
		var parts = name.split(/\./), ns = THREEAPP;
		// process each part and create objects
		for (var i = 0; i < parts.length - 1; i ++) {
			// create namespace part
			if (!ns[parts[i]]) {
				ns[parts[i]] = {};
			}
			// climb the namespace
			ns = ns[parts[i]];
		}
		// return value if only name is given
		if (arguments.length == 1) {
			return ns[parts[i]];
		}
		// trying to overwrite existing
		// move object values to function
		var existingType = typeof ns[parts[i]];
		if (existingType == "object") {
			var old = ns[parts[i]];
			for (var key in old) {
				if (old.hasOwnProperty(key)) {
					obj[key] = old[key];
				}
			}
		}
		// error out to avoid unexpected bugs
		else if (existingType != "undefined") {
			throw Error("Namespace already taken!")
		}
		// assign to final result
		return ns[parts[i]] = obj;
	};
	// EO THREEAPP

	// copy over preserved stuff
	if (typeof preserve == "object") {
		for (var key in preserve) {
			if (preserve.hasOwnProperty(key)) {
				THREEAPP[key] = preserve[key];
			}
		}
	}

	// Pass in the objects to merge as arguments.
	// Vanilla JavaScript version of jQuery extend
	// For a deep extend, set the first argument to `true`.
	// http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
	function extend() {

		// Variables
		var extended;
		var deep = false;
		var i = 0;
		var length = arguments.length;

		// Check if a deep merge
		if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
			deep = arguments[0];
			i++;
		}

		// Merge the object into the extended object
		function merge (obj) {
			for ( var prop in obj ) {
				if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
					// If deep merge and property is an object, merge properties
					if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
						extended[prop] = extend( true, extended[prop], obj[prop] );
					}
					// needed to properly mixin listeners
					// otherwise we would share the array
					// ToDo: solve this more elegantly
					else if (deep && obj[prop] instanceof Array) {
						if (typeof extended[prop] == "undefined") extended[prop] = [];
						extended[prop] = extended[prop].concat(obj[prop]);
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};

		// Extend first object
		extended = arguments[i++];
		// Loop and merge objects
		for ( ; i < length; i++ ) {
			merge(arguments[i]);
		}

		// Return results
		return extended;

	}
	// EO extend

	// simple template function
	// replace %key% with props
	function tmpl (str, props)
	{
		return str.replace(/%([a-zA-Z][a-zA-Z0-9]*)%/g, function (match, token) {
			return props[token] ? props[token] : '[%' + token + '%]';
		});
	}

	// merges prototypes
	function mixin(dst, src)
	{
		if (!src || !dst) debugger;
		var p_dst = dst.prototype;
		var p_src = src.prototype;
		for (var name in p_src) {

			if (p_src.hasOwnProperty(name)) {
				// Concatenate arrays (i.e. listeners)
				if (p_src[name] instanceof Array) {
					if (!p_dst[name]) p_dst[name] = [];
					p_dst[name] = p_dst[name].concat(p_src[name]);
				}
				// Functions are also instances of Object!
				else if (p_src[name] instanceof Function) {
					p_dst[name] = p_src[name];
					extend(p_dst[name], p_src[name]);
				}
				// Deep merge objects (hash maps)
				else if (p_src[name] instanceof Object) {
					if (!p_dst[name]) p_dst[name] = {};
					extend(true, p_dst[name], p_src[name]);
				}
				// Otherwise just assign
				else {
					p_dst[name] = p_src[name];
				}
			}
		}

	}
	// EO mixin

	// assign static functions
	THREEAPP('extend', extend);
	THREEAPP('mixin', mixin);
	THREEAPP('tmpl', tmpl);

	module.THREEAPP = THREEAPP;

// EO private scope
})(self, THREE);
