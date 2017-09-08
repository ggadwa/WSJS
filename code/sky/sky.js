import * as constants from '../../code/main/constants.js';
import SkyShaderClass from '../../code/sky/sky_shader.js';
import GenBitmapSkyClass from '../../generate/bitmap/gen_bitmap_sky.js';

//
// sky class
//

export default class SkyClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.skyShader=new SkyShaderClass(view,fileCache);

        this.vertexes=null;
        this.uvs=null;
        this.indexes=null;
        
        this.vertexPosBuffer=null;
        this.uvPosBuffer=null;
        this.indexBuffer=null;
        
        this.bitmap=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let gl=this.view.gl;
        let genBitmap;

        if (!this.skyShader.initialize()) return(false);
        
            // room enough for the 8 points of the cube
            
        this.vertexes=new Float32Array(24);
        this.uvs=new Float32Array(16);
        this.indexes=new Uint16Array(6*4);      //enough for 4 sides, the longest draw pattern we do
        
        this.vertexPosBuffer=gl.createBuffer();
        this.uvPosBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();
        
            // create bitmaps
        
        genBitmap=new GenBitmapSkyClass(this.view);
        this.bitmap=genBitmap.generate(false);
        
        return(true);
    }

    release()
    {
        let gl=this.view.gl;

        gl.deleteBuffer(this.vertexPosBuffer);
        gl.deleteBuffer(this.uvPosBuffer);
        gl.deleteBuffer(this.indexBuffer);
        
        this.bitmap.close();
        
        this.skyShader.release();
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
        
    draw()
    {
        let gl=this.view.gl;
        let cameraPos=this.view.camera.position;
        let skyRadius=25000;
        
            // setup shader
            
        gl.disable(gl.DEPTH_TEST);

        this.skyShader.drawStart();
        
        this.bitmap.attachAsSky();
        
            // sides
        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,0.0,0.51,2.0,0.99);
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,0.0,0.51,2.0,0.99);        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,0.0,0.51,2.0,0.99);
        this.drawPlane(gl,cameraPos,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,0.0,0.51,2.0,0.99);
        
            // top
        
        this.drawPlane(gl,cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,0.01,0.01,0.49,0.49);
        
            // bottom
        
        this.drawPlane(gl,cameraPos,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,0.51,0.01,0.99,0.49);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // end shader
            
        this.skyShader.drawEnd();

        gl.enable(gl.DEPTH_TEST);
    }
    
}

