import DialogBaseClass from '../main/dialog_base.js';
import SetupClass from '../main/setup.js';
import InterfaceButtonClass from '../interface/interface_button.js';
import InterfaceControlClass from '../interface/interface_control.js';

export default class DialogMultiplayerClass extends DialogBaseClass
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
        if (!this.addDialogButton('localGame',0.01,0.93,0.1,0.05,'Local Game',false)) return(false);
        if (!this.addDialogButton('joinGame',0.89,0.93,0.1,0.05,'Join Game',true)) return(false);
        
            // profile controls
            
        if (!this.addDialogControl('headProfile',this.core.interface.CONTROL_TYPE_HEADER,'Profile',null)) return(false);
        if (!this.addDialogControl('name',this.core.interface.CONTROL_TYPE_TEXT,'Name:',null)) return(false);
        if (!this.addDialogControl('showFPS',this.core.interface.CONTROL_TYPE_CHECKBOX,'Show FPS:',null)) return(false);
        
            // multiplayer controls
            
        if (!this.addDialogControl('headMultiplayer',this.core.interface.CONTROL_TYPE_HEADER,'Multiplayer',null)) return(false);
        if (!this.addDialogControl('localMap',this.core.interface.CONTROL_TYPE_LIST,'Local Map:',this.core.json.multiplayerMaps)) return(false);
        if (!this.addDialogControl('botCount',this.core.interface.CONTROL_TYPE_LIST,'Bot Count:',[0,1,2,3,4,5,6,7,8,9])) return(false);
        if (!this.addDialogControl('botSkill',this.core.interface.CONTROL_TYPE_LIST,'Bot Skill:',['Easy','Moderate','Normal','Skilled','Hard'])) return(false);
        if (!this.addDialogControl('serverURL',this.core.interface.CONTROL_TYPE_TEXT,'Server URL:',null)) return(false);
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
            // open header and no selected text
            
        this.core.interface.currentOpenHeaderControl=this.controls.get('headMultiplayer');
        this.core.interface.currentTextInputControl=null;
        
            // the values

        this.setDialogControl('name',this.core.setup.name);
        this.setDialogControl('showFPS',this.core.setup.showFPS);
        
        this.setDialogControl('localMap',this.core.setup.localMap);
        this.setDialogControl('botCount',this.core.setup.botCount);
        this.setDialogControl('botSkill',this.core.setup.botSkill);
        this.setDialogControl('serverURL',this.core.setup.serverURL);
    }
    
    saveDialogControls()
    {
        this.core.setup.name=this.getDialogControl('name');
        this.core.setup.showFPS=this.getDialogControl('showFPS');
        
        this.core.setup.localMap=this.getDialogControl('localMap');
        this.core.setup.botCount=this.getDialogControl('botCount');
        this.core.setup.botSkill=this.getDialogControl('botSkill');
        this.core.setup.serverURL=this.getDialogControl('serverURL');
        
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
        
        if (buttonId==='localGame') {
            this.saveDialogControls();
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_LOCAL);
            this.core.switchLoop(this.core.LOOP_GAME);
            return(false);
        }
        
        if (buttonId==='joinGame') {
            this.saveDialogControls();
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_JOIN);
            this.core.switchLoop(this.core.LOOP_GAME);
            return(false);
        }
        
        return(true);
    }
}
