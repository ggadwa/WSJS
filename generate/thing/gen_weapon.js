import WeaponClass from '../../code/entities/weapon.js';
import GenModelWeaponClass from '../../generate/model/gen_model_weapon.js';
import GenProjectileClass from '../../generate/thing/gen_projectile.js';

//
// generate weapon class
//

export default class GenWeaponClass
{
    constructor(view,map,sound)
    {
        this.view=view;
        this.map=map;
        this.sound=sound;
        
        Object.seal(this);
    }
    
    generate(name)
    {
        let weapon;
        let genModel=new GenModelWeaponClass(this.view);
        let genProjectile=new GenProjectileClass(this.view,this.map,this.sound);
        
            // the weapon and projectile
            
        weapon=new WeaponClass(this.view,genModel.generate(name,1.0,false),name);
        weapon.setProjectile(genProjectile.generate(name,true));
        
        return(weapon);
    }
}
