export default class SetupClass
{
    static BOT_SKILL_EASY=0;
    static BOT_SKILL_MODERATE=1;
    static BOT_SKILL_NORMAL=2;
    static BOT_SKILL_SKILLED=3;
    static BOT_SKILL_HARD=4;
    
    name='Player';
    
    serverURL='127.0.0.1';
    savedServerURLList=['127.0.0.1'];
    
    botCount=5;
    botSkill=SetupClass.BOT_SKILL_NORMAL;
    
    mouseXSensitivity=0.3;
    mouseXAcceleration=0.4;
    mouseXInvert=false;
    mouseYSensitivity=0.2;
    mouseYAcceleration=0.1;
    mouseYInvert=false;

    soundVolume=0.3;
    musicVolume=0.3;
    
    static load(core)
    {
        let jsonStr=window.localStorage.getItem(core.projectGame.getName()+'_setup');
        if (jsonStr!==null) return(JSON.parse(jsonStr));
        
        return(new SetupClass());
    }
    
    static save(core,setup)
    {
        window.localStorage.setItem((core.projectGame.getName()+'_setup'),JSON.stringify(setup));
    }
}
