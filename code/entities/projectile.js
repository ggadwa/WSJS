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
        
        this.gravityWaitTimeStamp=0;
        this.gravityInitValue=0;
        this.gravityAdd=0.0;
        
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
    
    setGravity(gravityWaitTimeStamp,gravityInitValue,gravityAdd)
    {
        this.gravityWaitTimeStamp=gravityWaitTimeStamp;
        this.gravityInitValue=gravityInitValue;
        this.gravityAdd=gravityAdd;
    }
    
    setBounce(bound,bounceFactor)
    {
        this.bounce=bounce;
        this.bounceFactor=bounceFactor;
    }
    
    fire(view,entityList,pos,ang)
    {
        entityList.addEntity(new EntityProjectileClass('projectile',view,pos,ang,this));
        if (this.fireSound!==null) this.fireSound.play(pos);
    }
    
}
