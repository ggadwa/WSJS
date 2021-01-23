import CharacterClass from '../main/character.js';

export default class CharacterListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.characters=new Map();
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let charDef,character;
        
        for (charDef of this.core.json.characters) {
            character=new CharacterClass(this.core,charDef.name,charDef.playerJson,charDef.botJson,charDef.bitmap,charDef.data);
            if (!(await character.initialize())) return(false);
            
            this.characters.set(charDef.name,character);
        }
        
        return(true);
    }
    
    release()
    {
        let character;
        
        for (character of this.characters) {
            character.release();
        }
        
        this.characters.clear();
    }
    
        //
        // get bot
        //
        
    get(name)
    {
        return(this.characters.get(name));
    }
}
