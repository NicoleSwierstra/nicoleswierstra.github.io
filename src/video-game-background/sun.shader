#shader vertex
attribute vec3 position;

uniform mat4 u_MVP;
uniform mat4 trans;
varying float l;

void main(void) { 
    l = (position.z / 150.0) + 1.0; 
    gl_Position = u_MVP * trans * vec4(position, 1.0); 
}

#shader fragment
precision mediump float;
varying float l;

void main(void) {
    gl_FragColor = mix( vec4(0.6, 0.2, 1.0, 1.0), vec4(1.0, 0.4, 0.6, 1.0), l);
}