import ColorClass from '../utility/color.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlCharacterPickerClass extends DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y)
    {
        super(core,dialog,tabId,x,y,null);
        
        this.colorArray=new Float32Array(16);
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.colorBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let vertexArray,uvArray,indexArray;
        let gl=this.core.gl;
        
            // vertex array
            
        vertexArray=new Float32Array(8);
            
        vertexArray[0]=vertexArray[6]=this.x;
        vertexArray[1]=vertexArray[3]=this.y;
        vertexArray[2]=vertexArray[4]=this.x+this.dialog.PICKER_SIZE;
        vertexArray[5]=vertexArray[7]=this.y+this.dialog.PICKER_SIZE;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);
        
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
        
        return(this.dialog.PICKER_SIZE);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    cursorIn()
    {
        return((this.core.cursor.x>=this.x) && (this.core.cursor.x<(this.x+this.dialog.PICKER_SIZE)) && (this.core.cursor.y>=this.y) && (this.core.cursor.y<(this.y+this.dialog.PICKER_SIZE)));
    }
        
    draw(highlight)
    {
        let shader=this.core.shaderList.colorShader;
        let gl=this.core.gl;
        
            // no character fill
            
        if (this.value==='') {
            shader=this.core.shaderList.colorShader;
            
            shader.drawStart();

            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

            this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=this.disableColor.r;
            this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=this.disableColor.g;
            this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=this.disableColor.b;
            this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;

            gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
            gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);

            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
            
            shader.drawEnd();
        }
        
            // character fill
            
        else {
            shader=this.core.shaderList.interfaceShader;
        
            shader.drawStart();
            gl.uniform4f(shader.colorUniform,1,1,1,1);
            
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
            gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
            gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            
            this.core.project.getCharacter(this.value).bitmap.attach();
            gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            shader.drawEnd();
        }
        
            // the outline
            
        shader=this.core.shaderList.colorShader;
            
        shader.drawStart();
            
        this.colorArray[0]=this.colorArray[4]=this.colorArray[8]=this.colorArray[12]=highlight?this.highlightOutlineColor.r:this.outlineColor.r;
        this.colorArray[1]=this.colorArray[5]=this.colorArray[9]=this.colorArray[13]=highlight?this.highlightOutlineColor.g:this.outlineColor.g;
        this.colorArray[2]=this.colorArray[6]=this.colorArray[10]=this.colorArray[14]=highlight?this.highlightOutlineColor.b:this.outlineColor.b;
        this.colorArray[3]=this.colorArray[7]=this.colorArray[11]=this.colorArray[15]=1;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.colorArray);
        gl.vertexAttribPointer(shader.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        
        gl.drawArrays(gl.LINE_LOOP,0,4);

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        shader.drawEnd();
    }
}
