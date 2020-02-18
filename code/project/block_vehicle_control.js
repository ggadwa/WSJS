import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';

export default class BlockVehicleControlClass
{
    constructor(core,block)
    {
        this.core=core;
        this.block=block;
    }
    
    initialize(entity)
    {
        return(true);
    }
    
    release(entity)
    {
    }
    
    ready(entity)
    {
    }
    
    run(entity)
    {
        let x,y,turnAdd,lookAdd,fire;
        let forward,reverse,drifting,brake,jump;
        let rate,textLap;
        let setup=this.getSetup();
        
            // keys
            
        forward=this.isKeyDown('w');
        reverse=this.isKeyDown('s');
        drifting=(this.isKeyDown('a')||this.isKeyDown('d'));
        brake=this.isKeyDown('q');
        jump=this.isKeyDown(' ');
        
            // turning
            
        turnAdd=0;

        x=this.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
        }
        
            // looking (mostly for debug flying)
        
        if (this.debugPlayerFly) {    
            y=this.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.MOUSE_MAX_LOOK_SPEED) lookAdd=this.MOUSE_MAX_LOOK_SPEED*Math.sign(lookAdd);

                this.angle.x+=lookAdd;
                if (this.angle.x<-this.MAX_LOOK_ANGLE) this.angle.x=-this.MAX_LOOK_ANGLE;
                if (this.angle.x>=this.MAX_LOOK_ANGLE) this.angle.x=this.MAX_LOOK_ANGLE;
            }
        }
        else {
            this.angle.x=0;
        }
        
            // run the kart
        
        fire=this.isMouseButtonDown(0);  
        this.moveKart(turnAdd,forward,reverse,drifting,brake,fire,jump,true);
        
            // update the sound
        
        rate=this.MIN_ENGINE_SOUND_RATE+(((Math.abs(this.movement.z)/this.forwardMaxSpeed)*this.ADD_ENGINE_SOUND_RATE)+this.engineSoundRateAirIncrease);
        if (this.isStandingOnFloor()) {
            if (this.engineSoundRateAirIncrease>=0) {
                this.engineSoundRateAirIncrease-=0.01;
                if (this.engineSoundRateAirIncrease<0) this.engineSoundRateAirIncrease=0;
            }
        }
        else {
            if (this.engineSoundRateAirIncrease<=this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE) {
                this.engineSoundRateAirIncrease+=0.01;
                if (this.engineSoundRateAirIncrease>this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE) this.engineSoundRateAirIncrease=this.ADD_ENGINE_SOUND_AIR_RATE_INCREASE;
            }
        }
        
        this.changeSoundRate(this.engineSoundPlayIdx,rate);
    }
    
    drawSetup(entity)
    {
        let speed;
        let timestamp=this.getTimestamp();
        
            // physics are guarenteed to be run 60fps, but
            // drawing could be slower so only do the rigid body stuff here
        
            // create the rigid body goto angle
            // the regular angle is slowly transformed to reflect this
            
        if (!this.isStandingOnFloor()) {
            this.rigidGotoAngle.x=0;
            this.rigidGotoAngle.z=0;
        }
        else {
            this.getRigidBodyAngle(this.rigidAngle,this.MAX_RIGID_DROP,this.MAX_RIGID_ANGLE);

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
        
        this.angle.turnXTowards(this.rigidGotoAngle.x,speed);
        this.angle.turnZTowards(this.rigidGotoAngle.z,speed);
        
            // the drawing angle
            
        this.drawAngle.setFromPoint(this.angle);
        if (this.spinOutCount!==0) this.drawAngle.y+=this.spinOutCount;
            
            // and finally just call the regular draw position
            // stuff
            
        this.setModelDrawPosition(this.position,this.drawAngle,this.scale,false);
        return(true);
    }
}

