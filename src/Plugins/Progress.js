/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

// private scope
(function (jQuery, THREE, THREEAPP)
{
	"use strict";

	var Progress = THREEAPP.Class.create('Progress', null, ['Plugin'])

	.ctor(function (app) {

		// create the main container
		this.el = jQuery('<div id="progressbar"/>');
		this.wrapper = jQuery('<div class="indicator"/>').appendTo(this.el);
		this.indicator = jQuery('<div class="bg"/>').appendTo(this.wrapper);
		this.text = jQuery('<div class="text"/>').appendTo(this.el);

		// append it to the viewport
		this.el.appendTo(app.viewport);

		// threshold for new loads
		this.thresholdFiles = 0;
		this.thresholdBytes = 0;

		// initialize stopped
		this.stopped = true;
		// hide main element
		this.el.hide();

		// just a sample how it's done
		this.indicator.css('width', 0 + '%');

		var _this = this;
		app.listen('fetch.progress', function (stats) {
			if (_this.stopped) {
				if (_this.stopped !== true) {
					clearTimeout(_this.stopped);
				}
				_this.el.fadeIn(200);
				_this.stopped = false;
			}
			var txt = sprintf("%d/%d (%S/%S)",
				stats.filesLoaded, stats.filesTotal,
				stats.bytesLoaded - _this.thresholdBytes,
				stats.bytesTotal - _this.thresholdBytes
			);
			var p = (stats.bytesLoaded - _this.thresholdBytes) /
				(stats.bytesTotal - _this.thresholdBytes);
			_this.indicator.css('width', (p * 100) + '%');
			_this.text.html(txt);
		})

		app.listen('fetch.complete', function (stats) {
			_this.thresholdBytes = stats.bytesLoaded;
			_this.thresholdFiles = stats.filesLoaded;
			// schedule the timeout for the closer
			_this.stopped = setTimeout(function () {
				_this.el.fadeOut(600, function () {
					_this.stopped = true;
				});
			}, 1000);
		})

	})

	.init(function () {
	})

	.ready(function () {
	})


	;

	// assign class to global namespace
	THREEAPP('Plugin.Progress', Progress);

// EO private scope
})(jQuery, THREE, THREEAPP);
