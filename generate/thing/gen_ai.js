"use strict";

//
// generate projectile class
//

class GenAIClass
{
    constructor(genProjectile,genRandom)
    {
        this.genProjectile=genProjectile;
        this.genRandom=genRandom;
        
        Object.seal(this);
    }

    generate()
    {
        var ai=new AIClass();
        
        ai.setProjectile(this.genProjectile.generate(false));
        ai.setProjectileFire(5000,20);
        
        return(ai);
    }
    
}
