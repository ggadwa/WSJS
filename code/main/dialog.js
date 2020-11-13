import SetupClass from '../main/setup.js';
import InterfaceButtonClass from '../interface/interface_button.js';
import InterfaceControlClass from '../interface/interface_control.js';

export default class DialogClass
{
    constructor(core)
    {
        this.core=core;
        
        this.timestamp=0;
        this.lastSystemTimestamp=0;
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.DIALOG_MODE_SETTINGS=0;
        this.DIALOG_MODE_MULTIPLAYER=1;
        this.DIALOG_MODE_DEVELOPER=2;
        
        this.CONTROL_TYPE_HEADER=0;
        this.CONTROL_TYPE_TEXT=1;
        this.CONTROL_TYPE_CHECKBOX=2;
        this.CONTROL_TYPE_RANGE=3;
        this.CONTROL_TYPE_LIST=4;
        
        this.controls=new Map();
        
        this.currentDialogMode=0;
        this.clickDown=false;
        this.currentOpenHeaderControl=null;     // current open header in dialog
        this.currentTextInputControl=null;      // current text input in dialog
        
        this.cancelButton=null;
        this.okButton=null;
        this.localGameButton=null;
        this.joinGameButton=null;
        this.developBuildPathHintsButton=null;
        this.developBuildShadowMapsButton=null;
        
        Object.seal(this);
    }

        //
        // initialize and release
        //
    
