var TaskAPI = {
	// each task has its args
	// references used theory
	args: 0,
	// the same for every task
	// this references the time
	uniforms: 1,
	// expected result buffers
	// only returns positions
	results: [3],
	// same cmd for all tasks
	// will only vary inputs
	cmds: 'compute'
};

var Task = THREEAPP.Class.create('Task', THREEAPP.Batch)

.listen('updateUniforms', function () {
	this.tbuffers.uniforms[0] = app.time;
})

.ctor(function (app, options) {
	this.api = TaskAPI;
	this.items.push([]);
})
// EO ctor

;

var Sphere = THREEAPP.Class.create('Sphere', THREE.Mesh, ['Resources'])

// default options
.defaults({
	color: 0xFF0000,
	// texture: ...
})

// called on object construction
.ctor(function (app) {
	// fetch resources
	this.prefetch(this.options.texture ? {
		'texture': ['T', this.options.texture],
	} : {})
})

// called when texture is loaded
.ready(function () {

	var options = this.options;
	var texture = options.texture;
	var matopt = { color: options.color };
	if (options.hasOwnProperty('opacity')) {
		matopt.opacity = options.opacity;
	}
	if (texture) matopt.map = this.asset('texture');
	// create a sphere geometry with radius 4
	var geometry = new THREE.IcosahedronGeometry(4, 6);
	// create a lambert material with red color (needs light!)
	var material = new THREE.MeshLambertMaterial(matopt);
	// call base mesh constructor function
	THREE.Mesh.call(this, geometry, material);
	// add ourself to parent if given by options
	if (options.parent) options.parent.add(this);

	// optional dat ui part
	if (app.datui) {
		var datui = app.datui;
		var name = options.name || "Sphere";
		var folder = datui.addFolder(name);
		folder.add(material, 'opacity', 0, 1)
			.name( 'Transparency' ).step(0.01).listen();
	}

})

;

// get the viewport dom element
var vp = document.getElementById('vp');

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
		// load tasker plugins
		THREEAPP.Plugin.Tasker,
		THREEAPP.Plugin.Scheduler,
		// add statitics monitor
		THREEAPP.Plugin.MonitorGPU,
		THREEAPP.Plugin.MonitorCPU,
		THREEAPP.Plugin.DATUI,
	],
	// Tasker plugin options
	Tasker: { root: '../src' },
	// autostart
	start: true
});

app.listen('ready', function () {
	var tasker = app.tasker;
	tasker.register({
		name: 'compute',
		src: '../demo/compute.js',
		api: TaskAPI
	});
})

app.tasker.listen('ready', function () {
	var tasker = app.tasker;
	for (var i = 0; i < tasker.threads; i++) {
		var task = new Task(app);
		app.scheduler.push(task, 0);
	}
})

// get objects created by plugins
var scene = app.scene,
	camera = app.camera,
	controls = app.controls,
	renderer = app.renderer;

// instantiate our custom sphere
var sphere = new Sphere(app, {
	texture: 'land_shallow_topo_2048.jpg',
	parent: app.scene,
	color: 0x99CCFF,
	name: 'Earth',
	opacity: 0.8
});

// create a point light (with white light)
var light = new THREE.PointLight(0xFFFFFF);

// set the light position
light.position.x = 10;
light.position.y = 50;
light.position.z = 130;

// add light to scene
app.scene.add(light);

// set camera position
app.camera.position.x = -6;
app.camera.position.z = 10;
