/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

attribute vec4 uvs;
attribute vec3 offset;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float texWidth;
uniform float texHeight;
uniform float appWidth;
uniform float appHeight;

varying vec2 uvSize;
varying vec2 uvOff;
varying float lblWidth;
varying float lblHeight;

void main() {
  lblWidth = uvs.z; // in real px
  lblHeight = uvs.a; // in real px
  uvOff = vec2(uvs.x / texWidth, uvs.y / texHeight);
  uvSize = vec2(uvs.z / texWidth, uvs.a / texHeight);
  float size = max(uvSize.x, uvSize.y);
  // fix aspect ratio distortion
  uvSize.x *= size / uvSize.x;
  uvSize.y *= size / uvSize.y;
  vec3 transformed = offset + position;
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // offset point by its size (to be lower/right aligned)
  gl_Position.x += (uvs.z + 6.0) / appWidth * gl_Position.w;
  gl_Position.y -= (uvs.z + 6.0) / appHeight * gl_Position.w;
  gl_PointSize = uvs.z;
}
