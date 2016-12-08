
var gl;
var canvas;
var shaderProgram;
var terrainProgram;
var vertexNormalBuffer
var vertexPositionBuffer;
var vertexIndexBuffer;
var vertexColorBuffer;
var texR;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrix1 = mat4.create();
var pMatrix1 = mat4.create();
var mvMatrixStack = [];
var mvMatrixStack1 = [];

var change =0;
var modelYRotationRadians = degToRad(0);




function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

function uploadNormalMatrixToShader() {
  var a = mat3.create();
  var b = mat3.create();
  var nMatrix = mat3.create();
  mat3.fromMat4(a, mvMatrix);
  mat3.invert(b, a);
  mat3.transpose(nMatrix, b);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}


function lights(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}



function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function mvPushMatrix1() {
   var copy =mat4.clone(mvMatrix1);
   mvMatrixStack1.push(copy);
}

function mvPopMatrix1() {
    if(mvMatrixStack1.length ==0){
      throw "Invalid popMatrix!";
    }
    mvMatrix1 = mvMatrixStack1.pop();
}





function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadProjectionMatrixToShader();
    uploadNormalMatrixToShader();
}

function setMatrixUniformsforTerrain(){
    var nMatrix1= mat3.create();
    gl.uniformMatrix4fv(terrainProgram.mvMatrixUniform, false, mvMatrix1);
    gl.uniformMatrix4fv(terrainProgram.pMatrixUniform, false, pMatrix1);
    mat3.fromMat4(nMatrix1,mvMatrix1);
    mat3.transpose(nMatrix1,nMatrix1);
    mat3.invert(nMatrix1,nMatrix1);
    gl.uniformMatrix3fv(terrainProgram.nMatrixUniform, false, nMatrix1);

}


//change degress to Radians
function degToRad(degrees) {
        return degrees * Math.PI / 180;
} 


function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
    var c = names.length;
  for (var i=0; i<c; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}//end of create GL context


function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  
  if (!shaderScript) {
    return null;
  }
  
  
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { 
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

 

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
 
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.cubeMapSampler = gl.getUniformLocation(shaderProgram, "uCubeSampler");

  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
  
  gl.useProgram(shaderProgram);
  
}

function drawTeapot(){

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, theLondonEnvironment);
  gl.uniform1i(shaderProgram.cubeMapSampler, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
  
  gl.drawElements(gl.TRIANGLES, 6768, gl.UNSIGNED_SHORT, 0);

}


function initTerrainBuffer(){
  var vertexShader1 =loadShaderFromDOM("terrain-vs");
  var fragmentShader1 =loadShaderFromDOM("terrain-fs");
  terrainProgram = gl.createProgram();
  gl.attachShader(terrainProgram, vertexShader1);
  gl.attachShader(terrainProgram, fragmentShader1);
  gl.linkProgram(terrainProgram);

    
    
    
  if (!gl.getProgramParameter(terrainProgram, gl.LINK_STATUS)){
    alert("Failed to setup terrainshaders");
  }

 
  gl.useProgram(terrainProgram);
  terrainProgram.vertexNormalAttribute =gl.getAttribLocation(terrainProgram, "aVertexNormal1");
  gl.enableVertexAttribArray(terrainProgram.vertexNormalAttribute);

  terrainProgram.vertexPositionAttribute = gl.getAttribLocation(terrainProgram, "aVertexPosition1");

  gl.enableVertexAttribArray(terrainProgram.vertexPositionAttribute);

  terrainProgram.textureCoordAttribute = gl.getAttribLocation(terrainProgram, "aTexCoord");
  gl.enableVertexAttribArray(terrainProgram.textureCoordAttribute);

  terrainProgram.mvMatrixUniform = gl.getUniformLocation(terrainProgram, "uMVMatrix1");
  terrainProgram.pMatrixUniform = gl.getUniformLocation(terrainProgram, "uPMatrix1");
  terrainProgram.nMatrixUniform = gl.getUniformLocation(terrainProgram, "uNMatrix1");
 
  terrainProgram.TextureSamplerUniform = gl.getUniformLocation(terrainProgram, "uImage");

    
}



