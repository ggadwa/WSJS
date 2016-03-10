"use strict";

//
// debug class
//

class DebugClass
{
    constructor()
    {
        this.debugShader=new DebugShaderClass();
    }
    
        //
        // initialize/release debug
        //

    initialize(view,fileCache)
    {
        return(this.debugShader.initialize(view,fileCache));
    }

    release(view)
    {
        this.debugShader.release(view);
    }

        //
        // draw lines around map mesh
        //

    drawMapMeshLines(view,mesh)
    {
        var n;
        var gl=view.gl;

        this.debugShader.drawStart(view,new wsColor(1.0,0.0,0.0));
        gl.disable(gl.DEPTH_TEST);
        
            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,mesh.drawVertices,gl.STREAM_DRAW);

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
    }

        //
        // normal and tangents
        //
        
    drawMapMeshNormals(view,mesh)
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
            vertices[vIdx++]=mesh.drawVertices[vertexIdx];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+1];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+2];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx]+(mesh.drawNormals[vertexIdx]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+1]+(mesh.drawNormals[vertexIdx+1]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+2]+(mesh.drawNormals[vertexIdx+2]*normalSize);

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
    }
    
    drawMapMeshTangents(view,mesh)
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
            vertices[vIdx++]=mesh.drawVertices[vertexIdx];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+1];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+2];
            vertices[vIdx++]=mesh.drawVertices[vertexIdx]+(mesh.drawTangents[vertexIdx]*tangentSize);
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+1]+(mesh.drawTangents[vertexIdx+1]*tangentSize);
            vertices[vIdx++]=mesh.drawVertices[vertexIdx+2]+(mesh.drawTangents[vertexIdx+2]*tangentSize);

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
    }

        //
        // draw skeleton
        //

    drawModelSkeleton(view,model,angle,position)
    {
        var n,lineCount,vIdx,iIdx;
        var gl=view.gl;
        
        var skeleton=model.skeleton;
        if (skeleton===null) return;
        
        var nBone=skeleton.bones.length;
        
            // draw all this without depth testing
            
        gl.disable(gl.DEPTH_TEST);

            // create the lines

        var vertices=new Float32Array(nBone*3);
        var indexes=new Uint16Array(nBone*2);
        
        var rotVector=new wsPoint(0,0,0);

        vIdx=0;

        for (n=0;n!==nBone;n++) {
            rotVector.setFromPoint(skeleton.bones[n].curPosePosition);
            rotVector.rotate(angle);

            vertices[vIdx++]=rotVector.x+position.x;
            vertices[vIdx++]=rotVector.y+position.y;
            vertices[vIdx++]=rotVector.z+position.z;
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
        
            // bring back depth test
            
        gl.enable(gl.DEPTH_TEST);
        
            // now the bones, use the particle engine
            
        var particle=view.particleList.getFree();
        if (particle!==null) {
            
            particle.setCount(nBone);
            particle.setRadius(50,50);
            particle.setMovement(1.0);
            particle.setCenterPointFromPoint(position);      // particles are offsets from center point
            particle.setAlpha(1.0,1.0);
            particle.setColor(0.0,1.0,1.0,0.0,1.0,1.0);
            particle.setTiming(view.timeStamp,0);       // want it to immediately die after next draw
            particle.setNoDepthTest(true);
            
            var pnt;

            for (n=0;n!==nBone;n++) {
                pnt=particle.getPoint(n);
                pnt.setFromPoint(skeleton.bones[n].curPosePosition);
                pnt.rotate(angle);
            }
        }
    }
    
        //
        // draw model tangent space
        //
        
    drawModelMeshNormals(view,model)
    {
        var n,vIdx,iIdx,drawIdx,nVertex;
        var gl=view.gl;
        var normalSize=200.0;
        
        var mesh=model.mesh;
        
            // create the lines

        nVertex=mesh.vertexCount;

        var vertices=new Float32Array(nVertex*6);
        var indexes=new Uint16Array(nVertex*2);

        vIdx=0;
        iIdx=0;
        drawIdx=0;
        
        var v;

        for (n=0;n!==nVertex;n++) {
            v=mesh.vertexList[n];
            
            vertices[vIdx++]=mesh.drawVertices[drawIdx];
            vertices[vIdx++]=mesh.drawVertices[drawIdx+1];
            vertices[vIdx++]=mesh.drawVertices[drawIdx+2];
            vertices[vIdx++]=mesh.drawVertices[drawIdx]+(mesh.drawNormals[drawIdx]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[drawIdx+1]+(mesh.drawNormals[drawIdx+1]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[drawIdx+2]+(mesh.drawNormals[drawIdx+2]*normalSize);
            
            drawIdx+=3;

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
    }
    
    drawModelMeshTangents(view,model)
    {
        var n,vIdx,iIdx,drawIdx,nVertex;
        var gl=view.gl;
        var normalSize=200.0;
        
        var mesh=model.mesh;
        
            // create the lines

        nVertex=mesh.vertexCount;

        var vertices=new Float32Array(nVertex*6);
        var indexes=new Uint16Array(nVertex*2);

        vIdx=0;
        iIdx=0;
        drawIdx=0;
        
        var v;

        for (n=0;n!==nVertex;n++) {
            v=mesh.vertexList[n];
            
            vertices[vIdx++]=mesh.drawVertices[drawIdx];
            vertices[vIdx++]=mesh.drawVertices[drawIdx+1];
            vertices[vIdx++]=mesh.drawVertices[drawIdx+2];
            vertices[vIdx++]=mesh.drawVertices[drawIdx]+(mesh.drawTangents[drawIdx]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[drawIdx+1]+(mesh.drawTangents[drawIdx+1]*normalSize);
            vertices[vIdx++]=mesh.drawVertices[drawIdx+2]+(mesh.drawTangents[drawIdx+2]*normalSize);
            
            drawIdx+=3;

            indexes[iIdx]=iIdx;
            iIdx++;
            
            indexes[iIdx]=iIdx;
            iIdx++;
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

        gl.drawElements(gl.LINES,iIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd(view);
    }
    
        //
        // draw model mesh lines
        //
        
    drawModelMeshLines(view,model)
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
            vertices[vIdx]=mesh.drawVertices[vIdx];
            vertices[vIdx+1]=mesh.drawVertices[vIdx+1];
            vertices[vIdx+2]=mesh.drawVertices[vIdx+2];
            vIdx+=3;
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
    }

        //
        // display a canvas on page (for debuginning bitmaps)
        //

    displayCanvasData(fromCanvas,lft,top,wid,high)
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
    }
    
        //
        // display a canvas on page (for debuginning sound data)
        //

    displaySoundData(data,lft,top,wid,high)
    {
        var n,fx,fxAdd,y,halfHigh;
        var dataLen=data.length;
        
        console.log(dataLen);
        
        var cvs=document.createElement('canvas');
        cvs.style.position="absolute";
        cvs.style.left=lft+'px';
        cvs.style.top=top+'px';
        cvs.style.border='1px solid #000000';
        cvs.width=wid;
        cvs.height=high;
        
            // get x divisions
        
        fx=0;
        fxAdd=wid/dataLen;
        halfHigh=Math.trunc(high/2);
        
            // draw the wave

        var ctx=cvs.getContext('2d');
        
        ctx.strokeStyle='#0000FF';
        ctx.beginPath();
        
        y=halfHigh+Math.trunc(data[0]*halfHigh);
        ctx.moveTo(Math.trunc(fx),y);

        for (n=1;n<dataLen;n++) {
            fx+=fxAdd;
            y=halfHigh+Math.trunc(data[n]*halfHigh);
            ctx.lineTo(Math.trunc(fx),y);
        }

        ctx.stroke();

        document.body.appendChild(cvs);
    }
}

