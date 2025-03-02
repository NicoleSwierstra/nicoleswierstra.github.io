var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('webgl2');

canvas.width = window.screen.width;
canvas.height = window.screen.height; 

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-9999";
canvas.style.opacity = "1";

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

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

    if(mobileCheck()){
        mousex = Math.sin(time / 1000.0) * 0.6;
        mousey = Math.cos(time / 1000.0) * 0.6;
    }

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