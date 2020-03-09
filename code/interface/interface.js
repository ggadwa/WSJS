import ColorClass from '../utility/color.js';
import RectClass from '../../../code/utility/rect.js';
import InterfaceLiquidClass from '../interface/interface_liquid.js';
import InterfaceHitClass from '../interface/interface_hit.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceCountClass from '../interface/interface_count.js';
import InterfaceTextClass from '../interface/interface_text.js';
import TouchStickClass from '../interface/interface_touch_stick.js';

//
// interface class
//

export default class InterfaceClass
{
    constructor(core)
    {
        this.TEXT_TEXTURE_WIDTH=512;
        this.TEXT_TEXTURE_HEIGHT=512;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=50;
        this.TEXT_CHAR_HEIGHT=50;
        this.TEXT_FONT_NAME='Arial';
        this.TEXT_FONT_SIZE=48;
        
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
        
        this.core=core;
        
        this.elements=new Map();
        this.counts=new Map();
        this.texts=new Map();
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        this.fontTexture=null;
        this.fontCharWidths=new Float32Array(128);
        
        this.liquid=null;
        
        this.hitLeft=null;
        this.hitRight=null;
        this.hitTop=null;
        this.hitBottom=null;
        
        this.touchStickLeft=null;
        this.touchStickRight=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let hitSize;
        
            // clear all current elements and texts
            
        this.elements.clear();
        this.counts.clear();
        this.texts.clear();
        
            // create the font texture
            
        this.createFontTexture();
        
            // liquid tinting
            
        this.liquid=new InterfaceLiquidClass(this.core);
        if (!this.liquid.initialize()) return(false);
        
            // hit elements
            
        hitSize=Math.trunc(this.core.canvas.width*0.1);
        
        this.hitLeft=new InterfaceHitClass(this.core,new RectClass(0,0,hitSize,this.core.canvas.height),[[1,0],[1,1],[0,1],[0,0]]);
        if (!this.hitLeft.initialize()) return(false);
        
        this.hitRight=new InterfaceHitClass(this.core,new RectClass((this.core.canvas.width-hitSize),0,this.core.canvas.width,this.core.canvas.height),[[1,1],[1,0],[0,0],[0,1]]);
        if (!this.hitRight.initialize()) return(false);
        
        this.hitTop=new InterfaceHitClass(this.core,new RectClass(0,0,this.core.canvas.width,hitSize),[[0,0],[1,0],[1,1],[0,1]]);
        if (!this.hitTop.initialize()) return(false);
        
        this.hitBottom=new InterfaceHitClass(this.core,new RectClass(0,(this.core.canvas.height-hitSize),this.core.canvas.width,this.core.canvas.height),[[1,1],[0,1],[0,0],[1,0]]);
        if (!this.hitBottom.initialize()) return(false);

            // touch sticks
            
        this.touchStickLeft=new TouchStickClass(this.core);
        if (!this.touchStickLeft.initialize()) return(false);
        
        this.touchStickRight=new TouchStickClass(this.core);
        if (!this.touchStickRight.initialize()) return(false);

        return(true);
    }

    release()
    {
        let element,count,text;
        
        this.liquid.release();
        
        this.hitLeft.release();
        this.hitRight.release();
        this.hitTop.release();
        this.hitBottom.release();
        
        this.touchStickLeft.release();
        this.touchStickRight.release();
        
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
        
            // and the font texture
            
        this.deleteFontTexture();
    }
    
        //
        // build font bitmap
        //
        
