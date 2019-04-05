var vertexShaderSource = `#version 300 es
	in vec4 a_position;
	in vec3 a_normal;

	//Model, View, and Projection Matrices
	uniform mat4 u_model;
	uniform mat4 u_view;
	uniform mat4 u_projection;

	out vec3 FragPos;
	out vec3 Normal;

	void main() {
	  FragPos = vec3(u_model * a_position);
	  Normal = mat3(transpose(inverse(u_model))) * a_normal;

	  gl_Position = u_projection * u_view * u_model * a_position;
	}
	`;

var fragmentShaderSource = `#version 300 es
	precision mediump float;


	in vec3 Normal;
	in vec3 FragPos;

	uniform vec3 lightPos;
	uniform vec3 viewPos; //camera position
	uniform vec3 lightColor;
	uniform vec3 objectColor;

	out vec4 outColor;

	void main() {
		// ambient
		float ambientStrength = 0.1;
		vec3 ambient = ambientStrength * lightColor;

		// diffuse
		vec3 norm = normalize(Normal);
		vec3 lightDir = normalize(lightPos - FragPos);
		float diff = max(dot(norm, lightDir), 0.0);
		vec3 diffuse = diff * lightColor;

		// specular
		float specularStrength = 0.5;
		vec3 viewDir = normalize(viewPos - FragPos);
		vec3 reflectDir = reflect(-lightDir, norm);
		float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
		vec3 specular = specularStrength * spec * lightColor;

		vec3 result = (ambient + diffuse + specular) * objectColor;
		outColor =  vec4(result, 1.0);
	}
	`;

// Get A WebGL context
var canvas = document.getElementById("c");
canvas.addEventListener("click", mouseClick);

// canvas.width = window.innerWidth - 25;
// canvas.height = window.innerHeight - 25;
var gl = canvas.getContext("webgl2");
if (!gl) {
  alert("webgl2 is not supported");
}

function mouseClick(event) {
  console.log(event.offsetX + " " + event.offsetY); //	Returns the coordinates of the mouse pointer relative to the position of the edge of the target element
}

// Use our boilerplate utils to compile the shaders and link into a program
var program = webglUtils.createProgramFromSources(gl, [
  vertexShaderSource,
  fragmentShaderSource
]);

var positions = [
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, -0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    -0.5, 0.5, -0.5, 0.0, 0.0, -1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,

    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    -0.5, 0.5, 0.5, 0.0, 0.0, 1.0,
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,

    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,
    -0.5, 0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, -0.5, -1.0, 0.0, 0.0,
    -0.5, -0.5, 0.5, -1.0, 0.0, 0.0,
    -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,

    0.5, 0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 0.0,
    0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, -0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    -0.5, -0.5, 0.5, 0.0, -1.0, 0.0,
    -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,

    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    -0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0
];


// Create a buffer and put three 2d clip space points in it
var positionBuffer = gl.createBuffer();
// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


// Create a vertex array object (attribute state)
var vao = gl.createVertexArray();
// and make it the one we're currently working with
gl.bindVertexArray(vao);
// look up where the vertex data needs to go.
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
var size = 3; // 2 components per iteration
var type = gl.FLOAT; // the data is 32bit floats
var normalize = false; // don't normalize the data
var stride = size * 4 * 2; // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0; // start at the beginning of the buffer
gl.vertexAttribPointer(
  positionAttributeLocation,
  size,
  type,
  normalize,
  stride,
  offset
);
// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// look up where the vertex data needs to go.
var normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
gl.vertexAttribPointer(
  normalAttributeLocation,
  3,
  gl.FLOAT,
  false,
  size * 4 * 2,
  size * 4
);
// Turn on the attribute
gl.enableVertexAttribArray(normalAttributeLocation);

// un-Bind the attribute/buffer set
gl.bindVertexArray(null);

// Tell WebGL how to convert from clip space to pixels
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0.95, 0.95, 0.95, 1);

// Tell it to use our program (pair of shaders)
gl.useProgram(program);

