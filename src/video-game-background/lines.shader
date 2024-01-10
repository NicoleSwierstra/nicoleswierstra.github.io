#shader vertex
#version 330 core

attribute vec3 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying float l;

void main() {
	gl_Position = (u_MVP * trans * vec4(position, 1.0)) + vec4(0.0, 0.0, -0.0001, 0.0);
	l = ((trans * position).y + 5.0) / 30.0;
};

#shader fragment
#version 330 core

varying float l;

void main() {
	gl_FragColor = mix(vec4(0.0, 0.7, 1.0, 1.0), vec4(1.0, 0.0, 1.0, 0.25), l);
};