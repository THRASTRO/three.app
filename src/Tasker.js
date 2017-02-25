/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// since we have to work with very raw data here
// the tasker is very sensitive to invalid data
// not sure how to harden this without giving up
// too much performance. Works for me for now ...

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// seen base classes
	var classid = 0;

	// Execute a task on a worker
	function work (worker, task)
	{
		var tasker = this;
		// fetch fresh buffers
		var buffers = task.buffers();
		if (buffers.size == 0) return;
		// attach task to worker
		worker.task = task;
		// attach worker to task
		task.worker = worker;
		// increase work load
		tasker.load += 1;
		// create work package
		var vars = [], pass = [];
		vars.push(buffers.size);
		vars.push(buffers.cmds || 0);
		vars.push(buffers.args);
		task.invoke('updateUniforms');
		vars.push(buffers.uniforms);
		
		// append result buffers
		var input = buffers.input,
		    shareds = buffers.shareds,
			iL = input ? input.length: 0,
		    sL = shareds.length;
		// switch the buffers
		vars.push(iL + sL);
		for (var i = 0; i < iL; i++) {
			vars.push(input[i]);
		}
		for (var i = 0; i < sL; i++) {
			vars.push(shareds[i]);
		}

		var results = buffers.backups,
		    uniforms = buffers.uniforms,
		    rL = results.length;
		// switch the buffers
		for (var i = 0; i < rL; i++) {
			vars.push(results[i]);
		}
		// pass everything that is a buffer
		for (var i = 0; i < vars.length; i++) {
			if (vars[i] && vars[i].buffer) {
				pass.push(vars[i].buffer);
			}
		}
		for (var i = 0; i < uniforms.length; i++) {
			if (uniforms[i] && uniforms[i].buffer) {
				pass.push(uniforms[i].buffer);
			}
		}
		// time marker for worker
		worker.t_start = Date.now();
		// inform detached state
		task.invoke('calculate', worker);
		tasker.invoke('calculate', task, worker);
		// pass everything to worker
		worker.postMessage(vars, pass);
		// mark worker as busy
		worker.idle = false;
	}
	// EO execute

	// handler for results
	function onResult (e)
	{
		// closure variables
		var worker = this,
		    task = worker.task,
		    tasker = worker.parent;
		// get passed data
		var size = e.data[0],
		    cmds = e.data[1],
		    args = e.data[2],
		    uniforms = e.data[3],
		    inputs = e.data[4] || 0,
		    delta = inputs + 5;

		// buffer object on our side
		// if (!task) debugger;
		var buffers = task.tbuffers;
		// fetch optional cmds array
		if (cmds && !isNaN(cmds.length)) {
			buffers.cmds = cmds;
		}
		// attach back to task
		buffers.args = args;
		buffers.uniforms = uniforms;
		var input = buffers.input;
		var results = buffers.backups;
		var shareds = buffers.shareds;
		// switch buffer slots
		buffers.backups = buffers.results;
		buffers.results = results;
		// append result buffers
		var iL = input ? input.length: 0,
		    sL = shareds.length;
		// switch the buffers
		for (var i = 0; i < iL; i++) {
			buffers.input[i] = e.data[5+i];
		}
		for (var i = 0; i < sL; i++) {
			buffers.shareds[i] = e.data[5+iL+i];
		}
		var eL = e.data.length - 5 - iL - sL;
		for (var i = 0; i < eL; i++) {
			buffers.results[i] = e.data[5+iL+sL+i];
		}

		// decrease load
		tasker.load -= 1;
		// Runtime statistics
		tasker.tasks += size;
		tasker.batches += 1;
		task.worker = null;
		worker.task = null;
		worker.idle = true;
		// time marker for worker
		worker.t_result = Date.now();
		worker.t_busy += worker.t_result
		               - worker.t_start;
		// check if more work is pending
		if (tasker.queue.length > 0) {
			// take some work from the queue
			var batch = tasker.queue.shift();
			// batch was dequeued
			batch.queued = false;
			// dispatch queued task to worker
			work.call(tasker, worker, batch);
		}
		// invoke done callbacks synchronous
		// only time you have access to some buffers
		// afterwards they might be sent off to work
		tasker.invoke('calculated', task, worker);
		task.invoke('calculated', worker);
		// check if tasker is fully done
		if (tasker.load !== 0) return;

	}
	// EO onResult

	// handler for init phase
	function onInit (e)
	{
		// switch message handler for run mode
		if (e.data.run) { this.onmessage = onResult; }
		else { throw new Error("unexpected message"); }
	}
	// EO onInit

	// create a new (augmented) class
	var Tasker = THREEAPP.Class.create('Tasker', null, ['Events', 'Options'])

	// constructor
	.ctor(function ctor()
	{
		var tasker = this;
		// registered plugins
		tasker.PLUGINS = {};
		tasker.plugins = [];
		// allocated workers
		tasker.workers = [];
		// queued tasks
		tasker.queue = [];
		// busy worker count
		tasker.load = 0;
		// runtime stats
		tasker.tasks = 0;
		tasker.batches = 0;
	})

	// options
	.defaults({
		// auto-detect
		threads: 0,
		// max-queue size
		maxqueue: 4096*8,
		// main worker url
		taskerUrl: 'Worker.js',
		// workers root
		root: '../src'
	})

	// auto-detect CPUs
	.init(function init()
	{
		// closure variables
		var tasker = this, options = tasker.options;
		// start auto-detection or use preset thread count
		this.wait(new Promise(function (resolve) {
			// check if auto-detect is enabled
			if (options.threads == 0) {
				// do auto detection for best thread count
				THREEAPP.CPUs(tasker.path('CPUs'), function (threads)
				{
					// set instance variable to best detected thread count
					tasker.threads = parseInt(Math.min(threads / 1.3, 6));
					// resolve promise
					resolve();
				});
			}
			else {
				// copy option to instance variable
				tasker.threads = options.threads;
				// resolve promise
				resolve();
			}
		}));
	})

	// threads are detected
	.ready(function ready()
	{
		var tasker = this,
		    workers = tasker.workers;
		// get the url for tasker workers
		var tskurl = this.options.taskerUrl;
		// only start tasker once
		if (tasker.started) return;
		// create and init given number of workers
		for (var i = 0; i < tasker.threads; i += 1) {
			// create one worker instance for each thread
			workers[i] = new Worker(tasker.path(tskurl));
			// wait for run confirmation
			workers[i].onmessage = onInit;
			// for access in handlers
			workers[i].parent = tasker;
			// mark worker as idle
			workers[i].idle = true;
			// set worker index
			workers[i].id = i;
			// runtime statistics
			workers[i].t_busy = 0;
			// pass plugins to worker
			workers[i].postMessage({
				plugins: tasker.plugins
			});
		}
		// add start timestamp
		tasker.t_start = Date.now();
		// check if more work is pending
		if (tasker.queue.length > 0) {
			// get tasker and workers from objects
			var tasker = this, workers = tasker.workers;
			// check if we have an idle worker
			if (/* tasker.isReady && */ tasker.isIdle()) {
				// first locate idle worker in array
				for (var i = 0; i < workers.length; ++i) {
					// check if worker is idle
					if (workers[i].idle) {
						// dequeue the next item from queue
						var task = tasker.queue.shift();
						// dispatch task to worker via execute
						work.call(tasker, workers[i], task);
						// no longer queued
						task.queued = false;
						// we are done here
						return;
					}
				}
			}
		}
	})

	// get path from relative root
	.method('path', function path(url)
	{
		var root = this.options.root;
		return root.replace(/\/+$/, '')
			+ '/' + url.replace(/^\/+/, '');
	})

	// register plugin for tasker
	.method('register', function register(plugin)
	{
		var tasker = this, plugins = tasker.plugins;
		// assert that we are not called at an invalid program state
		// you can only register plugins before the runners are started
		if (tasker.started) { throw new Error('Cannot register after start'); }
		if (!plugin.api) { throw new Error('Plugin must have a task API class'); }
		// get next static plugin id
		plugin.id = plugins.length;
		// base class constrains how the
		// inputs and outputs are mapped
		var base = plugin.api;
		// check for unique class id
		if (isNaN(base.classid)) {
			base.classid = classid ++;
		}
		// inherit from base
		plugin.args = base.args;
		plugin.classid = base.classid;
		plugin.results = base.results;
		plugin.uniforms = base.uniforms;
		// base may force single cmds for all
		if (base.cmds) plugin.name = base.cmds;
		// remove base reference
		// can't be passed to worker
		delete plugin.base;
		plugins.push(plugin);
		// check if we are trying to overwrite existing plugin
		if (this.PLUGINS[plugin.name]) { throw new Error('Plugin already exists'); }
		// also keep a hash dictionary
		this.PLUGINS[plugin.name] = plugin
	})

	// add more work for tasker
	.method('push', function push(task)
	{
		// check if task is already busy
		if (task.queued || task.worker) {
			throw "task already busy" + task.queued;
		}
		// get tasker and workers from objects
		var tasker = task.tasker = this,
		    workers = tasker.workers;
		// check if we have an idle worker
		if (tasker.isReady && tasker.isIdle()) {
			// first locate idle worker in array
			for (var i = 0; i < workers.length; ++i) {
				// check if worker is idle
				if (workers[i].idle) {
					// dispatch task to worker via execute
					work.call(tasker, workers[i], task);
					// we are done here
					return;
				}
			}
		}
		// check if we have reached the queue limit
		if (tasker.queue.length >= tasker.options.maxqueue) {
			throw Error("Tasker queue limit exhausted");
		}
		// all workers seem to be busy atm
		// so add the task to the queue
		tasker.queue.push(task);
		// mark as already pending
		task.queued = true;
	})

	// Get plugin struct by name
	.method('isIdle', function isIdle()
	{
		if (!this.ready) return false;
		// check if load is not at max
		return this.load < this.threads;
	})

	// end of class
	;

	// assign class to global namespace
	THREEAPP('Tasker', Tasker);

// EO private scope
})(THREE, THREEAPP);
