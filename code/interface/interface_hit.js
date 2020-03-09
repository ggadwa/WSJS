export default class InterfaceHitClass
{
    constructor(core,rect,uvs)
    {
        this.core=core;
        
        this.rect=rect;
        this.uvs=uvs;
        
        this.flashStartTick=0;
        this.flashTick=0;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        
        Object.seal(this);
    }
    
    initialize()
    {
        let vertexArray,uvArray;
        let gl=this.core.gl;
        
            // build the data
            
        vertexArray=new Float32Array(2*6);
        vertexArray[0]=this.rect.lft;
        vertexArray[1]=this.rect.top;
        vertexArray[2]=this.rect.rgt;
        vertexArray[3]=this.rect.top;
        vertexArray[4]=this.rect.rgt;
        vertexArray[5]=this.rect.bot;
        
        vertexArray[6]=this.rect.lft;
        vertexArray[7]=this.rect.top;
        vertexArray[8]=this.rect.rgt;
        vertexArray[9]=this.rect.bot;
        vertexArray[10]=this.rect.lft;
        vertexArray[11]=this.rect.bot;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
        uvArray=new Float32Array(2*6);
        uvArray[0]=this.uvs[0][0];
        uvArray[1]=this.uvs[0][1];
        uvArray[2]=this.uvs[1][0];
        uvArray[3]=this.uvs[1][1];
        uvArray[4]=this.uvs[2][0];
        uvArray[5]=this.uvs[2][1];
        
        uvArray[6]=this.uvs[0][0];
        uvArray[7]=this.uvs[0][1];
        uvArray[8]=this.uvs[2][0];
        uvArray[9]=this.uvs[2][1];
        uvArray[10]=this.uvs[3][0];
        uvArray[11]=this.uvs[3][1];
        
        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        return(true);
    }

    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
    }
    
    flash(flashTick)
    {
        this.flashStartTick=this.core.timestamp;
        this.flashTick=flashTick;
    }
    
    draw()
    {
        let alpha,tick;
        let bitmap;
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
            // flash on?
            
        if (this.flashStartTick===0) return;
        
        tick=this.core.timestamp-this.flashStartTick;
        if (tick>this.flashTick) {
            this.flashStartTick=0;
            return;
        }
        
        alpha=Math.sin((tick/this.flashTick)*Math.PI);
        
            // draw
        
        shader.drawStart();
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
                
            // setup the bitmap
            
        bitmap=this.core.bitmapList.get('textures/interface_hit.png');
        bitmap.attachAsInterface();
        gl.uniform4f(shader.colorUniform,1,1,1,alpha);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
            // draw the two triangles
            
        gl.drawArrays(gl.TRIANGLES,0,6);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }

}
