# ThreeApp

Framework to build ThreeJS applications.

# Introduction

This is a preview related to https://github.com/mrdoob/three.js/issues/10676.
The implementation is a small excerpt from a bigger application I am currently
building. It should be modular enough to fit different scenarios, but it is
certainly tailored for my use-case in certain parts.

# Main features

- Pluggable Architecture
- All main features are plugins
- Most couplings are done via events
- Plugins can require or provide services
- Plugins start in right order automatically
- Class system with "managed" life-cycles

# ToDo

- Needs more documentation
- Add/Extract more plugins

# Example

```js
// get the viewport dom element
var vp = document.getElementById('vp');

// create main ThreeApp instance
var app = new THREEAPP.App(vp, {
	// load plugins
	plugins: [
		// order is not important
		THREEAPP.Plugin.Scene,
		THREEAPP.Plugin.AutoSize,
		THREEAPP.Plugin.WebGLRenderer,
		THREEAPP.Plugin.PerspectiveCamera,
		THREEAPP.Plugin.TrackballControls,
	],
	// autostart
	start: true
});

// get objects created by plugins
var scene = app.scene,
	camera = app.camera,
	controls = app.controls,
	renderer = app.renderer;

// create a sphere geometry with radius 4
var geometry = new THREE.IcosahedronGeometry(4, 6);
// create a lambert material with red color (needs light!)
var material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
// create mesh to draw geometry with material
var mesh = new THREE.Mesh(geometry, material);

// add mesh to scene
app.scene.add(mesh);

// create a point light (with white light)
var light = new THREE.PointLight(0xFFFFFF);

// set the light position
light.position.x = 10;
light.position.y = 50;
light.position.z = 130;

// add light to scene
app.scene.add(light);

// set camera position
app.camera.position.x = 10;
```