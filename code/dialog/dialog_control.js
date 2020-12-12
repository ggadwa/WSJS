import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';

export default class DialogControlClass
{
    constructor(core,dialog,controlType,title,list)
    {
        this.core=core;
        this.dialog=dialog;
        this.controlType=controlType;
        this.title=title;
        this.list=list;
        
        this.value=null;
        
        this.TITLE_MARGIN=5;
        this.TEXT_INPUT_WIDTH=300;
        this.CONTROL_HEIGHT=30;
        this.HEIGHT_MARGIN=5;
        this.FONT_MARGIN=4;
        this.CHECKBOX_MARGIN=2;
        this.CONTROL_RAIL_HEIGHT=5;
        this.LIST_INPUT_WIDTH=200;
        this.LIST_CONTROL_WIDTH=20;
        this.CHECKBOX_HORIZONTAL_MARGIN=4;
        this.CHECKBOX_VERTICAL_MARGIN=-2;
        
        this.vertexArray=new Float32Array(5*2);
        this.colorArray=new Float32Array(5*4);  // there's an extra to work around the missing pixel problem
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.widgetTopColor=new ColorClass(0.7,0.7,1.0);
        this.widgetBottomColor=new ColorClass(0.5,0.5,1.0);
        this.widgetTopHighlightColor=new ColorClass(0.9,0.75,1.0);
        this.widgetBottomHighlightColor=new ColorClass(0.8,0.55,1.0);
        this.widgetOutlineColor=new ColorClass(0.0,0.0,0.6);
        this.disableColor=new ColorClass(0.6,0.6,0.7);
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
        align=(this.controlType===this.dialog.CONTROL_TYPE_HEADER)?this.core.TEXT_ALIGN_LEFT:this.core.TEXT_ALIGN_RIGHT;
        
        this.titleText=new TextClass(this.core,this.title,0,0,fontSize,align,new ColorClass(1,1,1,1),1);
        this.titleText.initialize();
        
        this.valueText=null;
        
        switch (this.controlType) {
            case this.dialog.CONTROL_TYPE_TEXT:
                this.valueText=new TextClass(this.core,'',0,0,fontSize,this.core.TEXT_ALIGN_LEFT,this.widgetTopColor,1);
                this.valueText.initialize();
                break;
            case this.dialog.CONTROL_TYPE_LIST:
                this.valueText=new TextClass(this.core,'',0,0,fontSize,this.core.TEXT_ALIGN_CENTER,this.widgetTopColor,1);
                this.valueText.initialize();
                break;
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
        
    clickHeader(y)
    {
        if ((this.core.cursor.x<this.TITLE_MARGIN) || (this.core.cursor.x>(this.core.canvas.width-this.TITLE_MARGIN)) || (this.core.cursor.y<y) || (this.core.cursor.y>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.dialog.currentOpenHeaderControl=this;
        return(true);
    }
    
    drawHeader(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.canvas.width*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=this.core.canvas.width-this.TITLE_MARGIN;
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

            // the fill
            
        if ((this.core.cursor.x<this.TITLE_MARGIN) || (this.core.cursor.x>(this.core.canvas.width-this.TITLE_MARGIN)) || (this.core.cursor.y<y) || (this.core.cursor.y>(y+this.CONTROL_HEIGHT))) { 
            this.colorArray[0]=this.colorArray[4]=this.widgetTopColor.r;
            this.colorArray[1]=this.colorArray[5]=this.widgetTopColor.g;
            this.colorArray[2]=this.colorArray[6]=this.widgetTopColor.b;
            this.colorArray[3]=this.colorArray[7]=1;

            this.colorArray[8]=this.colorArray[12]=this.widgetBottomColor.r;
            this.colorArray[9]=this.colorArray[13]=this.widgetBottomColor.g
            this.colorArray[10]=this.colorArray[14]=this.widgetBottomColor.b;
            this.colorArray[11]=this.colorArray[15]=1;
        }
        else {
            this.colorArray[0]=this.colorArray[4]=this.widgetTopHighlightColor.r;
            this.colorArray[1]=this.colorArray[5]=this.widgetTopHighlightColor.g;
            this.colorArray[2]=this.colorArray[6]=this.widgetTopHighlightColor.b;
            this.colorArray[3]=this.colorArray[7]=1;

            this.colorArray[8]=this.colorArray[12]=this.widgetBottomHighlightColor.r;
            this.colorArray[9]=this.colorArray[13]=this.widgetBottomHighlightColor.g
            this.colorArray[10]=this.colorArray[14]=this.widgetBottomHighlightColor.b;
            this.colorArray[11]=this.colorArray[15]=1;
        }
        
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
        
    clickTextInput(y)
    {
        let x=Math.trunc(this.core.canvas.width*0.5);
        
        if ((this.core.cursor.x<x) || (this.core.cursor.x>((x+(this.TITLE_MARGIN*2))+this.TEXT_INPUT_WIDTH)) || (this.core.cursor.y<y) || (this.core.cursor.y>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.dialog.currentTextInputControl=this;
        this.core.input.keyClearLastRaw();
        
        return(true);
    }
        
    drawTextInput(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.canvas.width*0.5);
        
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
        
        if ((this.dialog.currentTextInputControl===this) && (!this.core.input.paused) && ((Math.trunc(window.performance.now())&0x200)!=0)) {
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
        
    clickCheckbox(y)
    {
        let x=Math.trunc(this.core.canvas.width*0.5);
        
        if ((this.core.cursor.x<(x+this.TITLE_MARGIN)) || (this.core.cursor.x>((x+this.TITLE_MARGIN)+(this.CONTROL_HEIGHT*2))) || (this.core.cursor.y<y) || (this.core.cursor.y>(y+this.CONTROL_HEIGHT))) return(false);
        
        this.value=!this.value;
        
        this.dialog.currentTextInputControl=null;
        return(true);
    }
        
    drawCheckbox(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.canvas.width*0.5);
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+(this.CONTROL_HEIGHT*2);
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
            // the control fill
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the check fill
            
        if (this.value) {
            this.vertexArray[0]=this.vertexArray[6]=((x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT)+1;
            this.vertexArray[2]=this.vertexArray[4]=((x+this.TITLE_MARGIN)+(this.CONTROL_HEIGHT*2))-1;
            
        }
        else {
            this.vertexArray[0]=this.vertexArray[6]=(x+this.TITLE_MARGIN)+1;
            this.vertexArray[2]=this.vertexArray[4]=((x+this.TITLE_MARGIN)+this.CONTROL_HEIGHT)-1;
        }
        
        this.vertexArray[1]=this.vertexArray[3]=y+1;
        this.vertexArray[5]=this.vertexArray[7]=(y+this.CONTROL_HEIGHT)-1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
            
        if (this.value) {
            this.colorArray[0]=this.colorArray[4]=this.widgetTopColor.r;
            this.colorArray[1]=this.colorArray[5]=this.widgetTopColor.g;
            this.colorArray[2]=this.colorArray[6]=this.widgetTopColor.b;
            this.colorArray[3]=this.colorArray[7]=1;

            this.colorArray[8]=this.colorArray[12]=this.widgetBottomColor.r;
            this.colorArray[9]=this.colorArray[13]=this.widgetBottomColor.g
            this.colorArray[10]=this.colorArray[14]=this.widgetBottomColor.b;
            this.colorArray[11]=this.colorArray[15]=1;
        }
        else {
            this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.disableColor.r;
            this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.disableColor.g;
            this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.disableColor.b;
            this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the check outline
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);
        
            // the control outline
            
        this.vertexArray[0]=this.vertexArray[6]=x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=y;
        this.vertexArray[2]=this.vertexArray[4]=(x+this.TITLE_MARGIN)+(this.CONTROL_HEIGHT*2);
        this.vertexArray[5]=this.vertexArray[7]=y+this.CONTROL_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
            
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
        // range
        //
        
    clickRange(y)
    {
        let hx;
        let x=Math.trunc(this.core.canvas.width*0.5);
        
        if ((this.core.cursor.x<x) || (this.core.cursor.x>((x+(this.TITLE_MARGIN*2))+this.TEXT_INPUT_WIDTH)) || (this.core.cursor.y<y) || (this.core.cursor.y>(y+this.CONTROL_HEIGHT))) return(false);
        
        hx=Math.trunc(((this.core.cursor.x-(x+this.TITLE_MARGIN))/this.TEXT_INPUT_WIDTH)*100); // we go a little over each edge so we can click to 0/100
        if (hx<0) hx=0;
        if (hx>100) hx=100;
        
        this.value=hx;
        
        this.dialog.currentTextInputControl=null;
        return(false);
    }
        
    drawRange(y)
    {
        let x,hx,my,hsz;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.canvas.width*0.5);
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
        
    clickList(y)
    {
        let x=Math.trunc(this.core.canvas.width*0.5);
        
            // down
            
        if ((this.core.cursor.x>=(x+(this.TITLE_MARGIN*2))) && (this.core.cursor.x<((x+(this.TITLE_MARGIN*2))+this.LIST_CONTROL_WIDTH)) && (this.core.cursor.y>=y) && (this.core.cursor.y<(y+this.CONTROL_HEIGHT))) {
            this.value--;
            if (this.value<0) this.value=0;
            
            this.dialog.currentTextInputControl=null;
            return(true);
        }
        
             // up
            
        if ((this.core.cursor.x>=((x+this.LIST_INPUT_WIDTH)-this.LIST_CONTROL_WIDTH)) && (this.core.cursor.x<(x+this.LIST_INPUT_WIDTH)) && (this.core.cursor.y>=y) && (this.core.cursor.y<(y+this.CONTROL_HEIGHT))) {
            this.value++;
            if (this.value>=this.list.length) this.value=this.list.length-1;
            
            this.dialog.currentTextInputControl=null;
            return(true);
        }
       
        return(false);
    }

    drawList(y)
    {
        let x;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        x=Math.trunc(this.core.canvas.width*0.5);
        
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
        
    click()
    {
        switch (this.controlType) {
            case this.dialog.CONTROL_TYPE_HEADER:
                return(this.clickHeader(this.lastDrawY));
            case this.dialog.CONTROL_TYPE_TEXT:
                return(this.clickTextInput(this.lastDrawY));
            case this.dialog.CONTROL_TYPE_CHECKBOX:
                return(this.clickCheckbox(this.lastDrawY));
            case this.dialog.CONTROL_TYPE_RANGE:
                return(this.clickRange(this.lastDrawY));
            case this.dialog.CONTROL_TYPE_LIST:
                return(this.clickList(this.lastDrawY));
        }
        
        return(false);
    }
    
        //
        // drawing
        //
        
    draw(y)
    {
        this.lastDrawY=y;
        
        switch (this.controlType) {
            case this.dialog.CONTROL_TYPE_HEADER:
                return(this.drawHeader(y));
            case this.dialog.CONTROL_TYPE_TEXT:
                return(this.drawTextInput(y));
            case this.dialog.CONTROL_TYPE_CHECKBOX:
                return(this.drawCheckbox(y));
            case this.dialog.CONTROL_TYPE_RANGE:
                return(this.drawRange(y));
            case this.dialog.CONTROL_TYPE_LIST:
                return(this.drawList(y));
        }
        
        return(y);
    }
}
