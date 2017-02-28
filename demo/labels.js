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

// variation of a very commonly found word generator
function createRandomWord(length) {
	var consonants = 'bcdfghjklmnpqrstvwxyz', vowels = 'aeiou';
	function rand(limit) { return Math.floor(Math.random()*limit); }
	var i, word='', length = parseInt(length,10),
		consonants = consonants.split(''),
		vowels = vowels.split('');
	for (i=0;i<length/2;i++) {
		var randConsonant = consonants[rand(consonants.length)],
			randVowel = vowels[rand(vowels.length)];
		word += (i===0) ? randConsonant.toUpperCase() : randConsonant;
		word += i*2<length-1 ? randVowel : '';
	}
	return word;
}

function createRandomPosition() {
	return new THREE.Vector3(
		Math.random() * 2000 - 1000,
		Math.random() * 2000 - 1000,
		Math.random() * 2000 - 1000
	);
}

app.listen('ready', function () {
	labels = new THREEAPP.Objects.Labels(app, {
		hardLimit: 65536,
		parent: app.scene
	});
	addLabels(128);
})

function addLabels(amount) {
	for (var i = 0; i < amount; i++) {
		var len = Math.random() * 14 + 3;
		var pos = createRandomPosition();
		labels.insert({
			position: pos,
			lineWidth: 1.0,
			txt: createRandomWord(len),
			// stroke: 'rgba(0, 0, 0, 1)',
			// color: 'rgba(255, 255, 255, 1)',
			// background: 'rgba(32, 32, 32, 1)',
		});
		// add sphere to control label alignment
		var checkbox = document.getElementById('addSphere');
		if (checkbox && checkbox.checked) {
			// create a sphere geometry with radius 4
			var geometry = new THREE.IcosahedronGeometry(3, 1);
			// create a lambert material with red color (needs light!)
			var material = new THREE.MeshLambertMaterial({ color: 0xCC0000 });
			// create mesh to draw geometry with material
			var mesh = new THREE.Mesh(geometry, material)
			mesh.position.copy(pos); // set position
			app.scene.add(mesh); // add to scene
		}
		var info = document.getElementById('labels');
		info.innerHTML = labels.items.length + ' Labels';
	}
}

// create a point light (with white light)
var light = new THREE.PointLight(0xFFFFFF);

// set the light position
light.position.x = 10;
light.position.y = 50;
light.position.z = 130;

// add light to scene
app.scene.add(light);

// set camera position
app.camera.position.x = -100;
app.camera.position.y = - 0.000001;
app.camera.position.z = - 0.000001;
