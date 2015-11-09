"use strict";

//
// particle class
//

function ParticleObject()
{
        // variables
        
    this.particleShader=new ParticleShaderObject();

        //
        // initialize/release particle
        //

    this.initialize=function(view)
    {
        return(this.particleShader.initialize(view));
    };

    this.release=function(view)
    {
        this.particleShader.release(view);
    };

        //
        // start/stop/draw text
        //

    this.drawStart=function(view)
    {
        this.particleShader.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.particleShader.drawEnd(view);
    };

    this.draw=function(view,particlePoints,particleRadius,color)
    {
        var n,k,pnt,vPnts,vIdx,iIdx,elementIdx;
        var gl=view.gl;

            // get # of trigs
        
        var nPoint=particlePoints.length;
        if (nPoint===0) return;
        
        var nTrig=nPoint*2;

            // build the vertices

        var vertices=new Float32Array((nPoint*4)*3);
        var indexes=new Uint16Array(nTrig*3);

        vIdx=0;
        iIdx=0;
        elementIdx=0;
        
        vPnts=[new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0),new wsPoint(0,0,0)];

        for (n=0;n!==nPoint;n++) {
            pnt=particlePoints[n];
            
                // billboard the pieces
                
            vPnts[0].x=-particleRadius;
            vPnts[0].y=-particleRadius;
            vPnts[0].z=0.0;
            vPnts[1].x=particleRadius;
            vPnts[1].y=-particleRadius;
            vPnts[1].z=0.0;
            vPnts[2].x=particleRadius;
            vPnts[2].y=particleRadius;
            vPnts[2].z=0.0;
            vPnts[3].x=-particleRadius;
            vPnts[3].y=particleRadius;
            vPnts[3].z=0.0;
            
            for (k=0;k!==4;k++) {
                vPnts[k].matrixMultiplyIgnoreTransform(view.billboardXMatrix);
                vPnts[k].matrixMultiplyIgnoreTransform(view.billboardYMatrix);
                
                vertices[vIdx++]=vPnts[k].x+pnt.x;
                vertices[vIdx++]=vPnts[k].y+pnt.y;
                vertices[vIdx++]=vPnts[k].z+pnt.z;
            }
            
                // build the triangles
            
            indexes[iIdx++]=elementIdx;     // triangle 1
            indexes[iIdx++]=elementIdx+1;
            indexes[iIdx++]=elementIdx+2;

            indexes[iIdx++]=elementIdx;     // triangle 2
            indexes[iIdx++]=elementIdx+2;
            indexes[iIdx++]=elementIdx+3;

            elementIdx+=4;
        }

            // set the color

        gl.uniform3f(this.particleShader.colorUniform,color.r,color.g,color.b);

            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STREAM_DRAW);

        gl.vertexAttribPointer(this.particleShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        var indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STREAM_DRAW);

            // draw the indexes

        gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(indexBuffer);
    };

}
