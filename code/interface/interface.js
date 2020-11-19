import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import RectClass from '../utility/rect.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceCountClass from '../interface/interface_count.js';
import InterfaceTextClass from '../interface/interface_text.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(core)
    {
        this.TEXT_ALIGN_LEFT=0;
        this.TEXT_ALIGN_CENTER=1;
        this.TEXT_ALIGN_RIGHT=2;
        
        this.TEXT_ALIGN_LIST=['left','center','right'];
        
        this.POSITION_MODE_TOP_LEFT=0;
        this.POSITION_MODE_TOP_RIGHT=1;
        this.POSITION_MODE_BOTTOM_LEFT=2;
        this.POSITION_MODE_BOTTOM_RIGHT=3;
        this.POSITION_MODE_MIDDLE=4;
        
        this.POSITION_MODE_LIST=['topLeft','topRight','bottomLeft','bottomRight','middle'];
        
        this.CONTROL_TYPE_HEADER=0;
        this.CONTROL_TYPE_TEXT=1;
        this.CONTROL_TYPE_CHECKBOX=2;
        this.CONTROL_TYPE_RANGE=3;
        this.CONTROL_TYPE_LIST=4;
        
        this.core=core;
        
        this.elements=new Map();
        this.counts=new Map();
        this.texts=new Map();
        this.fpsText=null;
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    async initialize()
    {
            // clear all current elements and texts
            
        this.elements.clear();
        this.counts.clear();
        this.texts.clear();
        
            // fps
            
        this.fpsText=new InterfaceTextClass(this.core,'',(this.core.wid-5),23,20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1,true);
        this.fpsText.initialize();

        return(true);
    }

    release()
    {
        let element,count,text;
        
            // release all elements, counts, and texts
            
        for (element of this.elements) {
            element.release();
        }
        
        for (count of this.counts) {
            count.release();
        }
        
        for (text of this.texts) {
            text.release();
        }
        
        this.fpsText.release();
    }
    
        //
        // add interface chunks
        //
        
    addElement(id,bitmap,width,height,positionMode,positionOffset,color,alpha,developer)
    {
        let element;
        let rect=new RectClass(positionOffset.x,positionOffset.y,(positionOffset.x+width),(positionOffset.y+height));
        
        switch (positionMode) {
            case this.POSITION_MODE_TOP_RIGHT:
                rect.move(this.core.canvas.width,0);
                break;
            case this.POSITION_MODE_BOTTOM_LEFT:
                rect.move(0,this.core.canvas.height);
                break;
            case this.POSITION_MODE_BOTTOM_RIGHT:
                rect.move(this.core.canvas.width,this.core.canvas.height);
                break;
            case this.POSITION_MODE_MIDDLE:
                rect.move(Math.trunc(this.core.canvas.width*0.5),Math.trunc(this.core.canvas.height*0.5));
                break;
        }
            
        element=new InterfaceElementClass(this.core,bitmap,rect,color,alpha,developer);
        element.initialize();
        this.elements.set(id,element);
    }
    
    showElement(id,show)
    {
        let element=this.elements.get(id);
        if (element===undefined) {
            console.log('Interface element ID does not exist: '+id);
            return;
        }
        
        element.show=show;
    }
    
    pulseElement(id,tick,expand)
    {
        let element=this.elements.get(id);
        if (element===undefined) {
            console.log('Interface element ID does not exist: '+id);
            return;
        }
        
        element.pulse(tick,expand);
    }
    
    addCount(id,bitmap,maxCount,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha,developer)
    {
        let count;
        let rect=new RectClass(positionOffset.x,positionOffset.y,(positionOffset.x+width),(positionOffset.y+height));
        
        switch (positionMode) {
            case this.POSITION_MODE_TOP_RIGHT:
                rect.move(this.core.canvas.width,0);
                break;
            case this.POSITION_MODE_BOTTOM_LEFT:
                rect.move(0,this.core.canvas.height);
                break;
            case this.POSITION_MODE_BOTTOM_RIGHT:
                rect.move(this.core.canvas.width,this.core.canvas.height);
                break;
            case this.POSITION_MODE_MIDDLE:
                rect.move(Math.trunc(this.core.canvas.width*0.5),Math.trunc(this.core.canvas.height*0.5));
                break;
        }
            
        count=new InterfaceCountClass(this.core,bitmap,maxCount,rect,addOffset,onColor,onAlpha,offColor,offAlpha,developer);
        count.initialize();
        this.counts.set(id,count);
    }
    
    showCount(id,show)
    {
        let count=this.counts.get(id);
        if (count===undefined) {
            console.log('Interface count ID does not exist: '+id);
            return;
        }
        
        count.show=show;
    }
    
    setCount(id,value)
    {
        let count=this.counts.get(id);
        if (count===undefined) {
            console.log('Interface count ID does not exist: '+id);
            return;
        }
        
        count.count=value;
    }
    
    addText(id,str,positionMode,positionOffset,fontSize,align,color,alpha,developer)
    {
        let text;
        let x=positionOffset.x;
        let y=positionOffset.y;
        
        switch (positionMode) {
            case this.POSITION_MODE_TOP_RIGHT:
                x+=this.core.canvas.width;
                break;
            case this.POSITION_MODE_BOTTOM_LEFT:
                y+=this.core.canvas.height;
                break;
            case this.POSITION_MODE_BOTTOM_RIGHT:
                x+=this.core.canvas.width;
                y+=this.core.canvas.height;
                break;
            case this.POSITION_MODE_MIDDLE:
                x+=Math.trunc(this.core.canvas.width*0.5);
                y+=Math.trunc(this.core.canvas.height*0.5);
                break;
        }

        text=new InterfaceTextClass(this.core,(''+str),x,y,fontSize,align,color,alpha,developer);
        text.initialize();
        this.texts.set(id,text);
    }
    
    removeText(id)
    {
        let text;
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
                
        text=this.texts.get(id);
        if (text!==undefined) {
            text.release();
            this.texts.delete(id);
        }
    }
    
    showText(id,show)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.show=show;
        text.hideTick=-1;
    }
    
    updateText(id,str)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.str=''+str;      // make sure it's a string
        text.hideTick=-1;
    }
    
    updateTemporaryText(id,str,tick)
    {
        let text=this.texts.get(id);
        if (text===undefined) {
            console.log('Interface text ID does not exist: '+id);
            return;
        }
        
        text.str=''+str;      // make sure it's a string
        text.show=true;
        text.hideTick=this.core.game.timestamp+tick;
    }

        //
        // add from json
        // 

    addFromJson(jsonInterface)
    {
        let element,count,text;
        let bitmap,positionMode,align;
        
        if (jsonInterface===undefined) return(true);
        
        if (jsonInterface.elements!==undefined) {
            for (element of jsonInterface.elements) {
                
                    // the element bitmap
                    
                bitmap=this.core.bitmapList.get(element.bitmap);
                if (bitmap===undefined) {
                    console.log('Missing bitmap to add to interface: '+element.bitmap);
                    return(false);
                }
                
                positionMode=this.POSITION_MODE_LIST.indexOf(element.positionMode);

                this.addElement(element.id,bitmap,element.width,element.height,positionMode,element.positionOffset,new ColorClass(element.color.r,element.color.g,element.color.b),element.alpha,false);
                this.showElement(element.id,element.show);
            }
        }
        
        if (jsonInterface.counts!==undefined) {
            for (count of jsonInterface.counts) {
                
                    // the element bitmap
                    
                bitmap=this.core.bitmapList.get(count.bitmap);
                if (bitmap===undefined) {
                    console.log('Missing bitmap to add to interface: '+count.bitmap);
                    return(false);
                }
                
                positionMode=this.POSITION_MODE_LIST.indexOf(count.positionMode);

                this.addCount(count.id,bitmap,count.count,count.width,count.height,positionMode,count.positionOffset,count.addOffset,new ColorClass(count.onColor.r,count.onColor.g,count.onColor.b),count.onAlpha,new ColorClass(count.offColor.r,count.offColor.g,count.offColor.b),count.offAlpha,false);
                this.showCount(count.id,count.show);
            }
        }
        
        if (jsonInterface.texts!==undefined) {
            for (text of jsonInterface.texts) {
                align=this.core.interface.TEXT_ALIGN_LIST.indexOf(text.textAlign);
                positionMode=this.POSITION_MODE_LIST.indexOf(text.positionMode);
                this.addText(text.id,text.text,positionMode,text.positionOffset,text.textSize,align,new ColorClass(text.color.r,text.color.g,text.color.b),text.alpha,false);
                this.showText(text.id,text.show);
            }
        }
        
        return(true);
    }
        
        //
        // game drawing
        //
        
    drawGame()
    {
        let key,element,count,text;
        let fpsStr,idx;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        
            // elements and counts
            
        this.core.shaderList.interfaceShader.drawStart();
        
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        for ([key,element] of this.elements) {
            element.draw();
        }
        
        for ([key,count] of this.counts) {
            count.draw();
        }
        
        this.core.shaderList.interfaceShader.drawEnd();
        
            // text
            
        this.core.shaderList.textShader.drawStart();
        
        for ([key,text] of this.texts) {
            text.draw();
        }
        
        if (this.core.setup.showFPS) {
            fpsStr=this.core.game.fps.toString();
        
            idx=fpsStr.indexOf('.');
            if (idx===-1) {
                fpsStr+='.0';
            }
            else {
                fpsStr=fpsStr.substring(0,(idx+3));
            }

            this.fpsText.str=fpsStr;
            this.fpsText.draw();
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
            text=new InterfaceTextClass(this.core,consoleStrings[n],5,y,20,this.core.interface.TEXT_ALIGN_LEFT,col,1,false);
            text.initialize();
            text.draw();
            text.release();
            
            y+=22;
        }
        
        this.core.shaderList.textShader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
}
