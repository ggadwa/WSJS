import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

export default class CharacterClass
{
    constructor(core,name,playerJsonName,botJsonName,bitmapName,data)
    {
        this.core=core;
        this.name=name;
        this.playerJsonName=playerJsonName;
        this.botJsonName=botJsonName;
        this.bitmapName=bitmapName;
        this.data=data;
        
        this.bitmap=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        this.bitmap=new BitmapInterfaceClass(this.core,this.bitmapName);
        if (!(await this.bitmap.load())) return(false);
        
        return(true);
    }
    
    release()
    {
        this.bitmap.release();
    }
    
}
