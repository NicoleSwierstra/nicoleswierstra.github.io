export { getShaderFrom, getShaderFromFile, Shader };

function getShaderFrom(vert, frag){
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vert);
    gl.compileShader(vertShader);

    var compiled = gl.getShaderParameter(vertShader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(vertShader);
    console.log('Shader compiler log: ' + compilationLog);
    
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, frag);
    gl.compileShader(fragShader);

    var compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(fragShader);
    console.log('Shader compiler log: ' + compilationLog);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    
    return shaderProgram;
}

async function getShaderFromFile(path){
    let fs = new FileReaderSync();
    var allContents = await fetch(path).then(x => x.text());

    var shaders = ["", ""];
    var type = 0;
    allContents.split(/\r?\n/).forEach((line) => {
        if (line.startsWith("#shader")) {
            if (line.includes("vertex")) {
                type = 0;
            }
            else if (line.includes("geometry")) {
                type = -1;
            }
            else if (line.includes("fragment")) {
                type = 1;
            }
        }
        else if(type != ShaderType.NONE) {
            shaders[type] += line + '\n';
        }
    });
    return getShaderFrom(shaders[0], shaders[1]); 
}

class Shader{
    constructor(filepath){
        this.id = getShaderFromFile(filepath);
    }

    bind(){
        gl.useProgram(this.id);
    }
}