    async initialize()
    {
            // dialog buttons
            
        this.cancelButton=new InterfaceButtonClass(this.core,0.78,0.93,0.1,0.05,'Cancel');
        if (!this.cancelButton.initialize()) return(false);
        
        this.okButton=new InterfaceButtonClass(this.core,0.89,0.93,0.1,0.05,'Ok');
        if (!this.okButton.initialize()) return(false);
        
        this.localGameButton=new InterfaceButtonClass(this.core,0.01,0.93,0.1,0.05,'Local Game');
        if (!this.localGameButton.initialize()) return(false);
        
        this.joinGameButton=new InterfaceButtonClass(this.core,0.89,0.93,0.1,0.05,'Join Game');
        if (!this.joinGameButton.initialize()) return(false);
        
        this.developBuildPathHintsButton=new InterfaceButtonClass(this.core,0.01,0.93,0.2,0.05,'Build Path Hints');
        if (!this.developBuildPathHintsButton.initialize()) return(false);
        
        this.developBuildShadowMapsButton=new InterfaceButtonClass(this.core,0.22,0.93,0.2,0.05,'Build Shadow Maps');
        if (!this.developBuildShadowMapsButton.initialize()) return(false);
        
            // dialog controls
            
        this.controls.clear();
        
            // profile
            
        if (!this.addDialogControl('head_profile',this.CONTROL_TYPE_HEADER,'Profile',null)) return(false);
        if (!this.addDialogControl('name',this.CONTROL_TYPE_TEXT,'Name:',null)) return(false);
        if (!this.addDialogControl('showFPS',this.CONTROL_TYPE_CHECKBOX,'Show FPS:',null)) return(false);
        
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
        if (!this.addDialogControl('snapLook',this.CONTROL_TYPE_CHECKBOX,'Snap Look:',null)) return(false);
        
            // sound
            
        if (!this.addDialogControl('head_sound',this.CONTROL_TYPE_HEADER,'Sound',null)) return(false);
        if (!this.addDialogControl('soundVolume',this.CONTROL_TYPE_RANGE,'Sound Volume:',null)) return(false);
        if (!this.addDialogControl('musicVolume',this.CONTROL_TYPE_RANGE,'Music Volume:',null)) return(false);
        if (!this.addDialogControl('musicOn',this.CONTROL_TYPE_CHECKBOX,'Music:',null)) return(false);
        
            // multiplayer
            
        if (!this.addDialogControl('head_multiplayer',this.CONTROL_TYPE_HEADER,'Multiplayer',null)) return(false);
        if (!this.addDialogControl('localGame',this.CONTROL_TYPE_CHECKBOX,'Local Game:',null)) return(false);
        if (!this.addDialogControl('localMap',this.CONTROL_TYPE_LIST,'Local Map:',this.core.game.json.multiplayerMaps)) return(false);
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
        let control;
        
            // controls
            
        for (control of this.controls) {
            control.release();
        }
        
            // buttons
            
        this.cancelButton.release();
        this.okButton.release();
        this.localGameButton.release();
        this.joinGameButton.release();
        this.developBuildPathHintsButton.release();
        this.developBuildShadowMapsButton.release();
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
            // dialog modes
            
        switch (this.currentDialogMode) {
            
            case this.core.dialog.DIALOG_MODE_SETTINGS:
                this.currentOpenHeaderControl=this.controls.get('head_profile');
                this.controls.get('head_profile').show=true;
                this.controls.get('head_movement').show=true;
                this.controls.get('head_sound').show=true;
                this.controls.get('head_multiplayer').show=false;
                this.controls.get('head_developer').show=false;
                break;
                
            case this.core.dialog.DIALOG_MODE_MULTIPLAYER:
                this.currentOpenHeaderControl=this.controls.get('head_multiplayer');
                this.controls.get('head_profile').show=false;
                this.controls.get('head_movement').show=false;
                this.controls.get('head_sound').show=false;
                this.controls.get('head_multiplayer').show=true;
                this.controls.get('head_developer').show=false;
                break;
                
            case this.core.dialog.DIALOG_MODE_DEVELOPER:
                this.currentOpenHeaderControl=this.controls.get('head_developer');
                this.controls.get('head_profile').show=false;
                this.controls.get('head_movement').show=false;
                this.controls.get('head_sound').show=false;
                this.controls.get('head_multiplayer').show=false;
                this.controls.get('head_developer').show=true;
                break;
        }

            // no text input
            
        this.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('name',this.core.setup.name);
        this.setDialogControl('showFPS',this.core.setup.showFPS);
        
        this.setDialogControl('mouseXSensitivity',Math.trunc(this.core.setup.mouseXSensitivity*100));
        this.setDialogControl('mouseXAcceleration',Math.trunc(this.core.setup.mouseXAcceleration*100));
        this.setDialogControl('mouseXInvert',this.core.setup.mouseXInvert);
        this.setDialogControl('mouseYSensitivity',Math.trunc(this.core.setup.mouseYSensitivity*100));
        this.setDialogControl('mouseYAcceleration',Math.trunc(this.core.setup.mouseYAcceleration*100));
        this.setDialogControl('mouseYInvert',this.core.setup.mouseYInvert);
        this.setDialogControl('touchStickXSensitivity',Math.trunc(this.core.setup.touchStickXSensitivity*100));
        this.setDialogControl('touchStickYSensitivity',Math.trunc(this.core.setup.touchStickYSensitivity*100));
        
        this.setDialogControl('snapLook',this.core.setup.snapLook);
        
        this.setDialogControl('soundVolume',Math.trunc(this.core.setup.soundVolume*100));
        this.setDialogControl('musicVolume',Math.trunc(this.core.setup.musicVolume*100));
        this.setDialogControl('musicOn',this.core.setup.musicOn);
        
        this.setDialogControl('localGame',this.core.setup.localGame);
        this.setDialogControl('localMap',this.core.setup.localMap);
        this.setDialogControl('botCount',this.core.setup.botCount);
        this.setDialogControl('botSkill',this.core.setup.botSkill);
        this.setDialogControl('serverURL',this.core.setup.serverURL);
        
        this.setDialogControl('skipShadowMapNormals',this.core.setup.skipShadowMapNormals);
        
            // special developer node keys
            
        if (this.currentDialogMode===this.core.dialog.DIALOG_MODE_DEVELOPER) {
            this.setDialogControl('nodeKey',this.core.developer.getSelectedNodeKey());
        }
        else {
            this.setDialogControl('nodeKey','');
        }
    }
    
