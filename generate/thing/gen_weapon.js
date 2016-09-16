"use strict";

//
// generate weapon class
//

class GenWeaponClass
{
    constructor(genProjectile)
    {
        Object.seal(this);
    }
    
    generate()
    {
        return(new WeaponClass(modelList.getModel('weapon_0')));
    }
}
