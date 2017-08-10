//
// generate weapon class
//

export default class GenWeaponClass
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
