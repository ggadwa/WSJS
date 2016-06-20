"use strict";

//
// projectile class
//

class ProjectileClass
{
    constructor(model)
    {
        this.model=model;
        
        this.speed=0;
        this.lifeTick=0;
        
        this.fireSound=null;
        this.hitSound=null;
        
        this.damage=0;
        this.splashRadius=0;
        this.splashDamage=0;
        
        this.noGravity=true;
        this.gravityInitValue=0;
        this.gravityMaxValue=0;
        this.gravityAcceleration=0;
        
        this.bounce=false;
        this.bounceFactor=1.0;
        
        this.reflect=false;
    }
    
    setSpeed(speed)
    {
        this.speed=speed;
    }
    
    setLifeTick(lifeTick)
    {
        this.lifeTick=lifeTick;
    }
    
    setFireSound(fireSound)
    {
        this.fireSound=fireSound;
    }
    
    setHitSound(hitSound)
    {
        this.hitSound=hitSound;
    }
    
    setDamage(damage,splashRadius,splashDamage)
    {
        this.damage=damage;
        this.splashRadius=splashRadius;
        this.splashDamage=splashDamage;
    }
    
    setGravity(gravityInitValue,gravityMaxValue,gravityAcceleration)
    {
        this.noGravity=false;
        this.gravityInitValue=gravityInitValue;
        this.gravityMaxValue=gravityMaxValue;
        this.gravityAcceleration=gravityAcceleration;
    }
    
    setBounce(bound,bounceFactor)
    {
        this.bounce=bounce;
        this.bounceFactor=bounceFactor;
    }
    
    fire(parentEntityId,pos,ang)
    {
        entityList.addEntity(new EntityProjectileClass('projectile',parentEntityId,pos,ang,this));
        if (this.fireSound!==null) this.fireSound.play(pos);
    }
    
}
