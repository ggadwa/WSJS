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
        let x,y,psz,sx;
        let n,ctrlName,botNameList,botCount;
        
        if (!super.initialize()) return(false);
        
            // tabs
            
        this.addDialogTab('profile','Profile',false);
        this.addDialogTab('server','Server',true);
        this.addDialogTab('bot','Bots',false);
        
            // dialog buttons
            
        this.addDialogButton('cancel',0.755,0.93,0.1,0.05,'Cancel',false);
        this.addDialogButton('localGame',0.01,0.93,0.125,0.05,'Local Game',false);
        this.addDialogButton('joinGame',0.865,0.93,0.125,0.05,'Join Network Game',true);
        
            // profile controls
            
        x=Math.trunc(this.core.canvas.width*0.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'profile','name',x,y,'Name:');
        y+=this.addDialogControlCharacterPicker(this,'profile','character',(x+5),y);
        
            // server controls
            
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'server','serverURL',x,y,'Network Server URL:');
        y+=this.addDialogControlList(this,'server','localMap',x,y,'Local Game Map:',this.core.json.multiplayerMaps);
        y+=this.addDialogControlRange(this,'server','respawnTime',x,y,'Respawn Time:');
        
            // bot controls

        psz=this.PICKER_SIZE+4;
        
        x=Math.trunc(this.core.canvas.width*0.5)-Math.trunc(psz*2.5);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        
        this.addDialogControlCharacterPicker(this,'bot','bot0',x,y);
        this.addDialogControlCharacterPicker(this,'bot','bot1',(x+psz),y);
        this.addDialogControlCharacterPicker(this,'bot','bot2',(x+(psz*2)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot3',(x+(psz*3)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot4',(x+(psz*4)),y);
        
        y+=psz;
        this.addDialogControlCharacterPicker(this,'bot','bot5',x,y);
        this.addDialogControlCharacterPicker(this,'bot','bot6',(x+psz),y);
        this.addDialogControlCharacterPicker(this,'bot','bot7',(x+(psz*2)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot8',(x+(psz*3)),y);
        this.addDialogControlCharacterPicker(this,'bot','bot9',(x+(psz*4)),y);
        
            // character picking
            
        sx=x=Math.trunc(this.core.canvas.width*0.5)-(psz*2);
        y=Math.trunc(this.core.canvas.height*0.5)-(psz*2);
        
        botNameList=this.core.project.getCharacterList();
        botCount=botNameList.length;
        
        for (n=0;n!==16;n++) {
            ctrlName='botPick'+n;
            this.addDialogControlCharacterPicker(this,null,ctrlName,x,y);
            this.setDialogControl(ctrlName,(n<botCount)?botNameList[n]:'');
            
            if (((n+1)%4)===0) {
                x=sx;
                y+=psz;
            }
            else {
                x+=psz;
            }
        }
        
        return(true);
    }
    
        //
        // dialog controls
        //
        
    loadDialogControls()
    {
        let n;
        let multiplayerCharacter,multiplayerLocalMap;
        
            // no selected text
            
        this.currentTextInputControl=null;
        
            // force a multiplayer character/map for player
            
        multiplayerCharacter=this.core.setup.multiplayerCharacter;
        if (multiplayerCharacter==='') multiplayerCharacter=this.core.project.multiplayerDefaultCharacter;
        
        multiplayerLocalMap=this.core.setup.multiplayerLocalMap;
        if (multiplayerLocalMap==='') multiplayerLocalMap=this.core.json.multiplayerMaps[0];
        
            // the values

        this.setDialogControl('name',this.core.setup.multiplayerName);
        this.setDialogControl('character',multiplayerCharacter);
        
        this.setDialogControl('serverURL',this.core.setup.multiplayerServerURL);
        this.setDialogControl('localMap',multiplayerLocalMap);
        this.setDialogControl('respawnTime',this.core.setup.multiplayerRespawnTime);
        
        for (n=0;n!==10;n++) {
            this.setDialogControl(('bot'+n),this.core.setup.multiplayerBotCharacters[n]);
        }
    }
    
    saveDialogControls()
    {
        let n;
        
        this.core.setup.multiplayerName=this.getDialogControl('name');
        this.core.setup.multiplayerCharacter=this.getDialogControl('character');
        
        this.core.setup.multiplayerLocalMap=this.getDialogControl('localMap');
        this.core.setup.multiplayerServerURL=this.getDialogControl('serverURL');
        this.core.setup.multiplayerRespawnTime=this.getDialogControl('respawnTime');
        
        for (n=0;n!==10;n++) {
            this.core.setup.multiplayerBotCharacters[n]=this.getDialogControl('bot'+n);
        }
        
        this.core.setup.save();
    }
    
        //
        // running
        //
        
    run()
    {
        let value;
        let id=super.runInternal();
        
            // buttons

        if (id==='cancel') {
            this.core.switchLoop(this.core.previousLoop);
            return(false);
        }
        
        if (id==='localGame') {
            this.saveDialogControls();
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_LOCAL);
            this.core.switchLoop(this.core.LOOP_GAME_LOAD);
            return(false);
        }
        
        if (id==='joinGame') {
            this.saveDialogControls();
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_JOIN);
            this.core.switchLoop(this.core.LOOP_GAME_LOAD);
            return(false);
        }
        
            // controls
            
        if (id===null) return(true);
        
        if (id.startsWith('botPick')) {
            value=this.getDialogControl(id);
            if ((!this.pickerControlAllowBlank) && (value==='')) return(true);
                
            this.setDialogControl(this.pickerControlId,value);
            this.pickerMode=false;
            return(true);
        }
        
        if (id.startsWith('bot')) {
            this.pickerMode=true;
            this.pickerControlId=id;
            this.pickerControlAllowBlank=true;
            return(true);
        }
        
        if (id.startsWith('character')) {
            this.pickerMode=true;
            this.pickerControlId=id;
            this.pickerControlAllowBlank=false;
            return(true);
        }
        
        return(true);
    }
}
