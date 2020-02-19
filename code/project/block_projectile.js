import PointClass from '../utility/point.js';
import BlockClass from '../project/block.js';

export default class BlockProjectileClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.lifeTimestamp=0;
        this.speed=0;
        this.spins=false;
        this.stopOnHit=true;
        this.canBounce=false;
        this.canReflect=false;
        this.canRoll=false;
        this.rollDeceleration=0;
        this.bounceFactor=0;
        this.bounceSound=null;
        this.reflectSound=null;
        this.hitEffect=null;
        
        this.rolling=false;
        this.stopped=false;
        
            // pre-allocations

        this.motion=new PointClass(0,0,0);
        this.savePoint=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
    }
    
    initialize(entity)
    {
        this.lifeTimestamp=this.core.timestamp+this.core.game.lookupValue(this.block.lifeTick,entity.data);
        this.speed=this.core.game.lookupValue(this.block.speed,entity.data);
        this.spins=this.core.game.lookupValue(this.block.spins,entity.data);
        this.stopOnHit=this.core.game.lookupValue(this.block.stopOnHit,entity.data);
        this.canBounce=this.core.game.lookupValue(this.block.canBounce,entity.data);
        this.canReflect=this.core.game.lookupValue(this.block.canReflect,entity.data);
        this.canRoll=this.core.game.lookupValue(this.block.canRoll,entity.data);
        this.rollDeceleration=this.core.game.lookupValue(this.block.rollDeceleration,entity.data);
        this.bounceFactor=this.core.game.lookupValue(this.block.bounceFactor,entity.data);
        this.bounceSound=this.block.bounceSound;
        this.reflectSound=this.block.reflectSound;

        this.hitEffect=this.core.game.lookupValue(this.block.hitEffect,entity.data);
        
        return(true);
    }
    
    ready(entity)
    {
        this.rolling=false;
        this.stopped=false;
        
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
    
    floorBounce(entity)
    {
        this.motion.y=-((this.motion.y+entity.gravity)*this.bounceFactor);
        entity.gravity=this.core.map.gravityMinValue;
        
        if (Math.abs(this.motion.y)<entity.weight) this.motion.y=0;
    }
    
    wallReflect(entity)
    {
        let sn,cs,x,z,rang,normal;
        let collisionTrig;
        
            // get the normal
            
        collisionTrig=this.core.map.meshList.meshes[entity.collideWallMeshIdx].collisionWallTrigs[entity.collideWallTrigIdx];
        normal=collisionTrig.normal;
        
            // get the angle between the normal and
            // the reversed hit vector (so they both can start
            // at the same point)
            
        this.motion.x=-this.motion.x;
        this.motion.z=-this.motion.z;
            
        rang=Math.atan2(normal.z,normal.x)-Math.atan2(this.motion.z,this.motion.x);
        
            // now rotate double the angle from the normal
            // to get the reflection motion
            // note this is based on positive x/counter-clockwise
            // which is different from out regular rotations
        
        rang=-(rang*2.0);
        sn=Math.sin(rang);
        cs=Math.cos(rang);
        
        x=(this.motion.z*sn)+(this.motion.x*cs);   // this is based on the positive X, because atan2 is angle from positive x, counter-clockwise
        z=(this.motion.z*cs)-(this.motion.x*sn);
        
        this.motion.x=x;
        this.motion.z=z;
    }
    
    run(entity)
    {
            // are we over our life time
 
        if (this.lifeTimestamp<this.core.timestamp) {
            this.finish(entity);
            return;
        }
        
            // rolling slows down grenade
            
        if ((this.rolling) && (!this.stopped)) {
            this.motion.x*=this.rollDeceleration;
            this.motion.z*=this.rollDeceleration;
            
            if ((Math.abs(this.motion.x)+Math.abs(this.motion.z))<1) {
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
            if (this.canBounce) this.floorBounce(entity);
            
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

        if (entity.collideWallMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish(entity);
                return;
            }
            
            this.core.soundList.playJson(entity,null,this.reflectSound);
            
            entity.position.setFromPoint(this.savePoint);
            
            if (this.canReflect) {
                this.wallReflect(entity);
            }
            else {
                this.motion.setFromValues(0,0,0);
            }
            return;
        }
    }
    
    drawSetup(entity)
    {
        if (entity.model===null) return(false);
        
        if (this.spins) {

                // spinning

            if (!this.stopped) {
                if (!this.rolling) {
                    this.drawAngle.x=this.core.getPeriodicLinear(4000,360);
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
                    this.drawAngle.z=this.core.getPeriodicLinear(4000,360);
                }

                this.drawAngle.y=this.core.getPeriodicLinear(3000,360);
            }

                // model is centered on Y so it needs
                // to be moved up to draw (when need to rotate from
                // center to roll)

            entity.modelEntityAlter.position.setFromPoint(entity.position);
            entity.modelEntityAlter.position.y+=Math.trunc(entity.height*0.5);
            
            entity.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        }
        else {
            entity.modelEntityAlter.position.setFromPoint(entity.position);
            entity.modelEntityAlter.angle.setFromPoint(entity.angle);
        }
        
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

