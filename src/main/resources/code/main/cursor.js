import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class CursorClass
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
        
        this.currentTouchId=-1;
        
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
        this.x=Math.trunc(this.core.canvas.width*0.5);
        this.y=Math.trunc(this.core.canvas.height*0.5);
        
        this.currentTouchId=-1;
    }
    
    run()
    {
        let touch;
        let input=this.core.input;
        
            // touch cursor
            
        if (input.hasTouch) {
            
                // is there a current touch?
                
            if (this.currentTouchId!==-1) {
                
                    // get any movement
                    
                while(true) {
                    touch=input.getNextTouchMove();
                    if (touch===null) break;
                    
                    if (touch.id===this.currentTouchId) {
                        this.x=touch.x;
                        this.y=touch.y;
                    }
                }
                
                    // see if we are going up
                    
                while(true) {
                    touch=input.getNextTouchEnd();
                    if (touch===null) break;
                    
                    if (touch.id===this.currentTouchId) {
                        this.currentTouchId=-1;
                        break;
                    }
                }
                
                return(this.currentTouchId!==-1);       // continue reporting a click until it ends, so it works like a mouse click
            }
            
                // any new touches?
            
            this.x=-1;
            this.y=-1;

            while (true) {
                touch=input.getNextTouchStart();
                if (touch===null) break;
                
                this.currentTouchId=touch.id;
                this.x=touch.x;
                this.y=touch.y;
                
                console.info('had touch='+this.x+'>'+this.y);
                
                return(true);           // a click
            }
            
            return(false);
        }
        
            // mouse cursor
            
        this.x+=input.getMouseMoveX();
        if (this.x<0) this.x=0;
        if (this.x>=this.core.canvas.width) this.x=this.core.canvas.width-1;

        this.y+=input.getMouseMoveY();
        if (this.y<0) this.y=0;
        if (this.y>=this.core.canvas.height) this.y=this.core.canvas.height-1;
            
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
