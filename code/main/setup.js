/**
 * The object that contains all the information on how
 * the user setup this game (for instance, things like mouse
 * speed, etc.)
 * 
 * @hideconstructor
 */
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

        this.localGame=true;

        this.serverURL='127.0.0.1';
        this.savedServerURLList=['127.0.0.1'];

        this.botCount=5;
        this.botSkill=this.BOT_SKILL_NORMAL;

        this.mouseXSensitivity=0.3;
        this.mouseXAcceleration=0.4;
        this.mouseXInvert=false;
        this.mouseYSensitivity=0.2;
        this.mouseYAcceleration=0.1;
        this.mouseYInvert=false;
        
        this.touchStickXSensitivity=0.6;
        this.touchStickYSensitivity=0.5;
        
        this.snapLook=false;

        this.soundVolume=0.3;
        this.musicVolume=0.3;
    }
    
    load(core)  // core has to be passed in other JSON is circular
    {
        let jsonStr=window.localStorage.getItem(core.game.json.name+'_setup');
        if (jsonStr!==null) Object.assign(this,JSON.parse(jsonStr));
    }
    
    save(core)
    {
        window.localStorage.setItem((core.game.json.name+'_setup'),JSON.stringify(this));
    }
}
