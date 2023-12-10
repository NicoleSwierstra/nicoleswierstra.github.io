#shader vertex
#version 330 core

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 normal;

uniform mat4 u_MVP;
uniform mat4 trans;

out float l;
flat out vec3 Normal;

void main() {
	gl_Position = u_MVP * trans * position;
	l = ((trans * position).y ) / 10.0f;
	Normal = normal.xyz;
};

#shader fragment
#version 330 core

in float l;
flat in vec3 Normal;
out vec4 color;

void main() {
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(vec3(0.0f, -4.0f, 1.0f));
	float li = min(1.0f, max(dot(norm, lightDir) + 0.5f, 0.0)) + 0.5f;
	vec4 lighting = vec4(li, li, li, 1.0f);
	color = mix(vec4(0.125f, 0.125f, 0.15f, 0.95f), vec4(0.0f, 0.0f, 0.0f, 1.0f), 1-l) * lighting;
	//color = vec4(li, li, li, 1.0f);
};