import PointClass from '../utility/point.js';
import RectClass from '../utility/rect.js';
import ColorClass from '../utility/color.js';
import ElementClass from '../game/element.js';
import CountClass from '../game/count.js';
import TextClass from '../main/text.js';
import LiquidTintClass from '../game/liquid_tint.js';
import HitOverlayClass from '../game/hit_overlay.js';
import TouchStickClass from '../game/touch_stick.js';
import TouchButtonClass from '../game/touch_button.js';
import EntityFPSPlayerClass from '../entity/entity_fps_player.js';
import EntityFPSBotClass from '../entity/entity_fps_bot.js';

export default class GameOverlayClass
{
    constructor(core)
    {
        this.core=core;
        
        this.MAX_SCORE_COUNT=10;
        
        this.POSITION_MODE_TOP_LEFT=0;
        this.POSITION_MODE_TOP_RIGHT=1;
        this.POSITION_MODE_BOTTOM_LEFT=2;
        this.POSITION_MODE_BOTTOM_RIGHT=3;
        this.POSITION_MODE_MIDDLE=4;
        
        this.POSITION_MODE_LIST=['topLeft','topRight','bottomLeft','bottomRight','middle'];
        
        this.TOUCH_SWIPE_DEAD_ZONE=20;
        
            // some colors
            
        this.scoreColor=new ColorClass(0,1,0.2);
        this.uiTextColor=new ColorClass(1,1,0);
        
            // the overlays

        this.elements=new Map();
        this.counts=new Map();
        this.texts=new Map();
        
        this.fpsText=null;
        this.debugText=null;
        
        this.liquidTint=null;
        this.hitOverlay=null;

        this.touchStickLeft=null;
        this.touchStickRight=null;
        this.touchButtonMenu=null;
        
            // multiplayer scores
        
        this.scores=null;
        this.scoreShow=false;
        this.scoreLastItemCount=0;
        
            // touch stick flags
            
        this.touchStickLeftClick=false;
        this.touchStickRightClick=false;
        
        this.touchLeftSwipeId=null;
        this.touchLeftSwipePosition=new PointClass(0,0,0);
        this.touchLeftSwipeMovement=new PointClass(0,0,0);
        
        this.touchRightSwipeId=null;
        this.touchRightSwipePosition=new PointClass(0,0,0);
        this.touchRightSwipeMovement=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    async initialize()
    {
        let n,y;
        
            // load interface json
            
        this.elements.clear();
        this.counts.clear();
        this.texts.clear();
            
        if (!(await this.addJsonInterfaceObject(this.core.json.interface))) return(false);
        
        this.fpsText=new TextClass(this.core,'',(this.core.canvas.width-5),23,20,this.core.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        this.fpsText.initialize();
        
        this.debugText=new TextClass(this.core,'',5,(this.core.canvas.height-5),20,this.core.TEXT_ALIGN_LEFT,new ColorClass(1,1,0),1);
        this.debugText.initialize();
        
            // multiplayer interface
                
        y=-Math.trunc((35*(this.MAX_SCORE_COUNT-1))*0.5);

        for (n=0;n!==this.MAX_SCORE_COUNT;n++) {
            this.addText(('score_name_'+n),'',this.POSITION_MODE_MIDDLE,{"x":0,"y":y},30,this.core.TEXT_ALIGN_RIGHT,this.scoreColor,1);
            this.showText(('score_name_'+n),false);
            this.addText(('score_point_'+n),'',this.POSITION_MODE_MIDDLE,{"x":10,"y":y},30,this.core.TEXT_ALIGN_LEFT,this.scoreColor,1);
            this.showText(('score_point_'+n),false);
            y+=35;
        }
            
            // overlays
            
        this.liquidTint=new LiquidTintClass(this.core);
        if (!this.liquidTint.initialize()) return(false);
        
        this.hitOverlay=new HitOverlayClass(this.core,'textures/ui_hit.png');
        if (!this.hitOverlay.initialize()) return(false);
            
            // virtual touch controls
            
        this.touchStickLeft=new TouchStickClass(this.core,'textures/ui_touch_stick_left_ring.png','textures/ui_touch_stick_left_thumb.png',this.core.json.config.touchStickSize,this.core.json.config.touchShowLeftStick);
        if (!(await this.touchStickLeft.initialize())) return(false);
        
        this.touchStickRight=new TouchStickClass(this.core,'textures/ui_touch_stick_right_ring.png','textures/ui_touch_stick_right_thumb.png',this.core.json.config.touchStickSize,this.core.json.config.touchShowRightStick);
        if (!(await this.touchStickRight.initialize())) return(false);
        
        this.touchButtonMenu=new TouchButtonClass(this.core,'textures/ui_touch_menu.png',new PointClass(Math.trunc(this.core.json.config.touchMenuPosition[0]*this.core.canvas.width),Math.trunc(this.core.json.config.touchMenuPosition[1]*this.core.canvas.height),0),this.core.json.config.touchButtonSize);
        if (!(await this.touchButtonMenu.initialize())) return(false);

        return(true);
    }
    
    release()
    {
        let element,count,text;
        
            // release all elements, counts, and texts
            
        for (element of this.elements.values()) {
            element.release();
        }
        
        for (count of this.counts.values()) {
            count.release();
        }
        
        for (text of this.texts.values()) {
            text.release();
        }

        this.fpsText.release();
        this.debugText.release();
        
            // touch controls and overlays
            
        this.touchStickLeft.release();
        this.touchStickRight.release();
        this.touchButtonMenu.release();
        
        this.liquidTint.release();
        this.hitOverlay.release();
    }
    
        //
        // overlay elements
        //
        
    async addElement(id,colorURL,width,height,positionMode,positionOffset,color,alpha,developer)
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
            
        element=new ElementClass(this.core,colorURL,rect,color,alpha,developer);
        if (!(await element.initialize())) return(false);
        this.elements.set(id,element);
        
        return(true);
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
    
        //
        // interface counts
        //
    
    async addCount(id,colorURL,maxCount,width,height,positionMode,positionOffset,addOffset,onColor,onAlpha,offColor,offAlpha,developer)
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
            
        count=new CountClass(this.core,colorURL,maxCount,rect,addOffset,onColor,onAlpha,offColor,offAlpha,developer);
        if (!(await count.initialize())) return(false);
        this.counts.set(id,count);
        
        return(true);
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
    
        //
        // interface texts
        //
        
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

        text=new TextClass(this.core,(''+str),x,y,fontSize,align,color,alpha);
        text.initialize();
        this.texts.set(id,text);
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
        // load and covert a json interface object into various interface parts
        //
        
    async addJsonInterfaceObject(jsonInterface)
    {
        let element,count,text;
        let positionMode,align;
        
        if (jsonInterface===undefined) return(true);
        
        if (jsonInterface.elements!==undefined) {
            for (element of jsonInterface.elements) {
                positionMode=this.POSITION_MODE_LIST.indexOf(element.positionMode);

                if (!await (this.addElement(element.id,element.bitmap,element.width,element.height,positionMode,element.positionOffset,new ColorClass(element.color.r,element.color.g,element.color.b),element.alpha,false))) return(false);
                this.showElement(element.id,element.show);
            }
        }
        
        if (jsonInterface.counts!==undefined) {
            for (count of jsonInterface.counts) {
                positionMode=this.POSITION_MODE_LIST.indexOf(count.positionMode);

                if (!await (this.addCount(count.id,count.bitmap,count.count,count.width,count.height,positionMode,count.positionOffset,count.addOffset,new ColorClass(count.onColor.r,count.onColor.g,count.onColor.b),count.onAlpha,new ColorClass(count.offColor.r,count.offColor.g,count.offColor.b),count.offAlpha,false))) return(false);
                this.showCount(count.id,count.show);
            }
        }
        
        if (jsonInterface.texts!==undefined) {
            for (text of jsonInterface.texts) {
                align=this.core.TEXT_ALIGN_LIST.indexOf(text.textAlign);
                positionMode=this.POSITION_MODE_LIST.indexOf(text.positionMode);
                this.addText(text.id,text.text,positionMode,text.positionOffset,text.textSize,align,new ColorClass(text.color.r,text.color.g,text.color.b),text.alpha,false);
                this.showText(text.id,text.show);
            }
        }
        
        return(true);
    }
    
        //
        // multiplayer scores
        //
        
    multiplayerInitScores()
    {
        let entity;
        
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE) return;
            
            // current scores

        this.scores=new Map();

        for (entity of this.core.game.map.entityList.entities) {
            if ((entity instanceof EntityFPSPlayerClass) ||
                (entity instanceof EntityFPSBotClass)) this.scores.set(entity.name,0);
        }

            // no scores yet

        this.scoreShow=false;
        this.scoreLastItemCount=0;
        
        this.multiplayerUpdateScores();
    }
    
    multiplayerUpdateScores()
    {
        let n,points;
        let iter,rtn,name,insertIdx;
        let sortedNames=[];
        
            // sort the scores
            
        iter=this.scores.keys();
        
        while (true) {
            rtn=iter.next();
            if (rtn.done) break;
            
            name=rtn.value;
            points=this.scores.get(name);
            
            if (sortedNames.length===0) {
                sortedNames.push(name);
            }
            else {
                insertIdx=0;

                for (n=(sortedNames.length-1);n>=0;n--) {
                    if (points<this.scores.get(sortedNames[n])) {
                        insertIdx=n+1;
                        break;
                    }
                }

                sortedNames.splice(insertIdx,0,name);
            }
        }
        
        this.scoreLastItemCount=sortedNames.length;
        
            // update the overlay
        
        for (n=0;n!=this.MAX_SCORE_COUNT;n++) {
            if (n<this.scoreLastItemCount) {
                this.updateText(('score_name_'+n),sortedNames[n]);
                this.showText(('score_name_'+n),this.scoreShow);
                
                this.updateText(('score_point_'+n),this.scores.get(sortedNames[n]));
                this.showText(('score_point_'+n),this.scoreShow);
            }
            else {
                this.showText(('score_name_'+n),false);
                this.showText(('score_point_'+n),false);
            }
        }
    }
    
    multiplayerAddScore(fromEntity,killedEntity,isTelefrag)
    {
        let score,points;
        let scoreEntity=null;
        
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE) return;
        
            // any messages
            
        points=0;
            
        if ((fromEntity!==null) && ((fromEntity instanceof EntityFPSPlayerClass) || (fromEntity instanceof EntityFPSBotClass))) {
            if (isTelefrag) {
                scoreEntity=fromEntity;
                points=1;
                if (this.core.json.config.multiplayerMessageText!==null) this.updateTemporaryText(this.core.json.config.multiplayerMessageText,(fromEntity.name+' telefragged '+killedEntity.name),this.core.json.config.multiplayerMessageWaitTick);
            }
            else {
                if (fromEntity!==killedEntity) {
                    scoreEntity=fromEntity;
                    points=1;
                    if (this.core.json.config.multiplayerMessageText!==null) this.updateTemporaryText(this.core.json.config.multiplayerMessageText,(fromEntity.name+' killed '+killedEntity.name),this.core.json.config.multiplayerMessageWaitTick);
                }
                else {
                    scoreEntity=killedEntity;
                    points=-1;
                    if (this.core.json.config.multiplayerMessageText!==null) this.updateTemporaryText(this.core.json.config.multiplayerMessageText,(killedEntity.name+' committed suicide'),this.core.json.config.multiplayerMessageWaitTick);
                }
            }
        }
        
            // add the points
            
        if (scoreEntity!==null) {
            score=this.scores.get(scoreEntity.name);
            if (score===undefined) score=0;

            this.scores.set(scoreEntity.name,(score+points));
        }
        
            // update scores
            
        this.multiplayerUpdateScores();
    }
    