//create projection matrix
var projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, glMatrix.toRadian(45), 400 / 300, 0.01, 6);
//    mat4.ortho(projectionMatrix, -400, 400, -300, 300, 0.01, 6);

//assign the projection matrix to the program
var u_projectionLoc = gl.getUniformLocation(program, "u_projection");
gl.uniformMatrix4fv(u_projectionLoc, false, projectionMatrix);

// console.table(projectionMatrix);

//create view (camera attributes)
var viewMatrix = mat4.create();
mat4.lookAt(
  viewMatrix,
  [0, 0, 4], //Position of the viewer/camera
  [0, 0, 0], //Point the viewer/camera is looking at
  [0, 1, 0] //pointing up
);
//assign the view matrix to the program
var u_viewLoc = gl.getUniformLocation(program, "u_view");

gl.uniformMatrix4fv(u_viewLoc, false, viewMatrix);

gl.uniform3f(gl.getUniformLocation(program, "objectColor"), 1.0, 0.5, 0.31);
gl.uniform3f(gl.getUniformLocation(program, "lightColor"), 1.0, 1.0, 1.0);
gl.uniform3f(gl.getUniformLocation(program, "lightPos"), -1.0, 1.0, 5.0);
gl.uniform3f(gl.getUniformLocation(program, "viewPos"), 0.0, 0.0, 4.0);


//create model matrix
let angle = 1;
var modelMatrix = mat4.create(); //identity matrix
//assign the model matrix to the program
var u_modelLoc = gl.getUniformLocation(program, "u_model");

let up = true;
let right = true;
let deep = false;
let step = 0.011;
let colors = [Math.random(), Math.random(), Math.random()];
let randomColor=Math.floor(Math.random() * 3);
let colorCondition = [true, true, true];
let colorIncrement=0.005

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniform3f(
    gl.getUniformLocation(program, "lightPos"),
    modelMatrix[12] - 1.8,
    modelMatrix[13] + 5,
    5.0
  );
  gl.uniform3f(
    gl.getUniformLocation(program, "viewPos"),
    modelMatrix[12] - 0.5,
    modelMatrix[13] - 3,
    4.0
  );

  let moveUP = up ? step : -step;
  let moveRight = right ? step : -step;
  mat4.translate(modelMatrix, modelMatrix, [moveRight, moveUP, 0]);

  if (modelMatrix[13] > 0.97 * Math.abs(modelMatrix[5]) && up) {
    console.log("down");
    randomColor = Math.floor(Math.random() * 3);
    up = false;
  } else if (modelMatrix[13] < -0.98 * Math.abs(modelMatrix[5]) && !up) {
    console.log("up");
    randomColor = Math.floor(Math.random() * 3);
    up = true;
  }

  if (modelMatrix[12] > 1.45 * Math.abs(modelMatrix[0]) && right) {
    console.log("left");
    randomColor = Math.floor(Math.random() * 3);
    right = false;
  } else if (modelMatrix[12] < -1.46 * Math.abs(modelMatrix[0]) && !right) {
    console.log("right");
    randomColor = Math.floor(Math.random() * 3);
    right = true;
  }
  let changeColor=colorCondition[randomColor]?colorIncrement:-colorIncrement

  if (colors[randomColor] > 1 && colorCondition[randomColor]) {
    colorCondition[randomColor] = false;
  } else if (colors[randomColor] < 0 && !colorCondition[randomColor]) {
    colorCondition[randomColor] = true;
  }
  colors[randomColor]+=changeColor


  gl.uniform3f(
    gl.getUniformLocation(program, "objectColor"),
    colors[0],
    colors[1],
    colors[2]
  );

  gl.uniformMatrix4fv(u_modelLoc, false, modelMatrix);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0 * 2 * 3;
  var count = 6 * 2 * 3;
  gl.drawArrays(primitiveType, offset, count);

  // un-Bind the attribute/buffer
  gl.bindVertexArray(null);

  // Call drawScene again next frame
  requestAnimationFrame(drawScene);
}

//Call drawScene draw the first frame
drawScene();
