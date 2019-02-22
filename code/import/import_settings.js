import PointClass from '../utility/point.js';

export default class ImportSettingsClass
{
    static FORMAT_OBJ=0;
    static FORMAT_GLTF=1;
    
    constructor(name)
    {
        this.name=name;
        
        this.format=this.FORMAT_OBJ;
        
        this.scale=1;
        this.uScale=1;
        this.vScale=1;
        this.floorY=false;
        this.skipMeshes=[];
        
        this.effectClassLookup=new Map();
        
        Object.seal(this);
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
