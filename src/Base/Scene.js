/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function ()
{
	"use strict";

	// create new virtual class (inherit THREE.Scene)
	var Scene = THREEAPP.Class.virtual(THREE.Scene)

	// constructor
	.ctor(function(app, options) {
		// Call Scene initializer
		THREE.Scene.call(this);
	})

	// end
	;

	// assign class to global namespace
	THREEAPP('Scene', Scene);

})();
