/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create a new (augmented) class
	var Options = THREEAPP.Class.mixin()

	.ctor(function (app, options) {
		// store app ref
		this.app = app;
		// extend the existing options
		// this.options is already a copy
		THREEAPP.extend(this.options, options);
	})

	// end of class
	;

	// assign class to global namespace
	THREEAPP('Options', Options);

// EO private scope
})(THREE, THREEAPP);
