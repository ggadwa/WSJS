import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class CountClass
{
    constructor(core,colorURL,maxCount,rect,addOffset,onColor,onAlpha,offColor,offAlpha,developer)
    {
        this.core=core;
        
        this.colorURL=colorURL;
        this.maxCount=maxCount;
        this.rect=rect;
        this.addOffset=addOffset;
        this.onColor=onColor;
        this.onAlpha=onAlpha;
        this.offColor=offColor;
        this.offAlpha=offAlpha;
        this.developer=developer;
        
        this.bitmap=null;
        this.count=maxCount;
        this.show=true;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
    async initialize()
    {
        let n,vIdx,uvIdx,iIdx,elemIdx;
        let vertexArray,uvArray,indexArray;
        let r;
        let gl=this.core.gl;
        
            // load the bitmap
            
        this.bitmap=new BitmapInterfaceClass(this.core,this.colorURL);
        if (!(await this.bitmap.load())) return(false);
        
            // build the arrays
         
        vertexArray=new Float32Array((2*4)*this.maxCount);
        uvArray=new Float32Array((2*4)*this.maxCount);
        indexArray=new Uint16Array(6*this.maxCount);
        
        vIdx=0;
        uvIdx=0;
        iIdx=0;
        
        r=this.rect.copy();
        
        for (n=0;n!==this.maxCount;n++) {
            elemIdx=Math.trunc(vIdx/2);
            
            vertexArray[vIdx++]=r.lft;
            vertexArray[vIdx++]=r.top;
            vertexArray[vIdx++]=r.rgt;
            vertexArray[vIdx++]=r.top;
            vertexArray[vIdx++]=r.rgt;
            vertexArray[vIdx++]=r.bot;
            vertexArray[vIdx++]=r.lft;
            vertexArray[vIdx++]=r.bot;
        
            uvArray[uvIdx++]=0;
            uvArray[uvIdx++]=0;
            uvArray[uvIdx++]=1;
            uvArray[uvIdx++]=0;
            uvArray[uvIdx++]=1;
            uvArray[uvIdx++]=1;
            uvArray[uvIdx++]=0;
            uvArray[uvIdx++]=1;
            
            indexArray[iIdx++]=elemIdx;
            indexArray[iIdx++]=elemIdx+1;
            indexArray[iIdx++]=elemIdx+2;
            indexArray[iIdx++]=elemIdx;
            indexArray[iIdx++]=elemIdx+2;
            indexArray[iIdx++]=elemIdx+3;
            
            r.move(this.addOffset.x,this.addOffset.y);
        }
        
            // this is all statically drawn
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;
        
        this.bitmap.release();
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    draw()
    {
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
            // skip if not shown
            
        if (!this.show) return;
        if ((this.developer) && (this.core.currentLoop!==this.core.LOOP_DEVELOPER)) return;
                
            // setup the bitmap
            
        this.bitmap.attach();
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the quads
            
        if (this.count>0) {
            if (this.onColor===null) {
                gl.uniform4f(shader.colorUniform,1,1,1,this.onAlpha);
            }
            else {
                gl.uniform4f(shader.colorUniform,this.onColor.r,this.onColor.g,this.onColor.b,this.onAlpha);
            }
        
            gl.drawElements(gl.TRIANGLES,(this.count*6),gl.UNSIGNED_SHORT,0);
        }
        if ((this.count<this.maxCount) && (this.offAlpha>0)) {
            if (this.onColor===null) {
                gl.uniform4f(shader.colorUniform,1,1,1,this.offAlpha);
            }
            else {
                gl.uniform4f(shader.colorUniform,this.offColor.r,this.offColor.g,this.offColor.b,this.offAlpha);
            }
        
            gl.drawElements(gl.TRIANGLES,((this.maxCount-this.count)*6),gl.UNSIGNED_SHORT,((this.count*6)*2));
        }

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

}
