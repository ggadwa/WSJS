import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

export default class DialogErrorClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
        
        this.errorTitle=null;
        this.errorDescription=null;
        
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
            
        this.addDialogTab('error','Error',true);
        
            // dialog buttons
            
        this.addDialogButton('ok',0.89,0.93,0.1,0.05,'Ok',true);
        
            // node controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=Math.trunc(this.core.canvas.height*0.5);
        
        y+=this.addDialogControlStatic(this,'error','errorTitle',x,y);
        this.addDialogControlStatic(this,'error','errorDescription',x,y);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
        this.setDialogControl('errorTitle',this.errorTitle);
        this.setDialogControl('errorDescription',this.errorDescription);
    }
    
        //
        // setup
        //
        
    setup(errorTitle,errorDescription)
    {
        this.errorTitle=errorTitle;
        this.errorDescription=errorDescription;
    }
    
        //
        // running
        //
        
    run()
    {
         let id=super.runInternal();

        if (id==='ok') {
            this.core.switchLoop(this.core.LOOP_TITLE);     // all errors go back to title
            return(false);
        }
        
        return(true);
    }
}
