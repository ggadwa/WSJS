import AIClass from '../../code/entities/ai.js';
import genRandom from '../../generate/utility/random.js';
import GenModelMonsterClass from '../../generate/model/gen_model_monster.js';
import GenProjectileClass from '../../generate/thing/gen_projectile.js';
import GenSoundClass from '../../generate/sound/gen_sound.js';

//
// generate projectile class
//

export default class GenAIClass
{
    constructor(view,map,sound)
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
        this.MONSTER_MIN_FIRE_MAX_DISTANCE=15000;
        this.MONSTER_RANDOM_EXTRA_FIRE_MAX_DISTANCE=15000;
        
        this.MONSTER_MIN_FAR_WAKE_DISTANCE=35000;
        this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE=20000;
        
        this.AI_TYPE_STALKING_MONSTER=0;
        this.AI_TYPE_BOSS=1;

        this.view=view;
        this.map=map;
        this.sound=sound;
        
        Object.seal(this);
    }

    generate(name,aiType)
    {
        let genSound,genProjectile;
        let speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed;
        let nearWakeDistance,farWakeDistance;
        let fireRechargeTick,fireSlopAngle,fixMaxDistance;
        let genModel=new GenModelMonsterClass(this.view);
        let ai=new AIClass();
        
            // the model
        
        switch (aiType) {
            case this.AI_TYPE_STALKING_MONSTER:
                ai.setModel(genModel.generate(name,1.0,false));
                break;
            case this.AI_TYPE_BOSS:
                ai.setModel(genModel.generate(name,genRandom.randomFloat(2.5,3.0),false));
                break;
        }
        
            // sound generator
            
        genSound=new GenSoundClass(this.sound.getAudioContext());
        
            // create the AI
       
        fireSlopAngle=genRandom.randomFloat(this.MONSTER_MIN_FIRE_SLOP_ANGLE,this.MONSTER_RANDOM_EXTRA_FIRE_SLOP_ANGLE);
        
        speed=genRandom.randomInt(this.MONSTER_MIN_SPEED,this.MONSTER_RANDOM_EXTRA_SPEED);
        acceleration=genRandom.randomFloat(this.MONSTER_MIN_ACCELERATION,this.MONSTER_RANDOM_EXTRA_ACCELERATION);
        deceleration=genRandom.randomFloat(this.MONSTER_MIN_DECLERATION,this.MONSTER_RANDOM_EXTRA_DECELERATION);
        standTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_STAND_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED);
        walkTurnSpeed=genRandom.randomFloat(this.MONSTER_MIN_WALK_TURN_SPEED,this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED);
        
        if (aiType===this.AI_TYPE_BOSS) {
            speed*=0.7;
            walkTurnSpeed*=0.7;
            if (walkTurnSpeed<1.0) walkTurnSpeed=1.0;
        }
        
        ai.setSpeed(speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed);
        
        farWakeDistance=genRandom.randomInt(this.MONSTER_MIN_FAR_WAKE_DISTANCE,this.MONSTER_RANDOM_EXTRA_FAR_WAKE_DISTANCE);
        nearWakeDistance=Math.trunc(farWakeDistance*(genRandom.random()*0.7));
        
        if (aiType===this.AI_TYPE_STALKING_MONSTER) {
            ai.setWakeSleepDistance(nearWakeDistance,farWakeDistance,(fireSlopAngle*2.0),(farWakeDistance*2));       // notice player with twice field of vision as firing
        }
        else {
            ai.setWakeSleepDistance(farWakeDistance,farWakeDistance,(fireSlopAngle*2.0),-1);        // boss never sleep
        }
        
        ai.setSoundBuffers(genSound.generate(genSound.TYPE_MONSTER_WAKE,false),genSound.generate(genSound.TYPE_MONSTER_HURT,false),genSound.generate(genSound.TYPE_MONSTER_DIE,false));
        
            // projectile
            
        if (genRandom.randomPercentage(this.MONSTER_FIRE_PERCENTAGE)) {
            genProjectile=new GenProjectileClass(this.view,this.map,this.sound);
            ai.setProjectile(genProjectile.generate(name,false));
            
            fireRechargeTick=genRandom.randomInt(this.MONSTER_MIN_FIRE_RECHARGE_TICK,this.MONSTER_RANDOM_EXTRA_FIRE_RECHARGE_TICK);
            fixMaxDistance=genRandom.randomInt(this.MONSTER_MIN_FIRE_MAX_DISTANCE,this.MONSTER_RANDOM_EXTRA_FIRE_MAX_DISTANCE);
            ai.setProjectileFire(fireRechargeTick,fireSlopAngle,fixMaxDistance);
        }
        
        return(ai);
    }
    
}
