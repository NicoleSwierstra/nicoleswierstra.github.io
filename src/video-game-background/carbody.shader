#shader vertex
#version 300 es

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 normal;

uniform mat4 u_MVP;
uniform mat4 trans;

flat out vec3 Normal;
out vec4 offset;

void main() {
	gl_Position = u_MVP * trans * position;
	Normal = normal.xyz;
	offset = trans * position;
}

#shader fragment
#version 300 es

precision highp float;
flat in vec3 Normal;
in vec4 offset;
out vec4 color;

void main() {
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(vec3(0.0f, 10.0f, 1.0f));
	vec3 col = vec3(0.2f, 0.2f, 0.2f) * (max(dot(norm, lightDir), 0.0) + 0.25f);
	color = vec4(col, 1.0f);
}