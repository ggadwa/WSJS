export default class SetupClass
{
    constructor()
    {
        this.BOT_SKILL_EASY=0;
        this.BOT_SKILL_MODERATE=1;
        this.BOT_SKILL_NORMAL=2;
        this.BOT_SKILL_SKILLED=3;
        this.BOT_SKILL_HARD=4;
        
        this.name='Player';

        this.showFPS=false;

        this.localMap=0;
        this.botCount=5;
        this.botSkill=this.BOT_SKILL_NORMAL;

        this.serverURL='127.0.0.1';
        this.savedServerURLList=['127.0.0.1'];

        this.mouseXSensitivity=0.3;
        this.mouseXAcceleration=0.4;
        this.mouseXInvert=false;
        this.mouseYSensitivity=0.2;
        this.mouseYAcceleration=0.1;
        this.mouseYInvert=false;
        
        this.touchStickLeftXDeadZone=0.5;
        this.touchStickLeftXAcceleration=1;
        this.touchStickLeftYDeadZone=0.5;
        this.touchStickLeftYAcceleration=1;
        
        this.touchStickRightXDeadZone=0.25;
        this.touchStickRightXAcceleration=3;
        this.touchStickRightYDeadZone=0.75;
        this.touchStickRightYAcceleration=2;
        
        this.snapLook=false;

        this.soundVolume=0.3;
        this.musicVolume=0.5;
        this.musicOn=true;
        
        this.skipShadowMapNormals=false;
    }
    
    load(core)  // core has to be passed in other JSON is circular
    {
        let jsonStr=window.localStorage.getItem(core.json.name+'_setup');
        if (jsonStr!==null) Object.assign(this,JSON.parse(jsonStr));
    }
    
    save(core)
    {
        window.localStorage.setItem((core.json.name+'_setup'),JSON.stringify(this));
    }
}
