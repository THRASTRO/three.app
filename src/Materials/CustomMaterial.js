/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// helper for shader chunk manipulation
	function insertChunk(chunks, idx, chunk, replace)
	{
		var insert = chunk.shader || "", replace = replace ? 1 : 0;
		if (Array.isArray(insert)) insert = insert.join("\n");
		return chunks.splice(idx, replace, insert);
	}
	// EO insertChunk

	// helper for shader chunk manipulation
	function insertChunks(inserts, chunks)
	{
		if (!inserts || !inserts.length) return;
		for (var i = 0; i < inserts.length; i++) {
			var found = false, chunk = inserts[i];
			for (var n = 0; n < chunks.length; n++) {
				if (chunk.after && chunk.after.test(chunks[n])) {
					insertChunk(chunks, n + 1, chunk, false);
					n += 2; // skip added
					found = true;
				}
				else if (chunk.before && chunk.before.test(chunks[n])) {
					insertChunk(chunks, n, chunk, false);
					n += 2; // skip added
					found = true;
				}
				else if (chunk.replace && chunk.replace.test(chunks[n])) {
					insertChunk(chunks, n, chunk, true);
					n += 1; // skip added
					found = true;
				}
			}
			// this only happens if source changed or dev error
			if (!found) throw Error('Shader Chunk not found');
		}
	}
	// EO insertChunks

	// create new virtual class (inherit THREE.ShaderMaterial)
	var CustomMaterial = THREEAPP.Class.virtual(THREE.ShaderMaterial)

	.ctor(function ctor(parameters, chunks, uniforms) {

		// init shared options
		var args = this._args = {
			chunks: chunks || {},
			uniforms: uniforms || {},
			parameters: parameters || {}
		};

		// ensure we have a valid base structure
		if (!args.chunks.vertex) args.chunks.vertex = [];
		if (!args.chunks.fragment) args.chunks.fragment = [];
		if (!args.parameters.defines) args.parameters.defines = {};

	})

	.init(function init() {

		// get all arguments from object
		// allows others to extend them!
		var parent = this._args.parent;
		var chunks = this._args.chunks;
		var uniforms = this._args.uniforms;
		var parameters = this._args.parameters;

		// fetch shader lib from ThreeJS
		if (typeof this._shaderLib == "string") {
			this._shaderLib = THREE.ShaderLib[this._shaderLib] ||
			console.error('Unknown THREE.ShaderLib: ' + this._shaderLib);
		}

		// can be string or shader struct
		var shaderLib = this._shaderLib;

		// shaders chunks copied one to one from three.js
		var shaderVerts = shaderLib.vertexShader.split(/\n+/);
		var shaderFrags = shaderLib.fragmentShader.split(/\n+/);
		insertChunks(chunks.vertex, shaderVerts);
		insertChunks(chunks.fragment, shaderFrags);

		// create material shader
		THREE.ShaderMaterial.call(this, {
			uniforms: THREE.UniformsUtils.merge([uniforms, shaderLib.uniforms]),
			vertexShader: shaderVerts.join("\n"),
			fragmentShader: shaderFrags.join("\n"),
			lights: true,
		});

		this.type = 'CustomMaterial';

	})

	// end
	;

	// assign class to global namespace
	THREEAPP('CustomMaterial', CustomMaterial);

// EO private scope
})(THREE, THREEAPP);
