import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

export default class DialogNodeClass extends DialogBaseClass
{
    constructor(core)
    {
        super(core);
        
        this.node=null;
        
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
            
        this.addDialogTab('node','Node',true);
        
            // dialog buttons
            
        this.addDialogButton('cancel',0.78,0.93,0.1,0.05,'Cancel',false);
        this.addDialogButton('ok',0.89,0.93,0.1,0.05,'Ok',true);
        
            // node controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        
        y+=this.addDialogControlText(this,'node','key',x,y,'Key (blank for none):');
        this.addDialogControlCheckbox(this,'node','spawn',x,y,'Allows spawns:');
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
        this.setDialogControl('key',this.node.key);
        this.setDialogControl('spawn',this.node.spawn);
        
        this.currentTextInputControl=this.controls.get('key');
    }
    
    saveDialogControls()
    {
        this.node.key=this.getDialogControl('key');
        if (this.node.key.length===0) this.node.key=null;
        
        this.node.spawn=this.getDialogControl('spawn');
    }
    
        //
        // setup
        //
        
    setup(node)
    {
        this.node=node;
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
        
        return(true);
    }
}
