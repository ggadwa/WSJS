import ColorClass from '../utility/color.js';
import InterfaceTextClass from '../interface/interface_text.js';

export default class InterfaceControlClass
{
    constructor(core,controlType,title,maxNumber)
    {
        this.core=core;
        this.controlType=controlType;
        this.title=title;
        this.maxNumber=maxNumber;
        
        this.value=null;
        
        this.TITLE_MARGIN=5;
        this.TEXT_INPUT_WIDTH=300;
        this.CONTROL_HEIGHT=30;
        this.HEIGHT_MARGIN=5;
        this.FONT_MARGIN=3;
        this.CHECKBOX_MARGIN=5;
        this.CONTROL_RAIL_HEIGHT=10;
        this.NUMBER_INPUT_WIDTH=100;
        this.NUMBER_CONTROL_WIDTH=20;
        
        this.vertexArray=new Float32Array(4*2);
        this.colorArray=new Float32Array(4*4);
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.blueTopColor=new ColorClass(0.7,0.7,1.0);
        this.blueBottomColor=new ColorClass(0.5,0.5,1.0);
        this.outlineColor=new ColorClass(0.5,0.5,0.5);
        this.fillColor=new ColorClass(0.9,0.9,0.9);
        
        this.titleText=null;
        this.valueText=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let fontSize,align;
        let indexArray;
        let gl=this.core.gl;
        
            // vertex array
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexArray,gl.DYNAMIC_DRAW);
        
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
            
        fontSize=Math.trunc(this.CONTROL_HEIGHT*0.6);
        align=(this.controlType===this.core.interface.CONTROL_TYPE_HEADER)?this.core.interface.TEXT_ALIGN_LEFT:this.core.interface.TEXT_ALIGN_RIGHT;
        
        this.titleText=new InterfaceTextClass(this.core,this.title,0,0,fontSize,align,new ColorClass(1,1,1,1),1,false);
        this.titleText.initialize();
        
        if ((this.controlType===this.core.interface.CONTROL_TYPE_TEXT) || (this.controlType===this.core.interface.CONTROL_TYPE_NUMBER)) {
            align=(this.controlType===this.core.interface.CONTROL_TYPE_TEXT)?this.core.interface.TEXT_ALIGN_LEFT:this.core.interface.TEXT_ALIGN_CENTER;
            
            this.valueText=new InterfaceTextClass(this.core,'123',0,0,fontSize,align,this.blueTopColor,1,false);
            this.valueText.initialize();
        }
        else {
            this.valueText=null;
        }

        return(true);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        this.titleText.release();
        if (this.valueText!==null) this.valueText.release();
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // clicking
        //
        
    cursorInButton(cursorX,cursorY)
    {
    //    return((cursorX>=this.lft) && (cursorX<this.rgt) && (cursorY>=this.top) && (cursorY<this.bot));
    }
    
        //
        // headers
        //
        
    drawHeader(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=this.core.wid-this.TITLE_MARGIN;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

            // the fill
            
        this.colorArray[0]=this.colorArray[4]=this.blueTopColor.r;
        this.colorArray[1]=this.colorArray[5]=this.blueTopColor.g;
        this.colorArray[2]=this.colorArray[6]=this.blueTopColor.b;
        this.colorArray[3]=this.colorArray[7]=1;

        this.colorArray[8]=this.colorArray[12]=this.blueBottomColor.r;
        this.colorArray[9]=this.colorArray[13]=this.blueBottomColor.g
        this.colorArray[10]=this.colorArray[14]=this.blueBottomColor.b;
        this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title text
            
        this.titleText.x=(this.TITLE_MARGIN*2);
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // text input
        //
        
    drawTextInput(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+this.TEXT_INPUT_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title and value text
            
        this.titleText.x=x-this.TITLE_MARGIN;
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        this.valueText.x=x+(this.TITLE_MARGIN*2);
        this.valueText.y=this.titleText.y;
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.valueText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // checkbox
        //
        
    drawCheckbox(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);
        
            // the check
            
        this.vertexArray[0]=this.vertexArray[6]=(x+this.TITLE_MARGIN)+this.CHECKBOX_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y+this.CHECKBOX_MARGIN;
        this.vertexArray[2]=this.vertexArray[4]=((x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT)-this.CHECKBOX_MARGIN;
        this.vertexArray[5]=this.vertexArray[7]=(y+this.CONTROL_HEIGHT)-this.CHECKBOX_MARGIN;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.blueBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.blueBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.blueBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title text
            
        this.titleText.x=x-this.TITLE_MARGIN;
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
         
        //
        // range
        //
        
    drawRange(y)
    {
        let x,my;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        my=(y+Math.trunc(this.CONTROL_HEIGHT*0.5))-Math.trunc(this.CONTROL_RAIL_HEIGHT*0.5);
        
        shader.drawStart();
        
            // the track
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=my;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+this.TEXT_INPUT_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=my+this.CONTROL_RAIL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the track fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the track outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);
        
            // the handle
            
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+Math.trunc(this.CONTROL_HEIGHT*0.5);
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the handle fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.blueBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.blueBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.blueBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the track outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);

            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title text
            
        this.titleText.x=x-this.TITLE_MARGIN;
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // number
        //

    drawNumber(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+this.NUMBER_INPUT_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);
        
            // down
            
        this.vertexArray[0]=x+(this.TITLE_MARGIN*2);
        this.vertexArray[1]=y+Math.trunc(this.CONTROL_HEIGHT*0.5);
        this.vertexArray[2]=this.vertexArray[4]=(x+(this.TITLE_MARGIN*2))+this.NUMBER_CONTROL_WIDTH;
        this.vertexArray[3]=y+this.FONT_MARGIN;
        this.vertexArray[5]=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.blueBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.blueBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.blueBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_SHORT,0);
        
            // up
            
        this.vertexArray[0]=x+this.NUMBER_INPUT_WIDTH;
        this.vertexArray[1]=y+Math.trunc(this.CONTROL_HEIGHT*0.5);
        this.vertexArray[2]=this.vertexArray[4]=(x+this.NUMBER_INPUT_WIDTH)-this.NUMBER_CONTROL_WIDTH;
        this.vertexArray[3]=y+this.FONT_MARGIN;
        this.vertexArray[5]=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        
        gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_SHORT,0);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title and value text
            
        this.titleText.x=x-this.TITLE_MARGIN;
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        this.valueText.x=(x+this.TITLE_MARGIN)+Math.trunc(this.NUMBER_INPUT_WIDTH*0.5);
        this.valueText.y=this.titleText.y;
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.valueText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // drawing
        //
        
    draw(y,cursorX,cursorY)
    {
        switch (this.controlType) {
            case this.core.interface.CONTROL_TYPE_HEADER:
                return(this.drawHeader(y));
            case this.core.interface.CONTROL_TYPE_TEXT:
                return(this.drawTextInput(y));
            case this.core.interface.CONTROL_TYPE_CHECKBOX:
                return(this.drawCheckbox(y));
            case this.core.interface.CONTROL_TYPE_RANGE:
                return(this.drawRange(y));
            case this.core.interface.CONTROL_TYPE_NUMBER:
                return(this.drawNumber(y));
        }
        
        return(y);
    }
    
}
