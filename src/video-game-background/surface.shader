#shader vertex
#version 330 core

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 normal;

uniform mat4 u_MVP;
uniform mat4 trans;

out vec3 Normal;
out vec4 offset;
flat out vec3 nFlat;

void main() {
	gl_Position = u_MVP * trans * position;
	Normal = normal.xyz;
	offset = trans * position;
	nFlat = normal.xyz;
};

#shader fragment
#version 330 core

in vec3 Normal;
in vec4 offset;
flat in vec3 nFlat;

out vec4 color;

void main() {
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(vec3(0.0f, 20.0f, 4.0f) - offset.xyz);
	vec3 reflectDir = reflect(lightDir, nFlat);
	float spec = pow(max(dot(vec3(0, 0, -1), reflectDir), 0.0), 8);
	vec3 col = vec3(0.05f, 0.05f, 0.05f) + (vec3(1.0f, 0.7f, 0.5f) * spec * 1.5f);
	color = vec4(col, 1.0f);
};