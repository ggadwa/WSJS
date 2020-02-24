import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityProjectileClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.lifeTimestamp=0;
        this.speed=0;
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
        this.hitEffect=null;
        
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
        
        this.lifeTimestamp=this.core.timestamp+this.core.game.lookupValue(this.json.config.lifeTick,this.data);
        this.speed=this.core.game.lookupValue(this.json.config.speed,this.data);
        this.spinY=this.core.game.lookupValue(this.json.config.spinY,this.data);
        this.spinRate=this.core.game.lookupValue(this.json.config.spinRate,this.data);
        this.tumbles=this.core.game.lookupValue(this.json.config.tumbles,this.data);
        this.stopOnHit=this.core.game.lookupValue(this.json.config.stopOnHit,this.data);
        this.canBounce=this.core.game.lookupValue(this.json.config.canBounce,this.data);
        this.canReflect=this.core.game.lookupValue(this.json.config.canReflect,this.data);
        this.canRoll=this.core.game.lookupValue(this.json.config.canRoll,this.data);
        this.rollDeceleration=this.core.game.lookupValue(this.json.config.rollDeceleration,this.data);
        this.bounceFactor=this.core.game.lookupValue(this.json.config.bounceFactor,this.data);
        this.bounceSound=this.json.config.bounceSound;
        this.reflectSound=this.json.config.reflectSound;

        this.hitEffect=this.core.game.lookupValue(this.json.config.hitEffect,this.data);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.rolling=false;
        this.stopped=false;
        
        this.motion.setFromValues(0,0,this.speed);
        this.motion.rotate(this.angle);
    }
    
    finish()
    {
        let parentEntity;
        
            // remove it
            
        this.markDelete=true;
        
            // find the final parent
            // so any damage is attributed to them
            
        parentEntity=this;
        while (parentEntity.heldBy!==null) {
            parentEntity=parentEntity.heldBy;
        }
        
            // any effect
            
        if (this.hitEffect!=='') this.addEffect(parentEntity,this.hitEffect,this.position,null,true);
    }
        
    run()
    {
        super.run();
        
            // are we over our life time
 
        if (this.lifeTimestamp<this.core.timestamp) {
            this.finish();
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
            
        this.savePoint.setFromPoint(this.position);
        
        if (!this.stopped) this.moveInMapXZ(this.motion,false,false);
        this.moveInMapY(this.motion,false);
       
            // hitting floor
            // we can either start rolling, stop, or finish

        if ((this.standOnMeshIdx!==-1) && (!this.rolling)) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            if (!this.stopped) this.core.soundList.playJson(this,null,this.bounceSound);
            
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
            else {
                this.motion.y=this.moveInMapY(this.motion,false);
            }
            
            return;
        }
        
            // hitting ceiling
            
        if (this.collideCeilingMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            this.core.soundList.playJson(this,null,this.bounceSound);

            this.position.setFromPoint(this.savePoint);
            this.motion.y=0;
        }

            // hitting wall

        if (this.collideWallMeshIdx!==-1) {
            if (this.stopOnHit) {
                this.finish();
                return;
            }
            
            this.core.soundList.playJson(this,null,this.reflectSound);
            
            this.position.setFromPoint(this.savePoint);
            
            if (this.canReflect) {
                this.wallReflect(this.motion);
            }
            else {
                this.motion.setFromValues(0,0,0);
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

