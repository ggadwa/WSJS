import SetupClass from '../main/setup.js';
import DialogClass from '../dialog/dialog.js';

export default class DialogConnectClass extends DialogClass
{
    constructor(core)
    {
        super(core);
    }
    
        //
        // views
        //
        
    addMultiplayerControls(viewDiv)
    {
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
    }
    
    addProfileControls(viewDiv)
    {
        this.addInput(viewDiv,'name','Name:','text',null,this.core.setup.name,null);
    }
    
        //
        // misc control events
        //
        
    localGameChange()
    {
        let checked=document.getElementById('localGame').checked;
        document.getElementById('serverURL').disabled=checked;
        document.getElementById('savedServerURLList').disabled=checked;
    }
    
    savedServerListPick()
    {
        document.getElementById('serverURL').value=document.getElementById('savedServerURLList').value;
    }

        //
        // connect dialog
        //
    
    open(callback)
    {
        this.createDialog(['Multiplayer','Profile'],0,callback);
        
        this.addMultiplayerControls(this.getView('Multiplayer'));
        this.addProfileControls(this.getView('Profile'));
    }
    
    close()
    {
            // change the setup and save
            
        this.core.setup.localGame=document.getElementById('localGame').checked;
        this.core.setup.botCount=document.getElementById('botCount').selectedIndex;
        this.core.setup.botSkill=document.getElementById('botSkill').selectedIndex;
        
        this.core.setup.serverURL=document.getElementById('serverURL').value;
        if (this.core.setup.savedServerURLList.indexOf(this.core.setup.serverURL)===-1) this.core.setup.savedServerURLList.splice(0,0,this.core.setup.serverURL);
        
        this.core.setup.name=document.getElementById('name').value;
        
        this.core.setup.save(this.core);
        
            // close the dialog
            
        this.removeDialog();
    }

}
