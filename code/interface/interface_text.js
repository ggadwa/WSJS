import ColorClass from '../../code/utility/color.js';
import InterfaceClass from '../../code/interface/interface.js';

export default class InterfaceTextClass
{
    static TEXT_TEXTURE_WIDTH=512;
    static TEXT_TEXTURE_HEIGHT=512;
    static TEXT_CHAR_PER_ROW=10;
    static TEXT_CHAR_WIDTH=50;
    static TEXT_CHAR_HEIGHT=50;
    static TEXT_FONT_SIZE=48;
    static TEXT_FONT_NAME='Arial';

    static TEXT_MAX_STRING_LEN=256;

    static TEXT_ALIGN_LEFT=0;
    static TEXT_ALIGN_CENTER=1;
    static TEXT_ALIGN_RIGHT=2;
    
    static FONT_TEXTURE=null;
    static FONT_CHAR_WIDS=new Float32Array(128);
    
    constructor(core,str,x,y,fontSize,align,color,alpha)
    {
        this.core=core;
        this.str=str;
        this.x=x;
        this.y=y;
        this.fontSize=fontSize;
        this.align=align;
        this.color=color;
        this.alpha=alpha;
                
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
        
        this.vertexArray=new Float32Array((InterfaceTextClass.TEXT_MAX_STRING_LEN*4)*2);
        this.uvArray=new Float32Array((InterfaceTextClass.TEXT_MAX_STRING_LEN*4)*2);
        this.indexArray=new Uint16Array((InterfaceTextClass.TEXT_MAX_STRING_LEN*2)*3);
            
        this.vertexBuffer=gl.createBuffer();
        this.uvBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();
    }
    
    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // build font bitmap
        //
        
    static createStaticFontTexture(gl)
    {
        let x,y,yAdd,cIdx,charStr,ch;
        let canvas,ctx;
        
            // create the text bitmap

        canvas=document.createElement('canvas');
        canvas.width=InterfaceTextClass.TEXT_TEXTURE_WIDTH;
        canvas.height=InterfaceTextClass.TEXT_TEXTURE_HEIGHT;
        ctx=canvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored
            
        ctx.fillStyle='#000000';
        ctx.fillRect(0,0,InterfaceTextClass.TEXT_TEXTURE_WIDTH,InterfaceTextClass.TEXT_TEXTURE_HEIGHT);

            // draw the text

        ctx.font=(InterfaceTextClass.TEXT_FONT_SIZE+'px ')+InterfaceTextClass.TEXT_FONT_NAME;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        yAdd=Math.trunc(InterfaceTextClass.TEXT_CHAR_HEIGHT/2);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%InterfaceTextClass.TEXT_CHAR_PER_ROW)*InterfaceTextClass.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/InterfaceTextClass.TEXT_CHAR_PER_ROW)*InterfaceTextClass.TEXT_CHAR_HEIGHT;
            y+=yAdd;

            charStr=String.fromCharCode(ch);
            InterfaceTextClass.FONT_CHAR_WIDS[cIdx]=((ctx.measureText(charStr).width+4)/InterfaceTextClass.TEXT_CHAR_WIDTH);
            if (InterfaceTextClass.FONT_CHAR_WIDS[cIdx]>1.0) InterfaceTextClass.FONT_CHAR_WIDS[cIdx]=1.0;

            ctx.fillText(charStr,(x+2),(y-1));

            x+=InterfaceTextClass.TEXT_CHAR_WIDTH;
        }

            // finally load into webGL
            
        InterfaceTextClass.FONT_TEXTURE=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,InterfaceTextClass.FONT_TEXTURE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
    static deleteStaticFontTexture(gl)
    {
        gl.deleteTexture(InterfaceTextClass.FONT_TEXTURE);
    }
    
        //
        // string lengths
        //
        
    getStringDrawWidth(charWid,str)
    {
        let n,cIdx,len;
        let wid=0;

            // figure out the size
            // and alignment

        len=str.length;
        if (len===0) return(0);
        
        for (n=0;n!==len;n++) {
            cIdx=str.charCodeAt(n)-32;
            wid+=Math.trunc(charWid*InterfaceTextClass.FONT_CHAR_WIDS[cIdx]);
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
        let shader=this.core.shaderList.textShader;
        let gl=this.core.gl;
        
            // get the length and clip if
            // past our pre-set buffer size
            
        len=this.str.length;
        if (len===0) return;
        
        if (len>InterfaceTextClass.TEXT_MAX_STRING_LEN) len=InterfaceTextClass.TEXT_MAX_STRING_LEN;

            // figure out the size
            // and alignment

        switch (this.align) {
            case InterfaceTextClass.TEXT_ALIGN_CENTER:
                x-=Math.trunc(this.getStringDrawWidth(this.fontSize,this.str)*0.5);
                break;
            case InterfaceTextClass.TEXT_ALIGN_RIGHT:
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

        gxAdd=InterfaceTextClass.TEXT_CHAR_WIDTH/InterfaceTextClass.TEXT_TEXTURE_WIDTH;
        gyAdd=InterfaceTextClass.TEXT_CHAR_HEIGHT/InterfaceTextClass.TEXT_TEXTURE_HEIGHT;

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
            gx=((cIdx%InterfaceTextClass.TEXT_CHAR_PER_ROW)*InterfaceTextClass.TEXT_CHAR_WIDTH)/InterfaceTextClass.TEXT_TEXTURE_WIDTH;
            gy=(Math.trunc(cIdx/InterfaceTextClass.TEXT_CHAR_PER_ROW)*InterfaceTextClass.TEXT_CHAR_HEIGHT)/InterfaceTextClass.TEXT_TEXTURE_HEIGHT;

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
            
            x+=Math.trunc(this.fontSize*InterfaceTextClass.FONT_CHAR_WIDS[cIdx]);
        }

            // set the shader and bitmap

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,InterfaceTextClass.FONT_TEXTURE);

        if (overrideColor!==null) {
            gl.uniform4f(shader.colorUniform,overrideColor.r,overrideColor.g,overrideColor.b,this.alpha);
        }
        else {
            gl.uniform4f(shader.colorUniform,this.color.r,this.color.g,this.color.b,this.alpha);
        }

            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvArray,gl.STREAM_DRAW);

        gl.enableVertexAttribArray(shader.vertexUVAttribute);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexArray,gl.STREAM_DRAW);

            // draw the indexes

        gl.drawElements(gl.TRIANGLES,(nTrig*3),gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
    draw()
    {
        this.drawSingle(1,1,this.fontShadowColor);
        this.drawSingle(0,0,null);
    }

}
