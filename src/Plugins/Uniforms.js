/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// helper function to get a shared uniform
	// the uniform will be created on demand!
	function uniform(name, type, def)
	{
		// default type is float
		if (!type) type = 'f';
		// create uniform on demand
		if (!this.uniforms[name]) {
			this.uniforms[name] = {
				type: type,
				value: def || 0
			}
		}
		// return the shared uniform
		return this.uniforms[name];
	}

	var Uniforms = THREEAPP.Class.create('Uniforms', null, ['Plugin'])

	.ctor(function (app)
	{
		// store uniforms
		app.uniforms = [];
		// add uniform method
		app.uniform = uniform;
	})

	.ready(function (app)
	{
		if (app.hasOwnProperty("time")) {
			app.listen('preframe', function () {
				// update the shared time uniform
				app.uniform('time').value = app.time;
			}, 999999) // run very very early
		}
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Uniforms', Uniforms);

// EO private scope
})(THREE, THREEAPP);
