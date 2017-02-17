var gl;
var program;
var canvas;
var fre=new Uint8Array(47*4);
for(var i=0;i<47;i++)fre[i*4]=255;
var count=[];
var frtex;
window.onload=function(){
	canvas=document.getElementById("transpic");
	if(canvas && canvas.getContext){
		gl=canvas.getContext("webgl");
			gl.clearColor(0.0,0.0,0.0,0.0);
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			program=gl.createProgram();
			setShader("vs",document.getElementById("vshader").text);
			setShader("fs",document.getElementById("fshader").text);
			gl.linkProgram(program);
			gl.useProgram(program);
			loadImg("img/keyboard.png");
	}
}

function setShader(type,tx){
	var shader;
	if(type=="vs"){
		shader=gl.createShader(gl.VERTEX_SHADER);
	}else if(type=="fs"){
		shader=gl.createShader(gl.FRAGMENT_SHADER);
	}
	gl.shaderSource(shader,tx);
	gl.compileShader(shader);
	
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS) && !gl.isContextLost()){
		var infoLog=gl.getShaderInfoLog(shader);
		if(infoLog.length>0){
			console.log(type+" shader compile error: "+infoLog);
		}
		return null;
	}
	gl.attachShader(program,shader);
}

function loadImg(src){
	var limg=new Image();
	limg.src=src;
	limg.onload=function(){
		canvas.width=window.innerWidth*0.7;
		canvas.height=limg.naturalHeight*canvas.width/limg.naturalWidth;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
		render(limg);
	}
}

function render(img){
	textAnal();
	var vpos=gl.getAttribLocation(program,"vpos");
	var textbuffer=gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,textbuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		-1.0,1.0,
		1.0,1.0,
		-1.0,-1.0,
		-1.0,-1.0,
		1.0,-1.0,
		1.0,1.0		
	]),gl.STATIC_DRAW);
	gl.enableVertexAttribArray(vpos);
	gl.vertexAttribPointer(vpos,2,gl.FLOAT,false,0,0);
	
	var texture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	
	frtex=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,frtex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 47,1,0,gl.RGBA, gl.UNSIGNED_BYTE,fre);
	
	gl.uniform1i(gl.getUniformLocation(program,"us"),0);
	gl.uniform1i(gl.getUniformLocation(program,"fre"),1);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,texture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D,frtex);

	var cw=gl.getUniformLocation(program,"scwidth");
	var ch=gl.getUniformLocation(program,"scheight");
	gl.uniform1i(cw,canvas.width);
	gl.uniform1i(ch,canvas.height);
	
	gl.drawArrays(gl.TRIANGLES,0,6);
}

function reRender(){
	textAnal();
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 47,1,0,gl.RGBA, gl.UNSIGNED_BYTE,fre);
	gl.drawArrays(gl.TRIANGLES,0,6);
}

function textAnal(){
	context=document.getElementById("input").value;
	var most=0;
	for(var i=0;i<47;i++){
		fre[i*4+3]=0;
		count[i]=0;
	}
	for(var i=0;i<context.length;i++){
		var c=context[i];
		count[keyvalue[c]]++;
		if(most<count[keyvalue[c]])most=count[keyvalue[c]];
	}
	for(var i=0;i<47;i++){
		fre[i*4+3]=Math.floor(count[i]/most*255);
	}
}