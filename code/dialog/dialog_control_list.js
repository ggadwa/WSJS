import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlClass extends DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y,title,list)
    {
        super(core,dialog,tabId,x,y,title);

        this.list=list;
        
        this.LIST_INPUT_PER_VIEW_ITEM_COUNT=10;
        this.LIST_INPUT_ITEM_HEIGHT=this.CONTROL_HEIGHT;
        
        this.LIST_INPUT_WIDTH=this.TEXT_INPUT_WIDTH;
        this.LIST_INPUT_HEIGHT=this.LIST_INPUT_PER_VIEW_ITEM_COUNT*this.LIST_INPUT_ITEM_HEIGHT;

        this.LIST_ARROW_WIDTH=20;
        this.LIST_ARROW_MARGIN=4;
        
        this.vertexArray=new Float32Array(8);
        this.colorArray=new Float32Array(16);  // there's an extra to work around the missing pixel problem
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.titleText=null;
        this.valueTexts=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let n,x,y,fontSize,valueText;
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
        
        this.titleText=new TextClass(this.core,this.title,(this.x-this.TITLE_MARGIN),((this.y+this.CONTROL_HEIGHT)-this.FONT_MARGIN),fontSize,this.core.TEXT_ALIGN_RIGHT,new ColorClass(1,1,1,1),1);
        this.titleText.initialize();
        
        this.valueTexts=[];
        
        x=(this.x+this.TITLE_MARGIN)+this.FONT_MARGIN;
        y=(this.y+this.CONTROL_HEIGHT)-this.FONT_MARGIN;
        
        for (n=0;n!==this.LIST_INPUT_PER_VIEW_ITEM_COUNT;n++) {
            valueText=new TextClass(this.core,'',x,y,fontSize,this.core.TEXT_ALIGN_LEFT,this.widgetTopColor,1);
            valueText.initialize();
            this.valueTexts.push(valueText);
            
            y+=this.CONTROL_HEIGHT;
        }
        
        return(this.LIST_INPUT_HEIGHT);
    }
    
    release()
    {
        let n;
        let gl=this.core.gl;
        
        this.titleText.release();
        
        for (n=0;n!==this.LIST_INPUT_PER_VIEW_ITEM_COUNT;n++) {
            this.valueTexts[n].release();
        }
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
        
    click()
    {
            // down
            
        if ((this.core.cursor.x>=(this.x+(this.TITLE_MARGIN*2))) && (this.core.cursor.x<((this.x+(this.TITLE_MARGIN*2))+this.LIST_ARROW_WIDTH)) && (this.core.cursor.y>=this.y) && (this.core.cursor.y<(this.y+this.CONTROL_HEIGHT))) {
            this.value--;
            if (this.value<0) this.value=0;
            
            this.dialog.currentTextInputControl=null;
            return(true);
        }
        
             // up
            
        if ((this.core.cursor.x>=((this.x+this.LIST_INPUT_WIDTH)-this.LIST_ARROW_WIDTH)) && (this.core.cursor.x<(this.x+this.LIST_INPUT_WIDTH)) && (this.core.cursor.y>=this.y) && (this.core.cursor.y<(this.y+this.CONTROL_HEIGHT))) {
            this.value++;
            if (this.value>=this.list.length) this.value=this.list.length-1;
            
            this.dialog.currentTextInputControl=null;
            return(true);
        }
       
        return(false);
    }

    draw()
    {
        let n,lft,rgt,top,bot,mx;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        shader.drawStart();
        
        this.vertexArray[0]=this.vertexArray[6]=this.x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=this.y;
        this.vertexArray[2]=this.vertexArray[4]=(this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=this.y+this.LIST_INPUT_HEIGHT;
            
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
        
            // arrow left and right
            
        rgt=((this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH)-this.LIST_ARROW_MARGIN;
        lft=rgt-this.LIST_ARROW_WIDTH;
        mx=Math.trunc((lft+rgt)*0.5);
        
            // up
            
        top=this.y+this.LIST_ARROW_MARGIN;
        bot=top+this.LIST_ARROW_WIDTH;
            
        this.vertexArray[0]=mx;
        this.vertexArray[1]=top;
        this.vertexArray[2]=rgt;
        this.vertexArray[3]=bot;
        this.vertexArray[4]=lft;
        this.vertexArray[5]=bot;
        
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
        
            // down
        
        bot=(this.y+this.LIST_INPUT_HEIGHT)-this.LIST_ARROW_MARGIN;    
        top=bot-this.LIST_ARROW_WIDTH;
            
        this.vertexArray[0]=mx;
        this.vertexArray[1]=bot;
        this.vertexArray[2]=rgt;
        this.vertexArray[3]=top;
        this.vertexArray[4]=lft;
        this.vertexArray[5]=top;
        
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
            
        //this.valueText.str=''+this.list[this.value];
            
        this.core.shaderList.textShader.drawStart();
        
        this.titleText.draw();
        for (n=0;n!==this.LIST_INPUT_PER_VIEW_ITEM_COUNT;n++) {
            this.valueTexts[n].draw();
        }
        
        this.core.shaderList.textShader.drawStart();
    }
}
