import WeaponClass from '../../code/entities/weapon.js';
import GenModelWeaponClass from '../../generate/model/gen_model_weapon.js';

//
// generate weapon class
//

export default class GenWeaponClass
{
    constructor(view,map,sound,modelList)
    {
        this.view=view;
        this.map=map;
        this.sound=sound;
        this.modelList=modelList;       // todo -- DELETE temporary until shaders are global
        
        Object.seal(this);
    }
    
    generate(name)
    {
        let genModel,model;
        
        genModel=new GenModelWeaponClass(this.view);
        model=genModel.generate('weapon_0',1.0,false);
        this.modelList.addModel(model);
        
        return(new WeaponClass(this.view,model,name));
    }
}
