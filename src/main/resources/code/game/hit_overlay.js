import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class HitOverlayClass
{
    constructor(core,bitmapPath)
    {
        this.core=core;
        this.bitmapPath=bitmapPath;
        
        this.SIDE_LEFT=0;
        this.SIDE_TOP=1;
        this.SIDE_RIGHT=2;
        this.SIDE_BOTTOM=3;
        this.SIDE_ALL=4;
        
        this.flashSide=0;
        this.flashStartTick=0;
        this.flashTick=0;
        
        this.vertexArray=new Float32Array(2*6);
        this.uvArray=new Float32Array(2*6);
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        
        this.bitmap=null;
        
        Object.seal(this);
    }
    
    async initialize()
    {
        let gl=this.core.gl;
        
            // any bitmap
            
        this.bitmap=new BitmapInterfaceClass(this.core,this.bitmapPath);
        if (!(await this.bitmap.load())) return(false);
        
            // vertex and uv array
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvArray,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        return(true);
    }

    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        
        this.bitmap.release();
    }
    
    flash(flashSide,flashTick)
    {
        this.flashSide=flashSide;
        this.flashStartTick=this.core.game.timestamp;
        this.flashTick=flashTick;
    }
    
    drawLeft()
    {
        let hitSize=Math.trunc(this.core.canvas.width*0.08);
        let hitMargin=Math.trunc(this.core.canvas.height*0.25);
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        this.vertexArray[0]=this.vertexArray[6]=this.vertexArray[10]=0;
        this.vertexArray[1]=this.vertexArray[3]=this.vertexArray[7]=hitMargin;
        this.vertexArray[2]=this.vertexArray[4]=this.vertexArray[8]=hitSize;
        this.vertexArray[5]=this.vertexArray[9]=this.vertexArray[11]=(this.core.canvas.height-hitMargin);
        
        this.uvArray[0]=this.uvArray[6]=1;
        this.uvArray[1]=this.uvArray[7]=0;
        this.uvArray[2]=1;
        this.uvArray[3]=1;
        this.uvArray[4]=this.uvArray[8]=0;
        this.uvArray[5]=this.uvArray[9]=1;
        this.uvArray[10]=0;
        this.uvArray[11]=0;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvArray);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    
    drawRight()
    {
        let hitSize=Math.trunc(this.core.canvas.width*0.08);
        let hitMargin=Math.trunc(this.core.canvas.height*0.25);
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        this.vertexArray[0]=this.vertexArray[6]=this.vertexArray[10]=(this.core.canvas.width-hitSize);
        this.vertexArray[1]=this.vertexArray[3]=this.vertexArray[7]=hitMargin;
        this.vertexArray[2]=this.vertexArray[4]=this.vertexArray[8]=this.core.canvas.width;
        this.vertexArray[5]=this.vertexArray[9]=this.vertexArray[11]=(this.core.canvas.height-hitMargin);
        
        this.uvArray[0]=this.uvArray[6]=1;
        this.uvArray[1]=this.uvArray[7]=1;
        this.uvArray[2]=1;
        this.uvArray[3]=0;
        this.uvArray[4]=this.uvArray[8]=0;
        this.uvArray[5]=this.uvArray[9]=0;
        this.uvArray[10]=0;
        this.uvArray[11]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvArray);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    
    drawTop()
    {
        let hitSize=Math.trunc(this.core.canvas.height*0.08);
        let hitMargin=Math.trunc(this.core.canvas.width*0.25);
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        this.vertexArray[0]=this.vertexArray[6]=this.vertexArray[10]=hitMargin;
        this.vertexArray[1]=this.vertexArray[3]=this.vertexArray[7]=0;
        this.vertexArray[2]=this.vertexArray[4]=this.vertexArray[8]=(this.core.canvas.width-hitMargin);
        this.vertexArray[5]=this.vertexArray[9]=this.vertexArray[11]=hitSize;
        
        this.uvArray[0]=this.uvArray[6]=0;
        this.uvArray[1]=this.uvArray[7]=0;
        this.uvArray[2]=1;
        this.uvArray[3]=0;
        this.uvArray[4]=this.uvArray[8]=1;
        this.uvArray[5]=this.uvArray[9]=1;
        this.uvArray[10]=0;
        this.uvArray[11]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvArray);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
 
    drawBottom()
    {
        let hitSize=Math.trunc(this.core.canvas.height*0.08);
        let hitMargin=Math.trunc(this.core.canvas.width*0.25);
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        this.vertexArray[0]=this.vertexArray[6]=this.vertexArray[10]=hitMargin;
        this.vertexArray[1]=this.vertexArray[3]=this.vertexArray[7]=(this.core.canvas.height-hitSize);
        this.vertexArray[2]=this.vertexArray[4]=this.vertexArray[8]=(this.core.canvas.width-hitMargin);
        this.vertexArray[5]=this.vertexArray[9]=this.vertexArray[11]=this.core.canvas.height;
        
        this.uvArray[0]=this.uvArray[6]=1;
        this.uvArray[1]=this.uvArray[7]=1;
        this.uvArray[2]=0;
        this.uvArray[3]=1;
        this.uvArray[4]=this.uvArray[8]=0;
        this.uvArray[5]=this.uvArray[9]=0;
        this.uvArray[10]=1;
        this.uvArray[11]=0;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvArray);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
    }
    
    draw()
    {
        let alpha,tick;
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
            // flash on?
            
        if (this.flashStartTick===0) return;
        
        tick=this.core.game.timestamp-this.flashStartTick;
        if (tick>this.flashTick) {
            this.flashStartTick=0;
            return;
        }
        
        alpha=Math.sin((tick/this.flashTick)*Math.PI);
        
            // draw
        
        shader.drawStart();
        
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
                
        this.bitmap.attach();
        gl.uniform4f(shader.colorUniform,1,1,1,alpha);
        
        switch (this.flashSide) {
            case this.SIDE_LEFT:
                this.drawLeft();
                break;
            case this.SIDE_TOP:
                this.drawTop();
                break;
            case this.SIDE_RIGHT:
                this.drawRight();
                break;
            case this.SIDE_BOTTOM:
                this.drawBottom();
                break;
            case this.SIDE_ALL:
                this.drawLeft();
                this.drawTop();
                this.drawRight();
                this.drawBottom();
                break;  
        }

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }

}
