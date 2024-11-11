#shader vertex

attribute vec3 position;

uniform mat4 u_MVP;
uniform mat4 trans;

varying vec3 Normal;
varying vec4 offset;

void main() {
	offset = trans * vec4(position, 1.0);
	Normal = vec3(0.0, 1.0, 0.0);
	gl_Position = u_MVP * trans * vec4(position, 1.0);
}

#shader fragment
precision highp float;
varying vec3 Normal;
varying vec4 offset;

void main() {
	vec3 norm = normalize(Normal);
	vec3 lightDir = normalize(vec3(0.0, 20.0, 4.0) - offset.xyz);
	vec3 reflectDir = reflect(lightDir, norm);
	float spec = pow(max(dot(vec3(0.0, 0.0, -1.0), reflectDir), 0.0), 8.0);
	vec3 col = vec3(0.05, 0.05, 0.05) + (vec3(1.0, 0.7, 0.5) * spec * 1.5);
	gl_FragColor = vec4(col, 1.0);
}