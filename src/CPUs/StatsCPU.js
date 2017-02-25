/**
 * @author mrdoob / http://mrdoob.com/
 * @author mgreter / http://github.com/mgreter
 */

var StatsCPU = function (tasker) {

	var now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;

	var startTime = now(), prevTime = startTime;
	var frames = 0, mode = 0;

	function createElement( tag, id, css ) {

		var element = document.createElement( tag );
		element.id = id;
		element.style.cssText = css;
		return element;

	}

	function createPanel( id, fg, bg, slices ) {

		var div = createElement( 'div', id, 'padding:0 0 3px 3px;text-align:left;background:' + bg );

		var text = createElement( 'div', id + 'Text', 'font-family:Tahoma,Helvetica,Arial,sans-serif;font-size:8px;font-weight:bold;line-height:15px;color:' + fg );
		text.innerHTML = id.toUpperCase();
		div.appendChild( text );

		var w = 94 / slices, wd = 94;
		var graph = createElement( 'div', id + 'Graph', 'width:94px;height:30px;background:' + fg );
		div.appendChild( graph );

		for ( var i = 0; i < slices; i ++ ) {
			var wx = parseInt(w) == w ? w + 'px' : (100 / slices) + '%';
			graph.appendChild( createElement( 'span', '', 'width:'+wx+';height:30px;float:left;opacity:0.9;background:' + bg ) );
		}

		return div;

	}

	function setMode( value ) {

		var children = container.children;

		for ( var i = 0; i < children.length; i ++ ) {

			children[ i ].style.display = i === value ? 'block' : 'none';

		}

		mode = value;

	}

	var fitness = 0, fitoff = 0;

	setInterval(function () {
		fitness ++;
	}, 20);

	setInterval(function () {
		fitoff = Math.abs(50 - fitness);
		fitness = 0;
	}, 1000);

	var cpuload = [];
	function updateLoads ( dom, values ) {
		var now = Date.now();
		if (!dom.firstChild) return;
		idlesDiv.style.background = 'rgba(' + fitoff*7 + ', 64, 0, 1)';
		for (var i = 0; i < dom.children.length; i ++) {
			var worker = tasker.workers[i];
			var load = cpuload[i] || 0;
			if (!worker.idle) load = 1;
			dom.children[i].style.height = Math.max(Math.min( 30, 30 - load * 30 ), 0.25) + 'px';
		}
	}

	function updateGraph( dom, value ) {

		var child = dom.appendChild( dom.firstChild );
		child.style.height = Math.max(Math.min( 30, 30 - value * 30 ), 0.25) + 'px';

	}

	//

	var container = createElement( 'div', 'statsCPU', 'width:100px;opacity:0.9;cursor:pointer' );
	container.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();
		setMode( ++ mode % container.children.length );

	}, false );

	// TASKS

	var tasks = 0, tasksMin = Infinity, tasksMax = 0;

	var tasksDiv = createPanel( 'tasks', '#306', '#ccc', 94 );
	var tasksText = tasksDiv.children[ 0 ];
	var tasksGraph = tasksDiv.children[ 1 ];

	container.appendChild( tasksDiv );

	// BATCHES

	var batches = 0, batchesMin = Infinity, batchesMax = 0;

	var batchesDiv = createPanel( 'batches', '#09f', '#ccc', 94 );
	var batchesText = batchesDiv.children[ 0 ];
	var batchesGraph = batchesDiv.children[ 1 ];

	container.appendChild( batchesDiv );

	// BATCHES

	var queues = 0, queuesMin = Infinity, queuesMax = 0;

	var queuesDiv = createPanel( 'queues', '#99f', '#339', 94 );
	var queuesText = queuesDiv.children[ 0 ];
	var queuesGraph = queuesDiv.children[ 1 ];

	container.appendChild( queuesDiv );

	// LOAD

	var idles = 0, idlesMin = Infinity, idlesMax = 0;
	var idlesDiv, idlesText, idlesGraph;

	var history = [],
	    busy = [],
	    old = 0;

	function resetStats() {
		var now = Date.now();
		var dtime = now - old;
		for (var i = 0; i < app.tasker.workers.length; i++) {
			if (!busy[i]) {
				busy[i] = app.tasker.workers[i].t_busy;
			}
			else {
				var tbusy = app.tasker.workers[i].t_busy - busy[i];
				cpuload[i] = tbusy / dtime;
				busy[i] = app.tasker.workers[i].t_busy;
			}
		}
		old = now;
	}

	function onReady() {
		idlesDiv = createPanel( 'workers', '#0f0', '#020', tasker.threads );
		idlesText = idlesDiv.children[ 0 ];
		idlesGraph = idlesDiv.children[ 1 ];
		container.appendChild( idlesDiv );
		setMode(3); // show of cpu use
		for (var i = 0; i < tasker.threads; i += 1) {
			tasker.workers[i].busy = 0;
			tasker.workers[i].idling = 0;
		}

		setInterval(resetStats, 1000);

	};

	// tasker.onReady(
	tasker.listen('ready', onReady);

	//

	setMode( mode );

	function KMG (nr) {
		var u = '';
		if (nr >= 1e10) {
			nr = nr / 1e9;
			u = "G";
		}
		else if (nr >= 1e7) {
			nr = nr / 1e6;
			u = "M";
		}
		else if (nr >= 1e4) {
			nr = nr / 1e3;
			u = "K"
		}
		nr = parseInt(nr);
		return nr + u;
	}

	return {

		REVISION: 14,

		domElement: container,

		setMode: setMode,

		begin: function () {

			startTime = now();

		},

		end: function () {

			var time = now();

			frames += 1;

			if ( time > prevTime + 250 ) {

				tasks = Math.round( ( tasker.tasks * 1000 ) / ( time - prevTime ) );
				tasksMin = Math.min( tasksMin, tasks );
				tasksMax = Math.max( tasksMax, tasks );

				tasksText.textContent = KMG(tasks) + ' TSK (' /* + KMG(tasksMin) + '-' */ + KMG(tasksMax) + ')';
				updateGraph( tasksGraph, tasks / tasksMax );

				batches = Math.round( ( tasker.batches * 1000 ) / ( time - prevTime ) );
				batchesMin = Math.min( batchesMin, batches );
				batchesMax = Math.max( batchesMax, batches );

				batchesText.textContent = KMG(batches) + ' BAT (' /* + KMG(batchesMin) + '-' */ + KMG(batchesMax) + ')';
				updateGraph( batchesGraph, batches / batchesMax );

				queues = Math.round( ( tasker.queue.length * 1000 ) / ( time - prevTime ) );
				queuesMin = Math.min( queuesMin, queues );
				queuesMax = Math.max( queuesMax, queues );

				queuesText.textContent = KMG(queues) + ' QUE (' /* + (queuesMin) + '-' */ + KMG(queuesMax) + ')';
				updateGraph( queuesGraph, queues / queuesMax );

				if (idlesGraph) {
					updateLoads( idlesGraph );
					var status = tasker.isIdle() ? "" : "BSY";
					idlesText.textContent = 'CPUS '+ status + ' (' + tasker.threads + ')';
					for (var i = 0; i < tasker.workers.length; i += 1) {
						tasker.workers[i].busy = 0;
						tasker.workers[i].idling = 0;
					}
				}

				frames = 0;
				prevTime = time;
				tasker.tasks = 0;
				tasker.batches = 0;

			}

			return time;

		},

		update: function () {

			startTime = this.end();
			updateLoads( idlesGraph );

		}

	};

};

if ( typeof module === 'object' ) {

	module.exports = StatsCPU;

}