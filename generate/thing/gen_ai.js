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
        
        if (this.genRandom.randomPercentage(config.MONSTER_FIRE_PERCENTAGE)) {
            ai.setProjectile(this.genProjectile.generate(false));
            ai.setProjectileFire(5000,20);
        }
        
        var speed=this.genRandom.randomInt(config.MONSTER_MIN_SPEED,config.MONSTER_RANDOM_EXTRA_SPEED);
        var acceleration=this.genRandom.randomInt(config.MONSTER_MIN_ACCELERATION,config.MONSTER_RANDOM_EXTRA_ACCELERATION);
        var deceleration=this.genRandom.randomInt(config.MONSTER_MIN_DECLERATION,config.MONSTER_RANDOM_EXTRA_DECELERATION);
        var standTurnSpeed=this.genRandom.randomInt(config.MONSTER_MIN_STAND_TURN_SPEED,config.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED);
        var walkTurnSpeed=this.genRandom.randomInt(config.MONSTER_MIN_WALK_TURN_SPEED,config.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED);

        ai.setSpeed(speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed);
        
        return(ai);
    }
    
}
