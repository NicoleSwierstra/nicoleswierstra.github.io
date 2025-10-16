var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('webgl2');

canvas.width = window.screen.width;
canvas.height = window.screen.height; 

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-9999";
canvas.style.opacity = "1";


let breakpauses = [
    0,
    document.getElementById('firstBreak').getBoundingClientRect().top,
    document.getElementById('secondBreak').getBoundingClientRect().top
]

let contents_major = [...document.getElementsByClassName("major")];
let contents_minor = [...document.getElementsByClassName("minor")];

console.log(contents_major.length)

let sidebar = document.getElementById('sidebar')

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const scrollspeed = 1.2;
const roadx = 11;
const roady = 200;
const scalex = 3;
const scaley = 60.0;
const mountainx = 20;
const sunres = 64;

const TAU = 6.28318530717958623199592693709 // not accurate enough :(

let rot = glm.rotate(glm.mat4(1.), glm.radians(-65.), glm.vec3(1.0, 0.0, 0.0));
let trans = glm.mat4(1.0);
let trans2 = glm.mat4(1.0);
let pos = glm.vec3(0.0, 0.0, -1.0);
let suntrans = glm.translate(rot, glm.vec3(0.0, (20 * scaley), 10.0));

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
    let xo = roadverts[0] - 1.5 * x,
        x2 = -roadverts[0] + 1.5 * x,
        yo = (scaley * (4 * roady / (roady - 1))) - (0.5 * scaley);
    lmbuffer.push(xo, yo, lmbuffer[(x * 3) + 2]);
    rmbuffer.push(x2, yo, rmbuffer[(x * 3) + 2]);
}

let lmountain_vb_wnormals = [];
let rmountain_vb_wnormals = [];

for (let y = 0; y < (roady * 0.25) - 1; y++) {
    for (let x = 0; x < mountainx; x++) {
        let s = ((y * mountainx) + x) * 3;
        let s1 = (((y + 1) * mountainx) + x) * 3;

        let lv1 = glm.vec3(lmbuffer[s], lmbuffer[s + 1], lmbuffer[s + 2]),
            lv2 = glm.vec3(lmbuffer[s + 3], lmbuffer[s + 4], lmbuffer[s + 5]),
            lv3 = glm.vec3(lmbuffer[s1], lmbuffer[s1 + 1], lmbuffer[s1 + 2]),
            lv4 = glm.vec3(lmbuffer[s1 + 3], lmbuffer[s1 + 4], lmbuffer[s1 + 5]),
            rv1 = glm.vec3(rmbuffer[s], rmbuffer[s + 1], rmbuffer[s + 2]),
            rv2 = glm.vec3(rmbuffer[s + 3], rmbuffer[s + 4], rmbuffer[s + 5]),
            rv3 = glm.vec3(rmbuffer[s1], rmbuffer[s1 + 1], rmbuffer[s1 + 2]),
            rv4 = glm.vec3(rmbuffer[s1 + 3], rmbuffer[s1 + 4], rmbuffer[s1 + 5]);

        //v3, v2, v1,
        //v3, v2, v4,

        let ln1 = glm.cross(glm.normalize(lv2['-'](lv3)), glm.normalize(lv1['-'](lv3)));
        let ln2 = glm.cross(glm.normalize(lv4['-'](lv3)), glm.normalize(lv2['-'](lv3)));
        let rn1 = glm.cross(glm.normalize(rv1['-'](rv3)), glm.normalize(rv2['-'](rv3)));
        let rn2 = glm.cross(glm.normalize(rv2['-'](rv3)), glm.normalize(rv4['-'](rv3)));

        lmountain_vb_wnormals.push(
            lv3.x, lv3.y, lv3.z, ln1.x, ln1.y, ln1.z,
            lv2.x, lv2.y, lv2.z, ln1.x, ln1.y, ln1.z,
            lv1.x, lv1.y, lv1.z, ln1.x, ln1.y, ln1.z,
            lv3.x, lv3.y, lv3.z, ln2.x, ln2.y, ln2.z,
            lv2.x, lv2.y, lv2.z, ln2.x, ln2.y, ln2.z,
            lv4.x, lv4.y, lv4.z, ln2.x, ln2.y, ln2.z
        );
        rmountain_vb_wnormals.push(
            rv3.x, rv3.y, rv3.z, rn1.x, rn1.y, rn1.z,
            rv2.x, rv2.y, rv2.z, rn1.x, rn1.y, rn1.z,
            rv1.x, rv1.y, rv1.z, rn1.x, rn1.y, rn1.z,
            rv3.x, rv3.y, rv3.z, rn2.x, rn2.y, rn2.z,
            rv2.x, rv2.y, rv2.z, rn2.x, rn2.y, rn2.z,
            rv4.x, rv4.y, rv4.z, rn2.x, rn2.y, rn2.z,
        );
    }
}