    multiplayerShowScores(show)
    {
        let n;
        
        if (this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE) return;
        
        this.scoreShow=show;
        
        for (n=0;n!=this.MAX_SCORE_COUNT;n++) {
            if (n<this.scoreLastItemCount) {
                this.showText(('score_name_'+n),this.scoreShow);
                this.showText(('score_point_'+n),this.scoreShow);
            }
            else {
                this.showText(('score_name_'+n),false);
                this.showText(('score_point_'+n),false);
            }
        }
    }
    
    multiplayerFlipScoreDisplay()
    {
        this.multiplayerShowScores(!this.scoreShow);
    }
    
        //
        // touch controls
        //
        
    isTouchStickLeftOn()
    {
        return(this.touchStickLeft.show);
    }
    
    isTouchStickLeftClick()
    {
        let click=this.touchStickLeftClick;
        this.touchStickLeftClick=false;
        
        return(click);
    }
    
    isTouchStickLeftDown()
    {
        return(this.touchStickLeft.isTouchDown());
    }
    
    getTouchStickLeftX()
    {
        let x=this.touchStickLeft.getX();
        
        if (Math.abs(x)<this.core.setup.touchStickLeftXDeadZone) return(0);
        return(x*this.core.setup.touchStickLeftXAcceleration);
    }
    
