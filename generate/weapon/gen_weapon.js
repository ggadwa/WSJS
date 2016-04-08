"use strict";

//
// generate weapon class
//

class GenWeaponClass
{
    constructor(modelList,soundList,genProjectile,genRandom)
    {
        this.modelList=modelList;
        this.soundList=soundList;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }
    
    generate()
    {
        return(new WeaponClass(this.modelList.getModel('weapon_0')));
    }
}
