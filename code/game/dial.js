import PointClass from '../utility/point.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class DialClass
{
    constructor(core,backgroundColorURL,foregroundColorURL,needleColorURL,rect,developer)
    {
        this.core=core;
        
        this.backgroundColorURL=backgroundColorURL;
        this.foregroundColorURL=foregroundColorURL;
        this.needleColorURL=needleColorURL;
        this.rect=rect;
        this.developer=developer;
        
        this.backgroundBitmap=null;
        this.needleBitmap=null;
        this.foregroundBitmap=null;
        this.show=true;
        
        this.value=0;
        
        this.vertexArray=null;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        this.centerPoint=new PointClass(0,0,0);
        this.rotPoint=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    async initialize()
    {
        let uvArray,indexArray;
        let gl=this.core.gl;
        
            // load the bitmaps
            
        this.backgroundBitmap=new BitmapInterfaceClass(this.core,this.backgroundColorURL);
        if (!(await this.backgroundBitmap.load())) return(false);
        
        this.needleBitmap=new BitmapInterfaceClass(this.core,this.needleColorURL);
        if (!(await this.needleBitmap.load())) return(false);
        
        this.foregroundBitmap=new BitmapInterfaceClass(this.core,this.foregroundColorURL);
        if (!(await this.foregroundBitmap.load())) return(false);
        
            // a center point for needle rotation
            
        this.centerPoint.setFromValues(this.rect.rgt,this.rect.bot,0);
        
            // build the arrays
         
        this.vertexArray=new Float32Array((2*4)*3);
        uvArray=new Float32Array((2*4)*3);
        indexArray=new Uint16Array(6*3);
        
        this.vertexArray[0]=this.rect.lft;   // background
        this.vertexArray[1]=this.rect.top;
        this.vertexArray[2]=this.rect.rgt;
        this.vertexArray[3]=this.rect.top;
        this.vertexArray[4]=this.rect.rgt;
        this.vertexArray[5]=this.rect.bot;
        this.vertexArray[6]=this.rect.lft;
        this.vertexArray[7]=this.rect.bot;
        
        this.vertexArray[8]=this.rect.lft;   // needle
        this.vertexArray[9]=this.rect.top;
        this.vertexArray[10]=this.rect.rgt;
        this.vertexArray[11]=this.rect.top;
        this.vertexArray[12]=this.rect.rgt;
        this.vertexArray[13]=this.rect.bot;
        this.vertexArray[14]=this.rect.lft;
        this.vertexArray[15]=this.rect.bot;
        
        this.vertexArray[16]=this.rect.lft;   // foreground
        this.vertexArray[17]=this.rect.top;
        this.vertexArray[18]=this.rect.rgt;
        this.vertexArray[19]=this.rect.top;
        this.vertexArray[20]=this.rect.rgt;
        this.vertexArray[21]=this.rect.bot;
        this.vertexArray[22]=this.rect.lft;
        this.vertexArray[23]=this.rect.bot;

        uvArray[0]=0;
        uvArray[1]=0;
        uvArray[2]=1;
        uvArray[3]=0;
        uvArray[4]=1;
        uvArray[5]=1;
        uvArray[6]=0;
        uvArray[7]=1;
        
        uvArray[8]=0;
        uvArray[9]=0;
        uvArray[10]=1;
        uvArray[11]=0;
        uvArray[12]=1;
        uvArray[13]=1;
        uvArray[14]=0;
        uvArray[15]=1;
        
        uvArray[16]=0;
        uvArray[17]=0;
        uvArray[18]=1;
        uvArray[19]=0;
        uvArray[20]=1;
        uvArray[21]=1;
        uvArray[22]=0;
        uvArray[23]=1;
            
        indexArray[0]=0;
        indexArray[1]=1;
        indexArray[2]=2;
        indexArray[3]=0;
        indexArray[4]=2;
        indexArray[5]=3;
            
        indexArray[6]=4;
        indexArray[7]=5;
        indexArray[8]=6;
        indexArray[9]=4;
        indexArray[10]=6;
        indexArray[11]=7;
        
        indexArray[12]=8;
        indexArray[13]=9;
        indexArray[14]=10;
        indexArray[15]=8;
        indexArray[16]=10;
        indexArray[17]=11;
        
            // this is all statically drawn
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
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
        
        this.backgroundBitmap.release();
        this.needleBitmap.release();
        this.foregroundBitmap.release();
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    draw()
    {
        let rot,ty,by,high;
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
            // skip if not shown
            
        if (!this.show) return;
        if ((this.developer) && (this.core.currentLoop!==this.core.LOOP_DEVELOPER)) return;
        
            // change the needle
            
        high=Math.trunc((this.rect.bot-this.rect.top)/16);
        ty=this.rect.bot-high;
        by=this.rect.bot+high;
        rot=this.value*90.0;
            
        this.rotPoint.setFromValues(this.rect.lft,ty,0);
        this.rotPoint.rotateZ(this.centerPoint,rot);
            
        this.vertexArray[8]=this.rotPoint.x;
        this.vertexArray[9]=this.rotPoint.y;
        
        this.rotPoint.setFromValues(this.rect.rgt,ty,0);
        this.rotPoint.rotateZ(this.centerPoint,rot);
            
        this.vertexArray[10]=this.rotPoint.x;
        this.vertexArray[11]=this.rotPoint.y;

        this.rotPoint.setFromValues(this.rect.rgt,by,0);
        this.rotPoint.rotateZ(this.centerPoint,rot);
            
        this.vertexArray[12]=this.rotPoint.x;
        this.vertexArray[13]=this.rotPoint.y;

        this.rotPoint.setFromValues(this.rect.lft,by,0);
        this.rotPoint.rotateZ(this.centerPoint,rot);
            
        this.vertexArray[14]=this.rotPoint.x;
        this.vertexArray[15]=this.rotPoint.y;
        
            // no colors
            
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the dial
            
        this.backgroundBitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
        this.needleBitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,12);   // 16 bit indexes
        
        this.foregroundBitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,24);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

}
