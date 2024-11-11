var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('experimental-webgl');

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
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const scrollspeed = 2;
const roadx = 11;
const roady = 200;
const scalex = 2.5;
const scaley = 60.0;
const mountainx = 20;
const sunres = 64;

const TAU = 6.28318530717958623199592693709 // not accurate enough :(

const rot = glm.rotate(glm.mat4(1.), glm.radians(-65.), glm.vec3(1.0, 0.0, 0.0));
let trans = glm.mat4(1.0);
let trans2 = glm.mat4(1.0);
let pos = glm.vec3(0.0, 0.0, -1.0);
let suntrans = glm.translate(rot, glm.vec3(0.0, (20 * scaley), 0.0));

console.log(pos);

let sunverts = [0.0, 0.0, 0.0];
let sunindex = [];
let roadverts = [];
let roadindex = [];
let lmbuffer = [];
let rmbuffer = [];
let mindex = [];
let starbuffer = [];
let starindex = [];

for (let i = 0; i < sunres; i++) {
    let h = i * TAU;
    sunverts.push(Math.cos(h / sunres) * 130.0, 0.0, Math.sin(h / sunres) * 115.0);
}
for (let i = 1; i <= sunres; i++) {
    sunindex.push(0, i, i % sunres ? i + 1 : 1);
}

for (let y = 0; y < roady; y++) {
    for (let x = 0; x < roadx; x++) {
        roadverts.push(scalex * (x / (roadx - 1)) - (0.5 * scalex), scaley * (y / (roady - 1)) - 0.5 * scaley, 0.0);
    }
}

for (let y = 0; y < (roady - 1); y++) {
    for (let x = 0; x < (roadx - 1); x++) {
        let s = (y * roadx) + x;
        let s1 = ((y + 1) * roadx) + x;
        roadindex.push( s, s + 1, s1, s1, s1 + 1, s + 1 );
    }
}

for (let y = 0; y < roady * 0.25; y++) {
    for (let x = 0; x < mountainx; x++) {
        let xo = roadverts[0] - (1.5 * x),
            x2 = -roadverts[0] + (1.5 * x),
            yo = (scaley * (4 * y / (roady - 1))) - (0.5 * scaley);
        lmbuffer.push(xo, yo, (x != 0) ? 2 * Math.pow(Math.random(), 2) : 0.0);
        rmbuffer.push(x2, yo, (x != 0) ? 2 * Math.pow(Math.random(), 2) : 0.0);
    }
}

for (let x = 0; x < mountainx; x++) {
    let xo = roadverts[0].x - 1.5 * x,
        x2 = -roadverts[0].x + 1.5 * x,
        yo = (scaley * (4 * (roady * 0.25) / (roady - 1))) - (0.5 * scaley);
    lmbuffer.push(xo, yo, lmbuffer[x].z);
    rmbuffer.push(x2, yo, rmbuffer[x].z);
}

for (let y = 0; y < (roady * 0.25); y++) {
    for (let x = 0; x < (mountainx - 1); x++) {
        let s = (y * mountainx) + x;
        let s1 = ((y + 1) * mountainx) + x;
        mindex.push( s, s + 1, s1, s1, s1 + 1, s + 1 );
    }
}

console.log(lmbuffer)
console.log(mindex)

//assigns stars random positions
for (let n = 0; n < 10000; n++) {
    starbuffer.push(30.0 - Math.random() * scaley, 0.0 - Math.random() * scaley, Math.pow(Math.random(), 0.33) * 8.0);
    starindex.push(n);
}

var sun_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunverts), gl.STATIC_DRAW);

var sun_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sunindex), gl.STATIC_DRAW);

var road_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, road_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(roadverts), gl.STATIC_DRAW);

var road_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, road_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(roadindex), gl.STATIC_DRAW);

var lmountain_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, lmountain_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lmbuffer), gl.STATIC_DRAW);

var rmountain_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rmbuffer), gl.STATIC_DRAW);

var mountain_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mountain_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mindex), gl.STATIC_DRAW);

var stars_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, stars_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starbuffer), gl.STATIC_DRAW);

var stars_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stars_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(starindex), gl.STATIC_DRAW);

import { getShaderFrom, getShaderFromFile, setshadercontext } from "/src/modules/shader.js";
setshadercontext(gl);

var sunShader = await getShaderFromFile("src/video-game-background/sun.shader");
var roadShader = await getShaderFromFile("src/video-game-background/surface.shader");
var mountains = await getShaderFromFile("src/video-game-background/mountains.shader");
var lineShader = await getShaderFromFile("src/video-game-background/lines.shader");
var starShader = await getShaderFromFile("src/video-game-background/stars.shader");

