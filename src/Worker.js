"use strict";

// loaded scripts
var loaded = {};
var plugins = [];

// create call args for plugin
function callargs(plugin, args, i)
{
	// extract array for first arg
	var L = plugin.args, off = L * i;
	return args.slice(off, off + L);
}

// store results from plugin to buffer
function pushrv(rv, plugin, buffers, i, delta)
{
	// store return values on buffer
	for (var r = delta; r < buffers.length; r++) {
		var off = 0, nL = plugin.results[r - delta];
		if (isNaN(nL) === false) {
			for (var n = 0; n < nL; n ++) {
				buffers[r][i*nL+n] = rv[off++];
			}
		}
		// must be array otherwise
		// expects object as return value
		// stores properties back to buffer
		else {
			var props = nL;
			nL = props.length;
			for (var n = 0; n < nL; n ++) {
				buffers[r][i*nL+n] = rv[props[n]];
			}
		}
	}
}

// worker message handler
function onWork(e)
{

	// get passed data
	var size = e.data[0],
	    cmds = e.data[1],
	    args = e.data[2],
	    uniforms = e.data[3],
	    inputs = e.data[4] || 0;

	// console.log(size);
	// we pass back the same buffers
	var buffers = e.data, pass = [];
	// process each task in batch
	for (var i = 0; i < size; i ++) {
		// use shared command or get from array
		var cmd = isNaN(cmds) ? cmds[i] : cmds,
		    plugin = plugins[cmd] /* || eval('debugger') */;
		// get input arguments for apply
		var arg = callargs(plugin, args, i);
		// invoke the plugin function
		var params = [], rv;
		if (arg.length == 1) {
			params.push(arg[0]);
		} else if (arg.length > 1) {
			params.push(arg);
		}
		if (uniforms.length == 1) {
			params.push(uniforms[0]);
		} else if (uniforms.length > 1) {
			params.push(uniforms);
		}
		if (inputs == 1) {
			params.push(e.data[5]);
		} else if (inputs > 1) {
			for (var n = 0; n < inputs; n++) {
				params.push(e.data[5 + n]);
			}
		}
		rv = plugin.fn.apply(this, params)
		// store rv on results buffers
		pushrv(rv, plugin, buffers, i, 5 + inputs);

	}

	// pass cmds array if optional
	// cmds can also be a static nr
	if (cmds && !isNaN(cmds.length)) {
		pass.push(cmds.buffer);
	}
	// pass back remaining buffer arrays
	for (var i = 2; i < buffers.length; i++) {
		if (buffers[i].buffer) {
			pass.push(buffers[i].buffer);
		}
	}

	// defer postMessage
	// give some idle time
	// setTimeout(function() {
		postMessage(buffers, pass);
	// }, Math.random() * 2500 + 1000);

}
// EO onWork

// initial message handler
function onInit(e)
{
	// passed event data
	var data = e.data;
	// process plugins
	if (data.plugins) {
		// process and import each plugin (load script)
		for (var i = 0; i < data.plugins.length; i ++) {
			// get plugin to be loaded
			var plugin = data.plugins[i];
			// src might be optional array
			var src = plugin.src;
			if (!Array.isArray(src)) {
				src = [ [ src ] ];
			}
			// load all sources in array
			for (var n = 0; n < src.length; n ++) {
				// check if loaded before
				if (!loaded[src[n][0]]) {
					// check if the cache condition hits
					if (src[n][1] && this[src[n][1]]) {
						console.info('Cached: ' + src[n][0]);
						loaded[src[n][0]] = true;
						continue; // next loop
					}
					// import the source code
					try {
						// console.info('Importing: ' + src[n][0]);
						importScripts(src[n][0]);
						loaded[src[n][0]] = true;
					}
					catch (err) {
						var msg = "Error loading: '" + src[n][0];
						throw Error(msg + "'\n" + err.message);
					}
				}
			}
			var fn = self, parts = plugin.name.split('.');
			for (var n = 0, nL = parts.length; n < nL; n++) {
				fn = fn[parts[n]]; // go into scope
				if (!fn) break; // abort on dead end
			}
			// check if function was loaded
			if (typeof fn != "function") {
				throw new Error(plugin.name + " not found")
			}
			// get function reference
			plugin.fn = fn;
			// add to global plugins
			plugins.push(plugin);
		}
	}
	// switch to run mode
	postMessage({ run: true });
	// switch handler
	onmessage = onWork;
}
// EO onInit

// initial handler
onmessage = onInit;