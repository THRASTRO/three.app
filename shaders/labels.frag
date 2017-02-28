/*
	Copyright 2017 Marcel Greter
	https://www.github.com/mgreter
*/

precision highp float;
uniform sampler2D map;

varying vec2 uvOff;
varying vec2 uvSize;
varying float lblWidth;
varying float lblHeight;

void main() {
  vec2 vUv = gl_PointCoord;
  float size = max(lblWidth, lblHeight);
  if (vUv.y > lblHeight / size) discard; 
  if (vUv.x > lblWidth / size) discard; 
  vUv = vUv * uvSize + uvOff;
  vUv.y = 1.0 - vUv.y;
  gl_FragColor = texture2D(map, vUv);
}