    createFontTexture()
    {
        let x,y,yAdd,cIdx,charStr,ch;
        let canvas,ctx;
        let gl=this.core.gl;
        
            // create the text bitmap

        canvas=document.createElement('canvas');
        canvas.width=this.TEXT_TEXTURE_WIDTH;
        canvas.height=this.TEXT_TEXTURE_HEIGHT;
        ctx=canvas.getContext('2d');
        
            // background is black, text is white
            // so it can be colored
            
        ctx.fillStyle='#000000';
        ctx.fillRect(0,0,this.TEXT_TEXTURE_WIDTH,this.TEXT_TEXTURE_HEIGHT);

            // draw the text

        ctx.font=(this.TEXT_FONT_SIZE+'px ')+this.TEXT_FONT_NAME;
        ctx.textAlign='left';
        ctx.textBaseline='middle';
        ctx.fillStyle='#FFFFFF';

        yAdd=Math.trunc(this.TEXT_CHAR_HEIGHT/2);

        for (ch=32;ch!==127;ch++) {
            cIdx=ch-32;
            x=(cIdx%this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_WIDTH;
            y=Math.trunc(cIdx/this.TEXT_CHAR_PER_ROW)*this.TEXT_CHAR_HEIGHT;
            y+=yAdd;

            charStr=String.fromCharCode(ch);
            this.fontCharWidths[cIdx]=((ctx.measureText(charStr).width+4)/this.TEXT_CHAR_WIDTH);
            if (this.fontCharWidths[cIdx]>1.0) this.fontCharWidths[cIdx]=1.0;

            ctx.fillText(charStr,(x+2),(y-1));

            x+=this.TEXT_CHAR_WIDTH;
        }

            // finally load into webGL
            
        this.fontTexture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.fontTexture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
    }
    
    deleteFontTexture()
    {
        this.core.gl.deleteTexture(this.fontTexture);
    }
    
        //
        // add interface chunks
        //
        
    addElement(id,bitmap,width,height,positionMode,positionOffset,color,alpha)
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
            
        element=new InterfaceElementClass(this.core,bitmap,rect,color,alpha);
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
    
    addCount(id,bitmap,maxCount,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha)
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
            
        count=new InterfaceCountClass(this.core,bitmap,maxCount,rect,addOffset,onColor,onAlpha,offColor,offAlpha);
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
    
    addText(id,str,positionMode,positionOffset,fontSize,align,color,alpha)
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

        text=new InterfaceTextClass(this.core,(''+str),x,y,fontSize,align,color,alpha);
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
        text.hideTick=this.core.timestamp+tick;
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

                this.addElement(element.id,bitmap,element.width,element.height,positionMode,element.positionOffset,new ColorClass(element.color.r,element.color.g,element.color.b),element.alpha);
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

                this.addCount(count.id,bitmap,count.count,count.width,count.height,positionMode,count.positionOffset,count.addOffset,new ColorClass(count.onColor.r,count.onColor.g,count.onColor.b),count.onAlpha,new ColorClass(count.offColor.r,count.offColor.g,count.offColor.b),count.offAlpha);
                this.showCount(count.id,count.show);
            }
        }
        
        if (jsonInterface.texts!==undefined) {
            for (text of jsonInterface.texts) {
                align=this.core.interface.TEXT_ALIGN_LIST.indexOf(text.textAlign);
                positionMode=this.POSITION_MODE_LIST.indexOf(text.positionMode);
                this.addText(text.id,text.text,positionMode,text.positionOffset,text.textSize,align,new ColorClass(text.color.r,text.color.g,text.color.b),text.alpha);
                this.showText(text.id,text.show);
            }
        }
        
        return(true);
    }
        
        //
        // drawing
        //
        
    draw()
    {
        let key,element,count,text;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
                    
            // liquid and hits
        
        this.liquid.draw();
        
        this.hitLeft.draw();
        this.hitRight.draw();
        this.hitTop.draw();
        this.hitBottom.draw();
            
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
        
        this.core.shaderList.textShader.drawEnd();
        
            // sticks
            
        if (this.core.input.hasTouch) {
            this.core.shaderList.interfaceShader.drawStart();
            
            this.touchStickLeft.draw();
            this.touchStickRight.draw();
            
            this.core.shaderList.interfaceShader.drawEnd();
        }

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
            text=new InterfaceTextClass(this.core,consoleStrings[n],5,y,20,this.TEXT_ALIGN_LEFT,col,1);
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
