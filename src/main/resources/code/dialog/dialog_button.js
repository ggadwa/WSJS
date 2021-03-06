import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';

export default class DialogButtonClass
{
    constructor(core,x,y,wid,high,title)
    {
        this.core=core;
        this.title=title;
        
        this.lft=x;
        this.rgt=x+wid;
        this.top=y;
        this.bot=y+high;
        
        this.DIALOG_BUTTON_TEXT_SIZE=20;
        
        this.colorArray=new Float32Array(4*4);
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.text=null;
        this.show=true;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let x,y;
        let vertexArray,indexArray;
        let gl=this.core.gl;
        
            // vertex array
            
        vertexArray=new Float32Array(8);
        
        vertexArray[0]=vertexArray[6]=this.lft;
        vertexArray[1]=vertexArray[3]=this.top;
        vertexArray[2]=vertexArray[4]=this.rgt;
        vertexArray[5]=vertexArray[7]=this.bot;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
            // color buffer
            
        this.colorBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.colorArray,gl.DYNAMIC_DRAW);
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
        
            // the title text
            
        x=Math.trunc((this.lft+this.rgt)*0.5);
        y=(this.bot-Math.trunc(((this.bot-this.top)-this.DIALOG_BUTTON_TEXT_SIZE)*0.5))+Math.trunc(this.DIALOG_BUTTON_TEXT_SIZE*0.1);
        
        this.text=new TextClass(this.core,this.title,x,y,this.DIALOG_BUTTON_TEXT_SIZE,this.core.TEXT_ALIGN_CENTER,new ColorClass(1,1,1,1),1);
        this.text.initialize();
    }
    
    release()
    {
        let gl=this.core.gl;
        
        this.text.release();
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // clicking
        //
        
    cursorIn()
    {
        return((this.core.cursor.x>=this.lft) && (this.core.cursor.x<this.rgt) && (this.core.cursor.y>=this.top) && (this.core.cursor.y<this.bot));
    }
    
        //
        // drawing
        //
        
    draw(highlight)
    {
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        shader.drawStart();
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // button fill
        
        if (!highlight) {
            this.colorArray[0]=this.colorArray[4]=0.7;
            this.colorArray[1]=this.colorArray[5]=0.2;
            this.colorArray[2]=this.colorArray[6]=1;
            this.colorArray[3]=this.colorArray[7]=1;
        
            this.colorArray[8]=this.colorArray[12]=0.4;
            this.colorArray[9]=this.colorArray[13]=0.2;
            this.colorArray[10]=this.colorArray[14]=0.8;
            this.colorArray[11]=this.colorArray[15]=1;
        }
        else {
            this.colorArray[0]=this.colorArray[4]=1;
            this.colorArray[1]=this.colorArray[5]=0;
            this.colorArray[2]=this.colorArray[6]=1;
            this.colorArray[3]=this.colorArray[7]=1;
        
            this.colorArray[8]=this.colorArray[12]=0.8;
            this.colorArray[9]=this.colorArray[13]=0;
            this.colorArray[10]=this.colorArray[14]=0.8;
            this.colorArray[11]=this.colorArray[15]=1;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=0;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=0;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=0;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the text
            
        this.core.shaderList.textShader.drawStart();
        this.text.draw();
        this.core.shaderList.textShader.drawEnd();
    }
    
}
