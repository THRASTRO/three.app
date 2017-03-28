/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	/*
	// meshphong_frag
	#define PHONG
	uniform vec3 diffuse;
	uniform vec3 emissive;
	uniform vec3 specular;
	uniform float shininess;
	uniform float opacity;
	#include <common>
	#include <packing>
	#include <color_pars_fragment>
	#include <uv_pars_fragment>
	#include <uv2_pars_fragment>
	#include <map_pars_fragment>
	#include <alphamap_pars_fragment>
	#include <aomap_pars_fragment>
	#include <lightmap_pars_fragment>
	#include <emissivemap_pars_fragment>
	#include <envmap_pars_fragment>
	#include <gradientmap_pars_fragment>
	#include <fog_pars_fragment>
	#include <bsdfs>
	#include <lights_pars>
	#include <lights_phong_pars_fragment>
	#include <shadowmap_pars_fragment>
	#include <bumpmap_pars_fragment>
	#include <normalmap_pars_fragment>
	#include <specularmap_pars_fragment>
	#include <logdepthbuf_pars_fragment>
	#include <clipping_planes_pars_fragment>
	void main() {
	  #include <clipping_planes_fragment>
	  vec4 diffuseColor = vec4( diffuse, opacity );
	  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	  vec3 totalEmissiveRadiance = emissive;
	  #include <logdepthbuf_fragment>
	  #include <map_fragment>
	  #include <color_fragment>
	  #include <alphamap_fragment>
	  #include <alphatest_fragment>
	  #include <specularmap_fragment>
	  #include <normal_flip>
	  #include <normal_fragment>
	  #include <emissivemap_fragment>
	  #include <lights_phong_fragment>
	  #include <lights_template>
	  #include <aomap_fragment>
	  vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	  #include <envmap_fragment>
	  gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	  #include <premultiplied_alpha_fragment>
	  #include <tonemapping_fragment>
	  #include <encodings_fragment>
	  #include <fog_fragment>
	}

	meshphong_vert
	#define PHONG
	varying vec3 vViewPosition;
	#ifndef FLAT_SHADED
	  varying vec3 vNormal;
	#endif
	#include <common>
	#include <uv_pars_vertex>
	#include <uv2_pars_vertex>
	#include <displacementmap_pars_vertex>
	#include <envmap_pars_vertex>
	#include <color_pars_vertex>
	#include <fog_pars_vertex>
	#include <morphtarget_pars_vertex>
	#include <skinning_pars_vertex>
	#include <shadowmap_pars_vertex>
	#include <logdepthbuf_pars_vertex>
	#include <clipping_planes_pars_vertex>
	void main() {
	  #include <uv_vertex>
	  #include <uv2_vertex>
	  #include <color_vertex>
	  #include <beginnormal_vertex>
	  #include <morphnormal_vertex>
	  #include <skinbase_vertex>
	  #include <skinnormal_vertex>
	  #include <defaultnormal_vertex>
	#ifndef FLAT_SHADED
	  vNormal = normalize( transformedNormal );
	#endif
	  #include <begin_vertex>
	  #include <displacementmap_vertex>
	  #include <morphtarget_vertex>
	  #include <skinning_vertex>
	  #include <project_vertex>
	  #include <logdepthbuf_vertex>
	  #include <clipping_planes_vertex>
	  vViewPosition = - mvPosition.xyz;
	  #include <worldpos_vertex>
	  #include <envmap_vertex>
	  #include <shadowmap_vertex>
	  #include <fog_vertex>
	}

	*/

	// create new virtual class (inherit THREEAPP.CustomMaterial)
	var CustomPhong = THREEAPP.Class.virtual(THREEAPP.CustomMaterial)

	.ctor(function ctor(parameters, chunks, uniforms) {

		this._shaderLib = 'phong';
		this.isMeshPhongMaterial = true;

	})

	.init(function init() {

		// get all arguments from object
		// allows others to extend them!
		var parent = this._args.parent;
		var chunks = this._args.chunks;
		var uniforms = this._args.uniforms;
		var parameters = this._args.parameters;

		// the rest is copied from MeshPhongMaterial
		// this is probably specific to ThreeJS r84
		// We'll see how well it's forward compatible ...
		this.type = 'MeshCustomPhongMaterial';

		this.color = new THREE.Color( 0xffffff ); // diffuse
		this.specular = new THREE.Color( 0x111111 );
		this.shininess = 30;

		this.map = null;

		this.lightMap = null;
		this.lightMapIntensity = 1.0;

		this.aoMap = null;
		this.aoMapIntensity = 1.0;

		this.emissive = new THREE.Color( 0x000000 );
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;

		this.bumpMap = null;
		this.bumpScale = 1;

		this.normalMap = null;
		this.normalScale = new THREE.Vector2( 1, 1 );

		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;

		this.specularMap = null;

		this.alphaMap = null;

		this.envMap = null;
		this.combine = THREE.MultiplyOperation;
		this.reflectivity = 1;
		this.refractionRatio = 0.98;

		this.wireframe = false;
		this.wireframeLinewidth = 1;
		this.wireframeLinecap = 'round';
		this.wireframeLinejoin = 'round';

		this.skinning = false;
		this.morphTargets = false;
		this.morphNormals = false;

		this.setValues( parameters );

	})

	// end
	;

	// assign class to global namespace
	THREEAPP('CustomPhong', CustomPhong);

// EO private scope
})(THREE, THREEAPP);
