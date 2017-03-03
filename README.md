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

# Attention - Danger

This is really just a preview and I expect to change the API quite substantially.
The basic principles will probably not be changed, as they have proven to work
very will if used correctly. But there are some edges that are not fully satisfying
yet (i.e. how `proto` is needed to define plugin dependencies). Other things are
simply not fully thought through yet. Let's see how it evolves from here.

# Custom Class Framework

This custom class framework is based on the extensibility of javascript, a prototype
based programming language. It provides a few integral building blocks to declare your
own custom classes. JavaScript only has direct inheritance and no true polymorphism (as
determinded by `instanceof`). We are adopting the mixins paradigm from other languages
and adhere to direct inheritance in this implementation. Each class is "born" in three
life-cylces: `ctor`, `init` and `ready`. Every base class or mixin can add hooks for
each of these three life-cycles. They are executed in order when an object is constructed.
Ie. all `ctor` hooks of all mixins and base classes are executed before calling the `init`
hooks next before finally (delayed) calling `ready`.

## Main use-cases

- [`THREEAPP.Class.create(name, base, [mixins...])`][2]
- [`THREEAPP.Class.virtual(base, [mixins...])`][3]
- [`THREEAPP.Class.mixin([mixins...])`][4]

The differences between these three types is very little. Main difference is that only
classes declared by `create` are actually instanceable. Mixins or Virtual base classes
will error if you try to create an object via `new`. A `virtual` class can act as a base
class you declare via `create`, and a `mixin` can depend on other `mixin`. A final class
may has multiple `mixin` and `virtual` base classes. On instantiation the `ctor`, `init`
and `ready` functions are invoked accordingly.

[2]: https://github.com/mgreter/three.app/blob/develop/src/Objects/Labels.js
[3]: https://github.com/mgreter/three.app/blob/develop/src/Base/Object3D.js
[4]: https://github.com/mgreter/three.app/blob/develop/src/Mixins/Group.js

## Initializtation Order

The `ctor` and `init` hooks are always called synchronous: Calling all `ctor` hooks of all
base classes and mixins first, and then the `init` functions. The `ready` function might
be delayed by calling the `wait` method in `ctor` or `init` (the `wait` method is removed
and not callable after the `ìnit` phase!).

## Delayed ready events

The `ready` hook is called after all requested async/delayed actions have been completed.
Such `wait` constraints are registered during the `ctor` or `init` phase via `wait`.

```js
var Resources = THREEAPP.Class.mixin(['Options', 'Events'])
.init(function (app) {
  this.wait(new Promise(function (resolve, reject) {
    // do async work and invoke resolve or reject
    setTimeout(resolve, Math.random() * 10000)
  });
})
.ready(function () {
  // executed when all waits are resolved
});
```

This method is employed be the resources plugin. You can define resources to be prefetched
on `ctor` or on `init`. The `ready` call is delayed until all requested resources are loaded:

```js
var Object3D = THREEAPP.Class.create('Custom', THREEAPP.Object3D, ['Resources'])
.ctor(function (app) {
  this.prefetch({
    'texture': ['T', this.options.texture],
  })
  this.wait(this.plugins.dependency)
})
.ready(function () {
  var texture = this.asset('texture');
  // create material with map texture
  this.add(new THREE.Mesh(..., ...));
});
```

## Delaying the ready events

As we've seen above the `ready` hook is delayed by registering `wait` objects. The example above
uses a standrad Promise object that is passed to `wait`. Beside standard `Promise` objects it also
accepts objects that implement our `ready` lisntener event (i.e. just pass a plugin to wait).

```js
.init(function (app)
{
	// wait for star db
	this.wait(app.plugin);
})
```

# Create an Application

The main Application is instantiated via `new THREEAPP.App(vp, {...})`.
The `vp` arguments is the dom node where the results should be rendered.
Given plugins will be initialized in order of dependency. In case the
dependency can't be satisfied, the initialization shall error out.

## Plugin declarations

```js
var Plugin = THREEAPP.Class.create('Plugin', null, ['Plugin'])
.ctor(function() { ... })
.init(function() { ... })
.proto('provides', 'service')
.proto('requires', 'dependency')
.ready(function() { ... })
```

I am not really happy how dependencies and services are defined via
`proto` here! But this was the easiest shortcut to get this working!
it would be favorable to get supported for all classes. For now this
is only supported by `plugin` mixins, and other implementations will
simply ignore it without any error. Internally it just uses `wait`.

Regular non-plugin objects can still wait for services to be ready.
The syntax is just a bit more explicit and requires you to actually
load the needed plugins (there is no specific error if you forget to
load the required js libs):

