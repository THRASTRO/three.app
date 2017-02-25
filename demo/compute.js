function compute(time) {
	var x = Math.cos(time) * 5;
	var y = Math.sin(time) * 5;
	for (var i = 0; i < 1e10 * Math.random(); i++) {
		x = Math.cos(time) * 5;
		y = Math.sin(time) * 5;
	}
	return [x,y,0];
}