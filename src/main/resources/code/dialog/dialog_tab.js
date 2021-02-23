import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';

export default class DialogTabClass
{
    constructor(core,tabCount,title)
    {
        this.core=core;
        this.title=title;
        
        this.TAB_WIDTH=150;
        this.TAB_HEIGHT=30;
        this.TAB_LEFT_MARGIN=4;
        this.TAB_RIGHT_MARGIN=4;
        this.TAB_TOP_MARGIN=10;
        this.TAB_TEXT_MARGIN=4;
        this.TAB_LINE_HEIGHT=3;
        
        this.lft=this.TAB_LEFT_MARGIN+((this.TAB_WIDTH+this.TAB_RIGHT_MARGIN)*tabCount);
        this.rgt=this.lft+this.TAB_WIDTH;
        this.top=this.TAB_TOP_MARGIN;
        this.bot=this.top+this.TAB_HEIGHT;
        
        this.colorArray=new Float32Array(4*8);
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.text=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let x,y,fontSize;
        let vertexArray,indexArray;
        let gl=this.core.gl;
        
            // vertex array
            
        vertexArray=new Float32Array(16);
        
        vertexArray[0]=vertexArray[6]=this.lft;                 // the tab itself
        vertexArray[1]=vertexArray[3]=this.top;
        vertexArray[2]=vertexArray[4]=this.rgt;
        vertexArray[5]=vertexArray[7]=this.bot;
        
        vertexArray[8]=vertexArray[14]=this.TAB_LEFT_MARGIN;     // the underline
        vertexArray[9]=vertexArray[11]=this.TAB_TOP_MARGIN+this.TAB_HEIGHT;
        vertexArray[10]=vertexArray[12]=this.core.canvas.width-this.TAB_LEFT_MARGIN;
        vertexArray[13]=vertexArray[15]=(this.TAB_TOP_MARGIN+this.TAB_HEIGHT)+this.TAB_LINE_HEIGHT;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
            // color buffer
              
        this.colorArray[16]=this.colorArray[20]=this.colorArray[24]=this.colorArray[28]=0.4;        // underline is always same color
        this.colorArray[17]=this.colorArray[21]=this.colorArray[25]=this.colorArray[29]=0.2;
        this.colorArray[18]=this.colorArray[22]=this.colorArray[26]=this.colorArray[30]=0.8;
        this.colorArray[19]=this.colorArray[23]=this.colorArray[27]=this.colorArray[31]=1;
            
        this.colorBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.colorArray,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // always drawing a quad
            
        indexArray=new Uint16Array(12);
        indexArray[0]=0;                // tab quad
        indexArray[1]=1;
        indexArray[2]=2;
        indexArray[3]=0;
        indexArray[4]=2;
        indexArray[5]=3;
        indexArray[6]=4;                // line quad
        indexArray[7]=5;
        indexArray[8]=6;
        indexArray[9]=4;
        indexArray[10]=6;
        indexArray[11]=7;
        
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexArray,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // the title text
            
        x=this.lft+this.TAB_TEXT_MARGIN;
        fontSize=Math.trunc((this.bot-this.top)*0.6);
        y=(this.bot-Math.trunc(((this.bot-this.top)-fontSize)*0.5))+Math.trunc(fontSize*0.1);
        
        this.text=new TextClass(this.core,this.title,x,y,fontSize,this.core.TEXT_ALIGN_LEFT,new ColorClass(1,1,1,1),1);
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
        
    cursorInTab()
    {
        return((this.core.cursor.x>=this.lft) && (this.core.cursor.x<this.rgt) && (this.core.cursor.y>=this.top) && (this.core.cursor.y<this.bot));
    }
    
        //
        // drawing
        //
        
    draw(selected)
    {
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        shader.drawStart();
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // button fill
        
        if (!this.cursorInTab()) {
            if (selected) {
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
                this.colorArray[0]=this.colorArray[4]=0.2;
                this.colorArray[1]=this.colorArray[5]=0.2;
                this.colorArray[2]=this.colorArray[6]=1;
                this.colorArray[3]=this.colorArray[7]=1;

                this.colorArray[8]=this.colorArray[12]=0.1;
                this.colorArray[9]=this.colorArray[13]=0.1;
                this.colorArray[10]=this.colorArray[14]=0.8;
                this.colorArray[11]=this.colorArray[15]=1;
            }
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
        
            // the underline (always gets drawn but this is UI
            // so we will excuse the slow down for convenience
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,12);

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
