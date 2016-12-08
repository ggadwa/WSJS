/* global modelList */

"use strict";

//
// generate weapon class
//

class GenWeaponClass
{
    constructor()
    {
        Object.seal(this);
    }
    
    generate()
    {
        return(new WeaponClass(modelList.getModel('weapon_0')));
    }
}
