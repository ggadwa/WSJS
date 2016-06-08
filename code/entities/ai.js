"use strict";

//
// AI class
//

class AIClass
{
    constructor(projectile)
    {
        this.projectile=null;
        
        Object.seal(this);
    }
    
    setProjectile(projectile)
    {
        this.projectile=projectile;
    }
}