    saveDialogControls()
    {
        this.core.setup.name=this.getDialogControl('name');
        this.core.setup.showFPS=this.getDialogControl('showFPS');
        
        this.core.setup.mouseXSensitivity=this.getDialogControl('mouseXSensitivity')/100;
        this.core.setup.mouseXAcceleration=this.getDialogControl('mouseXAcceleration')/100;
        this.core.setup.mouseXInvert=this.getDialogControl('mouseXInvert');
        this.core.setup.mouseYSensitivity=this.getDialogControl('mouseYSensitivity')/100;
        this.core.setup.mouseYAcceleration=this.getDialogControl('mouseYAcceleration')/100;
        this.core.setup.mouseYInvert=this.getDialogControl('mouseYInvert');
        this.core.setup.touchStickXSensitivity=this.getDialogControl('touchStickXSensitivity')/100;
        this.core.setup.touchStickYSensitivity=this.getDialogControl('touchStickYSensitivity')/100;
        
        this.core.setup.snapLook=this.getDialogControl('snapLook');
        
        this.core.setup.soundVolume=this.getDialogControl('soundVolume')/100;
        this.core.setup.musicVolume=this.getDialogControl('musicVolume')/100;
        this.core.setup.musicOn=this.getDialogControl('musicOn');
        
        this.core.setup.localGame=this.getDialogControl('localGame');
        this.core.setup.localMap=this.getDialogControl('localMap');
        this.core.setup.botCount=this.getDialogControl('botCount');
        this.core.setup.botSkill=this.getDialogControl('botSkill');
        this.core.setup.serverURL=this.getDialogControl('serverURL');
        
        this.core.setup.skipShadowMapNormals=this.getDialogControl('skipShadowMapNormals');
        
        this.core.setup.save(this.core);
        
            // special developer node keys

        if (this.currentDialogMode===this.core.dialog.DIALOG_MODE_DEVELOPER) {
            this.core.developer.setSelectedNodeKey(this.getDialogControl('nodeKey'));
        }
    }
    
        //
        // start and stop dialog loop
        //
        
    startLoop(mode)
    {
        this.currentDialogMode=mode;
        
        this.timestamp=0;
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=0;
        this.lastDrawTimestamp=0;
        
        this.clickDown=false;
        
        this.loadDialogControls();
        this.core.interface.cursor.center();
    }
    
    resumeLoop()
    {
        this.lastSystemTimestamp=Math.trunc(window.performance.now());
        
        this.lastRunTimestamp=this.timestamp;
        this.lastDrawTimestamp=this.timestamp;
        
        this.clickDown=false;
    }
    
        //
        // running
        //
        
