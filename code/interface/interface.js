import ColorClass from '../../code/utility/color.js';
import InterfaceShaderClass from '../shader/interface_shader.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceTextClass from '../interface/interface_text.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(core)
    {
        this.core=core;
        
        this.elements=new Map();
        this.texts=new Map();
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
            // clear all current elements and texts
            
        this.elements.clear();
        this.texts.clear();
        
            // create the static font texture
            
        InterfaceTextClass.createStaticFontTexture(this.core.gl);

        return(true);
    }

    release()
    {
        let element,text;
        
            // release all elements and texts
            
        for (element of this.elements) {
            element.release();
        }
        
        for (text of this.texts) {
            text.release();
        }
        
            // and the static font texture
            
        InterfaceTextClass.deleteStaticFontTexture(this.core.gl);
    }
    
        //
        // add interface chunks
        //
        
    addElement(id,bitmap,uvOffset,uvSize,rect,color,alpha)
    {
        let element=new InterfaceElementClass(this.core,bitmap,uvOffset,uvSize,rect,color,alpha);
        
        element.initialize();
        this.elements.set(id,element);
    }
    
    addText(id,str,x,y,fontSize,align,color,alpha)
    {
        let text=new InterfaceTextClass(this.core,str,x,y,fontSize,align,color,alpha);
        
        text.initialize();
        this.texts.set(id,text);
    }
    
    updateText(id,str)
    {
        this.texts.get(id).str=str;
    }

    draw()
    {
        let key,element,text;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

            // run through the elements
            
        this.core.shaderList.interfaceShader.drawStart();
        
        for ([key,element] of this.elements) {
            element.draw();
        }
        
        this.core.shaderList.interfaceShader.drawEnd();
        
        this.core.shaderList.textShader.drawStart();
        
        for ([key,text] of this.texts) {
            text.draw();
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // special core drawing
        // note: none of these are optimized, this is
        // debug stuff only, it'll be slow
        //
        
    drawDebugConsole(consoleStrings)
    {
        let n,y,col,text;
        let nLine=consoleStrings.length;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.core.shaderList.textShader.drawStart();
        
        y=(this.core.high-5)-((nLine-1)*22);
        col=new ColorClass(1.0,1.0,1.0);
        
        for (n=0;n!==nLine;n++) {
            if (n===(nLine-1)) col=new ColorClass(1,0.3,0.3);
            text=new InterfaceTextClass(this.core,consoleStrings[n],5,y,20,InterfaceTextClass.TEXT_ALIGN_LEFT,col,1);
            text.initialize();
            text.draw();
            text.release();
            
            y+=22;
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
        
    drawPauseMessage()
    {
        let text;
        let x=Math.trunc(this.core.wid*0.5);
        let y=Math.trunc(this.core.high*0.5);
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        this.core.shaderList.textShader.drawStart();
        
        text=new InterfaceTextClass(this.core,'Paused',x,(y-20),48,InterfaceTextClass.TEXT_ALIGN_CENTER,this.uiTextColor,1);
        text.initialize();
        text.draw();
        text.release();
        
        text=new InterfaceTextClass(this.core,'click to start - esc to pause',x,(y+20),36,InterfaceTextClass.TEXT_ALIGN_CENTER,this.uiTextColor,1);
        text.initialize();
        text.draw();
        text.release();
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
}
