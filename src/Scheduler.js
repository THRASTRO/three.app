/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (THREE, THREEAPP)
{
	"use strict";

	// configure the work distribution
	var distribution = [0, 0, 1, 0, 0, 1, 2];

	// create a new (augmented) class
	var Scheduler = THREEAPP.Class.create('Scheduler')

	// constructor
	.ctor(function ctor(app) {
		// get variables
		this.app = app;
		var scheduler = this;
		app.scheduler = scheduler;
		scheduler.tasker = app.tasker;
		// number of batches
		scheduler.batches = 0;
		// plannet batches per frame
		scheduler.plan = [[], [], []];
		for (var i = 0; i < 3; i++) {
			// plan iterator values
			scheduler.plan[i].it = 0;
			scheduler.plan[i].done = 0;
			// information status flags
			scheduler.plan[i].onTime = 0;
			scheduler.plan[i].delayed = 0;
			scheduler.plan[i].completed = 0;
		}
		// class iterator
		scheduler.it = 0;
		scheduler.ticks = 0;
	})

	// options
	.defaults({
	})

	// attach listeners
	.init(function init(app) {
		// called before task is passed to worker (not used yet)
		// this.tasker.listen('calculate', function (task, worker) {});
		// called after task comes back from worker
		this.tasker.listen('calculated', function (task, worker) {
			app.scheduler.plan[task.prio].done ++;
			app.scheduler.tick();
		});
	})

	// scheduler is ready
	.ready(function () {
	})

	// called from threeapp plugin
	.method('frame', function frame() {
		// restart frame
		this.done = 0;
		this.it = 0;
		// reset all plans that have been completed
		// set on time status for all other to false
		for (var i = 0; i < 3; i++) {
			// check if plan is done
			var L = this.plan[i].length;
			if (this.plan[i].done >= L) {
				this.plan[i].done = 0;
				this.plan[i].it = 0;
				this.plan[i].completed ++;
				if (!this.plan[i].late) {
					this.plan[i].onTime ++;
				}
				this.plan[i].late = false;
			} else {
				// mark as running late
				this.plan[i].late = true;
				this.plan[i].delayed ++;
			}
			// restart this class
			this.plan[i].last = false;
		}
		// call tick
		this.tick();
	})

	// only called by ourself
	.method('tick', function tick() {
		// try to saturate tasker (until all done)
		while (this.tasker.isIdle() && this.done < 3) {
			// fetch the plan group
			var plan = this.plan[this.it];
			// if (plan.last) continue;
			// check if plan reached end
			if (plan.it >= plan.length) {
				if (!plan.last) {
					// only count once
					plan.last = true;
					// plan is done
					this.done += 1;
				}
			}
			// plan has work
			else {
				// calculate next task
				var task = plan[plan.it];
				task.prio = this.it;
				// debugger;
				this.tasker.push(task);
				plan.it ++;
			}
			// increment or reset ticks counters
			this.ticks = this.ticks == 6 ? 0 : this.ticks + 1;
			// get class from work distribution
			this.it = distribution[this.ticks];
		}
		// mark frame done
		// this.done = true;
	})

	// add a new planned batch
	.method('push', function push(obj, prio) {
		this.plan[prio].push(obj);
		this.batches += 1;
		this.tick();
	})

	// remove a planned batch
	.method('remove', function remove(obj, prio) {
		var plan = this.plan[prio];
		var idx = isNaN(obj) ? plan.indexOf(obj) : obj;
		if (idx < 0) return; // not found
		plan.splice(idx, 1);
		this.batches -= 1;
	})

	// end of class
	;

	// assign class to global namespace
	THREEAPP('Scheduler', Scheduler);

// EO private scope
})(THREE, THREEAPP);
