#shader vertex
#version 300 es

layout(location = 0) in vec2 position;


out vec2 coords;

void main() {
	gl_Position = vec4(position.x, position.y, 0.0, 1.0);
	coords = position.xy;
}

#shader fragment
#version 300 es

precision highp float;
out vec4 FragColor;
//xoff, yoff, z = aspect ratio, w = scale,
uniform vec4 _bounds;

int iterations = 500;
uniform vec2 juliaCoords;

struct gradientPos {
	vec4 color;
	float position;
};

uniform gradientPos gradient[50];
uniform int gradientNum;
uniform vec4 inside_color;
in vec2 coords;

vec2 step_mandlebrot(vec2 v, float x, float y) {
	return vec2((v.x * v.x - v.y * v.y) + x, (2.0 * v.x * v.y) + y);
}

float iterator(float x, float y) {
	vec2 v = vec2(x, y);
	float iv = 0.0;
	int iteration = 0;
	
	while ((v.x * v.x + v.y * v.y) < 4.0 && iteration < iterations)
	{
		vec2 ov = v;
		v = step_mandlebrot(v, juliaCoords.x, juliaCoords.y);
		iv += length(ov - v);
		iteration++;
	}

	if (iteration == iterations)
		return (abs(iv) / (float(iteration) * 2.0));
	
	float log_zn = log(float(v.x * v.x + v.y * v.y)) / 2.0;
	float nu = log(log_zn / log(2.0)) / log(2.0);
	return (float(iteration + 1) - nu) / float(iterations);
}

vec4 getGradient(float pos) {
	int lower = 0, upper = gradientNum - 1;

	for (int i = 0; i < gradientNum - 1; i++) {
		if (gradient[i].position < pos)
		{
			if (gradient[lower].position < gradient[i].position)
			{
				lower = i;
			}
		}

		if (gradient[i].position >= pos)
		{
			if (gradient[upper].position > gradient[i].position)
			{
				upper = i;
			}
		}
	}

	if (upper == lower)
		return gradient[upper].color;
	
	return mix(gradient[lower].color, gradient[upper].color, 
		(pos - gradient[lower].position) / (gradient[upper].position - gradient[lower].position));
}

void main() {
	vec2 pos = vec2(
		(coords.x * _bounds.z * _bounds.w) + _bounds.x,
		(coords.y * _bounds.w) + _bounds.y
	);
	float ivalue = iterator(pos.x, pos.y);
	FragColor = (ivalue == -1.0) ? inside_color : getGradient(pow(ivalue, 0.6));
}