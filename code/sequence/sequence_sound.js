import SoundClass from '../sound/sound.js';

export default class SequenceSoundClass
{
    constructor(core,sequence,name,json)
    {
        this.core=core;
        this.sequence=sequence;
        this.name=name;
        this.json=json;
        
        this.sound=null;
        
        Object.seal(this);
    }
    
    async initialize()
    {
            // the sound
            
        this.sound=new SoundClass(this.core,this.name);
        this.sound.initialize();
        if (!(await this.sound.load())) return(false);
        
        return(true);
    }
    
    release()
    {
        this.sound.release();
    }
}
