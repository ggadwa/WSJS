import PointClass from '../../code/utility/point.js';
import ColorClass from '../../code/utility/color.js';
import DebugShaderClass from '../../code/debug/debug_shader.js';

//
// debug class
//

export default class DebugClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.debugShader=new DebugShaderClass(view,fileCache);
        
        Object.seal(this);
    }
    
        //
        // initialize/release debug
        //

    initialize()
    {
        return(this.debugShader.initialize());
    }

    release()
    {
        this.debugShader.release();
    }

        //
        // draw lines around map mesh
        //

    drawMapMeshLines(mesh)
    {
        let n,vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;

        this.debugShader.drawStart(new ColorClass(1.0,0.0,0.0));
        
            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,mesh.drawVertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indexes,gl.STREAM_DRAW);

            // draw the line loop trigs

        gl.depthFunc(gl.LEQUAL);
        
        for (n=0;n!==mesh.trigCount;n++) {
            gl.drawElements(gl.LINE_LOOP,3,gl.UNSIGNED_SHORT,(Uint16Array.BYTES_PER_ELEMENT*(n*3)));
        }
        
        gl.depthFunc(gl.LESS);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }

        //
        // normal and tangents
        //
        
    drawMapMeshNormals(mesh)
    {
        let n,vertexIdx,elementIdx,vIdx,iIdx,nVertex;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        let normalSize=200.0;
        
            // create the lines

        nVertex=mesh.vertexCount;

        vertices=new Float32Array(nVertex*6);
        indexes=new Uint16Array(nVertex*2);

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

        this.debugShader.drawStart(new ColorClass(1.0,0.0,1.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,elementIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }
    
    drawMapMeshTangents(mesh)
    {
        let n,vertexIdx,elementIdx,vIdx,iIdx,nVertex;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        let tangentSize=200.0;
        
            // create the lines

        nVertex=mesh.vertexCount;

        vertices=new Float32Array(nVertex*6);
        indexes=new Uint16Array(nVertex*2);

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

        this.debugShader.drawStart(new ColorClass(0.0,0.0,1.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,elementIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }
    
        //
        // draw hit box
        //
        
    drawModelHitBox(model,radius,high,angle,position)
    {
        let vIdx,iIdx;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        
            // create the lines

        vertices=new Float32Array(24);      // 8 points
        indexes=new Uint16Array(24);        // 12 lines
        
        vIdx=0;
        
        vertices[vIdx++]=position.x-radius;
        vertices[vIdx++]=position.y;
        vertices[vIdx++]=position.z-radius;
        
        vertices[vIdx++]=position.x-radius;
        vertices[vIdx++]=position.y;
        vertices[vIdx++]=position.z+radius;
        
        vertices[vIdx++]=position.x+radius;
        vertices[vIdx++]=position.y;
        vertices[vIdx++]=position.z+radius;
        
        vertices[vIdx++]=position.x+radius;
        vertices[vIdx++]=position.y;
        vertices[vIdx++]=position.z-radius;
        
        vertices[vIdx++]=position.x-radius;
        vertices[vIdx++]=position.y-high;
        vertices[vIdx++]=position.z-radius;
        
        vertices[vIdx++]=position.x-radius;
        vertices[vIdx++]=position.y-high;
        vertices[vIdx++]=position.z+radius;
        
        vertices[vIdx++]=position.x+radius;
        vertices[vIdx++]=position.y-high;
        vertices[vIdx++]=position.z+radius;
        
        vertices[vIdx++]=position.x+radius;
        vertices[vIdx++]=position.y-high;
        vertices[vIdx++]=position.z-radius;

        iIdx=0;
        
        indexes[iIdx++]=0;
        indexes[iIdx++]=1;
        indexes[iIdx++]=1;
        indexes[iIdx++]=2;
        indexes[iIdx++]=2;
        indexes[iIdx++]=3;
        indexes[iIdx++]=3;
        indexes[iIdx++]=0;
        
        indexes[iIdx++]=4;
        indexes[iIdx++]=5;
        indexes[iIdx++]=5;
        indexes[iIdx++]=6;
        indexes[iIdx++]=6;
        indexes[iIdx++]=7;
        indexes[iIdx++]=7;
        indexes[iIdx++]=4;
        
        indexes[iIdx++]=0;
        indexes[iIdx++]=4;
        indexes[iIdx++]=1;
        indexes[iIdx++]=5;
        indexes[iIdx++]=2;
        indexes[iIdx++]=6;
        indexes[iIdx++]=3;
        indexes[iIdx++]=7;

            // set the shader

        this.debugShader.drawStart(new ColorClass(1.0,1.0,0.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,24,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }

        //
        // draw skeleton
        //

    drawModelSkeleton(model,angle,position)
    {
        let n,nBone,lineCount,vIdx,iIdx;
        let rotVector,particle,pnt;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl; 
        let skeleton=model.skeleton;
        
        if (skeleton===null) return;
        
        nBone=skeleton.bones.length;
        
            // draw all this without depth testing
            
        gl.disable(gl.DEPTH_TEST);

            // create the lines

        vertices=new Float32Array(nBone*3);
        indexes=new Uint16Array(nBone*2);
        
        rotVector=new PointClass(0,0,0);

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

        this.debugShader.drawStart(new ColorClass(0.0,1.0,0.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,(lineCount*2),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
        
            // bring back depth test
            
        gl.enable(gl.DEPTH_TEST);
        
            // now the bones, use the particle engine
        
        particle=particleList.addDebugParticles(position,nBone);
        if (particle!==null) {            
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
        
    drawModelMeshNormals(model)
    {
        let n,v,vIdx,iIdx,drawIdx,nVertex;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        let normalSize=200.0;
        let mesh=model.mesh;
        
            // create the lines

        nVertex=mesh.vertexCount;

        vertices=new Float32Array(nVertex*6);
        indexes=new Uint16Array(nVertex*2);

        vIdx=0;
        iIdx=0;
        drawIdx=0;

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

        this.debugShader.drawStart(new ColorClass(1.0,0.0,1.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,iIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }
    
    drawModelMeshTangents(model)
    {
        let n,v,vIdx,iIdx,drawIdx,nVertex;
        let vertices,indexes;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        let normalSize=200.0;
        let mesh=model.mesh;
        
            // create the lines

        nVertex=mesh.vertexCount;

        vertices=new Float32Array(nVertex*6);
        indexes=new Uint16Array(nVertex*2);

        vIdx=0;
        iIdx=0;
        drawIdx=0;

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

        this.debugShader.drawStart(new ColorClass(0.0,0.0,1.0));

            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the lines

        gl.drawElements(gl.LINES,iIdx,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        this.debugShader.drawEnd();
    }
    
        //
        // draw model mesh lines
        //
        
    drawModelMeshLines(model)
    {
        let n,v,nVertex,vIdx;
        let vertices;
        let vertexPosBuffer,indexBuffer;
        let gl=this.view.gl;
        let mesh=model.mesh;
        
            // get the offset vertices
        
        nVertex=mesh.vertexCount;
        
        vertices=new Float32Array(nVertex*3);

        vIdx=0;

        for (n=0;n!==nVertex;n++) {
            v=mesh.vertexList[n];
            vertices[vIdx]=mesh.drawVertices[vIdx];
            vertices[vIdx+1]=mesh.drawVertices[vIdx+1];
            vertices[vIdx+2]=mesh.drawVertices[vIdx+2];
            vIdx+=3;
        }

            // start the shader
            
        this.debugShader.drawStart(new ColorClass(1.0,0.0,0.0));
        
            // setup the buffers

        vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.debugShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indexes,gl.STREAM_DRAW);

            // draw the line loop trigs

        gl.depthFunc(gl.LEQUAL);
        
        for (n=0;n!==mesh.trigCount;n++) {
            gl.drawElements(gl.LINE_LOOP,3,gl.UNSIGNED_SHORT,(Uint16Array.BYTES_PER_ELEMENT*(n*3)));
        }
        
        gl.depthFunc(gl.LESS);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.debugShader.drawEnd();
    }

        //
        // display a canvas on page (for debuginning bitmaps)
        //

    displayCanvasData(fromCanvas,lft,top,wid,high)
    {
        let cvs,ctx;
        
        cvs=document.createElement('canvas');
        cvs.style.position="absolute";
        cvs.style.left=lft+'px';
        cvs.style.top=top+'px';
        cvs.style.border='1px solid #000000';
        cvs.width=wid;
        cvs.height=high;

        ctx=cvs.getContext('2d');
        ctx.drawImage(fromCanvas,0,0,wid,high);

        document.body.appendChild(cvs);
    }
    
        //
        // display a canvas on page (for debuginning sound data)
        //

    displaySoundData(data,lft,top,wid,high)
    {
        let n,fx,fxAdd,y,halfHigh;
        let cvs,ctx;
        let dataLen=data.length;
        
        cvs=document.createElement('canvas');
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

        ctx=cvs.getContext('2d');
        
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
