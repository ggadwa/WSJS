"use strict";

//
// sky class
//

class SkyClass
{
    constructor()
    {
        this.skyShader=new SkyShaderClass();

        this.vertexes=null;
        this.uvs=null;
        this.indexes=null;
        
        this.vertexPosBuffer=null;
        this.uvPosBuffer=null;
        this.indexBuffer=null;
        
        this.topBitmap=null;
        this.bottomBitmap=null;
        this.sideBitmap=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize(view,fileCache)
    {
        var gl=view.gl;
        var genBitmapSky;

        if (!this.skyShader.initialize(view,fileCache)) return(false);
        
            // room enough for the 8 points of the cube
            
        this.vertexes=new Float32Array(24);
        this.uvs=new Float32Array(16);
        this.indexes=new Uint16Array(6*4);      //enough for 4 sides, the longest draw pattern we do
        
        this.vertexPosBuffer=gl.createBuffer();
        this.uvPosBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();
        
            // create bitmaps
        
        genBitmapSky=new GenBitmapSkyClass(new GenRandomClass(config.SEED_BITMAP_SKY));
        
        this.topBitmap=genBitmapSky.generate(view,"Sky Top",GEN_BITMAP_SKY_TYPE_TOP);
        this.bottomBitmap=genBitmapSky.generate(view,"Sky Bottom",GEN_BITMAP_SKY_TYPE_BOTTOM);
        this.sideBitmap=genBitmapSky.generate(view,"Sky Side",GEN_BITMAP_SKY_TYPE_SIDE);
        
        return(true);
    }

    release(view)
    {
        var gl=view.gl;

        view.gl.deleteBuffer(this.vertexPosBuffer);
        view.gl.deleteBuffer(this.uvPosBuffer);
        gl.deleteBuffer(this.indexBuffer);
        
        this.topBitmap.close();
        this.topBitmap.close();
        this.sideBitmap.close();
        
        this.skyShader.release(view);
    }

        //
        // start/stop/draw interface
        //

    drawStart(view)
    {
        var gl=view.gl;
        
        gl.disable(gl.DEPTH_TEST);

        this.skyShader.drawStart(view);
    }

    drawEnd(view)
    {
        var gl=view.gl;
        
        this.skyShader.drawEnd(view);

        gl.enable(gl.DEPTH_TEST);
    }
    
    drawPlane(gl,cameraPos,vx0,vy0,vz0,vx1,vy1,vz1,vx2,vy2,vz2,vx3,vy3,vz3)
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
        
        this.uvs[0]=0.0;
        this.uvs[1]=0.0;
        
        this.uvs[2]=1.0;
        this.uvs[3]=0.0;
        
        this.uvs[4]=1.0;
        this.uvs[5]=1.0;
        
        this.uvs[6]=0.0;
        this.uvs[7]=1.0;
        
        this.indexes[0]=0;
        this.indexes[1]=1;
        this.indexes[2]=3;
        this.indexes[3]=1;
        this.indexes[4]=2;
        this.indexes[5]=3;
        
            // attach buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.skyShader.vertexPositionAttribute);
        gl.vertexAttribPointer(this.skyShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(this.skyShader.vertexUVAttribute);
        gl.vertexAttribPointer(this.skyShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STREAM_DRAW);

            // draw the plane
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    }
        
    draw(view)
    {
        var gl=view.gl;
        var cameraPos=view.camera.position;
        var skyRadius=25000;
        
            // sides
        
        this.sideBitmap.attachAsSky();
        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius);
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius);        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius);
        this.drawPlane(gl,cameraPos,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius);
        
            // top
        
        this.topBitmap.attachAsSky();
        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius);
        
            // bottom
        
        this.topBitmap.attachAsSky();
        
        this.drawPlane(gl,cameraPos,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
}
