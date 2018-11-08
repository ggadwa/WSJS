import genRandom from '../../generate/utility/random.js';
import PointClass from '../../code/utility/point.js';
import EntityMonsterClass from '../../code/entities/entity_monster.js';
import GenModelMonsterClass from '../../generate/model/gen_model_monster.js';
import GenProjectileClass from '../../generate/thing/gen_projectile.js';
import GenSoundClass from '../../generate/sound/gen_sound.js';

export default class GenMonsterClass
{
    constructor(view,map,sound)
    {
            // constants
            
        this.MONSTER_FIRE_PERCENTAGE=0.5;
        this.MONSTER_NON_MOVING_PERCENTAGE=0.2;
        
        this.MONSTER_MIN_SPEED=45;
        this.MONSTER_RANDOM_EXTRA_SPEED=60;
        this.MONSTER_MIN_ACCELERATION=5;
        this.MONSTER_RANDOM_EXTRA_ACCELERATION=20;
        this.MONSTER_MIN_DECLERATION=5;
        this.MONSTER_RANDOM_EXTRA_DECELERATION=20;
        this.MONSTER_MIN_STAND_TURN_SPEED=0.4;
        this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED=1.0;
        this.MONSTER_MIN_WALK_TURN_SPEED=0.8;
        this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED=2.0;
        
        this.MONSTER_FAST_FACTOR=1.5;
        this.MONSTER_RANDOM_EXTRA_FAST_FACTOR=2.0;
        
        this.MONSTER_SLOW_FACTOR=0.5;
        this.MONSTER_RANDOM_EXTRA_SLOW_FACTOR=0.2;
        
        this.MONSTER_MIN_FIRE_RECHARGE_TICK=4000;
        this.MONSTER_RANDOM_EXTRA_FIRE_RECHARGE_TICK=2500;
        
        this.MONSTER_MIN_FIRE_SLOP_ANGLE=8.0;
        this.MONSTER_RANDOM_EXTRA_FIRE_SLOP_ANGLE=25.0;
        this.MONSTER_MIN_FIRE_MAX_DISTANCE=15000;
        this.MONSTER_RANDOM_EXTRA_FIRE_MAX_DISTANCE=15000;
        
        this.MONSTER_MIN_FAR_WAKE_DISTANCE=35000;
        this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE=20000;
            
            // variables

        this.view=view;
        this.map=map;
        this.sound=sound;
    }
        
