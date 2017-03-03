/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	var margin = 2;

	var Labels = THREEAPP.Class.create('Labels', THREE.Points, ['Resources', 'Labels'])

	// default options
	.defaults({
		color: 0xFF0000,
	})

	// called on object construction
	.ctor(function (app) {
		this.prefetch({
			'glsl_vert': ['S', app.path('shaders/labels.vert')],
			'glsl_frag': ['S', app.path('shaders/labels.frag')]
		})
	})

	// called when texture is loaded
	.ready(function () {

		var labels = this;
		var canvas = labels.canvas;
		var options = labels.options;
		// allocate enough to hold all
		var alloc = options.hardLimit;

		// create an instanced buffer geometry with one vertice
		// this is actually the point to be rendered and shaded
		// we don't seem to be able to use offsets directly!?
		var geometry = new THREE.InstancedBufferGeometry();

		// create position offsets for instances
		var offsets = new Float32Array(3*alloc);
		// special uvs array to map labels
		var uvs = new Float32Array(4*alloc);

		// setup main position (shared for instances) and the offsets (custom for instances)
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(3), 3 ) );
		geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( offsets, 3, 1 ) );
		geometry.addAttribute( 'uvs', new THREE.InstancedBufferAttribute( uvs, 4, 1 ) );

		labels.texture = new THREE.Texture( labels.canvas );

		// create custom minimal raw shader material
		var material = new THREE.RawShaderMaterial({
			uniforms: {
				map: { type: 't', value: labels.texture },
				appWidth: { type: 'f', value: app.width },
				appHeight: { type: 'f', value: app.height },
				texWidth: { type: 'f', value: canvas.width },
				texHeight: { type: 'f', value: canvas.height }
			},
			blending: THREE.AdditiveBlending,
			vertexShader: labels.asset('glsl_vert'),
			fragmentShader: labels.asset('glsl_frag'),
			transparent: true,
			depthTest: false
		});

		// call three.js base constructor function
		THREE.Points.call(labels, geometry, material);

		// disable frustum culling
		labels.frustumCulled = false;

		// add ourself to parent if given by options
		if (options.parent) options.parent.add(labels);

		// reset draw count (set on resize)
		geometry.maxInstancedCount = labels.items.length;

		// needed to show texture initially?
		labels.texture.needsUpdate = true;

		// update label positions before rendering
		labels.app.listen('preframe', function() {
			geometry.attributes.offset.needsUpdate = true;
			for (var i = 0; i < labels.items.length; i++) {
				var label = labels.items[i];
				if (!label.position) continue;
				offsets[i*3+0] = label.position.x;
				offsets[i*3+1] = label.position.y;
				offsets[i*3+2] = label.position.z;
			}
		})

		// update label positions before rendering
		labels.app.listen('resized', function() {
			labels.material.uniforms.appWidth.value = labels.app.width;
			labels.material.uniforms.appHeight.value = labels.app.height;
		});

	})

	.listen('resized', function ()
	{
		if (this.geometry && this.items) {
			var texWidth = this.canvas.width;
			var texHeight = this.canvas.height;
			var offsets = this.geometry.attributes.offset.array;
			var uvs = this.geometry.attributes.uvs.array;
			for (var i = 0; i < this.items.length; i++) {
				var item = this.items[i];
				uvs[i*4+0] = item.fit.x + margin;
				uvs[i*4+1] = item.fit.y + margin;
				uvs[i*4+2] = item.w - margin * 1;
				uvs[i*4+3] = item.h - margin * 1;
			}
			if (this.texture) this.texture.needsUpdate = true;
			this.geometry.attributes.offset.needsUpdate = true;
			this.geometry.attributes.uvs.needsUpdate = true;
			this.material.uniforms.texWidth.value = texWidth;
			this.material.uniforms.texHeight.value = texHeight;
			this.geometry.maxInstancedCount = this.items.length;
		}
	})

	;

	// assign class to global namespace
	THREEAPP('Objects.Labels', Labels);

// EO private scope
})(THREE, THREEAPP);
