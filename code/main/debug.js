"use strict";

//
// debug class
//

function DebugObject()
{
    this.debugShader=new DebugShaderObject();
    
        //
        // initialize/release debug
        //

    this.initialize=function(view)
    {
        return(this.debugShader.initialize(view));
    };

    this.release=function(view)
    {
        this.debugShader.release(view);
    };

        //
        // draw lines around map mesh
        //

    this.drawMapMeshLines=function(view,mesh)
    {
        var n;
        var gl=view.gl;

        this.debugShader.drawStart(view,new wsColor(1.0,0.0,0.0));
        gl.disable(gl.DEPTH_TEST);
        
            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indexes,gl.STREAM_DRAW);

            // draw the line loop trigs

        for (n=0;n!==mesh.trigCount;n++) {
            gl.drawElements(gl.LINE_LOOP,3,gl.UNSIGNED_SHORT,(Uint16Array.BYTES_PER_ELEMENT*(n*3)));
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    };

        //
        // normal and tangents
        //
        
    this.drawMapMeshNormals=function(view,mesh)
    {
        var n,vertexIdx,elementIdx,vIdx,iIdx,nVertex;
        var gl=view.gl;
        var normalSize=200.0;
        
            // create the lines

        nVertex=mesh.vertexCount;

        var vertices=new Float32Array(nVertex*6);
        var indexes=new Uint16Array(nVertex*2);

        vertexIdx=0;
        elementIdx=0;

        vIdx=0;
        iIdx=0;

        for (n=0;n!==nVertex;n++) {
            vertices[vIdx++]=mesh.vertices[vertexIdx];
            vertices[vIdx++]=mesh.vertices[vertexIdx+1];
            vertices[vIdx++]=mesh.vertices[vertexIdx+2];
            vertices[vIdx++]=mesh.vertices[vertexIdx]+(mesh.normals[vertexIdx]*normalSize);
            vertices[vIdx++]=mesh.vertices[vertexIdx+1]+(mesh.normals[vertexIdx+1]*normalSize);
            vertices[vIdx++]=mesh.vertices[vertexIdx+2]+(mesh.normals[vertexIdx+2]*normalSize);

            indexes[iIdx++]=elementIdx;
            indexes[iIdx++]=elementIdx+1;

            vertexIdx+=3;
            elementIdx+=2;
        }

            // set the shader

        this.debugShader.drawStart(view,new wsColor(1.0,0.0,1.0));
        gl.disable(gl.DEPTH_TEST);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,elementIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    };
    
    this.drawMapMeshTangents=function(view,mesh)
    {
        var n,vertexIdx,elementIdx,vIdx,iIdx,nVertex;
        var gl=view.gl;
        var tangentSize=200.0;
        
            // create the lines

        nVertex=mesh.vertexCount;

        var vertices=new Float32Array(nVertex*6);
        var indexes=new Uint16Array(nVertex*2);

        vertexIdx=0;
        elementIdx=0;

        vIdx=0;
        iIdx=0;

        for (n=0;n!==nVertex;n++) {
            vertices[vIdx++]=mesh.vertices[vertexIdx];
            vertices[vIdx++]=mesh.vertices[vertexIdx+1];
            vertices[vIdx++]=mesh.vertices[vertexIdx+2];
            vertices[vIdx++]=mesh.vertices[vertexIdx]+(mesh.tangents[vertexIdx]*tangentSize);
            vertices[vIdx++]=mesh.vertices[vertexIdx+1]+(mesh.tangents[vertexIdx+1]*tangentSize);
            vertices[vIdx++]=mesh.vertices[vertexIdx+2]+(mesh.tangents[vertexIdx+2]*tangentSize);

            indexes[iIdx++]=elementIdx;
            indexes[iIdx++]=elementIdx+1;

            vertexIdx+=3;
            elementIdx+=2;
        }

            // set the shader

        this.debugShader.drawStart(view,new wsColor(0.0,0.0,1.0));
        gl.disable(gl.DEPTH_TEST);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,elementIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    };

        //
        // draw skeleton
        //

    this.drawModelSkeleton=function(view,model,offsetPosition)
    {
        var n,lineCount,vIdx,iIdx;
        var skeleton=model.skeleton;
        var nBone=skeleton.bones.length;
        var gl=view.gl;
        
            // draw all this without depth testing
            
        gl.disable(gl.DEPTH_TEST);

            // create the lines

        var vertices=new Float32Array(nBone*3);
        var indexes=new Uint16Array(nBone*2);

        vIdx=0;

        for (n=0;n!==nBone;n++) {
            vertices[vIdx++]=skeleton.bones[n].curPosePosition.x+offsetPosition.x;
            vertices[vIdx++]=skeleton.bones[n].curPosePosition.y+offsetPosition.y;
            vertices[vIdx++]=skeleton.bones[n].curPosePosition.z+offsetPosition.z;
        }

        iIdx=0;
        lineCount=0;

        for (n=0;n!==nBone;n++) {
            if (skeleton.bones[n].parentBoneIdx===-1) continue;

            indexes[iIdx++]=n;
            indexes[iIdx++]=skeleton.bones[n].parentBoneIdx;

            lineCount++;
        }

            // set the shader

        this.debugShader.drawStart(view,new wsColor(0.0,1.0,0.0));

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,(lineCount*2),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd(view);
        
            // now the bones, use the particle engine
            
        var particlePoints=[];
        var pnt;
        
        for (n=0;n!==nBone;n++) {
            pnt=new wsPoint(skeleton.bones[n].curPosePosition.x,skeleton.bones[n].curPosePosition.y,skeleton.bones[n].curPosePosition.z);
            pnt.addPoint(offsetPosition);
            particlePoints.push(pnt);
        }
            
        view.particle.drawStart(view);
        view.particle.draw(view,particlePoints,50,new wsColor(0.0,1.0,1.0));
        view.particle.drawEnd(view);
        
            // bring back depth test
            
        gl.enable(gl.DEPTH_TEST);
    };
    
        //
        // draw model tangent space
        //
        
    this.drawModelMeshNormals=function(view,model,offsetPosition)
    {
        var n,vIdx,iIdx,nVertex;
        var gl=view.gl;
        var normalSize=200.0;
        
        var mesh=model.mesh;
        
            // create the lines

        nVertex=mesh.vertexCount;

        var vertices=new Float32Array(nVertex*6);
        var indexes=new Uint16Array(nVertex*2);

        vIdx=0;
        iIdx=0;
        
        var v;

        for (n=0;n!==nVertex;n++) {
            v=mesh.vertexList[n];
            
            vertices[vIdx++]=v.position.x+offsetPosition.x;
            vertices[vIdx++]=v.position.y+offsetPosition.y;
            vertices[vIdx++]=v.position.z+offsetPosition.z;
            vertices[vIdx++]=(v.position.x+offsetPosition.x)+(v.normal.x*normalSize);
            vertices[vIdx++]=(v.position.y+offsetPosition.y)+(v.normal.y*normalSize);
            vertices[vIdx++]=(v.position.z+offsetPosition.z)+(v.normal.z*normalSize);

            indexes[iIdx]=iIdx;
            iIdx++;
            
            indexes[iIdx]=iIdx;
            iIdx++;
        }

            // set the shader

        this.debugShader.drawStart(view,new wsColor(1.0,0.0,1.0));
        gl.disable(gl.DEPTH_TEST);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,iIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    };
    
        //
        // draw model mesh lines
        //
        
    this.drawModelMeshLines=function(view,model,offsetPosition)
    {
        var n;
        var gl=view.gl;
        
        var mesh=model.mesh;
        
            // get the offset vertices
        
        var nVertex=mesh.vertexCount;
        
        var vertices=new Float32Array(nVertex*3);

        var vIdx=0;
        var v;

        for (n=0;n!==nVertex;n++) {
            v=mesh.vertexList[n];
            vertices[vIdx++]=v.position.x+offsetPosition.x;
            vertices[vIdx++]=v.position.y+offsetPosition.y;
            vertices[vIdx++]=v.position.z+offsetPosition.z;
        }

            // start the shader
            
        this.debugShader.drawStart(view,new wsColor(1.0,0.0,0.0));
        gl.disable(gl.DEPTH_TEST);
        
            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indexes,gl.STREAM_DRAW);

            // draw the line loop trigs

        for (n=0;n!==mesh.trigCount;n++) {
            gl.drawElements(gl.LINE_LOOP,3,gl.UNSIGNED_SHORT,(Uint16Array.BYTES_PER_ELEMENT*(n*3)));
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    };

        //
        // display a canvas on page (for debuginning bitmaps)
        //

    this.displayCanvasData=function(fromCanvas,lft,top,wid,high)
    {
        var cvs=document.createElement('canvas');
        cvs.style.position="absolute";
        cvs.style.left=lft+'px';
        cvs.style.top=top+'px';
        cvs.style.border='1px solid #000000';
        cvs.width=wid;
        cvs.height=high;

        var ctx=cvs.getContext('2d');
        ctx.drawImage(fromCanvas,0,0,wid,high);

        document.body.appendChild(cvs);
    };

}

