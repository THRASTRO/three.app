/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

precision highp float;

// uniform matrixes from threejs
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// dummy position for instances
attribute vec3 position;
// offset for each instance
attribute vec3 offset;
// 2d-packer result in px
attribute vec4 uvs;
// the texture size in px
uniform float texWidth;
uniform float texHeight;
// the app vieport in px
uniform float appWidth;
uniform float appHeight;

// texture positions
varying vec2 uvSize;
varying vec2 uvOff;
// fragment borders
varying float lblWidth;
varying float lblHeight;

void main() {
  lblWidth = min(1.0, uvs.p / uvs.q); // in real px
  lblHeight = min(1.0, uvs.q / uvs.p); // in real px
  uvOff = vec2(uvs.x / texWidth, uvs.y / texHeight);
  uvSize = vec2(uvs.p / texWidth, uvs.q / texHeight);
  float size = max(uvSize.x, uvSize.y);
  float ratio = texWidth / texHeight;
  // fix aspect ratio distortion
  uvSize = vec2(
    max(uvs.p, uvs.q) / max(texHeight, texWidth),
    max(uvs.p, uvs.q) / min(texHeight, texWidth)
  );
  gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + position, 1.0);
  // offset point by its size (to be lower/right aligned)
  // ToDo: offset should be more dynamic (if close to camera)
  gl_Position.x += (uvs.z + 6.0) / appWidth * gl_Position.w;
  gl_Position.y -= (uvs.z + 6.0) / appHeight * gl_Position.w;
  gl_PointSize = max(uvs.p, uvs.q);
}