var tVertexPositionBuffer;
var tVertexNormalBuffer;
var tIndexTriBuffer;
var sceneTextureCoordBuffer
function setupTerrainBuffers() {
    
    var vTerrain=[];
    var fTerrain=[];
    var nTerrain=[];
    var eTerrain=[];
    var gridN=20;
    
    var numT = terrainFromIteration(gridN, -1,1,-1,1, vTerrain, fTerrain, nTerrain);
    
    tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW);
    tVertexPositionBuffer.itemSize = 3;
    tVertexPositionBuffer.numItems = (gridN+1)*(gridN+1);
    
    
    tVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nTerrain),
                  gl.STATIC_DRAW);
    tVertexNormalBuffer.itemSize = 3;
    tVertexNormalBuffer.numItems = (gridN+1)*(gridN+1);
    
    
    tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fTerrain),
                  gl.STATIC_DRAW);
    tIndexTriBuffer.itemSize = 1;
    tIndexTriBuffer.numItems = numT*3;

    sceneTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sceneTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generateTextureCoords(gridN)), gl.STATIC_DRAW);
    sceneTextureCoordBuffer.itemSize = 2;
    sceneTextureCoordBuffer.numItems = (gridN+1)*(gridN+1);
    

}



function xyToi(x, y, width, skip) {
  return skip * (width * y + x);
}

function generateTextureCoords(side) {
  var coords = [];
  for(var i = 0; i <=side; i++) { 
    for(var j = 0; j<=side; j++) { 
      coords[xyToi(j, i, side+1, 2)] = j/(side) + Math.random();
      coords[xyToi(j, i, side+1, 2) + 1] = i / side + 0.242;
     
    }
  }
  return coords;
}


function handleLoadedTexture(width,height) {

  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  
    gl.bindTexture(gl.TEXTURE_2D, null);
  
}//end 




function setupTextures() {
  
  texR = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
              new Uint8Array([255, 0, 0, 255]));
  var image = new Image();
  
  image.onload = function() {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, texR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    handleLoadedTexture(image.width,image.height);
  }
  
   image.src = 'Test.jpg';
}



