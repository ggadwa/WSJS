import DialogBaseClass from '../dialog/dialog_base.js';
import SetupClass from '../main/setup.js';

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
        let x,y,y2,xAdd;
        
        if (!super.initialize()) return(false);
        
            // tabs
            
        this.addDialogTab('profile','Profile',false);
        this.addDialogTab('server','Server',true);
        this.addDialogTab('bot','Bots',false);
        
            // dialog buttons
            
        this.addDialogButton('cancel',0.755,0.93,0.1,0.05,'Cancel',false);
        this.addDialogButton('localGame',0.01,0.93,0.125,0.05,'Local Game',false);
        this.addDialogButton('joinGame',0.865,0.93,0.125,0.05,'Join Game',true);
        
            // profile controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'profile','name',x,y,'Name:');
        y+=this.addDialogControlCharacterPicker(this,'profile','character',(x+5),y);
        
            // server controls
            
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlList(this,'server','localMap',x,y,'Local Map:',this.core.json.multiplayerMaps);
        y+=this.addDialogControlText(this,'server','serverURL',x,y,'Server URL:');
        
            // bot controls
            
        xAdd=Math.trunc(this.core.canvas.width/5);
        x=Math.trunc(xAdd*0.25);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        
        y2=y+this.addDialogControlCharacterPicker(this,'bot','bot0',x,y);
        this.addDialogControlCharacterPicker(this,'bot','bot1',(x+xAdd),y);
        this.addDialogControlCharacterPicker(this,'bot','bot2',(x+(xAdd*2)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot3',(x+(xAdd*3)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot4',(x+(xAdd*4)),y);
        
        this.addDialogControlCharacterPicker(this,'bot','bot5',x,y2);
        this.addDialogControlCharacterPicker(this,'bot','bot6',(x+xAdd),y2);
        this.addDialogControlCharacterPicker(this,'bot','bot7',(x+(xAdd*2)),y2);
        this.addDialogControlCharacterPicker(this,'bot','bot8',(x+(xAdd*3)),y2);
        this.addDialogControlCharacterPicker(this,'bot','bot9',(x+(xAdd*4)),y2);
        
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

        this.setDialogControl('name',this.core.setup.name);
        
        this.setDialogControl('localMap',this.core.setup.localMap);
        //this.setDialogControl('botCount',this.core.setup.botCount);
        //this.setDialogControl('botSkill',this.core.setup.botSkill);
        this.setDialogControl('serverURL',this.core.setup.serverURL);
    }
    
    saveDialogControls()
    {
        this.core.setup.name=this.getDialogControl('name');
        
        this.core.setup.localMap=this.getDialogControl('localMap');
        //this.core.setup.botCount=this.getDialogControl('botCount');
        //this.core.setup.botSkill=this.getDialogControl('botSkill');
        this.core.setup.serverURL=this.getDialogControl('serverURL');
        
        this.core.setup.save();
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
            this.core.switchLoop(this.core.LOOP_GAME_LOAD);
            return(false);
        }
        
        if (buttonId==='joinGame') {
            this.saveDialogControls();
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_JOIN);
            this.core.switchLoop(this.core.LOOP_GAME_LOAD);
            return(false);
        }
        
        return(true);
    }
}
