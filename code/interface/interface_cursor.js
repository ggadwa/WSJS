import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class DialogCursorClass
{
    constructor(core)
    {
        this.CURSOR_WIDTH=32;
        this.CURSOR_HEIGHT=32;
        
        this.core=core;
        
        this.cursorBitmap=null;
        
        this.vertexArray=new Float32Array(2*4);     // 2D, only 2 vertex coordinates
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        this.x=0;
        this.y=0;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let uvArray,indexArray;
        let gl=this.core.gl;
        
            // bitmap
            
        this.cursorBitmap=new BitmapInterfaceClass(this.core,'textures/ui_cursor.png');
        if (!(await this.cursorBitmap.load())) return(false);
        
            // vertex array
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
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
        
        this.cursorBitmap.release();
    }
        
        //
        // running
        //
        
    center()
    {
        this.x=Math.trunc(this.core.wid*0.5);
        this.y=Math.trunc(this.core.high*0.5);
    }
    
    run()
    {
        let input=this.core.input;
        
            // mouse move cursor
            
        if (input.hasTouch) {
            this.x=-1;
            this.y=-1;
        }
        else {
            this.x+=input.getMouseMoveX();
            if (this.x<0) this.x=0;
            if (this.x>=this.core.wid) this.x=this.core.wid-1;

            this.y+=input.getMouseMoveY();
            if (this.y<0) this.y=0;
            if (this.y>=this.core.high) this.y=this.core.high-1;
        }
        
            // clicks
            
        return(input.mouseButtonFlags[0]);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        shader.drawStart();       // we set these here instead of globally as UI interfaces have multiple shaders
        
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        
            // setup the drawing
            
        this.vertexArray[0]=this.vertexArray[6]=this.x;
        this.vertexArray[1]=this.vertexArray[3]=this.y;
        this.vertexArray[2]=this.vertexArray[4]=this.x+this.CURSOR_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=this.y+this.CURSOR_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw the curosr
            
        this.cursorBitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }
    
}
