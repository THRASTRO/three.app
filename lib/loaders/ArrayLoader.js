/**
 * @author mgreter / https://www.github.com/mgreter
 */

THREE.ArrayLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.ArrayLoader.prototype = {
	constructor: THREE.ArrayLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var manager = this.manager, app = manager.app;
		var loader = new THREE.FileLoader( manager );
		if (url.match(/\.lzma$/)) {
			loader.setResponseType( "arraybuffer" );
			loader.load( url, function (buffer) {
				app.wlzma.decode(buffer)
				.then(function (outStream) {
					var arr = outStream.toUint8Array();
					onLoad.call(this, arr.buffer);
				})
				.catch(onError);
			}, onProgress, onError );
		} else {
			loader.setResponseType( "arraybuffer" );
			loader.load( url, onLoad, onProgress, onError );
		}
	}
};
