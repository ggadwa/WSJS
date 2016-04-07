"use strict";

//
// projectile class
//

class ProjectileClass
{
    constructor(model,radius,high,speed,lifeTick)
    {
        this.model=model;
        this.radius=radius;
        this.high=high;
        this.speed=speed;
        this.lifeTick=lifeTick;
        
        this.fireSound=null;
        this.hitSound=null;
        
        this.damage=0;
        this.splashRadius=0;
        this.splashDamage=0;
        
        this.gravityWait=0;
        this.gravityAdd=0.0;
        
        this.bounce=false;
        this.bounceFactor=1.0;
        
        this.reflect=false;
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
    
    fire(view,soundList,entityList,pos,ang)
    {
        entityList.addEntity(new EntityProjectileClass('projectile',view,pos,ang,this.radius,this.high,this));
        if (this.fireSound!==null) this.fireSound.play(pos);
    }
    
}
