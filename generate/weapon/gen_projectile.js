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

    generate(isPlayer)
    {
        var projectile=new ProjectileClass(this.modelList.getModel('projectile_0'));
        projectile.setSpeed(isPlayer?400:100);
        projectile.setLifeTick(10000);
        projectile.setFireSound(this.soundList.getSound('fire'));
        projectile.setHitSound(this.soundList.getSound('explosion'));
        projectile.setDamage((isPlayer?25:15),0,0);
        
        if (!isPlayer) projectile.setGravity(2000,-10,5);
        
        return(projectile);
    }
    
}
