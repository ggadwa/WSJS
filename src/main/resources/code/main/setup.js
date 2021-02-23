export default class SetupClass
{
    constructor()
    {
        this.showFPS=false;

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
        this.fullScreen=false;
        this.shadowmaps=true;

        this.soundVolume=0.3;
        this.musicVolume=0.5;
        this.musicOn=true;
        
        this.multiplayerName='Player';
        this.multiplayerCharacter='';
        this.multiplayerLocalMap='';
        this.multiplayerServerURL='127.0.0.1';
        this.multiplayerSavedServerURLList=['127.0.0.1'];
        this.multiplayerBotCharacters=['','','','','','','','','',''];
        
        this.skipShadowMapNormals=false;
    }
    
    getStorageName()
    {
        let paths=window.location.pathname.split('/');
        return(paths[1]+'_setup');
    }
    
    load()
    {
        let jsonStr=window.localStorage.getItem(this.getStorageName());
        if (jsonStr!==null) Object.assign(this,JSON.parse(jsonStr));
    }
    
    save()
    {
        window.localStorage.setItem(this.getStorageName(),JSON.stringify(this));
    }
}
