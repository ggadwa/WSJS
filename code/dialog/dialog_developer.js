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
        let x,y;
        
        if (!super.initialize()) return(false);
        
            // tabs
            
        this.addDialogTab('developer','Developer',true);
        
            // dialog buttons
            
        this.addDialogButton('cancel',0.78,0.93,0.1,0.05,'Cancel',false);
        this.addDialogButton('ok',0.89,0.93,0.1,0.05,'Ok',true);
        this.addDialogButton('pathHints',0.01,0.93,0.2,0.05,'Save Path & Build Hints',false);
        this.addDialogButton('shadowMaps',0.22,0.93,0.2,0.05,'Build Shadow Maps',false);
        
            // developer controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlCheckbox(this,'developer','skipShadowMapNormals',x,y,'Skip Normals on Shadowmap Build:');
        
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

        this.setDialogControl('skipShadowMapNormals',this.core.setup.skipShadowMapNormals);
    }
    
    saveDialogControls()
    {
        this.core.setup.skipShadowMapNormals=this.getDialogControl('skipShadowMapNormals');
        
        this.core.setup.save();
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
        
        if (id==='pathHints') {
            this.saveDialogControls();
            this.core.developer.developerBuilders.buildPathHints();
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }

        if (id==='shadowMaps') {
            this.saveDialogControls();
            this.core.developer.developerBuilders.buildShadowmap(this.core.setup.skipShadowMapNormals);
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
        
        return(true);
    }
}
