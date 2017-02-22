/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// create new virtual class (inherit THREE.Object3D)
	var Object3D = THREEAPP.Class.virtual(THREE.Object3D)

	// constructor
	.ctor(function(app, options) {
		// Call Object3D initializer
		THREE.Object3D.call(this);
		this.matrixAutoUpdate = true;
		this.sortObjects = true;
	})

	// end
	;

	// assign class to global namespace
	THREEAPP('Object3D', Object3D);

})(THREE, THREEAPP);
