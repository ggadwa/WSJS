import ColorClass from '../utility/color.js';
import InterfaceTextClass from '../interface/interface_text.js';

export default class InterfaceControlClass
{
    constructor(core,controlType,title,list)
    {
        this.core=core;
        this.controlType=controlType;
        this.title=title;
        this.list=list;
        
        this.value=null;
        
        this.show=true;
        
        this.TITLE_MARGIN=5;
        this.TEXT_INPUT_WIDTH=300;
        this.CONTROL_HEIGHT=30;
        this.HEIGHT_MARGIN=5;
        this.FONT_MARGIN=4;
        this.CHECKBOX_MARGIN=2;
        this.CONTROL_RAIL_HEIGHT=5;
        this.LIST_INPUT_WIDTH=200;
        this.LIST_CONTROL_WIDTH=20;
        
        this.vertexArray=new Float32Array(5*2);
        this.colorArray=new Float32Array(5*4);  // there's an extra to work around the missing pixel problem
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.widgetTopColor=new ColorClass(0.7,0.7,1.0);
        this.widgetBottomColor=new ColorClass(0.5,0.5,1.0);
        this.widgetOutlineColor=new ColorClass(0.0,0.0,0.6);
        this.fillColor=new ColorClass(0.9,0.9,0.9);
        this.outlineColor=new ColorClass(0.5,0.5,0.5);
        
        this.titleText=null;
        this.valueText=null;
        
        this.lastDrawY=0;
        
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
        
        if ((this.controlType===this.core.interface.CONTROL_TYPE_TEXT) || (this.controlType===this.core.interface.CONTROL_TYPE_LIST)) {
            align=(this.controlType===this.core.interface.CONTROL_TYPE_TEXT)?this.core.interface.TEXT_ALIGN_LEFT:this.core.interface.TEXT_ALIGN_CENTER;
            
            this.valueText=new InterfaceTextClass(this.core,'',0,0,fontSize,align,this.widgetTopColor,1,false);
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
        // headers
        //
        
    clickHeader(y,cursorX,cursorY)
    {
        if ((cursorX<this.TITLE_MARGIN) || (cursorX>(this.core.wid-this.TITLE_MARGIN)) || (cursorY<y) || (cursorY>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.core.interface.currentOpenHeaderControl=this;
        return(true);
    }
    
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
            
        this.colorArray[0]=this.colorArray[4]=this.widgetTopColor.r;
        this.colorArray[1]=this.colorArray[5]=this.widgetTopColor.g;
        this.colorArray[2]=this.colorArray[6]=this.widgetTopColor.b;
        this.colorArray[3]=this.colorArray[7]=1;

        this.colorArray[8]=this.colorArray[12]=this.widgetBottomColor.r;
        this.colorArray[9]=this.colorArray[13]=this.widgetBottomColor.g
        this.colorArray[10]=this.colorArray[14]=this.widgetBottomColor.b;
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
        
    clickTextInput(y,cursorX,cursorY)
    {
        let x=Math.trunc(this.core.wid*0.5);
        
        if ((cursorX<x) || (cursorX>((x+(this.TITLE_MARGIN*2))+this.TEXT_INPUT_WIDTH)) || (cursorY<y) || (cursorY>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.core.interface.currentTextInputControl=this;
        this.core.input.keyClearLastRaw();
        
        return(true);
    }
        
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
        
        if (this.value===null) this.value='';
        
        if ((this.core.interface.currentTextInputControl===this) && (!this.core.input.paused) && ((Math.trunc(window.performance.now())&0x200)!=0)) {
            this.valueText.str=this.value+'_';
        }
        else {
            this.valueText.str=this.value;
        }
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.valueText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // checkbox
        //
        
    clickCheckbox(y,cursorX,cursorY)
    {
        let x=Math.trunc(this.core.wid*0.5);
        
        if ((cursorX<(x+this.TITLE_MARGIN)) || (cursorX>((x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT)) || (cursorY<y) || (cursorY>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.value=!this.value;
        
        this.core.interface.currentTextInputControl=null;
        return(true);
    }
        
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
          
        if (this.value) {
            this.vertexArray[0]=this.vertexArray[6]=(x+this.TITLE_MARGIN)+this.CHECKBOX_MARGIN;
            this.vertexArray[1]=this.vertexArray[3]=y+this.CHECKBOX_MARGIN;
            this.vertexArray[2]=this.vertexArray[4]=((x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT)-this.CHECKBOX_MARGIN;
            this.vertexArray[5]=this.vertexArray[7]=(y+this.CONTROL_HEIGHT)-this.CHECKBOX_MARGIN;

            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);

            this.colorArray[0]=this.colorArray[4]=this.widgetBottomColor.r;
            this.colorArray[1]=this.colorArray[5]=this.widgetBottomColor.g;
            this.colorArray[2]=this.colorArray[6]=this.widgetBottomColor.b;
            this.colorArray[3]=this.colorArray[7]=1;

            this.colorArray[8]=this.colorArray[12]=this.widgetTopColor.r;
            this.colorArray[9]=this.colorArray[13]=this.widgetTopColor.g
            this.colorArray[10]=this.colorArray[14]=this.widgetTopColor.b;
            this.colorArray[11]=this.colorArray[15]=1;

            gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);

            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
            
            this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.widgetOutlineColor.r;
            this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.widgetOutlineColor.g;
            this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.widgetOutlineColor.b;
            this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
            
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
            
            gl.drawArrays(gl.LINE_LOOP,0,4);
        }
        
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
        
    clickRange(y,cursorX,cursorY)
    {
        let hx;
        let x=Math.trunc(this.core.wid*0.5);
        
        if ((cursorX<x) || (cursorX>((x+(this.TITLE_MARGIN*2))+this.TEXT_INPUT_WIDTH)) || (cursorY<y) || (cursorY>(y+this.CONTROL_HEIGHT))) return(false);
        
        hx=Math.trunc(((cursorX-(x+this.TITLE_MARGIN))/this.TEXT_INPUT_WIDTH)*100); // we go a little over each edge so we can click to 0/100
        if (hx<0) hx=0;
        if (hx>100) hx=100;
        
        this.value=hx;
        
        this.core.interface.currentTextInputControl=null;
        return(false);
    }
        
    drawRange(y)
    {
        let x,hx,my,hsz;
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
            
        if (!Number.isInteger(this.value)) this.value=0;
        
        hsz=Math.trunc(this.CONTROL_HEIGHT*0.5);
        hx=x+Math.trunc(this.value*(this.TEXT_INPUT_WIDTH-hsz)/100);
            
        this.vertexArray[0]=this.vertexArray[6]=hx+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(hx+this.TITLE_MARGIN)+hsz;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the handle fill
            
            this.colorArray[0]=this.colorArray[4]=this.widgetBottomColor.r;
            this.colorArray[1]=this.colorArray[5]=this.widgetBottomColor.g;
            this.colorArray[2]=this.colorArray[6]=this.widgetBottomColor.b;
            this.colorArray[3]=this.colorArray[7]=1;

            this.colorArray[8]=this.colorArray[12]=this.widgetTopColor.r;
            this.colorArray[9]=this.colorArray[13]=this.widgetTopColor.g
            this.colorArray[10]=this.colorArray[14]=this.widgetTopColor.b;
            this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the handle outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.widgetOutlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.widgetOutlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.widgetOutlineColor.b;
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
        // list
        //
        
    clickList(y,cursorX,cursorY)
    {
        let x=Math.trunc(this.core.wid*0.5);
        
            // down
            
        if ((cursorX>=(x+(this.TITLE_MARGIN*2))) && (cursorX<((x+(this.TITLE_MARGIN*2))+this.LIST_CONTROL_WIDTH)) && (cursorY>=y) && (cursorY<(y+this.CONTROL_HEIGHT))) {
            this.value--;
            if (this.value<0) this.value=0;
            
            this.core.interface.currentTextInputControl=null;
            return(true);
        }
        
             // up
            
        if ((cursorX>=((x+this.LIST_INPUT_WIDTH)-this.LIST_CONTROL_WIDTH)) && (cursorX<(x+this.LIST_INPUT_WIDTH)) && (cursorY>=y) && (cursorY<(y+this.CONTROL_HEIGHT))) {
            this.value++;
            if (this.value>=this.list.length) this.value=this.list.length-1;
            
            this.core.interface.currentTextInputControl=null;
            return(true);
        }
       
        return(false);
    }

    drawList(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.wid*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH;
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
        this.vertexArray[2]=this.vertexArray[4]=(x+(this.TITLE_MARGIN*2))+this.LIST_CONTROL_WIDTH;
        this.vertexArray[3]=y+this.FONT_MARGIN;
        this.vertexArray[5]=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.widgetBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.widgetBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.widgetBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_SHORT,0);
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.widgetOutlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.widgetOutlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.widgetOutlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;
        
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,3);
        
            // up
            
        this.vertexArray[0]=x+this.LIST_INPUT_WIDTH;
        this.vertexArray[1]=y+Math.trunc(this.CONTROL_HEIGHT*0.5);
        this.vertexArray[2]=this.vertexArray[4]=(x+this.LIST_INPUT_WIDTH)-this.LIST_CONTROL_WIDTH;
        this.vertexArray[3]=y+this.FONT_MARGIN;
        this.vertexArray[5]=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.widgetBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.widgetBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.widgetBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawElements(gl.TRIANGLES,3,gl.UNSIGNED_SHORT,0);
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.widgetOutlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.widgetOutlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.widgetOutlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;
        
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,3);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title and value text
            
        this.titleText.x=x-this.TITLE_MARGIN;
        this.titleText.y=(y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        this.valueText.x=(x+this.TITLE_MARGIN)+Math.trunc(this.LIST_INPUT_WIDTH*0.5);
        this.valueText.y=this.titleText.y;
        this.valueText.str=''+this.list[this.value];
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.valueText.draw();
        this.core.shaderList.textShader.drawStart();
        
        return((y+this.CONTROL_HEIGHT)+this.HEIGHT_MARGIN);
    }
    
        //
        // clicking
        //
        
    click(cursorX,cursorY)
    {
        switch (this.controlType) {
            case this.core.interface.CONTROL_TYPE_HEADER:
                return(this.clickHeader(this.lastDrawY,cursorX,cursorY));
            case this.core.interface.CONTROL_TYPE_TEXT:
                return(this.clickTextInput(this.lastDrawY,cursorX,cursorY));
            case this.core.interface.CONTROL_TYPE_CHECKBOX:
                return(this.clickCheckbox(this.lastDrawY,cursorX,cursorY));
            case this.core.interface.CONTROL_TYPE_RANGE:
                return(this.clickRange(this.lastDrawY,cursorX,cursorY));
            case this.core.interface.CONTROL_TYPE_LIST:
                return(this.clickList(this.lastDrawY,cursorX,cursorY));
        }
        
        return(false);
    }
    
        //
        // drawing
        //
        
    draw(y,cursorX,cursorY)
    {
        this.lastDrawY=y;
        
        switch (this.controlType) {
            case this.core.interface.CONTROL_TYPE_HEADER:
                return(this.drawHeader(y));
            case this.core.interface.CONTROL_TYPE_TEXT:
                return(this.drawTextInput(y));
            case this.core.interface.CONTROL_TYPE_CHECKBOX:
                return(this.drawCheckbox(y));
            case this.core.interface.CONTROL_TYPE_RANGE:
                return(this.drawRange(y));
            case this.core.interface.CONTROL_TYPE_LIST:
                return(this.drawList(y));
        }
        
        return(y);
    }
}