```js
var Firmament = THREEAPP.Class.create('Firmament', THREE.Points, ['Resources'])
// object constructor
.ctor(function (app)
{
	// fetch resources
	this.prefetch({
		'glsl_s_vert': ['S', '../three.stars/shaders/firmament.vert'],
		'glsl_s_frag': ['S', '../three.stars/shaders/firmament.frag']
	})
})
// EO ctor
// object initializer
.init(function (app)
{
	// wait for star db
	this.wait(app.stars);
})
// EO init
```

## plugins

ToDo: documentation needed for all plugins!

- [WebGLRenderer](src/Plugins/WebGLRenderer.js): Use WebGL canvas renderer
- [AutoSize](src/Plugins/AutoSize.js): Enable auto resizing of renderer canvas
- [PerspectiveCamera](src/Plugins/PerspectiveCamera.js): Adds a perspective camera
- [TrackballControls](src/Plugins/TrackballControls.js): Enable standard trackball control
- [Scene](src/Plugins/Scene.js): Main scene to be rendered
- [Background](src/Plugins/Background.js): Optional background scne
- [Uniforms](src/Plugins/Uniforms.js): Shared uniforms interface
- [Loader](src/Plugins/Loader.js): Shared resource loader
- [Progress](src/Plugins/Progress.js): Show loading progress
- [UI](src/Plugins/UI.js): Proxy plugin for debounced UI updates
- [LOD](src/Plugins/LOD.js): Dispatch LOD events on distance borders
- [LZMA](src/Plugins/LZMA.js): Load LZMA background decompression workers
- [Tween](src/Plugins/Tween.js): Enable tween library on frame drawing
- [Clock](src/Plugins/Clock.js): Enable threejs clock and update time
- [Labels](src/Plugins/Labels.js): Enable plugin to show text labels
- [Tasker](src/Plugins/Tasker.js): Enable plguin for background tasks
- [Scheduler](src/Plugins/Scheduler.js): Enable plugin to schedule tasks
- [DATUI](src/Plugins/DATUI.js): Enable debugging options UI
- [MonitorCPU](src/Plugins/MonitorCPU.js): Enable debugging CPU monitor
- [MonitorGPU](src/Plugins/MonitorGPU.js): Enable debugging GPU monitor

```js
// create main ThreeApp instance
var app = new THREEAPP.App(vp, {
	// load plugins
	plugins: [
		// order is not important
		THREEAPP.Plugin.Clock,
		THREEAPP.Plugin.Scene,
		THREEAPP.Plugin.AutoSize,
		THREEAPP.Plugin.WebGLRenderer,
		THREEAPP.Plugin.PerspectiveCamera,
		THREEAPP.Plugin.TrackballControls,
		// asset loading and status
		THREEAPP.Plugin.Loader,
		THREEAPP.Plugin.Progress,
		THREEAPP.Plugin.Labels,
		// add statitics monitor
		THREEAPP.Plugin.MonitorGPU
	],
	// relative root path
	root: '..',
	// Tasker plugin options
	Tasker: { root: '../src' },
	// autostart
	start: true
});
```

Plugin options are defined directly on the app options with
the according plugin name (i.e. `Tasker` above). These otions
are passed directly to the plugin constructor too.

# Issues

I was not yet able to get perfectly nice syntax sugar for all needed operations.
There are some couplings directly in the base class implementation (i.e. Events
is not a true plugin) which should not be there. None the less it already eases
a lot of edges you currently had to fill in yourself!

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

```js
var Sphere = THREEAPP.Class.create('Sphere', THREE.Mesh, ['Resources'])

// default options
.defaults({
	color: 0xFF0000,
	texture: 'land_shallow_topo_2048.jpg'
})

// called on object construction
.ctor(function (app) {
		// fetch resources
		this.prefetch({
			'texture': ['T', this.options.texture],
		})
})

// called when texture is loaded
.ready(function () {

	// create a sphere geometry with radius 4
	var geometry = new THREE.IcosahedronGeometry(4, 6);
	// create a lambert material with red color (needs light!)
	var material = new THREE.MeshLambertMaterial({
		map: this.asset('texture'),
		color: this.options.color
	});
	// call base mesh constructor function
	THREE.Mesh.call(this, geometry, material);
	// add ourself to parent if given by options
	if (this.options.parent) this.options.parent.add(this);

});

// create main ThreeApp instance
var app = new THREEAPP.App(vp, [
	// omitted base plugins
	THREEAPP.Plugin.Loader,
	THREEAPP.Plugin.Progress,
]);

// instantiate our custom sphere
var sphere = new Sphere(app, {
	parent: app.scene,
	color: 0x99CCFF
});
```

# Demos

- http://ocbnet.ch/three.app/demo/index.html
- http://ocbnet.ch/three.app/demo/assets.html
- http://ocbnet.ch/three.app/demo/tasker.html
- http://ocbnet.ch/three.app/demo/labels.html ([FF Bug][1])

[1]: https://bugzilla.mozilla.org/show_bug.cgi?id=1343705
