var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('experimental-webgl');

import { getShaderFrom, setshadercontext } from "/src/modules/shader.js";
setshadercontext(gl);

canvas.width = document.body.clientWidth;
canvas.height = canvas.width * 0.5625 

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const roadx = 11;
const roady = 200;
const scalex = 2.5;
const scaley = 60.0;
const mountainx = 20;
const sunres = 64;
const end_dist = scaley * 10;
var dist_traveled = 0.0;

const TAU = 6.28318530717958623199592693709
const rand_div = 0.000030518509476

const rot = glm.rotate(glm.mat4(1.), glm.radians(-65.), glm.vec3(1.0, 0.0, 0.0));
let trans = glm.mat4(1.0);
let trans2 = glm.mat4(1.0);
let pos = glm.vec3(0.0, 0.0, -1.0);
let suntrans = glm.translate(rot, glm.vec3(0.0, (5 * scaley) + end_dist, 0.0));

console.log(pos);

let sunverts = [0.0, 0.0, 0.0];
let sunindex = [];

for (let i = 0; i < sunres; i++) {
    let h = i * TAU;
    sunverts.push(Math.cos(h / sunres) * 130.0, 0.0, Math.sin(h / sunres) * 115.0);
}
for (let i = 1; i <= sunres; i++) {
    sunindex.push(0, i, i % sunres ? i + 1 : 1);
}

// Create and store data into vertex buffer
var sun_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunverts), gl.STATIC_DRAW);

// Create and store data into index buffer
var sun_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sunindex), gl.STATIC_DRAW);

// Create and store data into vertex buffer
var road_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunverts), gl.STATIC_DRAW);

// Create and store data into index buffer
var road_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sunindex), gl.STATIC_DRAW);

let sunvert = '\
attribute vec3 position; \
\
uniform mat4 u_MVP; \
uniform mat4 trans; \
varying float l; \
\
void main(void) { \
    gl_Position = u_MVP * trans * vec4(position, 1.0); \
    l = position.z / 160.0; \
}';

let sunfrag = '\
precision mediump float;\
varying float l;\
\
void main(void) {\
    gl_FragColor = mix(vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 1.0, 0.0, 1.0), l);\
}';

var sunShader = getShaderFromFile("src/video-game-background/sun.shader");

gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
var position = gl.getAttribLocation(sunShader, "position");
gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0);

// Position
gl.enableVertexAttribArray(position);
gl.useProgram(sunShader);

var proj_matrix = glm.perspective(glm.radians(90.0), canvas.width / canvas.height, 0.1, 5000.0);

gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "u_MVP"), false, proj_matrix.array);
gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "u_MVP"), false, proj_matrix.array);
gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "trans"), false, suntrans.array);

/*================= Drawing ===========================*/
var time_old = 0;

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
var bgcol = hexToRgb(getComputedStyle(canvas).getPropertyValue('--d_dark-grey'));

gl.clearColor(bgcol.r/256.0, bgcol.g/256.0, bgcol.b/256.0, 1);
gl.clearDepth(1.0);
var animate = function(time) {
    time_old = time;
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    trans = glm.translate(rot, pos);
    trans2 = glm.translate(rot, pos['+'](glm.vec3(0, scaley, 0)));

    gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "trans"), false, suntrans.array);

    gl.useProgram(sunShader);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
    gl.drawElements(gl.TRIANGLES, sunindex.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}

animate(0);