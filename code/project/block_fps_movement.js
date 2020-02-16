import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockFPSMovementClass extends BlockClass
{
    constructor(core,block)
    {
        super(core,block);
        
        this.maxTurnSpeed=0;
        this.maxLookSpeed=0;
        this.maxLookAngle=0;
        this.orwardAcceleration=0;
        this.forwardDeceleration=0;
        this.forwardMaxSpeed=0;
        this.sideAcceleration=0;
        this.sideDeceleration=0;
        this.sideMaxSpeed=0;
        this.jumpHeight=0;
        this.jumpWaterHeight=0;
        this.splashSound=null;
        this.flySwimYReduce=0;
        
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.rotMovement=new PointClass(0,0,0);
    }
        
    initialize(entity)
    {
        this.maxTurnSpeed=this.core.game.lookupValue(this.block.maxTurnSpeed,entity.data);
        this.maxLookSpeed=this.core.game.lookupValue(this.block.maxLookSpeed,entity.data);
        this.maxLookAngle=this.core.game.lookupValue(this.block.maxLookAngle,entity.data);
        this.forwardAcceleration=this.core.game.lookupValue(this.block.forwardAcceleration,entity.data);
        this.forwardDeceleration=this.core.game.lookupValue(this.block.forwardDeceleration,entity.data);
        this.forwardMaxSpeed=this.core.game.lookupValue(this.block.forwardMaxSpeed,entity.data);
        this.sideAcceleration=this.core.game.lookupValue(this.block.sideAcceleration,entity.data);
        this.sideDeceleration=this.core.game.lookupValue(this.block.sideDeceleration,entity.data);
        this.sideMaxSpeed=this.core.game.lookupValue(this.block.sideMaxSpeed,entity.data);
        this.jumpHeight=this.core.game.lookupValue(this.block.jumpHeight,entity.data);
        this.jumpWaterHeight=this.core.game.lookupValue(this.block.jumpWaterHeight,entity.data);
        this.splashSound=this.core.game.lookupValue(this.block.splashSound,entity.data);
        this.flySwimYReduce=this.core.game.lookupValue(this.block.flySwimYReduce,entity.data);
        
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;

        return(true);
    }
    
    ready(entity)
    {
    }
    
    run(entity)
    {
        let x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquidIdx,bump;
        let turnAdd,lookAdd;
        let developerPlayerFly=entity.blockData.get('developerPlayerFly');
        let developerPlayerNoClip=entity.blockData.get('developerPlayerNoClip');
        let input=this.core.input;
        let setup=this.core.setup;
        
            // forward and shift controls
            
        moveForward=(input.isKeyDown('w')) || (input.isKeyDown('ArrowUp')) || (input.getTouchStickLeftY()<0);
        moveBackward=(input.isKeyDown('s')) || (input.isKeyDown('ArrowDown')) || (input.getTouchStickLeftY()>0);
        moveLeft=input.isKeyDown('a') || (input.getTouchStickLeftX()<0);
        moveRight=input.isKeyDown('d') || (input.getTouchStickLeftX()>0);
        
            // turning
            
        turnAdd=0;
            
        x=input.getMouseMoveX();
        if (x!==0) {
            turnAdd=-(x*setup.mouseXSensitivity);
            turnAdd+=(turnAdd*setup.mouseXAcceleration);
            if (setup.mouseXInvert) turnAdd=-turnAdd;
            if (Math.abs(turnAdd)>this.maxTurnSpeed) turnAdd=this.maxTurnSpeed*Math.sign(turnAdd);
        }
        
        turnAdd-=(input.getTouchStickRightX()*(setup.touchStickXSensitivity*20));
        
        if (turnAdd!==0) {
            entity.angle.y+=turnAdd;
            if (entity.angle.y<0.0) entity.angle.y+=360.0;
            if (entity.angle.y>=360.00) entity.angle.y-=360.0;
        }
        
            // looking
            
        lookAdd=0;
            
        if (this.core.camera.isFirstPerson()) {
            y=input.getMouseMoveY();
            if (y!==0) {
                lookAdd=y*setup.mouseYSensitivity;
                lookAdd+=(lookAdd*setup.mouseYAcceleration);
                if (setup.mouseYInvert) lookAdd=-lookAdd;
                if (Math.abs(lookAdd)>this.maxLookSpeed) lookAdd=this.maxLookSpeed*Math.sign(lookAdd);
            }

            lookAdd+=(input.getTouchStickRightY()*(setup.touchStickYSensitivity*20));

            if ((setup.snapLook) && (moveForward || moveBackward || moveLeft || moveRight)) {
                if (lookAdd===0) {
                    entity.angle.x=entity.angle.x*0.95;
                    if (Math.abs(entity.angle.x)<0.05) entity.angle.x=0;
                }
            }
        
            if (lookAdd!==0) {
                entity.angle.x+=lookAdd;
                if (entity.angle.x<-this.maxLookAngle) entity.angle.x=-this.maxLookAngle;
                if (entity.angle.x>=this.maxLookAngle) entity.angle.x=this.maxLookAngle;
            }
        }
        else {
            entity.angle.x=0;
        }
        
            // liquid changes
            
        liquidIdx=this.core.map.liquidList.getLiquidForEyePoint(entity.position,entity.eyeOffset);
        
        if (liquidIdx!==-1) {
            this.lastUnderLiquid=true;
        }
        else {
            if ((this.lastUnderLiquid) && (this.angle.x>0)) {
                this.gravity=0;
                this.movement.y-=this.jumpWaterHeight;
            }
            
            this.lastUnderLiquid=false;
        }
        
        liquidIdx=this.core.map.liquidList.getLiquidForPoint(entity.position);
        
        if (liquidIdx!==-1) {
            if ((!this.lastInLiquid) && (this.splashSound!==null)) this.core.soundList.play(entity,null,this.splashSound,1.0,false);
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.splashSound!==null)) this.core.soundList.play(entity,null,this.splashSound,0.8,false);
            this.lastInLiquid=false;
        }
        
            // jumping
           
        if (input.isKeyDown(' ')) {
            if ((entity.standOnMeshIdx!==-1) && (liquidIdx===-1) && (!developerPlayerFly)) {
                entity.gravity=this.core.map.gravityMinValue;
                entity.movement.y=this.jumpHeight;
            }
        }
        
            // can only bump if we aren't falling
            // as otherwise ledges can catch you and
            // bump you back up, the only exception is
            // swimming, which always bumps over small obstacles
            
        bump=(entity.standOnMeshIdx!==-1)||(this.lastUnderLiquid);
        
            // figure out the movement
         
        entity.movement.moveZWithAcceleration(moveForward,moveBackward,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed,this.forwardAcceleration,this.forwardDeceleration,this.forwardMaxSpeed);
        entity.movement.moveXWithAcceleration(moveLeft,moveRight,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed,this.sideAcceleration,this.sideDeceleration,this.sideMaxSpeed);
        
        this.rotMovement.setFromPoint(entity.movement);
        if ((developerPlayerFly) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,entity.angle.x);     // if flying or swimming, add in the X rotation
            this.rotMovement.y*=this.flySwimYReduce;
        }
        this.rotMovement.rotateY(null,entity.angle.y);

            // if no clipping is on then
            // just move directly through map
            
        if (developerPlayerNoClip) {
            entity.position.addPoint(this.rotMovement);
        }

            // move around the map
        
        else {
            entity.movement.y=entity.moveInMapY(this.rotMovement,developerPlayerFly);
            entity.moveInMapXZ(this.rotMovement,bump,true);
        }
    }
}