function drawTerrain(){

 gl.polygonOffset(0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
 gl.vertexAttribPointer(terrainProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
 gl.vertexAttribPointer(terrainProgram.vertexNormalAttribute, 
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
 
  gl.bindBuffer(gl.ARRAY_BUFFER, sceneTextureCoordBuffer);
  gl.vertexAttribPointer(terrainProgram.textureCoordAttribute, sceneTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texR);
  gl.uniform1i(terrainProgram.TextureSamplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
  gl.drawElements(gl.TRIANGLES, tIndexTriBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}




function secondraw(){

    var transformVec = vec3.create();   
    mat4.perspective(pMatrix1,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0, pMatrix1);
    
    mvPushMatrix1();
    vec3.set(transformVec,0.2,-0.22,-3.0);
   
    mat4.translate(mvMatrix1, mvMatrix1,transformVec);
    mat4.rotateX(mvMatrix1, mvMatrix1, degToRad(-44));
    mat4.rotateZ(mvMatrix1, mvMatrix1, degToRad(22)); 

    setMatrixUniformsforTerrain(); 
    drawTerrain();
    mvPopMatrix1();

}



// Animate
function animate() {
    if (change!=0)
    {      now=Date.now();
    
        now = now* 0.004;   
        var dt = now - change;
       
        change = now;
        modelYRotationRadians += 0.6 * dt;
    }
    else    
         change = Date.now();
    
}


function loadteapot(){
    $.get('teapot.obj', function(data) {
    handleLoadedModel(getcoords(obj2json(data)));
    ready = true;
  });
}


function getcoords(data) {
    var numVertices = data.vertices.length / 3;
    var numTris = data.faceindex.length / 3;

    
    var triangles = new Array(numTris);
    
    var vertexIndices = new Array(numVertices);
    for(var i = 0; i < vertexIndices.length; i++)
        vertexIndices[i] = new Array();
  
    var u = vec3.create();
    var v = vec3.create();

    for(var i = 0; i < numTris; i++) 
    {
        
        var vii1 = 3 * i;
        var x2 = 3 * i + 1;
        var vii3 = 3 * i + 2; 
        var vi1 = data.faceindex[vii1] * 3;
        var vi2 = data.faceindex[x2] * 3;
        var x3 = data.faceindex[vii3] * 3;
      
        var v1 = [data.vertices[vi1], data.vertices[vi1 + 1], data.vertices[vi1 + 2]];
        var v2 = [data.vertices[vi2], data.vertices[vi2 + 1], data.vertices[vi2 + 2]];
        
        
        var v3 = [data.vertices[x3], data.vertices[x3 + 1], data.vertices[x3 + 2]];

        
        var normal = vec3.create();
        var normalized = vec3.create();
        vec3.subtract(u, v2, v1);
        vec3.subtract(v, v3, v1);
        vec3.cross(normal, u, v);
        vec3.normalize(normalized, normal);

       
        triangles[i] = normalized;
      
        vertexIndices[vi1 / 3].push(i);
        vertexIndices[vi2 / 3].push(i);
        vertexIndices[x3 / 3].push(i);
    }//end of for
      
    for(var i = 0; i < numVertices; i++) {
        var totalNormal = vec3.create();
        var temp = vec3.create();
        while(vertexIndices[i].length !== 0) {
            var currentTriangle = vertexIndices[i].pop();
            vec3.add(temp, totalNormal, triangles[currentTriangle]);
            vec3.copy(totalNormal, temp);
        }
        var normalized = vec3.create();
        vec3.normalize(normalized, totalNormal);
        data.vertexNormals[i * 3] = normalized[0];
        data.vertexNormals[i * 3 + 1] = normalized[1];
        data.vertexNormals[i * 3 + 2] = normalized[2];
        
    }
    
    return data;
}



function handleLoadedModel(data) {

  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numItems = data.vertices.length / 3;
  

  vertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexNormals), gl.STATIC_DRAW);
  vertexNormalBuffer.itemSize = 3;
  vertexNormalBuffer.numItems = data.vertexNormals.length / 3;
  

  vertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.faceindex), gl.STATIC_DRAW);
  vertexIndexBuffer.itemSize = 1;
  vertexIndexBuffer.numItems = data.faceindex.length;
  

  vertexColorBuffer= gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize=4;
  vertexColorBuffer.numItems=data.colors.length/4;
  

  
}


var theLondonEnvironment;
  
        
  function initEnvironmentCubeMap() {
    theLondonEnvironment = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, theLondonEnvironment);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    
    var cubeFaces = [
    ["3.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
    ["3.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
    ["3.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
    ["3.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
    ["3.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
    ["3.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
    ];

            var f = cubeFaces.length;
            for (var i = 0; i<f; i++) 
            {

                var image = new Image();
                image.src = cubeFaces[i][0];
                image.onload = function(texture, face, image) {

                    return function() {
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
                        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                    }
                } (theLondonEnvironment, cubeFaces[i][1], image);
            }

      
      
        };


function draw() { 
    var transformVec = vec3.create();
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0, pMatrix);
    mvPushMatrix();

    vec3.set(transformVec,0.7,0.8,-10.5);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateY(mvMatrix,mvMatrix,modelYRotationRadians);
    
    setMatrixUniforms(); 
    lights([0,1,1],[0.8,0.2,0.4],[1.0,0.1,0.4],[0.3,0.5,0.2]);   
    drawTeapot();   
    mvPopMatrix();

}



function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.2, 0.7, 0.2, 0.7);

  setupShaders();
  loadteapot();
  initEnvironmentCubeMap(); 
  initTerrainBuffer();
  setupTerrainBuffers();
  setupTextures();
  tick();

  
   
  
}//end of startuck


function tick() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    requestAnimFrame(tick);
    gl.useProgram(shaderProgram);
    draw();

    gl.useProgram(terrainProgram);
    secondraw();
   
    animate();
}

