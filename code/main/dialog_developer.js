import DialogBaseClass from '../main/dialog_base.js';
import SetupClass from '../main/setup.js';
import InterfaceButtonClass from '../interface/interface_button.js';
import InterfaceControlClass from '../interface/interface_control.js';

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
            
        if (!this.addDialogControl('head_developer',this.core.interface.CONTROL_TYPE_HEADER,'Developer',null)) return(false);
        if (!this.addDialogControl('nodeKey',this.core.interface.CONTROL_TYPE_TEXT,'Current Node Key:',null)) return(false);
        if (!this.addDialogControl('skipShadowMapNormals',this.core.interface.CONTROL_TYPE_CHECKBOX,'Skip Normals on Shadowmap Build:',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // open header and no selected text
            
        this.core.interface.currentOpenHeaderControl=this.controls.get('head_developer');
        this.core.interface.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('skipShadowMapNormals',this.core.setup.skipShadowMapNormals);
        this.setDialogControl('nodeKey',this.core.developer.getSelectedNodeKey());
    }
    
    saveDialogControls()
    {
        this.core.setup.skipShadowMapNormals=this.getDialogControl('skipShadowMapNormals');
        this.core.developer.setSelectedNodeKey(this.getDialogControl('nodeKey'));
        
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
