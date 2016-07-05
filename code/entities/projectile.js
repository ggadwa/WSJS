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
        this.lob=0;
        
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
    
    setNoGravity(noGravity)
    {
        this.noGravity=noGravity;
    }
    
    setLob(lob)
    {
        this.noGravity=false;       // lobbing always turns gravity on
        this.lob=lob;
    }
    
    setBounce(bounce,bounceFactor)
    {
        this.bounce=bounce;
        this.bounceFactor=bounceFactor;
    }
    
    setReflect(reflect)
    {
        this.reflect=reflect;
    }
    
    fire(parentEntityId,pos,ang)
    {
        entityList.addEntity(new EntityProjectileClass('projectile',parentEntityId,pos,ang,this));
        if (this.fireSound!==null) this.fireSound.play(pos);
    }
    
}
