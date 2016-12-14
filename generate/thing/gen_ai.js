/* global genRandom, config */

"use strict";

//
// generate projectile class
//

class GenAIClass
{
    constructor(genProjectile,genSound)
    {
            // constants
            
        this.MONSTER_FIRE_PERCENTAGE=0.75;              // amount of time a monster can fire
        
        this.MONSTER_MIN_SPEED=45;                      // minimum speed for monster
        this.MONSTER_RANDOM_EXTRA_SPEED=60;             // additional random speed for monster
        this.MONSTER_MIN_ACCELERATION=5;                // minimum acceleration
        this.MONSTER_RANDOM_EXTRA_ACCELERATION=20;
        this.MONSTER_MIN_DECLERATION=5;                 // minimum deceleration
        this.MONSTER_RANDOM_EXTRA_DECELERATION=20;
        
        this.MONSTER_MIN_STAND_TURN_SPEED=0.4;
        this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED=1.0;
        this.MONSTER_MIN_WALK_TURN_SPEED=0.8;
        this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED=2.0;
        
        this.MONSTER_MIN_FIRE_RECHARGE_TICK=4000;
        this.MONSTER_RANDOM_EXTRA_FIRE_RECHARGE_TICK=2500;
        
        this.MONSTER_MIN_FIRE_SLOP_ANGLE=8.0;
        this.MONSTER_RANDOM_EXTRA_FIRE_SLOP_ANGLE=25.0;
        
        this.MONSTER_MIN_FAR_WAKE_DISTANCE=25000;
        this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE=15000;

        this.genProjectile=genProjectile;
        this.genSound=genSound;
        
        Object.seal(this);
    }

    generate()
    {
        let speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed;
        let nearWakeDistance,farWakeDistance;
        let fireRechargeTick,fireSlopAngle;
        let ai=new AIClass();
        
        fireSlopAngle=genRandom.randomFloat(this.MONSTER_MIN_FIRE_SLOP_ANGLE,this.MONSTER_RANDOM_EXTRA_FIRE_SLOP_ANGLE);
        
        if (genRandom.randomPercentage(this.MONSTER_FIRE_PERCENTAGE)) {
            ai.setProjectile(this.genProjectile.generate(false));
            
            fireRechargeTick=genRandom.randomInt(this.MONSTER_MIN_FIRE_RECHARGE_TICK,this.MONSTER_RANDOM_EXTRA_FIRE_RECHARGE_TICK);
            ai.setProjectileFire(fireRechargeTick,fireSlopAngle);
        }
        
        speed=genRandom.randomInt(this.MONSTER_MIN_SPEED,this.MONSTER_RANDOM_EXTRA_SPEED);
        acceleration=genRandom.randomFloat(this.MONSTER_MIN_ACCELERATION,this.MONSTER_RANDOM_EXTRA_ACCELERATION);
        deceleration=genRandom.randomFloat(this.MONSTER_MIN_DECLERATION,this.MONSTER_RANDOM_EXTRA_DECELERATION);
        standTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_STAND_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED);
        walkTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_WALK_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED);
        ai.setSpeed(speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed);
        
        farWakeDistance=genRandom.randomInt(this.MONSTER_MIN_FAR_WAKE_DISTANCE,this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE);
        nearWakeDistance=Math.trunc(farWakeDistance*(genRandom.random()*0.5));
        ai.setWakeDistance(nearWakeDistance,farWakeDistance,(fireSlopAngle*2.0));       // notice player with twice field of vision as firing
        
        ai.setSoundBuffers(this.genSound.generate(this.genSound.TYPE_MONSTER_WAKE,false),this.genSound.generate(this.genSound.TYPE_MONSTER_HURT,false),this.genSound.generate(this.genSound.TYPE_MONSTER_DIE,false));
        
        return(ai);
    }
    
}
