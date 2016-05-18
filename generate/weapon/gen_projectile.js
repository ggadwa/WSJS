"use strict";

//
// generate projectile class
//

class GenProjectileClass
{
    constructor(genRandom)
    {
        this.genRandom=genRandom;
        
        Object.seal(this);
    }

    generate(isPlayer)
    {
        var projectile=new ProjectileClass(modelList.getModel('projectile_0'));
        projectile.setSpeed(isPlayer?400:100);
        projectile.setLifeTick(10000);
        projectile.setFireSound(soundList.getSound('fire'));
        projectile.setHitSound(soundList.getSound('explosion'));
        projectile.setDamage((isPlayer?25:15),0,0);
        
        if (!isPlayer) projectile.setGravity(2000,-10,5);
        
        return(projectile);
    }
    
}
