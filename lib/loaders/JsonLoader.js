/**
 * @author mgreter / https://www.github.com/mgreter
 */

THREE.JsonLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.JsonLoader.prototype = {
	constructor: THREE.JsonLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var manager = this.manager, app = manager.app;
		var loader = new THREE.FileLoader( manager );
		if (url.match(/\.lzma$/)) {
			loader.setResponseType( "arraybuffer" );
			loader.load( url, function (buffer) {
				app.wlzma.decode(buffer)
				.then(function (outStream) {
					var json = JSON.parse(outStream);
					if (typeof json != "object") {
						throw Error("Invalid JSON");
					}
					else onLoad.call(this, json);
				})
				.catch(onError);
			}, onProgress, onError );
		} else {
			loader.setResponseType( "json" );
			loader.load( url, function (json) {
				if (!json) throw Error("Invalid JSON");
				else return onLoad.apply(this, arguments);
			}, onProgress, onError );
		}
	}
};
