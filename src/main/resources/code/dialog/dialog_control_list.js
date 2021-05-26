import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlListClass extends DialogControlBaseClass
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
        
        this.listScrollIndex=0;
        
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
        
            // the value text
            
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
    
    cursorIn()
    {
        return((this.core.cursor.x>=this.x) && (this.core.cursor.x<((this.x+(this.TITLE_MARGIN*2))+this.LIST_INPUT_WIDTH)) && (this.core.cursor.y>=this.y) && (this.core.cursor.y<(this.y+this.LIST_INPUT_HEIGHT)));
    }
    
    cursorInUpArrow()
    {
        let rgt=((this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH)-this.LIST_ARROW_MARGIN;
        let lft=rgt-this.LIST_ARROW_WIDTH;
        let top=this.y+this.LIST_ARROW_MARGIN;
        let bot=top+this.LIST_ARROW_WIDTH;
        
        return((this.core.cursor.x>=lft) && (this.core.cursor.x<rgt) && (this.core.cursor.y>=top) && (this.core.cursor.y<bot));
    }
    
    cursorInDownArrow()
    {
        let rgt=((this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH)-this.LIST_ARROW_MARGIN;
        let lft=rgt-this.LIST_ARROW_WIDTH;
        let bot=(this.y+this.LIST_INPUT_HEIGHT)-this.LIST_ARROW_MARGIN;    
        let top=bot-this.LIST_ARROW_WIDTH;
        
        return((this.core.cursor.x>=lft) && (this.core.cursor.x<rgt) && (this.core.cursor.y>=top) && (this.core.cursor.y<bot));
    }
        
    clicked()
    {
        let idx,y;
        
             // up
             
        if (this.cursorInUpArrow()) {
            if (this.listScrollIndex>0) this.listScrollIndex-=this.LIST_INPUT_PER_VIEW_ITEM_COUNT;
            return(true);
        }

            // down
            
        if (this.cursorInDownArrow()) {
            if ((this.listScrollIndex+this.LIST_INPUT_PER_VIEW_ITEM_COUNT)<this.list.length) this.listScrollIndex+=this.LIST_INPUT_PER_VIEW_ITEM_COUNT;
            return(true);
        }
        
            // item
            
        y=Math.trunc((this.core.cursor.y-this.y)/this.CONTROL_HEIGHT);
        idx=this.listScrollIndex+y;
        
        if (idx>=this.list.length) return(false);
        this.value=this.list[idx];
       
        return(true);
    }

    draw(highlight)
    {
        let n,y,lft,rgt,top,bot,mx,idx;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        shader.drawStart();
        
            // the outline
            
        this.vertexArray[0]=this.vertexArray[6]=this.x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=this.y;
        this.vertexArray[2]=this.vertexArray[4]=(this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH;
        this.vertexArray[5]=this.vertexArray[7]=this.y+this.LIST_INPUT_HEIGHT;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=highlight?this.highlightOutlineColor.r:this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=highlight?this.highlightOutlineColor.g:this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=highlight?this.highlightOutlineColor.b:this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
            
            // the fill
        
        this.vertexArray[0]=this.vertexArray[6]=(this.x+this.TITLE_MARGIN)+1;
        this.vertexArray[1]=this.vertexArray[3]=this.y+1;
        this.vertexArray[2]=this.vertexArray[4]=((this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH)-1;
        this.vertexArray[5]=this.vertexArray[7]=(this.y+this.LIST_INPUT_HEIGHT)-1;
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexArray);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.fillColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.fillColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.fillColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
        
            // the highlight
            
        idx=this.listScrollIndex;
            
        for (n=0;n!==this.LIST_INPUT_PER_VIEW_ITEM_COUNT;n++) {
            if (idx<this.list.length) {
                if (this.list[idx]===this.value) {
                    y=this.y+((n*this.CONTROL_HEIGHT)+1);
                    this.vertexArray[0]=this.vertexArray[6]=(this.x+this.TITLE_MARGIN)+1;
                    this.vertexArray[1]=this.vertexArray[3]=y;
                    this.vertexArray[2]=this.vertexArray[4]=((this.x+this.TITLE_MARGIN)+this.LIST_INPUT_WIDTH)-1;
                    this.vertexArray[5]=this.vertexArray[7]=y+(this.CONTROL_HEIGHT-1);

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
                   
                    break;
                }
            }
            
            idx++;
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
        
            // the title and value text
            
        idx=this.listScrollIndex;
            
        this.core.shaderList.textShader.drawStart();
        
        this.titleText.draw();
        
        for (n=0;n!==this.LIST_INPUT_PER_VIEW_ITEM_COUNT;n++) {
            this.valueTexts[n].str=(idx<this.list.length)?this.list[idx]:'';
            this.valueTexts[n].draw();
            
            idx++;
        }
        
        this.core.shaderList.textShader.drawEnd();
        
            // arrow left and right
            
        shader.drawStart();
            
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
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        highlight=this.cursorInUpArrow();
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=highlight?this.widgetBottomHighlightColor.r:this.widgetBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=highlight?this.widgetBottomHighlightColor.g:this.widgetBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=highlight?this.widgetBottomHighlightColor.b:this.widgetBottomColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=1;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
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
        
        highlight=this.cursorInDownArrow();
        
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=highlight?this.widgetBottomHighlightColor.r:this.widgetBottomColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=highlight?this.widgetBottomHighlightColor.g:this.widgetBottomColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=highlight?this.widgetBottomHighlightColor.b:this.widgetBottomColor.b;
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
    }
}
