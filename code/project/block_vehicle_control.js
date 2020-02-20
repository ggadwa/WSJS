import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockVehicleControlClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
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
        /*
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
             * 
         */
    }
}

