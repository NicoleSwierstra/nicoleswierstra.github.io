#shader vertex
#version 330 core

layout(location = 0) in vec4 position;

uniform mat4 u_MVP;
uniform mat4 trans;

out float l;

void main() {
	gl_Position = u_MVP * trans * position;
	l = position.z / 200.0f;
};

#shader fragment
#version 330 core

in float l;

out vec4 color;

void main() {
	color = mix(vec4(1.0f, 0.0f, 0.0f, 1.0f), vec4(1.0f, 1.0f, 0.0f, 1.0f), l);
};