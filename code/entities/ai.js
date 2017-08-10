//
// AI class
//

export default class AIClass
{
    constructor()
    {
        this.speed=0;
        this.acceleration=0;
        this.deceleration=0;
        
        this.standTurnSpeed=0;
        this.walkTurnSpeed=0;
        
        this.nearWakeDistance=0;
        this.farWakeDistance=0;
        this.farWakeHalfAngleFieldOfVision=0;
        this.sleepDistance=0;
        
        this.projectile=null;
        
        this.fireRechargeTick=0;
        this.fireSlopAngle=0;
        this.fireMaxDistance=0;
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
    
    setWakeSleepDistance(nearWakeDistance,farWakeDistance,farWakeHalfAngleFieldOfVision,sleepDistance)
    {
        this.nearWakeDistance=nearWakeDistance;
        this.farWakeDistance=farWakeDistance;
        this.farWakeHalfAngleFieldOfVision=farWakeHalfAngleFieldOfVision;
        this.sleepDistance=sleepDistance;
    }
    
    setProjectile(projectile)
    {
        this.projectile=projectile;
    }
    
    setProjectileFire(fireRechargeTick,fireSlopAngle,fireMaxDistance)
    {
        this.fireRechargeTick=fireRechargeTick;
        this.fireSlopAngle=fireSlopAngle;
        this.fireMaxDistance=fireMaxDistance;
    }
    
    setSoundBuffers(wakeSoundBuffer,hurtSoundBuffer,dieSoundBuffer)
    {
        this.wakeSoundBuffer=wakeSoundBuffer;
        this.hurtSoundBuffer=hurtSoundBuffer;
        this.dieSoundBuffer=dieSoundBuffer;
    }
}
