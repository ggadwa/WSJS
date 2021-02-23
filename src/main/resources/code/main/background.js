import ColorClass from '../utility/color.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class InterfaceBackgroundClass
{
    constructor(core)
    {
        this.core=core;
        
        this.titleBitmap=null;
        
        this.vertexArray=new Float32Array(2*4);     // 2D, only 2 vertex coordinates
        
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
        
            // title bitmap
            
        this.titleBitmap=new BitmapInterfaceClass(this.core,'textures/ui_title.png');
        if (!(await this.titleBitmap.load())) return(false);
        
            // vertex array
            
        vertexArray=new Float32Array(8);
        
        vertexArray[0]=vertexArray[6]=0;
        vertexArray[1]=vertexArray[3]=0;
        vertexArray[2]=vertexArray[4]=this.core.canvas.width;
        vertexArray[5]=vertexArray[7]=this.core.canvas.height;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.DYNAMIC_DRAW);
        
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
        
        this.titleBitmap.release();
    }
        
        //
        // drawing
        //
        
    draw(inDialog)
    {
        let shader=this.core.shaderList.interfaceShader;
        let gl=this.core.gl;
        
        shader.drawStart();       // we set these here instead of globally as UI interfaces have multiple shaders
        
        if (!inDialog) {
            gl.uniform4f(shader.colorUniform,1,1,1,1);
        }
        else {
            gl.uniform4f(shader.colorUniform,0.2,0.2,0.2,1);
        }
        
            // setup the drawing
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw
            
        this.titleBitmap.attach();
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }

}

