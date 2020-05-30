import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityProjectileClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.lifeTimestamp=0;
        this.speed=0;
        this.hitDamage=0;
        
        this.floats=false;
        this.followsFloor=false;
        this.spinY=false;
        this.spinRate=0;
        this.tumbles=false;
        this.stopOnHit=true;
        this.canBounce=false;
        this.canReflect=false;
        this.canRoll=false;
        this.rollDeceleration=0;
        this.bounceFactor=0;
        this.bounceSound=null;
        this.reflectSound=null;
        this.spawnSound=null;
        
        this.hitEffect=null;
        
        this.trailEffect=null;
        this.trailSpawnTick=null;
        
        this.rolling=false;
        this.stopped=false;
        
            // pre-allocations

        this.motion=new PointClass(0,0,0);
        this.savePoint=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,0,0);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.lifeTimestamp=this.core.timestamp+this.core.game.lookupValue(this.json.config.lifeTick,this.data,0);
        this.speed=this.core.game.lookupValue(this.json.config.speed,this.data,0);
        this.hitDamage=this.core.game.lookupValue(this.json.config.damage,this.data,0);
        
        this.floats=this.core.game.lookupValue(this.json.config.floats,this.data,false);
        this.followsFloor=this.core.game.lookupValue(this.json.config.followsFloor,this.data,false);
        this.spinY=this.core.game.lookupValue(this.json.config.spinY,this.data,false);
        this.spinRate=this.core.game.lookupValue(this.json.config.spinRate,this.data,0);
        this.tumbles=this.core.game.lookupValue(this.json.config.tumbles,this.data,false);
        this.stopOnHit=this.core.game.lookupValue(this.json.config.stopOnHit,this.data,false);
        this.canBounce=this.core.game.lookupValue(this.json.config.canBounce,this.data,false);
        this.canReflect=this.core.game.lookupValue(this.json.config.canReflect,this.data,false);
        this.canRoll=this.core.game.lookupValue(this.json.config.canRoll,this.data,false);
        this.rollDeceleration=this.core.game.lookupValue(this.json.config.rollDeceleration,this.data,0);
        this.bounceFactor=this.core.game.lookupValue(this.json.config.bounceFactor,this.data,0);
        
        this.bounceSound=this.core.game.lookupSoundValue(this.json.sounds.bounceSound);
        this.reflectSound=this.core.game.lookupSoundValue(this.json.sounds.reflectSound);
        this.spawnSound=this.core.game.lookupSoundValue(this.json.sounds.spawnSound);

        this.hitEffect=this.core.game.lookupValue(this.json.config.hitEffect,this.data,null);
        
        this.trailEffect=this.core.game.lookupValue(this.json.config.trailEffect,this.data,null);
        this.trailSpawnTick=this.core.game.lookupValue(this.json.config.trailSpawnTick,this.data,0);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.rolling=false;
        this.stopped=false;
        
        this.motion.setFromValues(0,0,this.speed);
        this.motion.rotate(this.angle);
        
        if (this.spawnSound!==null) this.core.soundList.playJson(this.position,this.spawnSound);
        
        this.nextTrailTick=this.core.timestamp;
    }
    
    finish()
    {
        let parentEntity;
        
            // remove it
            
        this.markDelete=true;
        
            // find the final parent
            // so any damage is attributed to them
            
        parentEntity=this;
        if (this.spawnedBy!==null) parentEntity=this.spawnedBy;
        
        while (parentEntity.heldBy!==null) {
            parentEntity=parentEntity.heldBy;
        }
        
            // contact damage
            
        if (this.touchEntity!==null) {
            if (this.hitDamage!==0) this.touchEntity.damage(parentEntity,this.hitDamage,this.position);
        }
        
            // any effect
            
        if (this.hitEffect!==null) this.addEffect(parentEntity,this.hitEffect,this.position,null,true);
    }
        
    run()
    {
        super.run();
        
            // are we over our life time
 
        if (this.lifeTimestamp<this.core.timestamp) {
            this.finish();
            return;
        }
        
            // trails

        if (this.trailEffect!==null) {
            if (this.core.timestamp>=this.nextTrailTick) {
                this.nextTrailTick+=this.trailSpawnTick;

                this.addEffect(this,this.trailEffect,this.position,null,true);
            }
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
            
        this.savePoint.setFromPoint(this.position);
        
        if (!this.stopped) this.moveInMapXZ(this.motion,false,false);
        this.moveInMapY(this.motion,1.0,this.floats);
       
            // hitting floor
            // we can either start rolling, stop, or finish

        if ((this.standOnMeshIdx!==-1) && (!this.rolling) && (!this.followsFloor)) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            if ((!this.stopped) && (this.bounceSound!==null)) this.core.soundList.playJson(this.position,this.bounceSound);
            
            this.position.setFromPoint(this.savePoint);
            if (this.canBounce) this.floorBounce(this.motion);
            
            if (this.motion.y===0) {
                if (this.canRoll) {
                    this.rolling=true;
                }
                else {
                    this.stopped=true;
                    if (this.stopOnHit) {
                        this.finish();
                        return;
                    }
                }
            }
            
            return;
        }
        
            // hitting ceiling
            
        if (this.collideCeilingMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            this.core.soundList.playJson(this.position,this.bounceSound);

            this.position.setFromPoint(this.savePoint);
            this.motion.y=0;
        }

            // hitting wall

        if (this.collideWallMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            this.core.soundList.playJson(this.position,this.reflectSound);
            
            this.position.setFromPoint(this.savePoint);
            
            if (this.canReflect) {
                this.wallReflect(this.motion);
            }
            else {
                this.motion.setFromValues(0,0,0);
            }
            return;
        }
        
            // touching object
            
        if (this.touchEntity!==null) {
            if ((this.touchEntity.pickup) || (this.touchEntity.passThrough)) return;
            
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            if (!this.stopped) {
                this.core.soundList.playJson(this.position,this.reflectSound);

                this.position.setFromPoint(this.savePoint);
                this.motion.x=0;
                this.motion.z=0;
                
                this.stopped=true;
            }

            return;
        }
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        if (this.tumbles) {
            
                // tumble spin

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

            this.modelEntityAlter.position.setFromPoint(this.position);
            this.modelEntityAlter.position.y+=Math.trunc(this.height*0.5);
            
            this.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        }
        else {
            this.modelEntityAlter.position.setFromPoint(this.position);
            if (this.spins) {
                this.modelEntityAlter.angle.setFromValues(this.angle.x,this.core.getPeriodicLinear(this.spinRate,360),this.angle.z);
            }
            else {
                this.modelEntityAlter.angle.setFromPoint(this.angle);
            }
        }
        
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

