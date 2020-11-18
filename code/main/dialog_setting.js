import DialogBaseClass from '../main/dialog_base.js';
import SetupClass from '../main/setup.js';
import InterfaceButtonClass from '../interface/interface_button.js';
import InterfaceControlClass from '../interface/interface_control.js';

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
        
            // profile controls
            
        if (!this.addDialogControl('headProfile',this.core.interface.CONTROL_TYPE_HEADER,'Profile',null)) return(false);
        if (!this.addDialogControl('name',this.core.interface.CONTROL_TYPE_TEXT,'Name:',null)) return(false);
        if (!this.addDialogControl('showFPS',this.core.interface.CONTROL_TYPE_CHECKBOX,'Show FPS:',null)) return(false);
        
            // movement controls
            
        if (!this.addDialogControl('headMovement',this.core.interface.CONTROL_TYPE_HEADER,'Movement',null)) return(false);
        
        if (!this.addDialogControl('mouseXSensitivity',this.core.interface.CONTROL_TYPE_RANGE,'Mouse X Sensitivity:',null)) return(false);
        if (!this.addDialogControl('mouseXAcceleration',this.core.interface.CONTROL_TYPE_RANGE,'Mouse X Acceleration:',null)) return(false);
        if (!this.addDialogControl('mouseXInvert',this.core.interface.CONTROL_TYPE_CHECKBOX,'Invert Mouse X:',null)) return(false);
        if (!this.addDialogControl('mouseYSensitivity',this.core.interface.CONTROL_TYPE_RANGE,'Mouse Y Sensitivity:',null)) return(false);
        if (!this.addDialogControl('mouseYAcceleration',this.core.interface.CONTROL_TYPE_RANGE,'Mouse Y Acceleration:',null)) return(false);
        if (!this.addDialogControl('mouseYInvert',this.core.interface.CONTROL_TYPE_CHECKBOX,'Invert Mouse Y:',null)) return(false);
        if (!this.addDialogControl('touchStickXSensitivity',this.core.interface.CONTROL_TYPE_RANGE,'Touch Stick X Sensitivity:',null)) return(false);
        if (!this.addDialogControl('touchStickYSensitivity',this.core.interface.CONTROL_TYPE_RANGE,'Touch Stick Y Sensitivity:',null)) return(false);
        if (!this.addDialogControl('snapLook',this.core.interface.CONTROL_TYPE_CHECKBOX,'Snap Look:',null)) return(false);
        
            // sound controls
            
        if (!this.addDialogControl('headSound',this.core.interface.CONTROL_TYPE_HEADER,'Sound',null)) return(false);
        if (!this.addDialogControl('soundVolume',this.core.interface.CONTROL_TYPE_RANGE,'Sound Volume:',null)) return(false);
        if (!this.addDialogControl('musicVolume',this.core.interface.CONTROL_TYPE_RANGE,'Music Volume:',null)) return(false);
        if (!this.addDialogControl('musicOn',this.core.interface.CONTROL_TYPE_CHECKBOX,'Music:',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // open header and no selected text
            
        this.core.interface.currentOpenHeaderControl=this.controls.get('headProfile');
        this.core.interface.currentTextInputControl=null;
        
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
        
        this.core.setup.save(this.core);
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
                
        return(true);
    }
}