    getTouchStickLeftY()
    {
        let y=this.touchStickLeft.getY();
        
        if (Math.abs(y)<this.core.setup.touchStickLeftYDeadZone) return(0);
        return(y*this.core.setup.touchStickLeftYAcceleration);
    }
    
    isTouchStickRightOn()
    {
        return(this.touchStickRight.show);
    }
    
    isTouchStickRightClick()
    {
        let click=this.touchStickRightClick;
        this.touchStickRightClick=false;
        
        return(click);
    }
    
    isTouchStickRightDown()
    {
        return(this.touchStickRight.isTouchDown());
    }
    
    getTouchStickRightX()
    {
        let x=this.touchStickRight.getX();
        
        if (Math.abs(x)<this.core.setup.touchStickRightXDeadZone) return(0);
        return(x*this.core.setup.touchStickRightXAcceleration);
    }
    
    getTouchStickRightY()
    {
        let y=this.touchStickRight.getY();
        
        if (Math.abs(y)<this.core.setup.touchStickRightYDeadZone) return(0);
        return(y*this.core.setup.touchStickRightYAcceleration);
    }
    
    getTouchSwipeLeftX()
    {
        let x;
        
        if (this.touchLeftSwipeMovement.x===0) return(0);
        
        x=this.touchLeftSwipeMovement.x;
        this.touchLeftSwipeMovement.x=0;
        return(x);
    }
    
