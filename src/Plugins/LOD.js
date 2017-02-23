/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var LOD = THREEAPP.Class.create('LOD', THREEAPP.Object3D, ['Plugin'])

	.proto('provides', 'lod')
	.proto('requires', 'camera')
	.proto('requires', 'ui')

	.ctor(function (app)
	{
		// create array
		app.lods = [];
	})

	.ready(function (app) {

		// render ui is invoked debounced
		// no need to do this every frame!
		app.listen('update-ui', function () {

			var inv_mat = new THREE.Matrix4();
			inv_mat.multiplyMatrices(
				app.camera.projectionMatrix,
				app.camera.matrixWorldInverse
			);
			var frustum = new THREE.Frustum();
			frustum.setFromMatrix(inv_mat);
			var cam_pos = app.camera.getWorldPosition();

			var html = "", info = document.getElementById("lodInfo");
			for (var i = 0, L = app.lods.length; i < L; i++) {
				var pos = app.lods[i].getWorldPosition();
				var dist = cam_pos.distanceToSquared(pos);
				app.lods[i].inFrustum = frustum.intersectsSphere({
					center: pos, radius: app.lods[i].radius || 100
				});
				html += sprintf("%02d) %.5f", i, dist);
				if (!app.lods[i].inFrustum) {
					html += " - hidden<br>";
					continue;
				}
				// adjust dist by fov
				dist *= Math.pow(app.camera.fov, 2);
				var opts = app.lods[i].options.lod
				var lvl = 0, lvls = opts.length;
				// main loop to look for the correct break point
				if (lvl < lvls && !opts[lvl]) debugger;
				while (lvl < lvls && dist < opts[lvl].min) ++ lvl;
				if (lvl == lvls) lvl = -1;
				if (app.lods[i].level != lvl) {
					app.lods[i].level = lvl;
					app.lods[i].trigger('lod');
				}
				html += " - lvl " + lvl + "<br>";
			}
			if (info) info.innerHTML = html;
		})
	})

	// end of class
	;

	// assign class to global namespace
	THREEAPP('Plugin.LOD', LOD);

// EO private scope
})(THREE, THREEAPP);