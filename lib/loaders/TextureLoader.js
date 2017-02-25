/**
 * @author mgreter / https://www.github.com/mgreter
 */

THREE.TextureLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.TextureLoader.prototype = {
	constructor: THREE.TextureLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		// debugger;
		var manager = this.manager, app = manager.app;
		var loader = new THREE.FileLoader( manager );
		var texture = new THREE.Texture();
		loader.setResponseType( "arraybuffer" );
		loader.load( url, function (buffer) {
			var type = 'application/octet-stream';
			if (url.search( /\.(jpe?g)$/ )) type = "image/jpeg";
			else if (url.search( /\.(png)$/ )) type = "image/png";
			else if (url.search( /\.(gif)$/ )) type = "image/gif";
			var blob = new Blob([buffer], { type: type });	
			var reader = new FileReader(blob);
			texture.image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );
			texture.image.addEventListener( 'load', function () {
				// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
				texture.format = type == "image/jpeg" ? THREE.RGBFormat : THREE.RGBAFormat;
				texture.needsUpdate = true;
				if ( onLoad !== undefined ) {
					onLoad( texture );
				}
			});
			reader.addEventListener("load", function (result) {
				texture.image.src = reader.result;
			}, false);
			reader.readAsDataURL(blob);
		}, onProgress, onError );
		window.texture = texture;
		return texture;
	},
	setCrossOrigin: function ( value ) {
		this.crossOrigin = value;
		return this;
	},
	setPath: function ( value ) {
		this.path = value;
		return this;
	}
};
