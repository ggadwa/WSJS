import PointClass from '../utility/point.js';
import SoundClass from '../sound/sound.js';

//
// map sound list class
//

export default class MapSoundListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.sounds=new Map();

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        this.sounds.clear();
        
        return(true);
    }

    release()
    {
        let sound;
        
            // buffers
            
        for (sound of this.sounds.values()) {
            sound.release();
        }
        
        this.sounds.clear();
    }
    
        //
        // loading
        //
   
    buildSoundList()
    {
        let name,sound;
        let soundList=this.core.project.getSoundList(this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE);
        
        for (name of soundList) {
            sound=new SoundClass(this.core,name);
            sound.initialize();
            this.sounds.set(name,sound);
        }

    }
        
        //
        // gets milliseconds length of sample
        //
        
    getMillisecondDuration(name)
    {
        let sound;
        
        sound=this.sounds.get(name);
        if (sound===undefined) return(0);
        
        return(sound.buffer.duration*1000);
    }
    
    getMillisecondDurationJson(obj)
    {
        if ((obj===undefined) || (obj===null)) return(0);
        if ((obj.name===undefined) || (obj.name==='')) return(0);
        
        return(this.getMillisecondDuration(obj.name));
    }
    
}
