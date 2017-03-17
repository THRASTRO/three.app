/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

precision highp float;
uniform sampler2D map;

varying vec2 uvSize;
varying vec2 uvOff;
varying float lblWidth;
varying float lblHeight;

void main() {
  vec2 vUv = gl_PointCoord;
  if (vUv.y > lblHeight) discard; 
  if (vUv.x > lblWidth) discard; 
  vUv = vUv * uvSize + uvOff;
  vUv.y = 1.0 - vUv.y;
  gl_FragColor = texture2D(map, vUv);
}
