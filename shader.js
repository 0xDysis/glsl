var canvas = document.getElementById('glCanvas');
var gl = canvas.getContext('webgl');

var vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0, 1);
    }
`;

var fragmentShaderSource = `
    precision lowp float;
    uniform vec2 iResolution;
    uniform float iTime;
    void main() {
        vec2 uv =  (1.0 * gl_FragCoord.xy - iResolution) / max(iResolution.x, iResolution.y);
        vec2 uvOriginal = uv;
        float slowerTime = iTime / 4.0;
        for(float i = 1.0; i < 9.0; i++){
            uv.x += 0.6 / i * cos(i * 2.5* uv.y + slowerTime);
            uv.y += 0.6 / i * cos(i * 1.5 * uv.x + slowerTime );
            uv.x += 0.4 / i * sin(i - 2.5 * uvOriginal.y + slowerTime);
            uv.y += 0.4 / i * sin(i * 1.5 * uvOriginal.x + slowerTime + sin(slowerTime));
            uv.y  -= .2;
        }
        vec3 color = vec3(0.2)/abs(sin(slowerTime-uv.y-uv.x));
        float brightness = dot(color, vec3(0.299, 0.587, 0.114));
        vec3 glow = smoothstep(0.8, 5.0, brightness) * color;
        gl_FragColor = vec4(color + sin(glow), 3.05);
    }
`;

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);
var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
var positions = [
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

var iResolutionUniformLocation = gl.getUniformLocation(program, "iResolution");
gl.uniform2f(iResolutionUniformLocation, canvas.width, canvas.height);

var iTimeUniformLocation = gl.getUniformLocation(program, "iTime");
var startTime = Date.now();
function animate() {
    var currentTime = Date.now();
    var elapsedTime = (currentTime - startTime) / 1000; // in seconds
    gl.uniform1f(iTimeUniformLocation, elapsedTime);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(animate);
}
animate();
