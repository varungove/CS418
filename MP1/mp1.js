
var gl;
var canvas; // the canvas on which we are working
var shaderProgram;
var vertexPositionBuffer; // to hold position of thevertices
var check=document.getElementById("myCheck");

// Create a place to store vertex colors
var vertexColorBuffer;
var vertexColorBuffer2;
//creating the Matrix
var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;

var wireframeBuffer;

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//converting from degrees to radians
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//creating the GLContext
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"]; //context can be under these 2 names
  var context = null;
    //loop to find the context
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {  //if we found the context
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else { // if we were not able to find the context
    alert("Failed to create WebGL context!");
  }
  return context;
}

function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
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

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer); //binding the buffer
  var triangleVertices = [   //vertices for the trinagles. Using 12 triangles here
         -0.8,  0.8,  0.0,
        -0.8, 0.5,  0.0,
         -0.2, 0.5,  0.0,
      
      -0.8,  0.8,  0.0,
      0.0, 0.8, 0.0,
      -0.2, 0.5,  0.0,
      
      
      0.0, 0.8, 0.0,
      -0.2, 0.5,  0.0,
      0.2, 0.5, 0.0,
      
      
      0.0, 0.8, 0.0,
      0.2, 0.5, 0.0,
      0.8, 0.8, 0.0,
      
      0.2, 0.5, 0.0,
      0.8, 0.8, 0.0,
      0.8, 0.5, 0.0,
      
      -0.2, 0.5,  0.0,
       0.2, 0.5, 0.0,
      0.2, -0.5, 0.0,
      
      -0.2, 0.5,  0.0,
      0.2, -0.5, 0.0,
      -0.2, -0.5, 0.0,
      
      0.2, -0.5, 0.0,
      -0.2, -0.5, 0.0,
      0.0, -0.8, 0.0,
             
      -0.2, -0.5, 0.0,
      0.0, -0.8, 0.0,
      -0.8, -0.8, 0.0,
      
      -0.8, -0.8, 0.0,
      -0.2, -0.5, 0.0,
      -0.8, -0.5, 0.0,
      
       0.0, -0.8, 0.0,
       0.2, -0.5, 0.0,
      0.8, -0.8, 0.0,
      
      0.2, -0.5, 0.0,
      0.8, -0.8, 0.0,
      0.8, -0.5, 0.0
      
     
      
      
      
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3; // each vertice has 3 specifications
  vertexPositionBuffer.numberOfItems = 36; //36 verticies
    
   //creating the color buffers for the vertices
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer); //binding the color buffers
  var colors = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.6, 0.0, 1.0,

        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.8, 0.0, 1.0,

        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,

        1.0, 0.0, 1.0, 1.0,
        1.0, 0.4, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        

        1.0, 0.0, 0.8, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        

        1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.3, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.5, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.3, 0.0, 1.0,
        0.2, 0.0, 1.0, 1.0,
        1.0, 0.4, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0
        
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4; // number of specifications for each vertice
  vertexColorBuffer.numItems = 36;  //number of vertices
    
    wireframeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, wireframeBuffer); //binding the color buffers
      var wf = [
        -0.8, 0.8, 0.0,
        -0.2, 0.5, 0.0,
    
        -0.2, 0.5, 0.0,
        0.0, 0.8, 0.0,
    
        0.0, 0.8, 0.0,
        0.2, 0.5, 0.0,

        0.2, 0.5, 0.0,
         0.8, 0.8, 0.0,

         0.8, 0.8, 0.0,
         0.8, 0.5, 0.0,

         0.8, 0.8, 0.0,
         0.0, 0.8, 0.0,
    
         0.0, 0.8, 0.0,
         -0.8, 0.8, 0.0,

         -0.8, 0.8, 0.0,
        -0.8, 0.5, 0.0,

         -0.8, 0.5, 0.0,
        -0.2, 0.5, 0.0,

         -0.2, 0.5, 0.0,
         0.2,-0.5, 0.0,
    
         -0.2, 0.5, 0.0,
        -0.2,-0.5, 0.0,    

        0.2, 0.5, 0.0,
        0.2,-0.5, 0.0,    
    
        -0.2,-0.5, 0.0,    
         -0.8,-0.5, 0.0,

         -0.8,-0.5, 0.0,
         -0.8,-0.8, 0.0,

         -0.8,-0.8, 0.0,
         0.0,-0.8, 0.0,

         0.0,-0.8, 0.0,
         0.8,-0.8, 0.0,

         0.8,-0.8, 0.0,
        0.8,-0.5, 0.0,    
    
         0.8,-0.5, 0.0,
        0.2,-0.5, 0.0,

        0.2,-0.5, 0.0,
        0.8,-0.8, 0.0,
    
        0.2,-0.5, 0.0,
        0.0,-0.8, 0.0,    

        0.0,-0.8, 0.0,    
        -0.2,-0.5, 0.0,  
        
        -0.2, -0.5, 0.0,
        -0.8, -0.8, 0.0
    
];
 
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(wf), gl.STATIC_DRAW);
  wireframeBuffer.itemSize = 3; // number of specifications for each vertice
  wireframeBuffer.numItems = 44;  //number of vertices
    
    
    
    vertexColorBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer2); //binding the color buffers
  var colors2 = [
      
      
      
      1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,

        1.0, 0.0, 1.0, 1.0,
        1.0, 0.4, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        

        1.0, 0.0, 0.8, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 1.0, 1.0,
        

        1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.3, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.5, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
       

        1.0, 1.0, 1.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        

        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        
        
        
        
        1.0, 0.3, 0.0, 1.0,
        0.2, 0.0, 1.0, 1.0,
        1.0, 0.4, 0.0, 1.0,
      
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      
      1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0,
        1.0, 0.2, 0.0, 1.0
        
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors2), gl.STATIC_DRAW);
  vertexColorBuffer2.itemSize = 4; // number of specifications for each vertice
  vertexColorBuffer2.numItems = 44;  //number of vertices
    
}

function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  mat4.identity(mvMatrix);
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));
    
    mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));

    mat4.scale(mvMatrix,mvMatrix,[rotAngle/400,rotAngle/160,rotAngle/240])
//  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
//  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
//                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
//  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
//  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
//                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
//  
    
  
    
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
    
   
    
    gl.bindBuffer(gl.ARRAY_BUFFER, wireframeBuffer);
     gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                                 wireframeBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer2);
     gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                                 vertexColorBuffer2.itemSize, gl.FLOAT, false, 0, 0);
    
   setMatrixUniforms();
   gl.drawArrays(gl.LINES, 0, wireframeBuffer.numberOfItems);
}

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+1.0) % 360;
    }
    lastTime = timeNow;
}

//first function called

function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();  //setting up the Shaders
  setupBuffers();  //setting up the Buffers
  gl.clearColor(0.0, 0.0, 0.0, 1.0); //clears the current colors
  gl.enable(gl.DEPTH_TEST);
  tick();
}

function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