    generate(name,isBoss,pos)
    {
        let model,entity;
        let canFire,speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed;
        let fastFactor,slowFactor;
        let fireSlopAngle,maxHealth;
        let genModel=new GenModelMonsterClass(this.view);
        let genSound=new GenSoundClass(this.sound.getAudioContext());
        let genProjectile;
        
            // create the model
        
        if (!isBoss) {
            model=genModel.generate(name,1.0,false);
            maxHealth=100;
        }
        else {
            model=genModel.generate(name,genRandom.randomFloat(2.5,3.0),false);
            maxHealth=250;
        }
        
            // the monster

        entity=new EntityMonsterClass(this.view,this.map,this.sound,name,pos,new PointClass(0.0,(genRandom.random()*360.0),0.0),maxHealth,model);
        
            // some default speeds
            
        speed=genRandom.randomInt(this.MONSTER_MIN_SPEED,this.MONSTER_RANDOM_EXTRA_SPEED);
        acceleration=genRandom.randomFloat(this.MONSTER_MIN_ACCELERATION,this.MONSTER_RANDOM_EXTRA_ACCELERATION);
        deceleration=genRandom.randomFloat(this.MONSTER_MIN_DECLERATION,this.MONSTER_RANDOM_EXTRA_DECELERATION);
        standTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_STAND_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED);
        walkTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_WALK_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED);
        
        fastFactor=genRandom.randomFloat(this.MONSTER_FAST_FACTOR,this.MONSTER_RANDOM_EXTRA_FAST_FACTOR);
        slowFactor=genRandom.randomFloat(this.MONSTER_SLOW_FACTOR,this.MONSTER_RANDOM_EXTRA_SLOW_FACTOR);

            // if the monster can fire, it either walks
            // slowly or not at all
                
        if (genRandom.randomPercentage(this.MONSTER_FIRE_PERCENTAGE)) {
            canFire=true;
            
            if (genRandom.randomPercentage(this.MONSTER_NON_MOVING_PERCENTAGE)) {
                speed=0;
                acceleration=0;
                deceleration=0;
                standTurnSpeed*=fastFactor;
                walkTurnSpeed=0;
            }
            else {
                speed*=fastFactor;
                acceleration*=fastFactor;
                deceleration*=fastFactor;
                standTurnSpeed*=fastFactor;
                walkTurnSpeed*=fastFactor;
            }
        }
        else {
            canFire=false;
            speed=genRandom.randomInt(this.MONSTER_MIN_SPEED_FAST,this.MONSTER_RANDOM_EXTRA_SPEED_FAST);
            acceleration=genRandom.randomFloat(this.MONSTER_MIN_ACCELERATION_FAST,this.MONSTER_RANDOM_EXTRA_ACCELERATION_FAST);
            deceleration=genRandom.randomFloat(this.MONSTER_MIN_DECLERATION_FAST,this.MONSTER_RANDOM_EXTRA_DECELERATION_FAST);
            standTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_STAND_TURN_SPEED_FAST,this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED_FAST);
            walkTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_WALK_TURN_SPEED_FAST,this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED_FAST);
        }
        
            // bosses are bigger so have extra slow down
            
        if (isBoss) {
            speed*=slowFactor;
            acceleration*=slowFactor;
            deceleration*=slowFactor;
            standTurnSpeed*=slowFactor;
            walkTurnSpeed*=slowFactor;
        }
        
            // some mins
            
        if (standTurnSpeed<1.0) standTurnSpeed=1.0;
        if (walkTurnSpeed<1.0) walkTurnSpeed=1.0;
        
            // set in entity
            
        entity.movementForwardMaxSpeed=speed;
        entity.movementForwardAcceleration=acceleration;
        entity.movementForwardDeceleration=deceleration;
        entity.standTurnSpeed=standTurnSpeed;
        entity.walkTurnSpeed=walkTurnSpeed;
        
            // wake up distances
            
        fireSlopAngle=genRandom.randomFloat(this.MONSTER_MIN_FIRE_SLOP_ANGLE,this.MONSTER_RANDOM_EXTRA_FIRE_SLOP_ANGLE);
         
        if (!isBoss) {
            entity.farWakeDistance=genRandom.randomInt(this.MONSTER_MIN_FAR_WAKE_DISTANCE,this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE);
            entity.nearWakeDistance=Math.trunc(entity.farWakeDistance*(genRandom.random()*0.7));
            entity.farWakeHalfAngleFieldOfVision=fireSlopAngle*2.0;       // notice player with twice field of vision as firing
            entity.sleepDistance=entity.farWakeDistance*2;
        }
        else {
            entity.farWakeDistance=genRandom.randomInt(this.MONSTER_MIN_FAR_WAKE_DISTANCE,this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE);
            entity.nearWakeDistance=Math.trunc(entity.farWakeDistance*(genRandom.random()*0.7));
            entity.farWakeHalfAngleFieldOfVision=fireSlopAngle*2.0;       // notice player with twice field of vision as firing
            entity.sleepDistance=-1;              // boss never sleeps
        }
        
            // sound buffers
            
        entity.wakeSoundBuffer=genSound.generate(genSound.TYPE_MONSTER_WAKE,false);
        entity.hurtSoundBuffer=genSound.generate(genSound.TYPE_MONSTER_HURT,false);
        entity.dieSoundBuffer=genSound.generate(genSound.TYPE_MONSTER_DIE,false);
        
            // projectile
            
        if (canFire) {
            genProjectile=new GenProjectileClass(this.view,this.map,this.sound);
            entity.projectile=genProjectile.generate(name,false);
       
            entity.fireRechargeTick=genRandom.randomInt(this.MONSTER_MIN_FIRE_RECHARGE_TICK,this.MONSTER_RANDOM_EXTRA_FIRE_RECHARGE_TICK);
            entity.fireSlopAngle=fireSlopAngle;
            entity.fireMaxDistance=genRandom.randomInt(this.MONSTER_MIN_FIRE_MAX_DISTANCE,this.MONSTER_RANDOM_EXTRA_FIRE_MAX_DISTANCE);
        }
        
        return(entity);
    }
    
}
