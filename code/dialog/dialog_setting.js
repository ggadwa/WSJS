import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

export default class DialogSettingClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
        
        Object.seal(this);
    }

        //
        // initialize and release
        //
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
            // dialog buttons
            
        if (!this.addDialogButton('cancel',0.78,0.93,0.1,0.05,'Cancel',false)) return(false);
        if (!this.addDialogButton('ok',0.89,0.93,0.1,0.05,'Ok',true)) return(false);
        if (!this.addDialogButton('quit',0.01,0.93,0.125,0.05,'Quit to Title',false)) return(false);
        
            // profile controls
            
        if (!this.addDialogControl(this,'headVideo',this.CONTROL_TYPE_HEADER,'Video',null)) return(false);
        if (!this.addDialogControl(this,'showFPS',this.CONTROL_TYPE_CHECKBOX,'Show FPS:',null)) return(false);
        if (!this.addDialogControl(this,'fullScreen',this.CONTROL_TYPE_CHECKBOX,'Full Screen (requires restart):',null)) return(false);
        if (!this.addDialogControl(this,'shadowmaps',this.CONTROL_TYPE_CHECKBOX,'Use Shadow Maps:',null)) return(false);
        
            // controls
            
        if (!this.core.input.hasTouch) {
            if (!this.addDialogControl(this,'headMouse',this.CONTROL_TYPE_HEADER,'Mouse Controls',null)) return(false);

            if (!this.addDialogControl(this,'mouseXSensitivity',this.CONTROL_TYPE_RANGE,'Mouse X Sensitivity:',null)) return(false);
            if (!this.addDialogControl(this,'mouseXAcceleration',this.CONTROL_TYPE_RANGE,'Mouse X Acceleration:',null)) return(false);
            if (!this.addDialogControl(this,'mouseXInvert',this.CONTROL_TYPE_CHECKBOX,'Invert Mouse X:',null)) return(false);
            if (!this.addDialogControl(this,'mouseYSensitivity',this.CONTROL_TYPE_RANGE,'Mouse Y Sensitivity:',null)) return(false);
            if (!this.addDialogControl(this,'mouseYAcceleration',this.CONTROL_TYPE_RANGE,'Mouse Y Acceleration:',null)) return(false);
            if (!this.addDialogControl(this,'mouseYInvert',this.CONTROL_TYPE_CHECKBOX,'Invert Mouse Y:',null)) return(false);
        }
        else {
            if (!this.addDialogControl(this,'headTouch',this.CONTROL_TYPE_HEADER,'Touch Controls',null)) return(false);
        
            if (!this.addDialogControl(this,'touchStickLeftXDeadZone',this.CONTROL_TYPE_RANGE,'Left Touch Stick X Dead Zone:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickLeftXAcceleration',this.CONTROL_TYPE_RANGE,'Left Touch Stick X Acceleration:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickLeftYDeadZone',this.CONTROL_TYPE_RANGE,'Left Touch Stick Y Dead Zone:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickLeftYAcceleration',this.CONTROL_TYPE_RANGE,'Left Touch Stick Y Acceleration:',null)) return(false);

            if (!this.addDialogControl(this,'touchStickRightXDeadZone',this.CONTROL_TYPE_RANGE,'Right Touch Stick X Dead Zone:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickRightXAcceleration',this.CONTROL_TYPE_RANGE,'Right Touch Stick X Acceleration:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickRightYDeadZone',this.CONTROL_TYPE_RANGE,'Right Touch Stick Y Dead Zone:',null)) return(false);
            if (!this.addDialogControl(this,'touchStickRightYAcceleration',this.CONTROL_TYPE_RANGE,'Right Touch Stick Y Acceleration:',null)) return(false);

            if (!this.addDialogControl(this,'snapLook',this.CONTROL_TYPE_CHECKBOX,'Snap Look:',null)) return(false);
        }
        
            // sound controls
            
        if (!this.addDialogControl(this,'headSound',this.CONTROL_TYPE_HEADER,'Sound',null)) return(false);
        if (!this.addDialogControl(this,'soundVolume',this.CONTROL_TYPE_RANGE,'Sound Volume:',null)) return(false);
        if (!this.addDialogControl(this,'musicVolume',this.CONTROL_TYPE_RANGE,'Music Volume:',null)) return(false);
        if (!this.addDialogControl(this,'musicOn',this.CONTROL_TYPE_CHECKBOX,'Music:',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // open header and no selected text
            
        this.currentOpenHeaderControl=this.controls.get('headVideo');
        this.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('showFPS',this.core.setup.showFPS);
        this.setDialogControl('fullScreen',this.core.setup.fullScreen);
        this.setDialogControl('shadowmaps',this.core.setup.shadowmaps);
        
        if (!this.core.input.hasTouch) {
            this.setDialogControl('mouseXSensitivity',Math.trunc(this.core.setup.mouseXSensitivity*100));
            this.setDialogControl('mouseXAcceleration',Math.trunc(this.core.setup.mouseXAcceleration*100));
            this.setDialogControl('mouseXInvert',this.core.setup.mouseXInvert);
            this.setDialogControl('mouseYSensitivity',Math.trunc(this.core.setup.mouseYSensitivity*100));
            this.setDialogControl('mouseYAcceleration',Math.trunc(this.core.setup.mouseYAcceleration*100));
            this.setDialogControl('mouseYInvert',this.core.setup.mouseYInvert);
        }
        else {
            this.setDialogControl('touchStickLeftXDeadZone',this.core.setup.touchStickLeftXDeadZone*100);
            this.setDialogControl('touchStickLeftXAcceleration',Math.trunc(this.core.setup.touchStickLeftXAcceleration*10));
            this.setDialogControl('touchStickLeftYDeadZone',this.core.setup.touchStickLeftYDeadZone*100);
            this.setDialogControl('touchStickLeftYAcceleration',Math.trunc(this.core.setup.touchStickLeftYAcceleration*10));

            this.setDialogControl('touchStickRightXDeadZone',this.core.setup.touchStickRightXDeadZone*100);
            this.setDialogControl('touchStickRightXAcceleration',Math.trunc(this.core.setup.touchStickRightXAcceleration*10));
            this.setDialogControl('touchStickRightYDeadZone',this.core.setup.touchStickRightYDeadZone*100);
            this.setDialogControl('touchStickRightYAcceleration',Math.trunc(this.core.setup.touchStickRightYAcceleration*10));

            this.setDialogControl('snapLook',this.core.setup.snapLook);
        }
        
        this.setDialogControl('soundVolume',Math.trunc(this.core.setup.soundVolume*100));
        this.setDialogControl('musicVolume',Math.trunc(this.core.setup.musicVolume*100));
        this.setDialogControl('musicOn',this.core.setup.musicOn);
    }
    
    saveDialogControls()
    {
        this.core.setup.showFPS=this.getDialogControl('showFPS');
        this.core.setup.fullScreen=this.getDialogControl('fullScreen');
        this.core.setup.shadowmaps=this.getDialogControl('shadowmaps');
        
        if (!this.core.input.hasTouch) {
            this.core.setup.mouseXSensitivity=this.getDialogControl('mouseXSensitivity')/100;
            this.core.setup.mouseXAcceleration=this.getDialogControl('mouseXAcceleration')/100;
            this.core.setup.mouseXInvert=this.getDialogControl('mouseXInvert');
            this.core.setup.mouseYSensitivity=this.getDialogControl('mouseYSensitivity')/100;
            this.core.setup.mouseYAcceleration=this.getDialogControl('mouseYAcceleration')/100;
            this.core.setup.mouseYInvert=this.getDialogControl('mouseYInvert');
        }
        else {
            this.core.setup.touchStickLeftXDeadZone=this.getDialogControl('touchStickLeftXDeadZone')/100;
            this.core.setup.touchStickLeftXAcceleration=this.getDialogControl('touchStickLeftXAcceleration')/10;
            this.core.setup.touchStickLeftYDeadZone=this.getDialogControl('touchStickLeftYDeadZone')/100;
            this.core.setup.touchStickLeftYAcceleration=this.getDialogControl('touchStickLeftYAcceleration')/10;

            this.core.setup.touchStickRightXDeadZone=this.getDialogControl('touchStickRightXDeadZone')/100;
            this.core.setup.touchStickRightXAcceleration=this.getDialogControl('touchStickRightXAcceleration')/10;
            this.core.setup.touchStickRightYDeadZone=this.getDialogControl('touchStickRightYDeadZone')/100;
            this.core.setup.touchStickRightYAcceleration=this.getDialogControl('touchStickRightYAcceleration')/10;

            this.core.setup.snapLook=this.getDialogControl('snapLook');
        }
        
        this.core.setup.soundVolume=this.getDialogControl('soundVolume')/100;
        this.core.setup.musicVolume=this.getDialogControl('musicVolume')/100;
        this.core.setup.musicOn=this.getDialogControl('musicOn');
        
        this.core.setup.save(this.core);
    }
    
        //
        // override start loop to hide quit button
        //
        
    startLoop()
    {
        super.startLoop();
        this.setDialogButtonShow('quit',(this.core.previousLoop===this.core.LOOP_GAME));
    }
    
        //
        // running
        //
        
    run()
    {
        let buttonId=super.runInternal();

        if (buttonId==='cancel') {
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }

        if (buttonId==='ok') {
            this.saveDialogControls();
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
        
        if (buttonId==='quit') {
            this.core.game.exitGame=true;
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
                
        return(true);
    }
}
