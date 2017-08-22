import WeaponClass from '../../code/entities/weapon.js';

//
// generate weapon class
//

export default class GenWeaponClass
{
    constructor(view,modelList,genSound)
    {
        this.view=view;
        this.modelList=modelList;
        this.genSound=genSound;
        
        Object.seal(this);
    }
    
    generate()
    {
        return(new WeaponClass(this.view,this.modelList.getModel('weapon_0')));
    }
}
