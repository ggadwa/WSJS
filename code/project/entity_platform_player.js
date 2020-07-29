import PointClass from '../utility/point.js';
import EntityClass from '../project/entity.js';

export default class EntityPlatformPlayerClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.walkSpeed=0;
        this.runSpeed=0;
        this.turnSpeed=0;
        this.jumpHeight=0;
        
        this.stompable=false;
        this.stompBounceFactor=0;
        
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;
        
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.runAnimation=null;
        this.jumpAnimation=null;
        this.fallAnimation=null;
        this.hurtAnimation=null;
        this.dieAnimation=null;
        
            // variables
            

            // pre-allocates
            
        this.movement=new PointClass(0,0,0);
        this.drawAngle=new PointClass(0,90,0);      // requires a second draw angle because the camera has the angle on it
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.walkSpeed=this.core.game.lookupValue(this.json.config.walkSpeed,this.data,150);
        this.runSpeed=this.core.game.lookupValue(this.json.config.runSpeed,this.data,200);
        this.turnSpeed=this.core.game.lookupValue(this.json.config.turnSpeed,this.data,20);
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,0);
        
        this.stompable=this.core.game.lookupValue(this.json.config.stompable,this.data,false);
        this.stompBounceFactor=this.core.game.lookupValue(this.json.config.stompBounceFactor,this.data,0);
        
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        this.runAnimation=this.core.game.lookupAnimationValue(this.json.animations.runAnimation);
        this.jumpAnimation=this.core.game.lookupAnimationValue(this.json.animations.jumpAnimation);
        this.fallAnimation=this.core.game.lookupAnimationValue(this.json.animations.fallAnimation);
        this.hurtAnimation=this.core.game.lookupAnimationValue(this.json.animations.hurtAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.animations.dieAnimation);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.movement.setFromValues(0,0,0);
        this.drawAngle.setFromValues(0,0,0);
        
        this.core.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraLookAngle);
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
    }
        
    run()
    {
        let speed,fallY;
        let moveKeyDown,runKeyDown;
        let input=this.core.input;
        
        super.run();
        
            // movement keys
            
        speed=this.walkSpeed;
        runKeyDown=false;
        
        if (this.runSpeed!==0) {
            if (input.isKeyDown('Shift')) {
                runKeyDown=true;
                speed=this.runSpeed;
            }
        }
        
        this.movement.x=0;
        moveKeyDown=false;
        
        if (input.isKeyDown('d')) {
            moveKeyDown=true;
            if (this.drawAngle.turnYTowards(90,this.turnSpeed)===0) this.movement.x=speed;
        }
        else {
            if (input.isKeyDown('a')) {
                moveKeyDown=true;
                if (this.drawAngle.turnYTowards(270,this.turnSpeed)===0) this.movement.x=-speed;
            }
        }
        
            // if no movement and not falling/jumping face foward
            
        if ((this.movement.y===0) && (!moveKeyDown)) {
            this.drawAngle.turnYTowards(0,this.turnSpeed);
        }
        
            // jumping
            
        if (this.jumpHeight!==0) {
            if ((input.isKeyDown(' ')) && ((this.standOnMeshIdx!==-1) || (this.standOnEntity!==null))) {
                this.movement.y=this.jumpHeight;
                this.modelEntityAlter.startAnimationChunkInFrames(this.jumpAnimation);
            }
        }
        
            // falling and bouncing
            
        fallY=this.gravity-this.core.map.gravityMinValue;
        if (fallY>0) {
            if (this.standOnEntity!==null) {
                if (this.standOnEntity.stompable) this.standOnEntity.die();
                this.movement.y+=(fallY*this.standOnEntity.stompBounceFactor);
            }
        }
        
            // run the movement
            
        this.movement.y=this.moveInMapY(this.movement,1.0,false);
        this.moveInMapXZ(this.movement,false,false);
        
            // animation changes
            
        if ((this.movement.y<=0) && (this.standOnMeshIdx===-1)) {
            this.modelEntityAlter.continueAnimationChunkInFrames(this.fallAnimation);
        }
        else {
            if (this.movement.y<=0) {
                if (moveKeyDown) {
                    this.modelEntityAlter.continueAnimationChunkInFrames(runKeyDown?this.runAnimation:this.walkAnimation);
                }
                else {
                    this.modelEntityAlter.continueAnimationChunkInFrames(this.idleAnimation);
                }
            }
        }
    }

    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.drawAngle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