var sun_vertpointer = gl.getAttribLocation(sunShader, "position");
var surf_vertpointer = gl.getAttribLocation(roadShader, "position");
var line_vertpointer = gl.getAttribLocation(lineShader, "position");
var mnt_vertpointer = gl.getAttribLocation(mountains, "position");
var star_vertpointer = gl.getAttribLocation(starShader, "position")
gl.enableVertexAttribArray(sun_vertpointer)
gl.enableVertexAttribArray(surf_vertpointer)
gl.enableVertexAttribArray(line_vertpointer)
gl.enableVertexAttribArray(mnt_vertpointer)
gl.enableVertexAttribArray(star_vertpointer)

// Position

var proj_matrix = glm.perspective(glm.radians(90.0), canvas.width / canvas.height, 0.1, 2000.0);

gl.useProgram(sunShader)
gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "u_MVP"), false, proj_matrix.array);
gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "trans"), false, suntrans.array);

gl.useProgram(roadShader)
gl.uniformMatrix4fv(gl.getUniformLocation(roadShader, "u_MVP"), false, proj_matrix.array);

gl.useProgram(lineShader)
gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "u_MVP"), false, proj_matrix.array);

gl.useProgram(starShader)
gl.uniformMatrix4fv(gl.getUniformLocation(starShader, "u_MVP"), false, proj_matrix.array);

gl.useProgram(mountains)
gl.uniformMatrix4fv(gl.getUniformLocation(mountains,  "u_MVP"), false, proj_matrix.array);

/*================= Drawing ===========================*/
var time_old = 0;

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable( gl.BLEND );
var bgcol = hexToRgb(getComputedStyle(canvas).getPropertyValue('--d_dark-grey'));

gl.clearColor(bgcol.r/256.0, bgcol.g/256.0, bgcol.b/256.0, 1);
gl.clearDepth(1.0);
var animate = function(time) { 
    let dt = (time - time_old) / 1000.0;
    time_old = time
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    pos = glm.vec3(0, (pos.y - (scrollspeed * dt)), -1);

    if (pos.y < -30) {pos.y += scaley}

    trans = glm.translate(rot, pos);
    trans2 = glm.translate(rot, glm.vec3(pos.x, pos.y + scaley, pos.z));
 
    gl.useProgram(sunShader); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
    gl.vertexAttribPointer(sun_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.drawElements(gl.TRIANGLES, sunindex.length, gl.UNSIGNED_SHORT, 0);
 
    gl.useProgram(roadShader);
    gl.bindBuffer(gl.ARRAY_BUFFER, road_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, road_ib);
    gl.vertexAttribPointer(surf_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(gl.getUniformLocation(roadShader, "trans"), false, trans.array)
    gl.drawElements(gl.TRIANGLES, roadindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(roadShader, "trans"), false, trans2.array)
    gl.drawElements(gl.TRIANGLES, roadindex.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(mountains)
    gl.bindBuffer(gl.ARRAY_BUFFER, lmountain_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mountain_ib);
    gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 ); 
    gl.drawElements(gl.TRIANGLES, mindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans.array) 
    gl.drawElements(gl.TRIANGLES, mindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans2.array) 
    
    gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mountain_ib);
    gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans.array) 
    gl.drawElements(gl.TRIANGLES, mindex.length, gl.UNSIGNED_SHORT, 0)
    gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans2.array) 
    gl.drawElements(gl.TRIANGLES, mindex.length, gl.UNSIGNED_SHORT, 0);

    gl.useProgram(lineShader);
    gl.bindBuffer(gl.ARRAY_BUFFER, road_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, road_ib);
    gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array)
    gl.drawElements(gl.LINES, roadindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array)
    gl.drawElements(gl.LINES, roadindex.length, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, lmountain_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mountain_ib);
    gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );  
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array);
    gl.drawElements(gl.LINES, mindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array); 
    gl.drawElements(gl.LINES, mindex.length, gl.UNSIGNED_SHORT, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mountain_ib);
    gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array) 
    gl.drawElements(gl.LINES, mindex.length, gl.UNSIGNED_SHORT, 0)
    gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array) 
    gl.drawElements(gl.LINES, mindex.length, gl.UNSIGNED_SHORT, 0);


    gl.useProgram(starShader);
    gl.bindBuffer(gl.ARRAY_BUFFER, stars_vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stars_ib);
    gl.vertexAttribPointer(surf_vertpointer, 3, gl.FLOAT, false, 0, 0 );
    gl.uniformMatrix4fv(gl.getUniformLocation(starShader, "trans"), false, trans.array)
    gl.drawElements(gl.POINTS, starindex.length, gl.UNSIGNED_SHORT, 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(starShader, "trans"), false, trans2.array)
    gl.drawElements(gl.POINTS, starindex.length, gl.UNSIGNED_SHORT, 0);
    
    window.requestAnimationFrame(animate);
}

animate(0);