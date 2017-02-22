/**
 * @author mgreter / https://www.github.com/mgreter
 */

THREE.BlobLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.BlobLoader.prototype = {
	constructor: THREE.BlobLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var manager = this.manager, app = manager.app;
		var loader = new THREE.FileLoader( manager );
		if (url.match(/\.lzma$/)) {
			loader.setResponseType( "arraybuffer" );
			loader.load( url, function (buffer) {
				app.wlzma.decode(buffer)
				.then(function (outStream) {
					var blob = new Blob(outStream.buffers);
					if (typeof blob != "object") {
						throw Error("Invalid BLOB");
					}
					else onLoad.call(this, blob);
				})
				.catch(onError);
			}, onProgress, onError );
		} else {
			loader.setResponseType( "blob" );
			loader.load( url, function (blob) {
				if (!blob) throw Error("Invalid BLOB");
				else return onLoad.apply(this, arguments);
			}, onProgress, onError );
		}
	}
};
