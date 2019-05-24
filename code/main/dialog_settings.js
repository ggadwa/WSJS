import SetupClass from '../main/setup.js';
import DialogBaseClass from '../main/dialog_base.js';

export default class DialogSettingsClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
    }
    
        //
        // views
        //
        
    addProfileControls(viewDiv)
    {
        this.addInput(viewDiv,'name','Name:','text',null,this.core.setup.name,null);
    }
    
    addMovementControls(viewDiv)
    {
        this.addInput(viewDiv,'mouseXSensitivity','Mouse X Sensitivity:','range',null,Math.trunc(this.core.setup.mouseXSensitivity*100),null);
        this.addInput(viewDiv,'mouseXAcceleration','Mouse X Acceleration:','range',null,Math.trunc(this.core.setup.mouseXAcceleration*100),null);
        this.addInput(viewDiv,'mouseXInvert','Invert Mouse X:','checkbox',null,this.core.setup.mouseXInvert,null);
        this.addInput(viewDiv,'mouseYSensitivity','Mouse Y Sensitivity:','range',null,Math.trunc(this.core.setup.mouseYSensitivity*100),null);
        this.addInput(viewDiv,'mouseYAcceleration','Mouse X Acceleration:','range',null,Math.trunc(this.core.setup.mouseYAcceleration*100),null);
        this.addInput(viewDiv,'mouseYInvert','Invert Mouse Y:','checkbox',null,this.core.setup.mouseYInvert,null);
    }
    
    addSoundControls(viewDiv)
    {
        this.addInput(viewDiv,'soundVolume','Sound Volume:','range',null,Math.trunc(this.core.setup.soundVolume*100),null);
        this.addInput(viewDiv,'musicVolume','Music Volume:','range',null,Math.trunc(this.core.setup.musicVolume*100),null);
    }
    
        //
        // misc control events
        //
        
    savedServerListPick()
    {
        document.getElementById('serverURL').value=document.getElementById('savedServerURLLIst').value;
    }

        //
        // settings dialog
        //
    
    open()
    {
        this.createDialog(['Movement','Sound','Profile'],0,this.core.setPauseState.bind(this.core,false,false));
        
        this.addMovementControls(this.getView('Movement'));
        this.addSoundControls(this.getView('Sound'));
        this.addProfileControls(this.getView('Profile'));
    }
    
    close()
    {
            // change the setup and save
            
        this.core.setup.mouseXSensitivity=document.getElementById('mouseXSensitivity').value/100.0;
        this.core.setup.mouseXAcceleration=document.getElementById('mouseXAcceleration').value/100.0;
        this.core.setup.mouseXInvert=document.getElementById('mouseXInvert').checked;
        this.core.setup.mouseYSensitivity=document.getElementById('mouseYSensitivity').value/100.0;
        this.core.setup.mouseYAcceleration=document.getElementById('mouseYAcceleration').value/100.0;
        this.core.setup.mouseYInvert=document.getElementById('mouseYInvert').checked;

        this.core.setup.soundVolume=document.getElementById('soundVolume').value/100.0;
        this.core.setup.musicVolume=document.getElementById('musicVolume').value/100.0;
        
        this.core.setup.name=document.getElementById('name').value;

        SetupClass.save(this.core,this.core.setup);
        
            // close the dialog
            
        this.removeDialog();
    }

}
