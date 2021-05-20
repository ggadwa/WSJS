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
        let x,y;
        
        if (!super.initialize()) return(false);
        
            // tabs
            
        this.addDialogTab('video','Video',true);
        this.addDialogTab('control','Controls',false);
        this.addDialogTab('sound','Sounds',false);
        
            // dialog buttons
            
        x=(this.core.canvas.width-this.DIALOG_CONTROL_RIGHT_MARGIN)-this.DIALOG_BUTTON_SMALL_WIDTH;
        y=(this.core.canvas.height-this.DIALOG_CONTROL_BOTTOM_MARGIN)-this.DIALOG_BUTTON_HIGH;
        this.addDialogButton('ok',x,y,this.DIALOG_BUTTON_SMALL_WIDTH,this.DIALOG_BUTTON_HIGH,'Ok',true);
        
        x-=(this.DIALOG_BUTTON_SMALL_WIDTH+this.DIALOG_BUTTON_MARGIN);
        this.addDialogButton('cancel',x,y,this.DIALOG_BUTTON_SMALL_WIDTH,this.DIALOG_BUTTON_HIGH,'Cancel',false);
        
        this.addDialogButton('quit',this.DIALOG_CONTROL_LEFT_MARGIN,y,this.DIALOG_BUTTON_LARGE_WIDTH,this.DIALOG_BUTTON_HIGH,'Quit to Title',false);
        
            // video
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
            
        y+=this.addDialogControlCheckbox(this,'video','showFPS',x,y,'Show FPS:');
        y+=this.addDialogControlCheckbox(this,'video','fullScreen',x,y,'Full Screen (requires restart):');
        y+=this.addDialogControlCheckbox(this,'video','shadowmaps',x,y,'Use Shadow Maps:');
        
            // controls
            
        y=this.DIALOG_CONTROL_TOP_MARGIN;
            
        if (!this.core.input.hasTouch) {
            y+=this.addDialogControlRange(this,'control','mouseXSensitivity',x,y,'Mouse X Sensitivity:');
            y+=this.addDialogControlRange(this,'control','mouseXAcceleration',x,y,'Mouse X Acceleration:');
            y+=this.addDialogControlCheckbox(this,'control','mouseXInvert',x,y,'Invert Mouse X:');
            y+=this.addDialogControlRange(this,'control','mouseYSensitivity',x,y,'Mouse Y Sensitivity:');
            y+=this.addDialogControlRange(this,'control','mouseYAcceleration',x,y,'Mouse Y Acceleration:');
            y+=this.addDialogControlCheckbox(this,'control','mouseYInvert',x,y,'Invert Mouse Y:');
        }
        else {
            y+=this.addDialogControlRange(this,'control','touchStickLeftXDeadZone',x,y,'Left Touch Stick X Dead Zone:');
            y+=this.addDialogControlRange(this,'control','touchStickLeftXAcceleration',x,y,'Left Touch Stick X Acceleration:');
            y+=this.addDialogControlRange(this,'control','touchStickLeftYDeadZone',x,y,'Left Touch Stick Y Dead Zone:');
            y+=this.addDialogControlRange(this,'control','touchStickLeftYAcceleration',x,y,'Left Touch Stick Y Acceleration:');

            y+=this.addDialogControlRange(this,'control','touchStickRightXDeadZone',x,y,'Right Touch Stick X Dead Zone:');
            y+=this.addDialogControlRange(this,'control','touchStickRightXAcceleration',x,y,'Right Touch Stick X Acceleration:');
            y+=this.addDialogControlRange(this,'control','touchStickRightYDeadZone',x,y,'Right Touch Stick Y Dead Zone:');
            y+=this.addDialogControlRange(this,'control','touchStickRightYAcceleration',x,y,'Right Touch Stick Y Acceleration:');

            y+=this.addDialogControlCheckbox(this,'control','snapLook',x,y,'Snap Look:',null);
        }
        
            // sound controls
            
        y=this.DIALOG_CONTROL_TOP_MARGIN;
            
        y+=this.addDialogControlRange(this,'sound','soundVolume',x,y,'Sound Volume:');
        y+=this.addDialogControlRange(this,'sound','musicVolume',x,y,'Music Volume:');
        y+=this.addDialogControlCheckbox(this,'sound','musicOn',x,y,'Music:');
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // no selected text
            
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
        
        this.core.setup.save();
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
        let id=super.runInternal();

        if (id==='cancel') {
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }

        if (id==='ok') {
            this.saveDialogControls();
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
        
        if (id==='quit') {
            this.core.game.exitGame=true;
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
                
        return(true);
    }
}
