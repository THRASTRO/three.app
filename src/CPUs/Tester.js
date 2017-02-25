(function(THREE, THREEAPP) {

	function CPUs(path, cb)
	{

		// static vars
		var record = 0;
		var records = 0;

		// ensure ending slash
		path = path.replace(/[/]*$/, '/');
		// create load path for the worker
		var workersrc = path + "Worker.js";

		// called to check how much work a
		// specific nr of workers can complete
		function test (cpus, cb)
		{
			var workers = [];
			var complete = 0;
			var result = 0;
			// keep the main thread busy too
			var iv = setInterval(function()
			{
				// measure a mix of math functions
				for (var i = 0; i < 100; i++) {
					var x = Math.cos(Math.exp(Math.PI)) / Math.atan2(Math.PI, 0);
					var y = Math.sqrt(Math.pow(x, Math.exp(Math.abs(x)))) / Math.PI;
					var z = Math.sin(y * x % Math.PI) + Math.tan(x / y % Math.PI);
				}
				// result ++;
			}, 0);
			// fork given amount of workers
			for (var i = 0; i < cpus; i ++)
			{
				// load and create a new webworker
				workers[i] = new Worker(workersrc);
				// listen for the final work count
				workers[i].onmessage = function(e)
				{
					result += e.data;
					if (++ complete == cpus) {
						if (iv) clearInterval(iv);
						cb.call(this, result);
					}
				}
			}
			// start them all at once
			for (var i = 0; i < cpus; i ++)
			{
				workers[i].postMessage("start");
			}
		}

		// incrementally check more cpus
		// keep track of the best options
		function check (cpus, cb)
		{
			// test the given config
			test(cpus, function (count) {
				// last config was better?
				if (records > count) {
					return cb.call(this, record);
				};
				// do not test further?
				if (cpus > 12) {
		console.info('CPUs', cpus)
					return cb.call(this, cpus);
				}
				// remember config
				record = cpus;
				records = count;
				// check next config
				check(cpus * 2, cb);
			});
		}

		// start with one worker
		check(1, cb);

	};

	THREEAPP('CPUs', CPUs);

})(THREE, THREEAPP);
