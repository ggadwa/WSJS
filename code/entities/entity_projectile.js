//
// entity projectile object
//

export default class EntityProjectileClass extends EntityClass
{
    constructor(name,parentEntityId,position,angle,projectile)
    {
        super(name,position,angle,0,projectile.model);
        
            // remember who shot this
            
        this.parentEntityId=parentEntityId;
        
            // entity setup
            
        this.movementForwardMaxSpeed=projectile.speed;
        this.movementForwardAcceleration=projectile.speed;
        this.movementForwardDeceleration=0;
        
        this.movement.y=projectile.lob;
        
            // local variables
            
        this.projectile=projectile;
        this.startTimeStamp=view.timeStamp;
        
        Object.seal(this);
    }
    
        //
        // damage overrides
        // projectiles can't take damage, they just get destroyed
        // if they hit each other
        //
    
    addDamage(hitEntityId,damage)
    {
        this.markAsDelete();
    }
    
        //
        // projectile bounce and reflect
        //
        
    bounce()
    {
        this.restorePosition();
        if (!this.movementBounce(this.projectile.bounceFactor)) {
            this.movementForwardMaxSpeed=0;         // if we can't bounce, then stop
        }
    }
    
    reflect()
    {
        this.restorePosition();
        this.movementReflect();
    }
    
        //
        // projectile hits
        //
        
    hit()
    {
            // delete entity
            
        this.markAsDelete();
        
            // explosion and sound
            
        particleList.addExplosionParticles(this.position);
        sound.play(this,this.projectile.hitSoundBuffer);
        
            // handle any damage
        
        if (this.touchEntity!==null) this.touchEntity.addDamage(this.parentEntityId,this.projectile.damage);
    }
    
        //
        // run projectile
        //
    
    run()
    {
            // cancel any projectile that lasts over lifetime
            
        if ((this.startTimeStamp+this.projectile.lifeTick)<view.timeStamp) {
            this.markAsDelete();
            return;
        }
        
            // move it
        
        this.setMovementForward(true);
        this.backupPosition();
        this.move(false,false,this.projectile.noGravity,false);
        
            // check collisions
        
        if (this.isAnyCollision()) {
            
                // skip any collisions with parentEntity

            if (this.touchEntity!==null) {
                if (this.touchEntity.id===this.parentEntityId) return;
            }
            
                // bouncing
                
            if (this.projectile.bounce) {
                if (this.standOnMeshIdx!==-1) {
                    this.bounce();
                    return;
                }
            }
            
                // reflecting
                
            if (this.projectile.reflect) {
                if (this.collideWallMeshIdx!==-1) {
                    this.reflect();
                    return;
                }
            }
            
                // anything else a hit
                
            this.hit();
            return;
        }
    }
    
    
}
