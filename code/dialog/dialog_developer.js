import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

export default class DialogDeveloperClass extends DialogBaseClass
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
        if (!this.addDialogButton('pathHints',0.01,0.93,0.2,0.05,'Build Path Hints',false)) return(false);
        if (!this.addDialogButton('shadowMaps',0.22,0.93,0.2,0.05,'Build Shadow Maps',false)) return(false);
        
            // developer controls
            
        if (!this.addDialogControl(this,'headDeveloper',this.CONTROL_TYPE_HEADER,'Developer',null)) return(false);
        if (!this.addDialogControl(this,'skipShadowMapNormals',this.CONTROL_TYPE_CHECKBOX,'Skip Normals on Shadowmap Build:',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // open header and no selected text
            
        this.currentOpenHeaderControl=this.controls.get('headDeveloper');
        this.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('skipShadowMapNormals',this.core.setup.skipShadowMapNormals);
    }
    
    saveDialogControls()
    {
        this.core.setup.skipShadowMapNormals=this.getDialogControl('skipShadowMapNormals');
        
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
        
        if (buttonId==='pathHints') {
            this.saveDialogControls();
            this.core.developer.developerBuilders.buildPathHints();
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }

        if (buttonId==='shadowMaps') {
            this.saveDialogControls();
            this.core.developer.developerBuilders.buildShadowmap(this.core.setup.skipShadowMapNormals);
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
        
        return(true);
    }
}
