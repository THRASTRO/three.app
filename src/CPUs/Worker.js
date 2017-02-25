// expects only one msg!
onmessage = function(e)
{
	var count = 0;
	var run = true;
	// start cpu assesement
	// if (e.data == "start");
	var start = Date.now();
	while (start + 80 > Date.now()) {
		for (var i = 0; i < 200; i++) {
			var x = Math.cos(Math.exp(Math.PI)) / Math.atan2(Math.PI, 0);
			var y = Math.sqrt(Math.pow(x, Math.exp(Math.abs(x)))) / Math.PI;
			var z = Math.sin(y * x % Math.PI) + Math.tan(x / y % Math.PI);
		}
		count ++; // increment counter to measure relative cpu speed
	}
	// report back
	postMessage(count);
	// exit worker
	close();
}