/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) mixin class
	var Plugin = THREEAPP.Class.mixin(['Events'])

	// create data structures
	.method('required', [])
	.method('provided', {})

	// delay init until requirements are met
	.method('requires', function (requires)
	{
		// add provides to array
		if (Array.isArray(requires)) {
			this.required = this.required
				.concat(requires);
		}
		else {
			this.required.push(requires);
		}
		// chainable
		return this;
	})
	// EO method requires

	// plugins can provide services
	.method('provides', function (provides)
	{
		// local variable access
		var provided = this.provided;
		// upgrade single item to an array (overhead is ok)
		if (!Array.isArray(provides)) provides = [provides];
		// process and add each provided service
		for (var i = 0, iL = provides.length; i < iL; ++ i) {
			// assert that only one provider exists
			if (provided.hasOwnProperty(provides[i])) {
				throw Error("Duplicate service provider");
			}
			// flag provided service
			provided[provides[i]] = true;
		}
		// chainable
		return this;
	})
	// EO method provides

	;

	// assign class to global namespace
	THREEAPP('Plugin', Plugin);

// EO private scope
})(THREE, THREEAPP);
