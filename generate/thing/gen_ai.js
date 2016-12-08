/* global genRandom, config */

"use strict";

//
// generate projectile class
//

class GenAIClass
{
    constructor(genProjectile,genSound)
    {
        this.genProjectile=genProjectile;
        this.genSound=genSound;
        
        Object.seal(this);
    }

    generate()
    {
        var ai=new AIClass();
        
        if (genRandom.randomPercentage(config.MONSTER_FIRE_PERCENTAGE)) {
            ai.setProjectile(this.genProjectile.generate(false));
            ai.setProjectileFire(5000,20);
        }
        
        var speed=genRandom.randomInt(config.MONSTER_MIN_SPEED,config.MONSTER_RANDOM_EXTRA_SPEED);
        var acceleration=genRandom.randomInt(config.MONSTER_MIN_ACCELERATION,config.MONSTER_RANDOM_EXTRA_ACCELERATION);
        var deceleration=genRandom.randomInt(config.MONSTER_MIN_DECLERATION,config.MONSTER_RANDOM_EXTRA_DECELERATION);
        var standTurnSpeed=genRandom.randomInt(config.MONSTER_MIN_STAND_TURN_SPEED,config.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED);
        var walkTurnSpeed=genRandom.randomInt(config.MONSTER_MIN_WALK_TURN_SPEED,config.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED);

        ai.setSpeed(speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed);
        
        ai.setSoundBuffers(this.genSound.generate(this.genSound.TYPE_MONSTER_WAKE,false),this.genSound.generate(this.genSound.TYPE_MONSTER_HURT,false),this.genSound.generate(this.genSound.TYPE_MONSTER_DIE,false));
        
        return(ai);
    }
    
}
