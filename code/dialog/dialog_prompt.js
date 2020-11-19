import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

export default class DialogPromptClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
        
        this.valueObj=null;
        this.valuePropName=null;
        
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
        
            // prompt controls
            
        if (!this.addDialogControl(this,'headPrompt',this.core.interface.CONTROL_TYPE_HEADER,'',null)) return(false);
        if (!this.addDialogControl(this,'promptValue',this.core.interface.CONTROL_TYPE_TEXT,'',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
        this.currentOpenHeaderControl=this.controls.get('headPrompt');
        
            // only a single text value, which is always selected

        this.setDialogControl('promptValue',this.valueObj[this.valuePropName]);
        this.currentTextInputControl=this.controls.get('promptValue');
    }
    
    saveDialogControls()
    {
        this.valueObj[this.valuePropName]=this.getDialogControl('promptValue');
    }
    
        //
        // setup
        //
        
    setup(title,valueTitle,valueObj,valuePropName)
    {
        this.controls.get('headPrompt').titleText.str=title;
        this.controls.get('promptValue').titleText.str=valueTitle+':';
        this.valueObj=valueObj;
        this.valuePropName=valuePropName;
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