console.log(lmbuffer)
console.log(lmountain_vb_wnormals);

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
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lmountain_vb_wnormals), gl.STATIC_DRAW);

var rmountain_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rmountain_vb_wnormals), gl.STATIC_DRAW);

var stars_vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, stars_vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starbuffer), gl.STATIC_DRAW);

var stars_ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stars_ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(starindex), gl.STATIC_DRAW);

import { parseOBJFromFile } from "/src/modules/mesh.js"

var vehicle_vb0 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb0);

let vehicle_verticies0 = await parseOBJFromFile("res/models/carblack.obj");
let v_vertdata = []
for(let i = 0; i < vehicle_verticies0.position.length; i += 3){
    v_vertdata.push(
        vehicle_verticies0.position[i],
        vehicle_verticies0.position[i + 1],
        vehicle_verticies0.position[i + 2],
        vehicle_verticies0.normal[i],
        vehicle_verticies0.normal[i + 1],
        vehicle_verticies0.normal[i + 2],
    )
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vehicle_verticies0.position), gl.STATIC_DRAW)

var vehicle_vb1 = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb1)

let vehicle_verticies1 = await parseOBJFromFile("res/models/carblue.obj");
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vehicle_verticies1.position), gl.STATIC_DRAW)

import { getShaderFrom, getShaderFromFile, setshadercontext } from "/src/modules/shader.js";
setshadercontext(gl);

var sunShader = await getShaderFromFile("src/video-game-background/sun.shader");
var roadShader = await getShaderFromFile("src/video-game-background/surface.shader");
var mountains = await getShaderFromFile("src/video-game-background/mountains.shader");
var lineShader = await getShaderFromFile("src/video-game-background/lines.shader");
var starShader = await getShaderFromFile("src/video-game-background/stars.shader");
var carShader = await getShaderFromFile("src/video-game-background/carbody.shader")

var sun_vertpointer = gl.getAttribLocation(sunShader, "position");
var surf_vertpointer = gl.getAttribLocation(roadShader, "position");
var line_vertpointer = gl.getAttribLocation(lineShader, "position");
var mnt_vertpointer = gl.getAttribLocation(mountains, "position");
var mnt_normpointer = gl.getAttribLocation(mountains, "normal");
var star_vertpointer = gl.getAttribLocation(starShader, "position");
var car_vertpointer0 = gl.getAttribLocation(carShader, "position");
var car_vertpointer1 = gl.getAttribLocation(carShader, "normal");
gl.enableVertexAttribArray(sun_vertpointer)
gl.enableVertexAttribArray(surf_vertpointer)
gl.enableVertexAttribArray(line_vertpointer)
gl.enableVertexAttribArray(mnt_vertpointer)
gl.enableVertexAttribArray(mnt_normpointer)
gl.enableVertexAttribArray(star_vertpointer)
gl.enableVertexAttribArray(car_vertpointer0)
gl.enableVertexAttribArray(car_vertpointer1)

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

gl.useProgram(carShader)
gl.uniformMatrix4fv(gl.getUniformLocation(carShader,  "u_MVP"), false, proj_matrix.array)

/*================= Drawing ===========================*/
var time_old = 0;

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable( gl.BLEND );
var bgcol = hexToRgb(getComputedStyle(canvas).getPropertyValue('--d_dark-grey'));

gl.clearColor(bgcol.r/256.0, bgcol.g/256.0, bgcol.b/256.0, 1);
gl.clearDepth(1.0);

let mousex = 0, mousey = 0;

document.addEventListener("mousemove", logKey);

function logKey(e) {
    if (e.screenX == NaN) return;
    mousex = 2.0 * (e.screenX / canvas.width - 0.5);
    mousey = 2.0 * (e.clientY / canvas.height - 0.5);
}

function distFromNArray(p, arr){
    let closestdist = Infinity;
    let ind = -1;
    arr.forEach((element, index) => {
        let d1 = element - p 
        if(Math.abs(d1) < Math.abs(closestdist)) {
            closestdist = d1
            ind = index
        }
    });
    return [Math.abs(closestdist), ind, closestdist/Math.abs(closestdist)];
}
breakpauses = [
    0,
    document.getElementById('firstBreak').getBoundingClientRect().top + window.scrollY,
    document.getElementById('secondBreak').getBoundingClientRect().top + window.scrollY
]

