#shader vertex
attribute vec3 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying float l;

void main() {
	l = ((trans * position).y + 5.0) / 30.0;
	gl_Position = (u_MVP * trans * vec4(position, 1.0)) + vec4(0.0, 0.0, -0.0001, 0.0);
};

#shader fragment
varying float l;

void main() {
	gl_FragColor = mix(vec4(0.0, 0.7, 1.0, 1.0), vec4(1.0, 0.0, 1.0, 0.25), l);
};