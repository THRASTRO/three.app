/**
 * @author mgreter / https://www.github.com/mgreter
 */

THREE.TextLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.TextLoader.prototype = {
	constructor: THREE.TextLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var manager = this.manager, app = manager.app;
		var loader = new THREE.FileLoader( this.manager );
		if (url.match(/\.lzma$/)) {
			loader.setResponseType( "arraybuffer" );
			loader.load( url, function (buffer) {
				app.wlzma.decode(buffer)
				.then(function (outStream) {
					var string = outStream.toString();
					if (typeof string != "string") {
						throw Error("Invalid Text");
					}
					else onLoad.call(this, string);
				})
				.catch(onError);
			}, onProgress, onError );
		} else {
			loader.setResponseType( "text" );
			loader.load( url, onLoad, onProgress, onError );
		}
	}
};
