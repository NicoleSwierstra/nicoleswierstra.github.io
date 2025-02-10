#shader vertex
attribute vec4 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying float l;

void main() {
	l = ((trans * position).y + 5.0) / 30.0;
	gl_Position = (u_MVP * trans * position) + vec4(0.0, 0.0, -0.0, 0.001);
}

#shader fragment
precision highp float;
varying float l;

void main() {
	gl_FragColor = mix(vec4(0.0, 0.7, 1.0, 1.0), vec4(1.0, 0.0, 1.0, 0.5), l);
}