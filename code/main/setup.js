export default class SetupClass
{
    name='Player';
    serverURL='ws://127.0.0.1';
    savedServerURLList=['ws://127.0.0.1','ws://10.0.0.1','ws://10.0.0.2'];

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
