import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockVehicleClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.MAX_RIGID_DROP=3000;
        this.MAX_RIGID_ANGLE=25;
        this.RIGID_TRANSFORM_SPEED_PER_TICK=0.025;

        this.rigidGotoAngle=new PointClass(0,0,0);
        this.lastDrawTick=0;
        
        this.spinOutCount=0;
        
        
    }
        
    initialize(entity)
    {
        return(true);
    }
    
    ready(entity)
    {
        this.spinOutCount=0;
        this.lastDrawTick=this.core.timestamp;
        this.rigidGotoAngle.setFromValues(0,0,0);

    }
    
    run(entity)
    {
    }
    
    drawSetup(entity)
    {
        let speed;
        let timestamp=this.core.timestamp;

        if (entity.model===null) return(false);
        
            // physics are guarenteed to be run 60fps, but
            // drawing could be slower so only do the rigid body stuff here
        
            // create the rigid body goto angle
            // the regular angle is slowly transformed to reflect this
            
        if (!entity.isStandingOnFloor()) {
            this.rigidGotoAngle.x=0;
            this.rigidGotoAngle.z=0;
        }
        else {
            entity.getRigidBodyAngle(this.rigidAngle,this.MAX_RIGID_DROP,this.MAX_RIGID_ANGLE);

                // go towards the larger angle of the X/Z
                // and then reduce the other angle in half
            
            if (Math.abs(this.rigidAngle.x)>Math.abs(this.rigidAngle.z)) {
                this.rigidGotoAngle.x=this.rigidAngle.x;
                this.rigidGotoAngle.z*=0.5;
            }
            else {
                this.rigidGotoAngle.x*=0.5;
                this.rigidGotoAngle.z=this.rigidAngle.z;
            }
        }
        
            // transform the rigid body into the
            // actual draw angles, depending on how
            // much time has passed
            
        speed=this.RIGID_TRANSFORM_SPEED_PER_TICK*(timestamp-this.lastDrawTick);
        this.lastDrawTick=timestamp;
        
        entity.angle.turnXTowards(this.rigidGotoAngle.x,speed);
        entity.angle.turnZTowards(this.rigidGotoAngle.z,speed);
        
            // the drawing angle
            
        entity.modelEntityAlter.angle.setFromPoint(entity.angle);
        if (this.spinOutCount!==0) entity.modelEntityAlter.angle.y+=this.spinOutCount;
            
            // and finally just call the regular draw position
            // stuff
            
        entity.modelEntityAlter.position.setFromPoint(entity.position);
        
        entity.modelEntityAlter.scale.setFromPoint(entity.scale);
        entity.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

