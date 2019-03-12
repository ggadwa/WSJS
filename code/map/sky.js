import * as constants from '../main/constants.js';

//
// sky class
//

export default class SkyClass
{
    constructor(core)
    {
        this.core=core;
        
        this.on=false;
        this.skyBoxSettings=null;

        this.vertexes=null;
        this.uvs=null;
        this.indexes=null;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let gl=this.core.gl;
        
            // room enough for the 8 points of the cube
            
        this.vertexes=new Float32Array(24);
        this.uvs=new Float32Array(16);
        this.indexes=new Uint16Array(6*4);      //enough for 4 sides, the longest draw pattern we do
        
        this.vertexBuffer=gl.createBuffer();
        this.uvBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // draw
        //

    drawPlane(gl,cameraPos,vx0,vy0,vz0,vx1,vy1,vz1,vx2,vy2,vz2,vx3,vy3,vz3,u,v,u2,v2)
    {
        this.vertexes[0]=cameraPos.x+vx0;
        this.vertexes[1]=cameraPos.y+vy0;
        this.vertexes[2]=cameraPos.z+vz0;
        
        this.vertexes[3]=cameraPos.x+vx1;
        this.vertexes[4]=cameraPos.y+vy1;
        this.vertexes[5]=cameraPos.z+vz1;
        
        this.vertexes[6]=cameraPos.x+vx2;
        this.vertexes[7]=cameraPos.y+vy2;
        this.vertexes[8]=cameraPos.z+vz2;
        
        this.vertexes[9]=cameraPos.x+vx3;
        this.vertexes[10]=cameraPos.y+vy3;
        this.vertexes[11]=cameraPos.z+vz3;
        
        this.uvs[0]=u;
        this.uvs[1]=v;
        
        this.uvs[2]=u2;
        this.uvs[3]=v;
        
        this.uvs[4]=u2;
        this.uvs[5]=v2;
        
        this.uvs[6]=u;
        this.uvs[7]=v2;
        
        this.indexes[0]=0;
        this.indexes[1]=1;
        this.indexes[2]=3;
        this.indexes[3]=1;
        this.indexes[4]=2;
        this.indexes[5]=3;
        
            // attach buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.core.shaderList.skyShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.core.shaderList.skyShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.core.shaderList.skyShader.vertexUVAttribute);
        gl.vertexAttribPointer(this.core.shaderList.skyShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STREAM_DRAW);

            // draw the plane
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    }
        
    draw()
    {
        let gl=this.core.gl;
        let bitmap;
        let cameraPos,skyRadius;
        
        if (!this.on) return;
        
        cameraPos=this.core.camera.position;
        skyRadius=Math.trunc(this.skyBoxSettings.size*0.5);
        
            // setup shader

        this.core.shaderList.skyShader.drawStart();
        
            // negative X plane
            // after this first texture is set we do some
            // misc tex parameters (they would fail without a
            // texture set)
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapNegX);
        bitmap.attachAsSky();
        
        gl.disable(gl.DEPTH_TEST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,0.999,0.999,0.001,0.001);
        
            // positive X plane
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapPosX);
        bitmap.attachAsSky();
        this.drawPlane(gl,cameraPos,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,0.001,0.999,0.999,0.001);
         
            // negative Y plane
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapNegY);
        bitmap.attachAsSky();
        this.drawPlane(gl,cameraPos,skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,0.999,0.999,0.001,0.001);
        
            // positive Y plane
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapPosY);
        bitmap.attachAsSky();
        this.drawPlane(gl,cameraPos,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,0.999,0.999,0.001,0.001);
       
            // negative Z plane
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapNegZ);
        bitmap.attachAsSky();
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,0.001,0.999,0.999,0.001);

            // positive Z plane
        
        bitmap=this.core.bitmapList.get(this.skyBoxSettings.bitmapPosZ);
        bitmap.attachAsSky();
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,0.999,0.999,0.001,0.001);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // end shader
            
        this.core.shaderList.skyShader.drawEnd();

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
        gl.enable(gl.DEPTH_TEST);
    }
    
}

