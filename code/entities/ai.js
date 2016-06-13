"use strict";

//
// AI class
//

class AIClass
{
    constructor(projectile)
    {
        this.projectile=null;
        
        this.fireRechargeTick=0;
        this.fireSlopAngle=0;
        this.lastFireTimeStamp=0;
        
        Object.seal(this);
    }
    
    setProjectile(projectile)
    {
        this.projectile=projectile;
    }
    
    setProjectileFire(fireRechargeTick,fireSlopAngle)
    {
        this.fireRechargeTick=fireRechargeTick;
        this.fireSlopAngle=fireSlopAngle;
    }
}
