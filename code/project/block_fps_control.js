import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import BlockClass from '../project/block.js';

export default class BlockFPSControlClass extends BlockClass
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
        
        this.lastWheelClick=0;
        
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
        this.liquidInSound=this.block.liquidInSound;
        this.liquidOutSound=this.block.liquidOutSound;
        this.flySwimYReduce=this.core.game.lookupValue(this.block.flySwimYReduce,entity.data);
        
        this.lastInLiquid=false;
        this.lastUnderLiquid=false;
        
        this.lastWheelClick=0;
        
            // variables that all block need to access
            
        entity.firePrimary=false;
        entity.fireSecondary=false;
        entity.fireTertiary=false;
        
        entity.weaponNext=false;
        entity.weaponPrevious=false;
        entity.weaponSwitchNumber=-1;
            
        entity.developerPlayerFly=false;
        entity.developerPlayerNoClip=false;

        return(true);
    }
    
    ready(entity)
    {
    }
    
    run(entity)
    {
        let n,x,y;
        let moveForward,moveBackward,moveLeft,moveRight;
        let liquidIdx,bump;
        let turnAdd,lookAdd;
        let mouseWheelClick;
        let input=this.core.input;
        let setup=this.core.setup;
        
            // weapon switching
            
        mouseWheelClick=this.core.input.mouseWheelRead();
        
        entity.weaponPrevious=((mouseWheelClick<0) && (this.lastWheelClick===0));
        entity.weaponNext=((mouseWheelClick>0) && (this.lastWheelClick===0));
        
        this.lastWheelClick=mouseWheelClick;
        
        entity.weaponSwitchNumber=-1;
        
        for (n=0;n!==9;n++) {
            if (this.core.input.isKeyDown(String.fromCharCode(49+n))) {
                entity.weaponSwitchNumber=n;
                break;
            }
        }
        
            // weapon firing
            
        entity.firePrimary=this.core.input.mouseButtonFlags[0]||this.core.input.isTouchStickRightClick();    
        entity.fireSecondary=this.core.input.mouseButtonFlags[1];
        entity.fireTertiary=this.core.input.mouseButtonFlags[2];
        
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
            if ((!this.lastInLiquid) && (this.liquidInSound!==null)) this.core.soundList.playJson(entity,null,this.liquidInSound);
            this.lastInLiquid=true;
        }
        else {
            if ((this.lastInLiquid) && (this.liquidOutSound!==null)) this.core.soundList.playJson(entity,null,this.liquidOutSound);
            this.lastInLiquid=false;
        }
        
            // jumping
           
        if (input.isKeyDown(' ')) {
            if ((entity.standOnMeshIdx!==-1) && (liquidIdx===-1) && (!entity.developerPlayerFly)) {
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
        if ((entity.developerPlayerFly) || (this.lastUnderLiquid)) {
            this.rotMovement.y=0;       // only Y movement comes from X angle rotation
            this.rotMovement.rotateX(null,entity.angle.x);     // if flying or swimming, add in the X rotation
            this.rotMovement.y*=this.flySwimYReduce;
        }
        this.rotMovement.rotateY(null,entity.angle.y);

            // if no clipping is on then
            // just move directly through map
            
        if (entity.developerPlayerNoClip) {
            entity.position.addPoint(this.rotMovement);
        }

            // move around the map
        
        else {
            entity.movement.y=entity.moveInMapY(this.rotMovement,entity.developerPlayerFly);
            entity.moveInMapXZ(this.rotMovement,bump,true);
        }
    }
}

