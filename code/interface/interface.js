import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import RectClass from '../utility/rect.js';
import InterfaceBackgroundClass from '../interface/interface_background.js';
import InterfaceButtonClass from '../interface/interface_button.js';
import InterfaceControlClass from '../interface/interface_control.js';
import InterfaceCursorClass from '../interface/interface_cursor.js';
import InterfaceLiquidClass from '../interface/interface_liquid.js';
import InterfaceHitClass from '../interface/interface_hit.js';
import InterfaceElementClass from '../interface/interface_element.js';
import InterfaceCountClass from '../interface/interface_count.js';
import InterfaceTextClass from '../interface/interface_text.js';
import InterfaceTouchStickClass from '../interface/interface_touch_stick.js';
import InterfaceTouchButtonClass from '../interface/interface_touch_button.js';

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

        this.TEXT_TEXTURE_WIDTH=512;
        this.TEXT_TEXTURE_HEIGHT=512;
        this.TEXT_CHAR_PER_ROW=10;
        this.TEXT_CHAR_WIDTH=50;
        this.TEXT_CHAR_HEIGHT=50;
        this.TEXT_FONT_NAME='Arial';
        this.TEXT_FONT_SIZE=48;
        
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
        
        this.background=null;
        this.cursor=null;
        this.elements=new Map();
        this.counts=new Map();
        this.texts=new Map();
        this.playButton=null;
        this.multiplayerButton=null;
        this.optionButton=null;
        this.cancelButton=null;
        this.okButton=null;
        this.developBuildPathHintsButton=null;
        this.developBuildShadowMapsButton=null;
        this.controls=new Map();
            
        this.uiTextColor=new ColorClass(1,1,0);
        
        this.fontTexture=null;
        this.fontCharWidths=new Float32Array(128);
        
        this.liquid=null;
        this.hit=null;
        this.touchStickLeft=null;
        this.touchStickRight=null;
        this.touchButtonMenu=null;
        
        this.scrollTop=0;                       // scrolling in dialog
        this.currentOpenHeaderControl=null;     // open header in dialog
        this.currentTextInputControl=null;      // current text input in dialog
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    async initialize()
    {
        let hitSize,hitMargin,y;
        let game=this.core.game;
        
            // clear all current elements and texts
            
        this.elements.clear();
        this.counts.clear();
        this.texts.clear();
        
            // create the font texture
            
        this.createFontTexture();
        
            // background and cursor
            
        this.background=new InterfaceBackgroundClass(this.core);
        if (!(await this.background.initialize())) return(false);
            
        this.cursor=new InterfaceCursorClass(this.core);
        if (!(await this.cursor.initialize())) return(false);
        
            // liquid tinting
            
        this.liquid=new InterfaceLiquidClass(this.core);
        if (!this.liquid.initialize()) return(false);
        
            // hit elements
            
        hitSize=Math.trunc(this.core.canvas.width*0.08);
        hitMargin=Math.trunc(this.core.canvas.height*0.25);
        
        this.hit=new InterfaceHitClass(this.core,'textures/ui_hit.png');
        if (!this.hit.initialize()) return(false);
        
            // touch controls
            
        this.touchStickLeft=new InterfaceTouchStickClass(this.core,'textures/ui_touch_stick_left_ring.png','textures/ui_touch_stick_left_thumb.png',game.json.config.touchStickSize);
        if (!(await this.touchStickLeft.initialize())) return(false);
        
        this.touchStickRight=new InterfaceTouchStickClass(this.core,'textures/ui_touch_stick_right_ring.png','textures/ui_touch_stick_right_thumb.png',game.json.config.touchStickSize);
        if (!(await this.touchStickRight.initialize())) return(false);
        
        this.touchButtonMenu=new InterfaceTouchButtonClass(this.core,'textures/ui_touch_menu.png',new PointClass(game.json.config.touchMenuPosition[0],game.json.config.touchMenuPosition[1],0),game.json.config.touchButtonSize);
        if (!(await this.touchButtonMenu.initialize())) return(false);
        
            // buttons
            
        y=0.66;
        
        this.playButton=new InterfaceButtonClass(this.core,0.75,y,0.24,0.1,'Play');
        if (!this.playButton.initialize()) return(false);
        
        y+=0.11;
        
        this.multiplayerButton=new InterfaceButtonClass(this.core,0.75,y,0.24,0.1,'Multiplayer');
        if (!this.multiplayerButton.initialize()) return(false);
            
        y+=0.11;
        
        this.optionButton=new InterfaceButtonClass(this.core,0.75,y,0.24,0.1,'Setup');
        if (!this.optionButton.initialize()) return(false);

        this.cancelButton=new InterfaceButtonClass(this.core,0.78,0.93,0.1,0.05,'Cancel');
        if (!this.cancelButton.initialize()) return(false);
        
        this.okButton=new InterfaceButtonClass(this.core,0.89,0.93,0.1,0.05,'Ok');
        if (!this.okButton.initialize()) return(false);
        
        this.developBuildPathHintsButton=new InterfaceButtonClass(this.core,0.01,0.93,0.2,0.05,'Build Path Hints');
        if (!this.developBuildPathHintsButton.initialize()) return(false);
        
        this.developBuildShadowMapsButton=new InterfaceButtonClass(this.core,0.22,0.93,0.2,0.05,'Build Shadow Maps');
        if (!this.developBuildShadowMapsButton.initialize()) return(false);
        
            // controls
            
        this.controls.clear();
        
            // profile
            
        if (!this.addDialogControl('head_profile',this.CONTROL_TYPE_HEADER,'Profile',null)) return(false);
        if (!this.addDialogControl('name',this.CONTROL_TYPE_TEXT,'Name:',null)) return(false);
        
            // movement
            
        if (!this.addDialogControl('head_movement',this.CONTROL_TYPE_HEADER,'Movement',null)) return(false);
        
        if (!this.addDialogControl('mouseXSensitivity',this.CONTROL_TYPE_RANGE,'Mouse X Sensitivity:',null)) return(false);
        if (!this.addDialogControl('mouseXAcceleration',this.CONTROL_TYPE_RANGE,'Mouse X Acceleration:',null)) return(false);
        if (!this.addDialogControl('mouseXInvert',this.CONTROL_TYPE_CHECKBOX,'Invert Mouse X:',null)) return(false);
        if (!this.addDialogControl('mouseYSensitivity',this.CONTROL_TYPE_RANGE,'Mouse Y Sensitivity:',null)) return(false);
        if (!this.addDialogControl('mouseYAcceleration',this.CONTROL_TYPE_RANGE,'Mouse Y Acceleration:',null)) return(false);
        if (!this.addDialogControl('mouseYInvert',this.CONTROL_TYPE_CHECKBOX,'Invert Mouse Y:',null)) return(false);
        if (!this.addDialogControl('touchStickXSensitivity',this.CONTROL_TYPE_RANGE,'Touch Stick X Sensitivity:',null)) return(false);
        if (!this.addDialogControl('touchStickYSensitivity',this.CONTROL_TYPE_RANGE,'Touch Stick Y Sensitivity:',null)) return(false);
        
            // sound
            
        if (!this.addDialogControl('head_sound',this.CONTROL_TYPE_HEADER,'Sound',null)) return(false);
        if (!this.addDialogControl('soundVolume',this.CONTROL_TYPE_RANGE,'Sound Volume:',null)) return(false);
        if (!this.addDialogControl('musicVolume',this.CONTROL_TYPE_RANGE,'Music Volume:',null)) return(false);
        if (!this.addDialogControl('musicOn',this.CONTROL_TYPE_CHECKBOX,'Music:',null)) return(false);
        
            // multiplayer
            
        if (!this.addDialogControl('head_multiplayer',this.CONTROL_TYPE_HEADER,'Multiplayer',null)) return(false);
        if (!this.addDialogControl('localGame',this.CONTROL_TYPE_CHECKBOX,'Local Game:',null)) return(false);
        if (!this.addDialogControl('botCount',this.CONTROL_TYPE_LIST,'Bot Count:',[0,1,2,3,4,5,6,7,8,9])) return(false);
        if (!this.addDialogControl('botSkill',this.CONTROL_TYPE_LIST,'Bot Skill:',['Easy','Moderate','Normal','Skilled','Hard'])) return(false);
        if (!this.addDialogControl('serverURL',this.CONTROL_TYPE_TEXT,'Server URL:',null)) return(false);
        
            // developer
            
        if (!this.addDialogControl('head_developer',this.CONTROL_TYPE_HEADER,'Developer',null)) return(false);
        if (!this.addDialogControl('nodeKey',this.CONTROL_TYPE_TEXT,'Current Node Key:',null)) return(false);
        if (!this.addDialogControl('skipShadowMapNormals',this.CONTROL_TYPE_CHECKBOX,'Skip Normals on Shadowmap Build:',null)) return(false);

        return(true);
    }

    release()
    {
        let element,count,text,control;
        
        this.liquid.release();
        
        this.hit.release();
        
        this.touchStickLeft.release();
        this.touchStickRight.release();
        this.touchButtonMenu.release();
        
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
        
            // buttons and controls
            
        this.optionButton.release();
        this.playButton.release();
        this.multiplayerButton.release();
        this.cancelButton.release();
        this.okButton.release();
        this.developBuildPathHintsButton.release();
        this.developBuildShadowMapsButton.release();
        
        for (control of this.controls) {
            control.release();
        }
        
            // background and cursor
            
        this.cursor.release();
        this.background.release();
        
            // and the font texture
            
        this.deleteFontTexture();
    }
    
        //
        // dialog controls
        //
        
    addDialogControl(id,controlType,title,list)
    {
        let control;
        
        control=new InterfaceControlClass(this.core,controlType,title,list);
        if (!control.initialize()) return(false);
        this.controls.set(id,control);
        
        return(true);
    }
    
    setDialogControl(id,value)
    {
        this.controls.get(id).value=value;
    }
    
    getDialogControl(id)
    {
        return(this.controls.get(id).value);
    }
    
    loadDialogControls()
    {
        let key,control;
        
            // reset to first open header
            
        for ([key,control] of this.controls) {
            if (control.controlType===this.core.interface.CONTROL_TYPE_HEADER) {
                this.currentOpenHeaderControl=control;
                break;
            }
        }
        
            // no text input
            
        this.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('name',this.core.setup.name);
        
        this.setDialogControl('mouseXSensitivity',Math.trunc(this.core.setup.mouseXSensitivity*100));
        this.setDialogControl('mouseXAcceleration',Math.trunc(this.core.setup.mouseXAcceleration*100));
        this.setDialogControl('mouseXInvert',this.core.setup.mouseXInvert);
        this.setDialogControl('mouseYSensitivity',Math.trunc(this.core.setup.mouseYSensitivity*100));
        this.setDialogControl('mouseYAcceleration',Math.trunc(this.core.setup.mouseYAcceleration*100));
        this.setDialogControl('mouseYInvert',this.core.setup.mouseYInvert);
        this.setDialogControl('touchStickXSensitivity',Math.trunc(this.core.setup.touchStickXSensitivity*100));
        this.setDialogControl('touchStickYSensitivity',Math.trunc(this.core.setup.touchStickYSensitivity*100));
        
        this.setDialogControl('soundVolume',Math.trunc(this.core.setup.soundVolume*100));
        this.setDialogControl('musicVolume',Math.trunc(this.core.setup.musicVolume*100));
        this.setDialogControl('musicOn',this.core.setup.musicOn);
        
        this.setDialogControl('localGame',this.core.setup.localGame);
        this.setDialogControl('botCount',this.core.setup.botCount);
        this.setDialogControl('botSkill',this.core.setup.botSkill);
        this.setDialogControl('serverURL',this.core.setup.serverURL);
    }
    
    saveDialogControls()
    {
        this.core.setup.name=this.getDialogControl('name',);
        
        this.core.setup.mouseXSensitivity=this.getDialogControl('mouseXSensitivity')/100;
        this.core.setup.mouseXAcceleration=this.getDialogControl('mouseXAcceleration')/100;
        this.core.setup.mouseXInvert=this.getDialogControl('mouseXInvert');
        this.core.setup.mouseYSensitivity=this.getDialogControl('mouseYSensitivity')/100;
        this.core.setup.mouseYAcceleration=this.getDialogControl('mouseYAcceleration')/100;
        this.core.setup.mouseYInvert=this.getDialogControl('mouseYInvert');
        this.core.setup.touchStickXSensitivity=this.getDialogControl('touchStickXSensitivity')/100;
        this.core.setup.touchStickYSensitivity=this.getDialogControl('touchStickYSensitivity')/100;
        
        this.core.setup.soundVolume=this.getDialogControl('soundVolume')/100;
        this.core.setup.musicVolume=this.getDialogControl('musicVolume')/100;
        this.core.setup.musicOn=this.getDialogControl('musicOn');
        
        this.core.setup.localGame=this.getDialogControl('localGame');
        this.core.setup.botCount=this.getDialogControl('botCount');
        this.core.setup.botSkill=this.getDialogControl('botSkill');
        this.core.setup.serverURL=this.getDialogControl('serverURL');
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
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
                    
            // liquid and hits
        
        this.liquid.draw();
        this.hit.draw();
        
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
        
            // touch controls
            
        if (this.core.input.hasTouch) {
            this.core.shaderList.interfaceShader.drawStart();
            
            this.touchStickLeft.draw();
            this.touchStickRight.draw();
            this.touchButtonMenu.draw();
            
            this.core.shaderList.interfaceShader.drawEnd();
        }

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // title + dialog clicking and drawing
        //
    
    clickUI()
    {
        let key,control,show;
        
        show=false;

        for ([key,control] of this.controls) {
            if (control.controlType===this.core.interface.CONTROL_TYPE_HEADER) {
                show=(this.currentOpenHeaderControl===control);
                if (control.click(this.cursor.x,this.cursor.y)) return(true);
            }
            else {
                if (show) {
                    if (control.click(this.cursor.x,this.cursor.y)) return(true);
                }
            }
        }
        
        return(false);
    }
    
    keyUI()
    {
        let key;
        
        if (this.currentTextInputControl===null) return;
        
        key=this.core.input.keyGetLastRaw();
        if (key===null) return;
        
        if (key.toLowerCase()==='backspace') {
            if (this.currentTextInputControl.value.length>0) {
                this.currentTextInputControl.value=this.currentTextInputControl.value.substring(0,(this.currentTextInputControl.value.length-1));
            }
            return;
        }
        
        if (((key>='a') && (key<='z')) || ((key>='A') && (key<='Z')) || ((key>='0') && (key<='9'))) {
            this.currentTextInputControl.value+=key;
        }
    }
    
    drawUI(inDialog)
    {
        let y,key,control,show;
        let gl=this.core.gl;
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // NOTE: These set shaders on each draw because
            // we don't need the speed boost here and UI has
            // multiple different shaders
        
            // background
         
        this.background.draw(inDialog);
                    
            // pieces
            
        if (!inDialog) {
            this.playButton.draw(this.cursor.x,this.cursor.y);
            this.multiplayerButton.draw(this.cursor.x,this.cursor.y);
            this.optionButton.draw(this.cursor.x,this.cursor.y);
        }
        else {
            y=this.scrollTop+5;
            
            show=false;

            for ([key,control] of this.controls) {
                if (control.controlType===this.core.interface.CONTROL_TYPE_HEADER) {
                    show=(this.currentOpenHeaderControl===control);
                    y=control.draw(y,this.cursor.x,this.cursor.y);
                }
                else {
                    if (show) y=control.draw(y,this.cursor.x,this.cursor.y);
                }
            }
            
            this.developBuildPathHintsButton.draw(this.cursor.x,this.cursor.y);
            this.developBuildShadowMapsButton.draw(this.cursor.x,this.cursor.y);

            this.cancelButton.draw(this.cursor.x,this.cursor.y);
            this.okButton.draw(this.cursor.x,this.cursor.y);
        }
        
            // cursor
        
        if (!this.core.input.hasTouch) this.cursor.draw();

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
