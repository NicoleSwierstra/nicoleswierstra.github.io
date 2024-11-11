#shader vertex
attribute vec4 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying float l;

void main() {
	l = ((trans * position).y + 5.0) / 30.0;
	gl_Position = (u_MVP * trans * position) + vec4(0.0, 0.0, -0.0001, 0.0);
	gl_PointSize = 2.0;
}

#shader fragment
precision highp float;
varying float l;

void main() {
	gl_FragColor = mix(vec4(0.0, 0.7, 1.0, 1.0), vec4(1.0, 0.0, 1.0, 0.25), l);
}