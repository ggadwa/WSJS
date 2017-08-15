//
// generate weapon class
//

export default class GenWeaponClass
{
    constructor(modelList,genSound)
    {
        this.modelList=modelList;
        this.genSound=genSound;
        
        Object.seal(this);
    }
    
    generate()
    {
        return(new WeaponClass(this.modelList.getModel('weapon_0')));
    }
}
