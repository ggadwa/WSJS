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
        let x,y;
        
        if (!super.initialize()) return(false);
        
            // tabs
            
        this.addDialogTab('prompt','Prompt',true);
        
            // dialog buttons
            
        this.addDialogButton('cancel',0.78,0.93,0.1,0.05,'Cancel',false);
        this.addDialogButton('ok',0.89,0.93,0.1,0.05,'Ok',true);
        
            // prompt controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'prompt','promptValue',x,y,'');
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
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
        this.tabs.get('prompt').text.str=title;
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