let cmin_starts = contents_minor.map((x) => (document.getElementById(x.getAttributeNode("href").value.substring(1)).getBoundingClientRect().top + window.scrollY))

let vehicle_pos_x = 0

var animate = function(time) { 
    let dt = (time - time_old) / 1000.0;
    time_old = time
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let [relscrolly, index, relscrolldir] = distFromNArray(window.scrollY, breakpauses); 
    let opmut = Math.min(Math.max(0, 1000 - Math.abs(relscrolly)), 800) / 800.0;
    canvas.style.opacity = String(opmut);
    console.log()
    if (!window.matchMedia("(max-width:1000pt)").matches)
        sidebar.style.opacity = String(2.0 - (opmut * 2));
    else 
        sidebar.style.opacity = String(1.0);

    let major_selected = 0;
    let minor_selected = 0;

    for(; major_selected < breakpauses.length; major_selected++){
        let cm = breakpauses[major_selected];
        if(window.scrollY + 200 <= cm)
            break;
    }
    major_selected -= 1;

    for(; minor_selected < cmin_starts.length; minor_selected++){
        let cm = cmin_starts[minor_selected];
        if(window.scrollY + 200 <= cm)
            break;
    }
    
    if(minor_selected != 0) minor_selected -= 1;

    for(let i = 0; i < contents_major.length; i++){
        contents_major[i].className = "major";
    }
    contents_major[major_selected].className = "major_selected";

    for(let i = 0; i < contents_minor.length; i++){
        contents_minor[i].className = "minor";
    }
    contents_minor[minor_selected].className = "minor_selected";

    switch(index) {
        case 2:
        case 0: {
            let scmut = Math.min(Math.max(0, 600 - relscrolly), 300) / 300.0;
            rot = glm.rotate(glm.mat4(1.), glm.radians((30*(1-scmut)) - 70.), glm.vec3(1.0, 0.0, 0.0));
            rot = glm.rotate(rot, glm.radians(mousex * 5), glm.vec3(0.0, 0.0, 1.0))
            rot = glm.rotate(rot, glm.radians(mousey * 5), glm.vec3(1.0, 0.0, 0.0))
            let sscrollspeed = index == 2 ? scrollspeed + ((1 - Math.min(Math.max(mousey, -0.6), 0.6)) * 5) : scrollspeed
            pos = glm.vec3(0, (pos.y - (sscrollspeed * dt * scmut)), -1.5);

            if (pos.y < -30) {pos.y += scaley}

            suntrans = glm.translate(rot, glm.vec3(0.0, (15 * scaley), 30.0));
            trans = glm.translate(rot, pos);
            trans2 = glm.translate(rot, glm.vec3(pos.x, pos.y + scaley, pos.z));

            let mountvertnum = lmountain_vb_wnormals.length / 6
        
            gl.useProgram(sunShader); 
            gl.bindBuffer(gl.ARRAY_BUFFER, sun_vb);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sun_ib);
            gl.uniformMatrix4fv(gl.getUniformLocation(sunShader, "trans"), false, suntrans.array);
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
            gl.vertexAttribPointer(mnt_vertpointer, 3, gl.FLOAT, false, 24,  0 ); 
            gl.vertexAttribPointer(mnt_normpointer, 3, gl.FLOAT, false, 24, 12 );
            gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans.array) 
            gl.drawArrays(gl.TRIANGLES, 0, mountvertnum)
            gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans2.array) 
            gl.drawArrays(gl.TRIANGLES, 0, mountvertnum)
            
            gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
            gl.vertexAttribPointer(mnt_vertpointer, 3, gl.FLOAT, false, 24,  0 ); 
            gl.vertexAttribPointer(mnt_normpointer, 3, gl.FLOAT, false, 24, 12 );
            gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans.array) 
            gl.drawArrays(gl.TRIANGLES, 0, mountvertnum)
            gl.uniformMatrix4fv(gl.getUniformLocation(mountains, "trans"), false, trans2.array) 
            gl.drawArrays(gl.TRIANGLES, 0, mountvertnum)

            gl.useProgram(lineShader);
            gl.bindBuffer(gl.ARRAY_BUFFER, road_vb);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, road_ib);
            gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array)
            gl.drawElements(gl.LINES, roadindex.length, gl.UNSIGNED_SHORT, 0);
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array)
            gl.drawElements(gl.LINES, roadindex.length, gl.UNSIGNED_SHORT, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, lmountain_vb);
            gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 24, 0 ); 
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array);
            gl.drawArrays(gl.LINE_STRIP, 0, mountvertnum)
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array); 
            gl.drawArrays(gl.LINE_STRIP, 0, mountvertnum)
            
            gl.bindBuffer(gl.ARRAY_BUFFER, rmountain_vb);
            gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 24, 0 );
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans.array) 
            gl.drawArrays(gl.LINE_STRIP, 0, mountvertnum);
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, trans2.array) 
            gl.drawArrays(gl.LINE_STRIP, 0, mountvertnum);

            gl.useProgram(starShader);
            gl.bindBuffer(gl.ARRAY_BUFFER, stars_vb);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stars_ib);
            gl.vertexAttribPointer(surf_vertpointer, 3, gl.FLOAT, false, 0, 0 );
            gl.uniformMatrix4fv(gl.getUniformLocation(starShader, "trans"), false, trans.array)
            gl.drawElements(gl.POINTS, starindex.length, gl.UNSIGNED_SHORT, 0);
            gl.uniformMatrix4fv(gl.getUniformLocation(starShader, "trans"), false, trans2.array)
            gl.drawElements(gl.POINTS, starindex.length, gl.UNSIGNED_SHORT, 0);

            if (index == 2){
                let nrot = glm.rotate(rot, glm.radians(90), glm.vec3(1.0, 0.0, 0.0));
                let _t = 1.0 * (1 - (sscrollspeed / 10)) +  0.95 * (sscrollspeed / 10)
                vehicle_pos_x = vehicle_pos_x * _t + (Math.max(Math.min(mousex, 0.32), -0.32) * 2 * (1 -_t))
                let dvpx = vehicle_pos_x - (Math.max(Math.min(mousex, 0.32), -0.32) * 2)
                let ntrans = glm.translate(nrot, glm.vec3(vehicle_pos_x, -1, -2 + mousey / 2))
                let nscale = glm.scale(ntrans, glm.vec3(0.15,0.15,0.15))
                ntrans = glm.rotate(nscale, glm.radians(180), glm.vec3(0.0, 1.0, 0.0));
                ntrans = glm.rotate(ntrans, glm.radians(dvpx * 40), glm.vec3(0.0, 1.0, 0.0));

                gl.useProgram(carShader)
                gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb0)
                gl.vertexAttribPointer(car_vertpointer0, 3, gl.FLOAT, false, 0, 0 );
                gl.vertexAttribPointer(car_vertpointer1, 3, gl.FLOAT, false, 0, 0 );
                gl.uniformMatrix4fv(gl.getUniformLocation(carShader, "trans"), false, ntrans.array)
                gl.drawArrays(gl.TRIANGLES, 0, vehicle_verticies0.position.length / 3)
                
                gl.useProgram(lineShader)
                gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb1)
                gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
                gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, ntrans.array)
                gl.drawArrays(gl.TRIANGLES, 0, vehicle_verticies1.position.length / 3)
            }
        }; break;
        case 1:{
            

            let ntrans = glm.translate(glm.mat4(1.0), glm.vec3(0, 0, -6))
            let nrot = glm.rotate(ntrans, glm.radians(30), glm.vec3(1.0, 0.0, 0.0))
            nrot = glm.rotate(nrot, glm.radians(relscrolly * 0.5 * relscrolldir + 90), glm.vec3(0.0, 1.0, 0.0))

            gl.useProgram(carShader)
            gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb0)
            gl.vertexAttribPointer(car_vertpointer0, 3, gl.FLOAT, false, 0, 0 );
            gl.vertexAttribPointer(car_vertpointer1, 3, gl.FLOAT, false, 0, 0 );
            gl.uniformMatrix4fv(gl.getUniformLocation(carShader, "trans"), false, nrot.array)
            gl.drawArrays(gl.TRIANGLES, 0, vehicle_verticies0.position.length / 3)

            gl.useProgram(lineShader)
            gl.bindBuffer(gl.ARRAY_BUFFER, vehicle_vb1)
            gl.vertexAttribPointer(line_vertpointer, 3, gl.FLOAT, false, 0, 0 );
            gl.uniformMatrix4fv(gl.getUniformLocation(lineShader, "trans"), false, nrot.array)
            gl.drawArrays(gl.TRIANGLES, 0, vehicle_verticies1.position.length / 3)
        } break;
    }

    window.requestAnimationFrame(animate);
}

animate(0);