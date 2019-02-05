import PointClass from '../utility/point.js';

export default class ImportSettingsClass
{
    constructor(name)
    {
        this.name=name;
        
        this.Y_ZERO_NONE=0;
        this.Y_ZERO_TOP=1;
        this.Y_ZERO_BOTTOM=2;
        
        this.scale=1;
        this.uScale=1;
        this.vScale=1;
        this.rotate=new PointClass(0,0,0);
        this.yZero=this.Y_ZERO_NONE;
        
        this.effectClassLookup=new Map();
        
    }
    
    addEffectClassLookup(name,effectClass)
    {
        this.effectClassLookup.set(name,effectClass);
    }
    
    lookupEffectClass(name)
    {
        return(this.effectClassLookup.get(name));
    }
    
}
