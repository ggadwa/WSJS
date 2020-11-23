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
   
    async loadAllSounds()
    {
        let soundSet,name,sound;
        let mesh,move,liquid;
        let entity,jsonEntity;
        let success,promises;
        let game=this.core.game;
        let map=game.map;
        
            // load all the necessary sounds
            // into a set
            
        soundSet=new Set();
        
            // movement sounds
            
        for (mesh of map.meshList.meshes) {
            if (mesh.movement!==null) {
                for (move of mesh.movement.moves) {
                    if (move.sound!==null) soundSet.add(move.sound.name);
                }
            }
        }
        
            // liquid sounds
        
        for (liquid of map.liquidList.liquids) {
            if (liquid.soundIn!==null) soundSet.add(liquid.soundIn.name);
            if (liquid.soundOut!==null) soundSet.add(liquid.soundOut.name);
        }

            // entity sounds
            
        for (entity of map.entityList.entities) {
            jsonEntity=game.entityCache.getJson(entity.jsonName);
            if (jsonEntity!==null) game.addJsonObjectToLoadSet(soundSet,entity.data,"sounds",false,['name'],jsonEntity);
        }
        
            // load the sounds
            
        promises=[];
        
        for (name of soundSet) {
            sound=new SoundClass(this.core,name);
            sound.initialize();
            promises.push(sound.load());
            
            this.sounds.set(name,sound);
        }

            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );
                
        if (!success) return(false);

        return(true);
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