    run()
    {
        let key,control,show;
        
            // keyboard
        
        if (this.currentTextInputControl!==null) {
            key=this.core.input.keyGetLastRaw();
            if (key!==null) {

                if (key.toLowerCase()==='enter') {              // enter key can exit dialog
                    this.saveDialogControls();
                    window.main.core.switchLoop(window.main.core.previousLoop,0,(this.currentDialogMode===this.DIALOG_MODE_MULTIPLAYER));
                    return(false);
                }
                
                if (key.toLowerCase()==='backspace') {
                    if (this.currentTextInputControl.value.length>0) {
                        this.currentTextInputControl.value=this.currentTextInputControl.value.substring(0,(this.currentTextInputControl.value.length-1));
                    }
                    return(true);
                }

                if (key.length>1) return(true);

                if (((key>='a') && (key<='z')) || ((key>='A') && (key<='Z')) || ((key>='0') && (key<='9'))) {
                    this.currentTextInputControl.value+=key;
                    return(true);
                }
            }
        }

            // mouse clicking
            
        if (this.core.interface.cursor.run()) {
            this.clickDown=true;
            return(true);
        }
        
        if (!this.clickDown) return(true);
        this.clickDown=false;
        
            // controls

        show=false;

        for ([key,control] of this.controls) {
            if (control.controlType===this.CONTROL_TYPE_HEADER) {
                if (!control.show) {
                    show=false;
                }
                else {
                    show=(this.currentOpenHeaderControl===control);
                    if (control.click()) return(true);
                }
            }
            else {
                if (show) {
                    if (control.click()) return(true);
                }
            }
        }

            // buttons

        if (this.cancelButton.cursorInButton()) {
            window.main.core.switchLoop(window.main.core.previousLoop,0,false);
            return(false);
        }

        if (this.okButton.cursorInButton()) {
            this.saveDialogControls();
            if (this.currentDialogMode!==this.DIALOG_MODE_MULTIPLAYER) {
                window.main.core.switchLoop(window.main.core.previousLoop,0,false);
            }
            else {
                window.main.core.switchLoop(window.main.core.LOOP_GAME,0,true);
            }
            return(false);
        }

        if (this.currentDialogMode===this.DIALOG_MODE_DEVELOPER) {
            if (this.developBuildPathHintsButton.cursorInButton()) {
                this.saveDialogControls();
                this.core.developer.developerBuilders.buildPathHints();
                window.main.core.switchLoop(window.main.core.previousLoop,0,false);
                return(false);
            }

            if (this.developBuildShadowMapsButton.cursorInButton()) {
                this.saveDialogControls();
                this.core.developer.developerBuilders.buildShadowmap(this.core.setup.skipShadowMapNormals);
                window.main.core.switchLoop(window.main.core.previousLoop,0,false);
                return(false);
            }
        }
        
        return(true);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let y,key,control,show;
        let gl=this.core.gl;
        
        this.core.orthoMatrix.setOrthoMatrix(this.core.wid,this.core.high,-1.0,1.0);
        
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
            // NOTE: These set shaders on each draw because
            // we don't need the speed boost here and UI has
            // multiple different shaders
        
            // background
         
        this.core.interface.background.draw(true);
                    
            // controls
            
        y=5;

        show=false;

        for ([key,control] of this.controls) {
            if (control.controlType===this.CONTROL_TYPE_HEADER) {
                if (!control.show) {
                    show=false;
                }
                else {
                    show=(this.currentOpenHeaderControl===control);
                    y=control.draw(y);
                }
            }
            else {
                if (show) y=control.draw(y);
            }
        }

        if (this.currentDialogMode===this.DIALOG_MODE_DEVELOPER) {
            this.developBuildPathHintsButton.draw();
            this.developBuildShadowMapsButton.draw();
        }

        this.cancelButton.draw();

        if (this.currentDialogMode!==this.DIALOG_MODE_MULTIPLAYER) {
            this.okButton.draw();
        }
        else {
            this.localGameButton.draw();
            this.joinGameButton.draw();
        }
        
            // cursor
        
        if (!this.core.input.hasTouch) this.core.interface.cursor.draw();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
        //
        // loop
        //
        
    loop()
    {
        const RUN_MILLISECONDS=32;
        const DRAW_MILLISECONDS=32;
        const BAIL_MILLISECONDS=5000;

        let systemTick,runTick;

            // loop uses it's own tick (so it
            // can be paused, etc) and calculates
            // it from the system tick

        systemTick=Math.trunc(window.performance.now());
        this.timestamp+=(systemTick-this.lastSystemTimestamp);
        this.lastSystemTimestamp=systemTick;

            // cursor movement

        runTick=this.timestamp-this.lastRunTimestamp;

        if (runTick>RUN_MILLISECONDS) {

            if (runTick<BAIL_MILLISECONDS) {       // this is a temporary bail measure in case something held the browser up for a long time

                while (runTick>RUN_MILLISECONDS) {
                    runTick-=RUN_MILLISECONDS;
                    this.lastRunTimestamp+=RUN_MILLISECONDS;

                    if (!this.run()) return;        // returns false when changing loop
                }
            }
            else {
                this.lastRunTimestamp=this.timestamp;
            }
        }

            // drawing

        if ((this.timestamp-this.lastDrawTimestamp)>DRAW_MILLISECONDS) {
            this.lastDrawTimestamp=this.timestamp; 
            this.draw();
        }
    }

    
}
