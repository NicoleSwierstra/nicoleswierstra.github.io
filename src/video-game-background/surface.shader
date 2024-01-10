#shader vertex
#version 330 core

attribute vec4 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying vec3 Normal;
varying vec4 offset;

void main() {
	gl_Position = u_MVP * trans * position;
	Normal = vec3(0.0, 1.0, 0.0)
	offset = trans * position;
};

#shader fragment
#version 330 core

varying vec3 Normal;
varying vec4 offset;

void main() {
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(vec3(0.0f, 20.0f, 4.0f) - offset.xyz);
	vec3 reflectDir = reflect(lightDir, norm);
	float spec = pow(max(dot(vec3(0, 0, -1), reflectDir), 0.0), 8);
	vec3 col = vec3(0.05f, 0.05f, 0.05f) + (vec3(1.0f, 0.7f, 0.5f) * spec * 1.5f);
	gl_FragColor = vec4(col, 1.0f);
};