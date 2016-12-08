/* global config */

"use strict";

//
// AI class
//

class AIClass
{
    constructor()
    {
        this.speed=config.MONSTER_MIN_SPEED;
        this.acceleration=5;
        this.deceleration=10;
        
        this.standTurnSpeed=0.2;
        this.walkTurnSpeed=0.4;
        
        this.projectile=null;
        
        this.fireRechargeTick=0;
        this.fireSlopAngle=0;
        this.lastFireTimeStamp=0;
        
        this.wakeSoundBuffer=null;
        this.hurtSoundBuffer=null;
        this.dieSoundBuffer=null;
        
        Object.seal(this);
    }
    
    setSpeed(speed,acceleration,deceleration,standTurnSpeed,walkTurnSpeed)
    {
        this.speed=speed;
        this.acceleration=acceleration;
        this.deceleration=deceleration;

        this.standTurnSpeed=standTurnSpeed;
        this.walkTurnSpeed=walkTurnSpeed;
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
    
    setSoundBuffers(wakeSoundBuffer,hurtSoundBuffer,dieSoundBuffer)
    {
        this.wakeSoundBuffer=wakeSoundBuffer;
        this.hurtSoundBuffer=hurtSoundBuffer;
        this.dieSoundBuffer=dieSoundBuffer;
    }
}
