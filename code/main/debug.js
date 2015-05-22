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

    this.drawMapMeshLines=function(view,map,mesh)
    {
        var n;
        var gl=view.gl;

        this.debugShader.drawStart(view);

            // setup the buffers

        mesh.enableBuffers();
        mesh.bindBuffers(view,map.mapShader);

            // draw the line loop trigs

        for (n=0;n!==mesh.trigCount;n++) {
            gl.drawElements(gl.LINE_LOOP,3,gl.UNSIGNED_SHORT,(Uint16Array.BYTES_PER_ELEMENT*(n*3)));
        }

            // disable the buffers

        mesh.disableBuffers();

        this.debugShader.drawEnd(view);
    };

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

        this.debugShader.drawStart(view);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.debugShader.vertexPositionAttribute);
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

            // create the lines

        var vertices=new Float32Array(nBone*3);
        var indexes=new Uint16Array(nBone*2);

        vIdx=0;

        for (n=0;n!==nBone;n++) {
            vertices[vIdx++]=skeleton.bones[n].position.x+offsetPosition.x;
            vertices[vIdx++]=skeleton.bones[n].position.y+offsetPosition.y;
            vertices[vIdx++]=skeleton.bones[n].position.z+offsetPosition.z;
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

        this.debugShader.drawStart(view);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.debugShader.vertexPositionAttribute);
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

