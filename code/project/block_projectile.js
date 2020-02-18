import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockProjectileClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.lifeTimestamp=0;
        this.speed=0;
        this.stopOnHit=true;
        this.canBounce=false;
        this.canReflect=false;
        this.canRoll=false;
        this.bounceSound=null;
        this.reflectSound=null;
        this.hitEffect=null;
        
        this.rolling=false;
        this.stopped=false;
        this.bouncePause=0;
        
            // pre-allocations

        this.motion=new PointClass(0,0,0);
        this.savePoint=new PointClass(0,0,0);
        this.drawPosition=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
    }
    
    initialize(entity)
    {
        this.lifeTimestamp=this.core.timestamp+this.core.game.lookupValue(this.block.lifeTick,entity.data);
        this.speed=this.core.game.lookupValue(this.block.speed,entity.data);
        
        this.stopOnHit=this.core.game.lookupValue(this.block.stopOnHit,entity.data);
        this.canBounce=this.core.game.lookupValue(this.block.canBounce,entity.data);
        this.canReflect=this.core.game.lookupValue(this.block.canReflect,entity.data);
        this.canRoll=this.core.game.lookupValue(this.block.canRoll,entity.data);
        
        this.bounceSound=this.block.bounceSound;
        this.reflectSound=this.block.reflectSound;

        this.hitEffect=this.core.game.lookupValue(this.block.hitEffect,entity.data);
        
        return(true);
    }
    
    ready(entity)
    {
        this.rolling=false;
        this.stopped=false;
        this.bouncePause=0;
        
        this.motion.setFromValues(0,0,this.speed);
        this.motion.rotate(entity.angle);
    }
    
    finish(entity)
    {
        let parentEntity;
        
            // remove it
            
        entity.markDelete=true;
        
            // find the final parent
            // so any damage is attributed to them
            
        parentEntity=entity;
        while (parentEntity.heldBy!==null) {
            parentEntity=parentEntity.heldBy;
        }
        
            // any effect
            
        if (this.hitEffect!=='') this.addEffect(parentEntity,this.hitEffect,entity.position,null,true);
    }
    
    run(entity)
    {
        let len;
        
            // are we over our life time
 
        if (this.lifeTimestamp<this.core.timestamp) {
            this.finish(entity);
            return;
        }
        
            // rolling slows down grenade
            
        if ((this.rolling) && (!this.stopped)) {
            this.motion.x*=this.DECELERATION_FACTOR;
            this.motion.z*=this.DECELERATION_FACTOR;
            
            if ((Math.abs(this.motion.x)+Math.abs(this.motion.z))<this.STOP_SPEED) {
                this.motion.x=0;
                this.motion.z=0;
                this.stopped=true;
            }
        }
        
            // move grenade
            
        this.savePoint.setFromPoint(entity.position);
        
        if (!this.stopped) entity.moveInMapXZ(this.motion,false,false);
        entity.moveInMapY(this.motion,false);
       
            // hitting floor
            // we can either start rolling, stop, or finish

        if ((entity.standOnMeshIdx!==-1) && (!this.rolling)) {
            if (this.stopOnHit) {
                this.finish(entity);
                return;
            }
            
            if (!this.stopped) this.core.soundList.playJson(entity,null,this.bounceSound);
            
            entity.position.setFromPoint(this.savePoint);
            if (this.canBounce) this.motion.y=this.floorHitBounceY(this.motion.y,this.BOUNCE_FACTOR,this.BOUNCE_CUT);
            
            if (this.motion.y===0) {
                if (this.canRoll) {
                    this.rolling=true;
                }
                else {
                    this.stopped=true;
                    if (this.stopOnHit) {
                        this.finish(entity);
                        return;
                    }
                }
            }
            else {
                this.motion.y=entity.moveInMapY(this.motion,false);
            }
            
            return;
        }
        
            // hitting ceiling
            
        if (entity.collideCeilingMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish(entity);
                return;
            }
            
            this.core.soundList.playJson(entity,null,this.bounceSound);

            entity.position.setFromPoint(this.savePoint);
            this.motion.y=0;
        }

            // hitting wall

        if ((entity.collideWallMeshIdx!==-1) && (this.bouncePause===0)) {
            if (this.stopOnHit) {
                this.finish(entity);
                return;
            }
            
            this.core.soundList.playJson(entity,null,this.reflectSound);
            
            entity.position.setFromPoint(this.savePoint);
            
            if (this.canReflect) {
                len=this.motion.length();
                console.log('before='+this.motion.x+','+this.motion.y+','+this.motion.z);
                this.motion.normalize();
                entity.wallHitAngleReflect(this.motion);
                console.log('after 1='+this.motion.x+','+this.motion.y+','+this.motion.z);
                this.motion.scale(len);
                console.log('after 2='+this.motion.x+','+this.motion.y+','+this.motion.z);
            
                //this.motion.setFromValues(0,0,);
                //this.motion.rotate(entity.angle);
            
                this.bouncePause=this.BOUNCE_PAUSE_COUNT;
            }
            else {
                this.motion.setFromValues(0,0,0);
            }
            return;
        }
        
        if (this.bouncePause!==0) this.bouncePause--;
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        entity.modelEntityAlter.angle.setFromPoint(entity.angle);
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
    
    /*
     *     initialize()
    {
        super.initialize();
        
        this.LIFE_TICK=3000;
        this.SPEED=450;
        this.BOUNCE_FACTOR=0.95;
        this.BOUNCE_CUT=50;
        this.DECELERATION_FACTOR=0.95;
        this.STOP_SPEED=10;
        this.BOUNCE_PAUSE_COUNT=5;
        this.DAMAGE=100;
        this.DAMAGE_DISTANCE=20000;
        this.SHAKE_DISTANCE=30000;
        this.SHAKE_MAX_SHIFT=40;
        this.SHAKE_TICK=2000;
        
            // setup
            
        this.startTick=this.getTimestamp();
            
        this.radius=500;
        this.height=500;
        
        this.gravityMinValue=10;
        this.gravityMaxValue=320;
        this.gravityAcceleration=15;
            
        this.motion=new PointClass(0,0,0);      // some pre-allocates
        this.savePoint=new PointClass(0,0,0);
        this.drawPosition=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
        
            // setup motion
            
        this.show=true;
        this.rolling=false;
        this.stopped=false;
        this.bouncePause=0;
            
        this.motion.setFromValues(0,0,this.SPEED);
        this.motion.rotate(this.angle);
        
            // the model
            
        this.setModel('grenade');
        this.scale.setFromValues(100,100,100);
        
        return(true);
    }
    
        //
        // run
        //
    
    
    run()
    {
            // time for grenade to end?
            
        if (this.getTimestamp()>(this.startTick+this.LIFE_TICK)) {
            this.explode();
            return;
        }
        
            // rolling slows down grenade
            
        if ((this.rolling) && (!this.stopped)) {
            this.motion.x*=this.DECELERATION_FACTOR;
            this.motion.z*=this.DECELERATION_FACTOR;
            
            if ((Math.abs(this.motion.x)+Math.abs(this.motion.z))<this.STOP_SPEED) {
                this.motion.x=0;
                this.motion.z=0;
                this.stopped=true;
            }
        }
        
            // move grenade
            
        this.savePoint.setFromPoint(this.position);
        
        if (!this.stopped) this.moveInMapXZ(this.motion,false,false);
        this.moveInMapY(this.motion,false);
       
            // hitting floor

        if ((this.standOnMeshIdx!==-1) && (!this.rolling)) {
            this.playSound('grenade_bounce',1.0,false);
            
            this.position.setFromPoint(this.savePoint);
            this.motion.y=this.floorHitBounceY(this.motion.y,this.BOUNCE_FACTOR,this.BOUNCE_CUT);
            
            if (this.motion.y===0) {
                this.rolling=true;
            }
            else {
                this.motion.y=this.moveInMapY(this.motion,false);
            }
            
            return;
        }

            // hitting wall

        if ((this.collideWallMeshIdx!==-1) && (this.bouncePause===0)) {
            this.playSound('grenade_bounce',1.0,false);
            
            this.position.setFromPoint(this.savePoint);
            this.angle.y=this.wallHitAngleReflect();
            
            this.motion.setFromValues(0,0,this.motion.length());
            this.motion.rotate(this.angle);
            
            this.bouncePause=this.BOUNCE_PAUSE_COUNT;
            return;
        }
        
        if (this.bouncePause!==0) this.bouncePause--;
    }
    
    drawSetup()
    {
            // spinning

        if (!this.stopped) {
            if (!this.rolling) {
                this.drawAngle.x=this.getPeriodicLinear(4000,360);
            }
            else {
                if (this.drawAngle.x!==90) {
                    if (this.drawAngle.x>90) {
                        this.drawAngle.x-=2;
                        if (this.drawAngle.x<90) this.drawAngle.x=90;
                    }
                    else {
                        this.drawAngle.x+=2;
                        if (this.drawAngle.x>90) this.drawAngle.x=90;
                    }
                }
                this.drawAngle.z=this.getPeriodicLinear(4000,360);
            }
            
            this.drawAngle.y=this.getPeriodicLinear(3000,360);
        }
        
            // model is centered on Y so it needs
            // to be moved up to draw (when need to rotate from
            // center to roll)
                
        this.drawPosition.setFromPoint(this.position);
        this.drawPosition.y+=300;
        
        this.setModelDrawPosition(this.drawPosition,this.drawAngle,this.scale,false);
        return(true);
    }

     */
}

