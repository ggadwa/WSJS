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
            
        x=(this.core.canvas.width-this.DIALOG_CONTROL_RIGHT_MARGIN)-this.DIALOG_BUTTON_SMALL_WIDTH;
        y=(this.core.canvas.height-this.DIALOG_CONTROL_BOTTOM_MARGIN)-this.DIALOG_BUTTON_HIGH;
        this.addDialogButton('ok',x,y,this.DIALOG_BUTTON_SMALL_WIDTH,this.DIALOG_BUTTON_HIGH,'Ok',true);
        
        x-=(this.DIALOG_BUTTON_SMALL_WIDTH+this.DIALOG_BUTTON_MARGIN);
        this.addDialogButton('cancel',x,y,this.DIALOG_BUTTON_SMALL_WIDTH,this.DIALOG_BUTTON_HIGH,'Cancel',false);
        
        x=this.DIALOG_CONTROL_LEFT_MARGIN;
        this.addDialogButton('pathHints',x,y,this.DIALOG_BUTTON_LARGE_WIDTH,this.DIALOG_BUTTON_HIGH,'Save Path & Build Hints',false);
        
        x+=(this.DIALOG_BUTTON_LARGE_WIDTH+this.DIALOG_BUTTON_MARGIN);
        this.addDialogButton('shadowMaps',x,y,this.DIALOG_BUTTON_LARGE_WIDTH,this.DIALOG_BUTTON_HIGH,'Build Shadow Maps',false);
        
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
