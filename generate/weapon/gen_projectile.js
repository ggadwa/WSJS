"use strict";

//
// generate projectile class
//

class GenProjectileClass
{
    constructor(modelList,soundList,genRandom)
    {
        this.modelList=modelList;
        this.soundList=soundList;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }

    generate()
    {
        var projectile=new ProjectileClass(this.modelList.getModel('projectile_0'));
        projectile.setSpeed(400);
        projectile.setLifeTick(10000);
        projectile.setFireSound(this.soundList.getSound('fire'));
        projectile.setHitSound(this.soundList.getSound('explosion'));
        projectile.setDamage(25,0,0);
        
        return(projectile);
    }
    
}
