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
        
        projectile.setLifeTick(10000);
        projectile.setFireSound(soundList.getSound('fire'));
        projectile.setHitSound(soundList.getSound('explosion'));
        projectile.setDamage((isPlayer?25:15),0,0);
        
            // enemy settings
            
        if (!isPlayer) {
            projectile.setSpeed(this.genRandom.randomInt(150,150));
            
                // possible lob or reflect
                
            if (this.genRandom.randomPercentage(0.5)) {
                projectile.setLob(-this.genRandom.randomInt(150,150));
                projectile.setNoGravity(false);
            }
            
            if (this.genRandom.randomPercentage(0.5)) {
                projectile.setReflect(true);
            }
            
            if (this.genRandom.randomPercentage(0.5)) {
                projectile.setBounce(true,0.95);
            }
        }
        
            // player settings
            
        else {
            projectile.setSpeed(400);
        }
        
        return(projectile);
    }
    
}
