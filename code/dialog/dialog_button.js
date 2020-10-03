import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class DialogButtonClass
{
    constructor(core,lft,top,rgt,bot,bitmapPath,highlightBitmapPath)
    {
        this.core=core;
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
        this.bitmapPath=bitmapPath;
        this.highlightBitmapPath=highlightBitmapPath;
        
        this.bitmap=null;
        this.highlightBitmap=null;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let vertexArray,uvArray,indexArray;
        let gl=this.core.gl;
        
            // any bitmaps
            
        this.bitmap=new BitmapInterfaceClass(this.core,this.bitmapPath);
        if (!(await this.bitmap.load())) return(false);
        
        this.highlightBitmap=new BitmapInterfaceClass(this.core,this.highlightBitmapPath);
        if (!(await this.highlightBitmap.load())) return(false);
        
            // vertex array
            
        vertexArray=new Float32Array(8);
        
        vertexArray[0]=vertexArray[6]=this.lft;
        vertexArray[1]=vertexArray[3]=this.top;
        vertexArray[2]=vertexArray[4]=this.rgt;
        vertexArray[5]=vertexArray[7]=this.bot;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
            // index array
            
        uvArray=new Float32Array(8);
        
        uvArray[0]=0;
        uvArray[1]=0;
        uvArray[2]=1;
        uvArray[3]=0;
        uvArray[4]=1;
        uvArray[5]=1;
        uvArray[6]=0;
        uvArray[7]=1;

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // always drawing a single quad
            
        indexArray=new Uint16Array(6);
        indexArray[0]=0;
        indexArray[1]=1;
        indexArray[2]=2;
        indexArray[3]=0;
        indexArray[4]=2;
        indexArray[5]=3;
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        return(true);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
        
        if (this.bitmap!==null) this.bitmap.release();
        if (this.highlightBitmap!==null) this.highlightBitmap.release();
    }
    
        //
        // clicking
        //
        
    cursorInButton(cursorX,cursorY)
    {
        return((cursorX>=this.lft) && (cursorX<this.rgt) && (cursorY>=this.top) && (cursorY<this.bot));
    }
    
        //
        // drawing
        //
        
    draw(cursorX,cursorY)
    {
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        
            // setup the drawing
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the button
            
        if (this.cursorInButton(cursorX,cursorY)) {
            this.highlightBitmap.attach();
        }
        else {
            this.bitmap.attach();
        }
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
    
}
