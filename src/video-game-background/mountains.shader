#shader vertex
attribute vec3 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying float l;

void main() {
	gl_Position = u_MVP * trans * vec4(position, 1.0);
	l = ((trans * vec4(position, 1.0)).y ) / 10.0;
}

#shader fragment
precision highp float;
varying float l;

void main() {
	float lighting = 1.0;
	gl_FragColor = mix(vec4(0.125, 0.125, 0.15, 0.95), vec4(0.0, 0.0, 0.0, 1.0), 1.0-l) * lighting;
}