    getTouchSwipeLeftY()
    {
        let y;
        
        if (this.touchLeftSwipeMovement.y===0) return(0);
        
        y=this.touchLeftSwipeMovement.y;
        this.touchLeftSwipeMovement.y=0;
        return(y);
    }
    
    getTouchSwipeRightX()
    {
        let x;
        
        if (this.touchRightSwipeMovement.x===0) return(0);
        
        x=this.touchRightSwipeMovement.x;
        this.touchRightSwipeMovement.x=0;
        return(x);
    }
    
    getTouchSwipeRightY()
    {
        let y;
        
        if (this.touchRightSwipeMovement.y===0) return(0);
        
        y=this.touchRightSwipeMovement.y;
        this.touchRightSwipeMovement.y=0;
        return(y);
    }        
    
        //
        // run
        //
        
    run()
    {
        let touch,x,y,ax,ay;
        let input=this.core.input;
        
            // rest is touches, ignore if no touch
            
        if (!input.hasTouch) return(true);
        
            // touch starts
            
        while (true) {
            touch=input.getNextTouchStart();
            if (touch===null) break;
            
            this.debugText.str=touch.id+'>'+touch.x+','+touch.y+'>('+this.core.canvas.height+','+window.innerWidth+','+window.screen.width+window.innerHeight+','+window.screen.height+')';
            
                // check menu button
                
            if (this.touchButtonMenu.isTouchInButton(touch.x,touch.y)) {
                this.touchButtonMenu.id=touch.id;
                continue;
            }
            
                // check sticks

            if (touch.y>Math.trunc(this.core.canvas.height*0.5)) {
                if (touch.x<Math.trunc(this.core.canvas.width*0.5)) {
                    if (!this.touchStickLeft.show) this.touchStickLeft.touchUp();
                    this.touchStickLeft.touchDown(touch.id,touch.x,touch.y);
                }
                else {
                    if (this.touchStickRight.show) this.touchStickRight.touchUp();
                    this.touchStickRight.touchDown(touch.id,touch.x,touch.y);
                }
            }
            
                // check swipes
                
            else {
                if (touch.x<Math.trunc(this.core.canvas.width*0.5)) {
                    this.touchLeftSwipeId=touch.id;
                    this.touchLeftSwipePosition.setFromValues(touch.x,touch.y,0);
                }
                else {
                    this.touchRightSwipeId=touch.id;
                    this.touchRightSwipePosition.setFromValues(touch.x,touch.y,0);
                }
            }
        }
        
            // touch ends
            
        while (true) {
            touch=input.getNextTouchEnd();
            if (touch===null) break;
            
                // release on either stick?
                
            if (this.touchStickLeft.id===touch.id) {
                this.touchStickLeftClick=this.touchStickLeft.touchUp();
                break;
            }
            
            if (this.touchStickRight.id===touch.id) {
                this.touchStickRightClick=this.touchStickRight.touchUp();
                break;
            }
            
                // release either swipe
                
            if (this.touchLeftSwipeId===touch.id) {
                this.touchLeftSwipeId=null;
                x=touch.x-this.touchLeftSwipePosition.x;
                y=touch.y-this.touchLeftSwipePosition.y;
                ax=Math.abs(x);
                ay=Math.abs(y);
                if ((ax>this.TOUCH_SWIPE_DEAD_ZONE) && (ax>ay)) {
                    this.touchLeftSwipeMovement.setFromValues(x,0,0);
                }
                else {
                    if (ay>this.TOUCH_SWIPE_DEAD_ZONE) {
                        this.touchLeftSwipeMovement.setFromValues(0,y,0);
                    }
                }
                
                break;
            }
            
            if (this.touchRightSwipeId===touch.id) {
                this.touchRightSwipeId=null;
                x=touch.x-this.touchRightSwipePosition.x;
                y=touch.y-this.touchRightSwipePosition.y;
                ax=Math.abs(x);
                ay=Math.abs(y);
                if ((ax>this.TOUCH_SWIPE_DEAD_ZONE) && (ax>ay)) {
                    this.touchRightSwipeMovement.setFromValues(x,0,0);
                }
                else {
                    if (ay>this.TOUCH_SWIPE_DEAD_ZONE) {
                        this.touchRightSwipeMovement.setFromValues(0,y,0);
                    }
                }
                
                break;
            }
            
                // release on menu button
                
            if (this.touchButtonMenu.id===touch.id) {
                this.touchButtonMenu.touchUp();
                this.touchButtonMenu.touchDown(touch.id);
                this.core.switchLoop(this.core.LOOP_DIALOG_SETTING);
                return(false);
            }
        }
        
            // touch moves
            
        while (true) {
            touch=input.getNextTouchMove();
            if (touch===null) break;
        
                // check the sticks
                
            if (this.touchStickLeft.id===touch.id) {
                this.touchStickLeft.touchMove(touch.x,touch.y);
            }
            
            if (this.touchStickRight.id===touch.id) {
                this.touchStickRight.touchMove(touch.x,touch.y);
            }
        }
               
       return(true);
    }
    
        //
        // draw game
        //

    draw()
    {
        let key,element,count,text;
        let fpsStr,idx;
        let gl=this.core.gl;
            
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        
            // tints and overlays
            
        this.liquidTint.draw();
        this.hitOverlay.draw();
        
            // interface
            
        if (!this.core.game.hideUI) {

                // elements

            this.core.shaderList.interfaceShader.drawStart();

            gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

            for ([key,element] of this.elements) {
                element.draw();
            }

            for ([key,count] of this.counts) {
                count.draw();
            }

                // touch controls

            if (this.core.input.hasTouch) {
                this.touchStickLeft.draw();
                this.touchStickRight.draw();
                this.touchButtonMenu.draw();
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
            
            if (this.debugText.str!=='') this.debugText.draw();

            this.core.shaderList.textShader.drawEnd();
        }

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
}
