import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlClass extends DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y,title)
    {
        super(core,dialog,tabId,x,y,title);
        
        this.CONTROL_RAIL_HEIGHT=5;
        
        this.vertexArray=new Float32Array(8);
        this.colorArray=new Float32Array(16);
        
        this.vertexBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        this.titleText=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let fontSize;
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
        
        return(this.CONTROL_HEIGHT);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        this.titleText.release();
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
                
    click()
    {
        let hx;
        
        if ((this.core.cursor.x<this.x) || (this.core.cursor.x>((this.x+(this.TITLE_MARGIN*2))+this.TEXT_INPUT_WIDTH)) || (this.core.cursor.y<this.y) || (this.core.cursor.y>(this.y+this.CONTROL_HEIGHT))) return(false);
        
        hx=Math.trunc(((this.core.cursor.x-(this.x+this.TITLE_MARGIN))/this.TEXT_INPUT_WIDTH)*100); // we go a little over each edge so we can click to 0/100
        if (hx<0) hx=0;
        if (hx>100) hx=100;
        
        this.value=hx;
        
        this.dialog.currentTextInputControl=null;
        
        return(true);
    }
        
    draw()
    {
        let hx,my,hsz;
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
        my=(this.y+Math.trunc(this.CONTROL_HEIGHT*0.5))-Math.trunc(this.CONTROL_RAIL_HEIGHT*0.5);
        
        shader.drawStart();
        
            // the track
        
        this.vertexArray[0]=this.vertexArray[6]=this.x+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=my;
        this.vertexArray[2]=this.vertexArray[4]=(this.x+this.TITLE_MARGIN)+this.TEXT_INPUT_WIDTH;
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
        hx=this.x+Math.trunc(this.value*(this.TEXT_INPUT_WIDTH-hsz)/100);
            
        this.vertexArray[0]=this.vertexArray[6]=hx+this.TITLE_MARGIN;
        this.vertexArray[1]=this.vertexArray[3]=this.y;
        this.vertexArray[2]=this.vertexArray[4]=(hx+this.TITLE_MARGIN)+hsz;
        this.vertexArray[5]=this.vertexArray[7]=this.y+this.CONTROL_HEIGHT;
            
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
            
        this.core.shaderList.textShader.drawStart();
        this.titleText.draw();
        this.core.shaderList.textShader.drawStart();
    }
}
