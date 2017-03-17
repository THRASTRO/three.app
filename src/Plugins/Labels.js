/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var Labels = THREEAPP.Class.create('Labels', null, ['Plugin'])

	.proto('provides', 'labels')

	.defaults({
		groupier: true
	})

	.ctor(function (app)
	{
		if (this.options.groupier) {
			// dynamically add more group instances
			app.labels = new THREEAPP.Grouped(app, {
				ctor: THREEAPP.Objects.Labels,
				hardLimit: 8192,
				parent: app.scene
			});
		} else {
			// only add one group with a fixed item limit
			app.labels = new THREEAPP.Objects.Labels(app, {
				hardLimit: 65536,
				parent: app.scene
			});
		}
	})

	;

	// assign class to global namespace
	THREEAPP('Plugin.Labels', Labels);

// EO private scope
})(THREE, THREEAPP);
