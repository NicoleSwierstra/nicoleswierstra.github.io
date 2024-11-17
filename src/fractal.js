var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('webgl2');

canvas.width = window.screen.width;
canvas.height = window.screen.height; 

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-9999";
canvas.style.opacity = "1";

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16)/256,
        g: parseInt(result[2], 16)/256,
        b: parseInt(result[3], 16)/256
    } : null;
}

var bgcol = hexToRgb(getComputedStyle(canvas).getPropertyValue('--d_dark-grey'));

import { getShaderFromFile, setshadercontext } from "/src/modules/shader.js";
setshadercontext(gl);

var verts = [
    // First triangle:
     1.0,  1.0,
    -1.0,  1.0,
    -1.0, -1.0,
    // Second triangle:
    -1.0, -1.0,
     1.0, -1.0,
     1.0,  1.0
];


var mb2d = await getShaderFromFile("src/mbshader/mandlebrot.shader");

//renders a quad to screen
var nbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, nbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

// Position

gl.useProgram(mb2d)
var mbpos = gl.getAttribLocation(mb2d, "position");
gl.uniform4f(gl.getUniformLocation(mb2d, "_bounds"), 0,0, canvas.width/canvas.height, 2.0);

class colorentry{
    constructor(r, g, b, p){
        this.r = r;
        this.g = g;
        this.b = b;
        this.p = p;
    }
}

let c1 = hexToRgb(getComputedStyle(canvas).getPropertyValue('--light-grey'))
let c2 = hexToRgb(getComputedStyle(canvas).getPropertyValue('--pale-blue'))
let c3 = hexToRgb(getComputedStyle(canvas).getPropertyValue('--deep-blue'))

let colors = [
    new colorentry(bgcol.r, bgcol.g, bgcol.b, 0.0),
    new colorentry(c3.r, c3.g, c3.b, 0.2),
    new colorentry(c2.r, c2.g, c2.b, 0.6),
    new colorentry(c1.r, c1.g, c1.b, 0.8),
    new colorentry(0.8, 0.6, 1.0, 1.0),
]
let __i = 0
for (var i = 0; i < colors.length; i++) {
    gl.uniform1f(gl.getUniformLocation(mb2d, `gradient[${i}].position`), colors[i].p);
    gl.uniform4f(gl.getUniformLocation(mb2d, `gradient[${i}].color`), colors[i].r, colors[i].g, colors[i].b, 1.0);
}

gl.uniform1i(gl.getUniformLocation(mb2d, "gradientNum"), colors.length);
gl.vertexAttribPointer(mbpos, 2, gl.FLOAT, false, 0, 0 );
gl.enableVertexAttribArray(mbpos)

/*================= Drawing ===========================*/

gl.uniform4f(gl.getUniformLocation(mb2d, "inside_color"), c2.r, c2.g, c2.b, 1.0);

gl.clearColor(bgcol.r, bgcol.g, bgcol.b, 1);
gl.clearDepth(1.0);

let mousex = 0, mousey = 0;
document.addEventListener("mousemove", logKey);

var time_old = 0;
function logKey(e) {
    if (e.screenX == NaN) return;
    mousex = 2.0 * (e.screenX / canvas.width - 0.5);
    mousey = 2.0 * (e.clientY / canvas.height - 0.5);
}

var animate = function(time) { 
    let dt = (time - time_old) / 1000.0;
    time_old = time
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let opmut = Math.min(Math.max(0, 500 - window.scrollY), 350) / 350.0;
    canvas.style.opacity = String(opmut);
    let mx = 0 * (1-opmut) + opmut * (-mousex * 1.5), my = (mousey * 1.5) * opmut + 0 * (1-opmut)

    gl.useProgram(mb2d);
    gl.bindBuffer(gl.ARRAY_BUFFER, nbo) 
    gl.uniform4f(gl.getUniformLocation(mb2d, "_bounds"), 0,0, canvas.width * (1.0/canvas.height), 1.8);
    gl.uniform2f(gl.getUniformLocation(mb2d, "juliaCoords"), mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    window.requestAnimationFrame(animate);
}

animate(0);