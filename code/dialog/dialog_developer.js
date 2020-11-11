import SetupClass from '../main/setup.js';
import DialogClass from '../dialog/dialog.js';
import UploadClass from '../main/upload.js';
import ShadowmapLightClass from '../generate/shadowmap/shadowmap_light.js';
import ShadowmapMeshClass from '../generate/shadowmap/shadowmap_mesh.js';

export default class DialogDeveloperClass extends DialogClass
{
    constructor(core)
    {
        super(core);
        
        this.SHADOWMAP_THREAD_COUNT=8;
        
        this.shadowmapThreads=null;
        
        this.shadowmapGlobalShadowmapList=null;
        this.shadowmapGlobalMeshes=null;
        
        this.shadowmapTimestamp=0;
        
        this.pathHintThread=null;
        this.pathHintTimestamp=0;
    }
    
        //
        // views
        //
        
    addDeveloperControls(viewDiv)
    {
        this.addInput(viewDiv,'test1','Test1:','text',null,'blah',null);
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
    addBuilderControls(viewDiv)
    {
        this.addButton(viewDiv,'buildPathHints','Save and Compile Paths',this.buildPathHints.bind(this));
        this.addButton(viewDiv,'buildShadowmap','Build Shadowmap',this.buildShadowmap.bind(this,false));
        this.addButton(viewDiv,'buildShadowmapIgnoreNormals','Build Shadowmap (Ignore Normals)',this.buildShadowmap.bind(this,true));
        
        /*
        this.addInput(viewDiv,'localGame','Local Game:','checkbox',null,this.core.setup.localGame,this.localGameChange.bind(this));
        this.addInput(viewDiv,'botCount','Local Bot Count:','select',['0','1','2','3','4','5','6','7','8','9'],this.core.setup.botCount,null);
        this.addInput(viewDiv,'botSkill','Local Bot Skill:','select',['Easy','Moderate','Normal','Skilled','Hard'],this.core.setup.botSkill,null);
        this.addInput(viewDiv,'serverURL','Server URL:','text',null,this.core.setup.serverURL,null);
        this.addInput(viewDiv,'savedServerURLList','Saved Server URLs:','select',this.core.setup.savedServerURLList,-1,this.savedServerListPick.bind(this));
        
        this.localGameChange();         // to reset disabled items
            */
    }
    
    
        //
        // connect dialog
        //
    
    open()
    {
        this.createDialog(['Developer','Builders'],0,this.core.setPauseState.bind(this.core,false,false));
        
        this.addDeveloperControls(this.getView('Developer'));
        this.addBuilderControls(this.getView('Builders'));
    }
    
    close()
    {
        /*
            // change the setup and save
            
        this.core.setup.localGame=document.getElementById('localGame').checked;
        this.core.setup.botCount=document.getElementById('botCount').selectedIndex;
        this.core.setup.botSkill=document.getElementById('botSkill').selectedIndex;
        
        this.core.setup.serverURL=document.getElementById('serverURL').value;
        if (this.core.setup.savedServerURLList.indexOf(this.core.setup.serverURL)===-1) this.core.setup.savedServerURLList.splice(0,0,this.core.setup.serverURL);
        
        this.core.setup.name=document.getElementById('name').value;
        
        this.core.setup.save(this.core);
        */
            // close the dialog
            
        this.removeDialog();
    }

}
