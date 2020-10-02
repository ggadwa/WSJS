import ColorClass from '../utility/color.js';
import InterfaceClass from '../interface/interface.js';

export default class InterfaceTextClass
{
    constructor(core,str,x,y,fontSize,align,color,alpha,developer)
    {
        this.TEXT_MAX_STRING_LEN=256;
    
        this.core=core;
        this.str=str;
        this.x=x;
        this.y=y;
        this.fontSize=fontSize;
        this.align=align;
        this.color=color;
        this.alpha=alpha;
        this.developer=developer;
        
        this.show=true;
        this.hideTick=-1;
                
            // character drawing arrays
            
        this.vertexArray=null;
        this.uvArray=null;
        this.indexArray=null;
            
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;

        this.fontShadowColor=new ColorClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        let gl=this.core.gl;
        
        this.vertexArray=new Float32Array((this.TEXT_MAX_STRING_LEN*4)*2);
        this.uvArray=new Float32Array((this.TEXT_MAX_STRING_LEN*4)*2);
        this.indexArray=new Uint16Array((this.TEXT_MAX_STRING_LEN*2)*3);
        
            // setup buffer data here so we can subdata later
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvArray,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexArray,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // string lengths
        //
        
    getStringDrawWidth(charWid,str)
    {
        let n,cIdx,len;
        let fontCharWidths=this.core.interface.fontCharWidths;
        let wid=0;

            // figure out the size
            // and alignment

        len=str.length;
        if (len===0) return(0);
        
        for (n=0;n!==len;n++) {
            cIdx=str.charCodeAt(n)-32;
            wid+=Math.trunc(charWid*fontCharWidths[cIdx]);
        }
        
        return(wid);
    }

        //
        // start/stop/draw text
        //

    drawSingle(xOff,yOff,overrideColor)
    {
        let x=this.x+xOff;
        let y=this.y+yOff;
        let n,x2,ty,by,vIdx,uvIdx,iIdx,elementIdx;
        let cIdx,gx,gy,gxAdd,gyAdd;
        let len,nTrig;
        let fontCharWidths=this.core.interface.fontCharWidths;
        let shader=this.core.shaderList.textShader;
        let gl=this.core.gl;
        
            // get the length and clip if
            // past our pre-set buffer size
            
        len=this.str.length;
        if (len===0) return;
        
        if (len>this.TEXT_MAX_STRING_LEN) len=this.TEXT_MAX_STRING_LEN;

            // figure out the size
            // and alignment

        switch (this.align) {
            case this.core.interface.TEXT_ALIGN_CENTER:
                x-=Math.trunc(this.getStringDrawWidth(this.fontSize,this.str)*0.5);
                break;
            case this.core.interface.TEXT_ALIGN_RIGHT:
                x-=this.getStringDrawWidth(this.fontSize,this.str);
                break;
        }

            // the y

        ty=y-this.fontSize;
        by=y;

            // build the vertexes

        nTrig=len*2;            // 2 triangles for every character

        vIdx=0;
        uvIdx=0;
        iIdx=0;
        elementIdx=0;

        gxAdd=this.core.interface.TEXT_CHAR_WIDTH/this.core.interface.TEXT_TEXTURE_WIDTH;
        gyAdd=this.core.interface.TEXT_CHAR_HEIGHT/this.core.interface.TEXT_TEXTURE_HEIGHT;

        for (n=0;n!==len;n++) {
            x2=x+this.fontSize;

            this.vertexArray[vIdx++]=x;
            this.vertexArray[vIdx++]=ty;
            this.vertexArray[vIdx++]=x2;
            this.vertexArray[vIdx++]=ty;
            this.vertexArray[vIdx++]=x2;
            this.vertexArray[vIdx++]=by;
            this.vertexArray[vIdx++]=x;
            this.vertexArray[vIdx++]=by;

            cIdx=this.str.charCodeAt(n)-32;
            gx=((cIdx%this.core.interface.TEXT_CHAR_PER_ROW)*this.core.interface.TEXT_CHAR_WIDTH)/this.core.interface.TEXT_TEXTURE_WIDTH;
            gy=(Math.trunc(cIdx/this.core.interface.TEXT_CHAR_PER_ROW)*this.core.interface.TEXT_CHAR_HEIGHT)/this.core.interface.TEXT_TEXTURE_HEIGHT;

            this.uvArray[uvIdx++]=gx;
            this.uvArray[uvIdx++]=gy;
            this.uvArray[uvIdx++]=(gx+gxAdd);
            this.uvArray[uvIdx++]=gy;
            this.uvArray[uvIdx++]=(gx+gxAdd);
            this.uvArray[uvIdx++]=(gy+gyAdd);
            this.uvArray[uvIdx++]=gx;
            this.uvArray[uvIdx++]=(gy+gyAdd);

            this.indexArray[iIdx++]=elementIdx;     // triangle 1
            this.indexArray[iIdx++]=elementIdx+1;
            this.indexArray[iIdx++]=elementIdx+2;

            this.indexArray[iIdx++]=elementIdx;     // triangle 2
            this.indexArray[iIdx++]=elementIdx+2;
            this.indexArray[iIdx++]=elementIdx+3;

            elementIdx+=4;
            
            x+=Math.trunc(this.fontSize*fontCharWidths[cIdx]);
        }

            // set the shader and bitmap

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.core.interface.fontTexture);

        if (overrideColor!==null) {
            gl.uniform4f(shader.colorUniform,overrideColor.r,overrideColor.g,overrideColor.b,this.alpha);
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
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,this.indexArray);

            // draw the indexes

        gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
    draw()
    {
        if ((!this.show) || (this.core.game.developer.on!==this.developer)) return;
        
            // check for temporary time out
         
        if (this.hideTick!==-1) {
            if (this.hideTick<this.core.game.timestamp) {
                this.hideTick=-1;
                this.show=false;
                return;
            }
        }
        
        this.drawSingle(1,1,this.fontShadowColor);
        this.drawSingle(0,0,null);
    }

}
