export default class InterfaceElementClass
{
    constructor(core,bitmap,uvOffset,uvSize,rect,color,alpha)
    {
        this.core=core;
        
        this.bitmap=bitmap;
        this.uvOffset=uvOffset;
        this.uvSize=uvSize;
        this.rect=rect;
        this.color=color;
        this.alpha=alpha;
        
        this.show=true;
        
        this.pulseStartTick=0;
        this.pulseTick=-1;
        this.pulseExpand=0;
        
        this.vertexArray=new Float32Array(2*4);     // 2D, only 2 vertex coordinates
        this.uvArray=new Float32Array(2*4);
        this.indexArray=new Uint16Array(6);
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
    initialize()
    {
        let gl=this.core.gl;
        
            // pre build data for vertex and uv
            // so we can use the more efficient subdata later
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvArray,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // always drawing a single quad
            
        this.indexArray[0]=0;
        this.indexArray[1]=1;
        this.indexArray[2]=2;
        this.indexArray[3]=0;
        this.indexArray[4]=2;
        this.indexArray[5]=3;
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    pulse(tick,expand)
    {
        this.pulseStartTick=this.core.timestamp;
        this.pulseTick=tick;
        this.pulseExpand=expand;
    }
    
    draw()
    {
        let tick,lx,rx,ty,by,factor;
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
            // skip if not shown
            
        if (!this.show) return;
        
            // handle any pulses
            
        if (this.pulseTick!==-1) {
            tick=this.core.timestamp-this.pulseStartTick;
            factor=Math.trunc(Math.sin((tick/this.pulseTick)*Math.PI)*this.pulseExpand);
            
            if (tick>this.pulseTick) {
                this.pulseTick=-1;
                factor=0;
            }
            
            lx=this.rect.lft-factor;
            rx=this.rect.rgt+factor;
            ty=this.rect.top-factor;
            by=this.rect.bot+factor;
        }
        else {
            lx=this.rect.lft;
            rx=this.rect.rgt;
            ty=this.rect.top;
            by=this.rect.bot;
        }
        
            // vertexes

        this.vertexArray[0]=lx;
        this.vertexArray[1]=ty;
        this.vertexArray[2]=rx;
        this.vertexArray[3]=ty;
        this.vertexArray[4]=rx;
        this.vertexArray[5]=by;
        this.vertexArray[6]=lx;
        this.vertexArray[7]=by;
        
        if (this.uvOffset===null) {
            this.uvArray[0]=0;
            this.uvArray[1]=0;
            this.uvArray[2]=1;
            this.uvArray[3]=0;
            this.uvArray[4]=1;
            this.uvArray[5]=1;
            this.uvArray[6]=0;
            this.uvArray[7]=1;
        }
        else {
            this.uvArray[0]=this.uvOffset.x;
            this.uvArray[1]=this.uvOffset.y;
            this.uvArray[2]=this.uvOffset.x+this.uvSize.x;
            this.uvArray[3]=this.uvOffset.y;
            this.uvArray[4]=this.uvOffset.x+this.uvSize.x;
            this.uvArray[5]=this.uvOffset.y+this.uvSize.y;
            this.uvArray[4]=this.uvOffset.x;
            this.uvArray[5]=this.uvOffset.y+this.uvSize.y;
        }
        
            // setup the bitmap
            
        this.bitmap.attachAsInterface();
        if (this.color===null) {
            gl.uniform4f(shader.colorUniform,1,1,1,this.alpha);
        }
        else {
            gl.uniform4f(shader.colorUniform,this.color.r,this.color.g,this.color.b,this.alpha);
        }
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvArray);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the quad
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

}
