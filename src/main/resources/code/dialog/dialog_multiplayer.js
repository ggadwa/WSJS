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
        this.addDialogTab('game','Game',false);
        this.addDialogTab('bot','Bots',false);
        
            // dialog buttons
            
        x=(this.core.canvas.width-this.DIALOG_CONTROL_RIGHT_MARGIN)-this.DIALOG_BUTTON_LARGE_WIDTH;
        y=(this.core.canvas.height-this.DIALOG_CONTROL_BOTTOM_MARGIN)-this.DIALOG_BUTTON_HIGH;
        this.addDialogButton('joinGame',x,y,this.DIALOG_BUTTON_LARGE_WIDTH,this.DIALOG_BUTTON_HIGH,'Join Network Game',true);
        
        x-=(this.DIALOG_BUTTON_SMALL_WIDTH+this.DIALOG_BUTTON_MARGIN);
        this.addDialogButton('cancel',x,y,this.DIALOG_BUTTON_SMALL_WIDTH,this.DIALOG_BUTTON_HIGH,'Cancel',false);
        
        this.addDialogButton('localGame',this.DIALOG_CONTROL_LEFT_MARGIN,y,this.DIALOG_BUTTON_LARGE_WIDTH,this.DIALOG_BUTTON_HIGH,'Local Game',false);
        
            // profile controls
            
        x=Math.trunc(this.core.canvas.width*0.4);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'profile','name',x,y,'Name:');

        x=Math.trunc(this.core.canvas.width*0.4)+100;
        y+=this.addDialogControlCharacterPicker(this,'profile','character',x,y);
        
        x=Math.trunc(this.core.canvas.width*0.4);
        y+=this.addDialogControlRange(this,'profile','respawnTime',x,y,'Respawn Time:');        
        
            // server controls
            
        x=Math.trunc(this.core.canvas.width*0.4);
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlText(this,'server','serverURL',x,y,'Server URL:');
          
        x=Math.trunc(this.core.canvas.width*0.4);
        this.addDialogControlList(this,'server','serverList',x,y,'Recent URLs:',this.core.setup.multiplayerRecentServerURLs);        
        
            // game controls
            
        x=Math.trunc(this.core.canvas.width*0.5)-355;
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        this.addDialogControlList(this,'game','gameName',x,y,'Game:',Array.from(this.core.project.multiplayerGames.values()));
        
        x=Math.trunc(this.core.canvas.width*0.5)+60;
        y=this.DIALOG_CONTROL_TOP_MARGIN;
        y+=this.addDialogControlList(this,'game','mapName',x,y,'Map:',Array.from(this.core.project.multiplayerMaps.keys()));
        
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
        let multiplayerCharacter,multiplayerGameName,multiplayerMapName;
        
            // no selected text
            
        this.currentTextInputControl=null;
        
            // force a multiplayer character/map for player
            
        multiplayerCharacter=this.core.setup.multiplayerCharacter;
        if (multiplayerCharacter==='') multiplayerCharacter=this.core.project.multiplayerDefaultCharacter;
        
        multiplayerGameName=this.core.setup.multiplayerGameName;
        if (multiplayerGameName==='') multiplayerGameName=this.core.project.multiplayerGames.values().next().value;
        
        multiplayerMapName=this.core.setup.multiplayerMapName;
        if (multiplayerMapName==='') multiplayerMapName=this.core.project.multiplayerMaps.keys().next().value;
        
            // the values

        this.setDialogControl('name',this.core.setup.multiplayerName);
        this.setDialogControl('character',multiplayerCharacter);
        this.setDialogControl('respawnTime',this.core.setup.multiplayerRespawnTime);
        
        this.setDialogControl('serverURL',this.core.setup.multiplayerServerURL);
        this.setDialogControl('gameName',multiplayerGameName);
        this.setDialogControl('mapName',multiplayerMapName);
        
        for (n=0;n!==10;n++) {
            this.setDialogControl(('bot'+n),this.core.setup.multiplayerBotCharacters[n]);
        }
    }
    
    saveDialogControls()
    {
        let n;
        
        this.core.setup.multiplayerName=this.getDialogControl('name');
        this.core.setup.multiplayerCharacter=this.getDialogControl('character');
        
        this.core.setup.multiplayerGameName=this.getDialogControl('gameName');
        this.core.setup.multiplayerMapName=this.getDialogControl('mapName');
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
            
                // add this url to the recent list
                
            if (this.core.setup.multiplayerRecentServerURLs.indexOf(this.core.setup.multiplayerServerURL)===-1) {
                this.core.setup.multiplayerRecentServerURLs.splice(0,0,this.core.setup.multiplayerServerURL);
                if (this.core.setup.multiplayerRecentServerURLs.length>20) this.core.setup.multiplayerRecentServerURLs.length=20;
            }
            
            this.core.game.setMultiplayerMode(this.core.game.MULTIPLAYER_MODE_JOIN);
            this.core.switchLoop(this.core.LOOP_GAME_LOAD);
            return(false);
        }
        
            // controls
            
        if (id===null) return(true);
        
        if (id==='serverList') {
            this.setDialogControl('serverURL',this.getDialogControl('serverList'));
            return(true);
        }
        
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
