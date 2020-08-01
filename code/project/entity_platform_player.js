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
        
        this.platformCameraDistance=0;
        this.platformCameraYUpMoveFactor=1;
        this.platformCameraYDownMoveFactor=1;
        this.platformCameraJumpPause=false;
        
        this.idleAnimation=null;
        this.walkAnimation=null;
        this.runAnimation=null;
        this.jumpAnimation=null;
        this.fallAnimation=null;
        this.hurtAnimation=null;
        this.shovedAnimation=null;
        this.dieAnimation=null;
        
            // variables
            
        this.currentCameraY=0;
        this.inJumpCameraPause=false;
        
        this.shoveSpeed=0;
        this.shoveFadeFactor=0;

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
        
        this.platformCameraDistance=this.core.game.lookupValue(this.json.config.platformCameraDistance,this.data,0);
        this.platformCameraYUpMoveFactor=this.core.game.lookupValue(this.json.config.platformCameraYUpMoveFactor,this.data,1);
        this.platformCameraYDownMoveFactor=this.core.game.lookupValue(this.json.config.platformCameraYDownMoveFactor,this.data,1);
        this.platformCameraJumpPause=this.core.game.lookupValue(this.json.config.platformCameraJumpPause,this.data,false);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.walkAnimation=this.core.game.lookupAnimationValue(this.json.animations.walkAnimation);
        this.runAnimation=this.core.game.lookupAnimationValue(this.json.animations.runAnimation);
        this.jumpAnimation=this.core.game.lookupAnimationValue(this.json.animations.jumpAnimation);
        this.fallAnimation=this.core.game.lookupAnimationValue(this.json.animations.fallAnimation);
        this.hurtAnimation=this.core.game.lookupAnimationValue(this.json.animations.hurtAnimation);
        this.shovedAnimation=this.core.game.lookupAnimationValue(this.json.animations.shovedAnimation);
        this.dieAnimation=this.core.game.lookupAnimationValue(this.json.animations.dieAnimation);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.movement.setFromValues(0,0,0);
        this.drawAngle.setFromValues(0,0,0);
        
        this.currentCameraY=this.position.y;
        this.inJumpCameraPause=false;
        
        this.shoveSpeed=0;
        this.shoveFadeFactor=0;
        
        this.core.camera.gotoPlatform(this.platformCameraDistance,this.platformCameraYUpMoveFactor,this.platformCameraYDownMoveFactor);
        
        this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
    }
    
    shove(shoveSpeed,shoveFadeFactor)
    {
        this.shoveSpeed=shoveSpeed;
        this.shoveFadeFactor=shoveFadeFactor;
    }
        
    run()
    {
        let speed,fallY,cameraDiff;
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
        
            // movement
            
        moveKeyDown=false;
            
        if (this.shoveSpeed!==0) {
            this.movement.x=this.shoveSpeed;
            this.shoveSpeed*=this.shoveFadeFactor;
            if (Math.abs(this.shoveSpeed)<(this.walkSpeed*0.1)) this.shoveSpeed=0;
        }
        else {
            this.movement.x=0;

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
        }
        
            // if no movement and not falling/jumping face foward
            
        if ((this.movement.y===0) && (!moveKeyDown)) {
            this.drawAngle.turnYTowards(0,this.turnSpeed);
        }
        
            // jumping
            
        if (this.jumpHeight!==0) {
            if ((input.isKeyDown(' ')) && ((this.standOnMeshIdx!==-1) || (this.standOnEntity!==null))) {
                this.movement.y=this.jumpHeight;
                this.inJumpCameraPause=this.platformCameraJumpPause;
                this.modelEntityAlter.startAnimationChunkInFrames(this.jumpAnimation);
            }
        }
        
            // falling and bouncing
            
        fallY=this.gravity-this.core.map.gravityMinValue;
        if (fallY>0) {
            if (this.standOnEntity!==null) {
                if (this.standOnEntity.stompable) this.standOnEntity.die();
                this.inJumpCameraPause=this.platformCameraJumpPause;
                if (this.standOnEntity.stompBounceHeight!==0) this.movement.y=this.standOnEntity.stompBounceHeight;
            }
        }
        
            // run the movement
            
        this.movement.y=this.moveInMapY(this.movement,1.0,false);
        this.moveInMapXZ(this.movement,false,false);
        
            // animation changes
            
        if (this.shoveSpeed!==0) {
            this.modelEntityAlter.continueAnimationChunkInFrames(this.shovedAnimation);
        }
        else {
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
        
            // the camera Y has a slop, if you are standing
            // on something it always moves towards the player,
            // but if you are jumping it pauses until another
            // ground comes up or if it's falling past the original ground
            // this makes it easier to make run-and-stomp type games
            
        cameraDiff=this.currentCameraY-this.position.y;
        
        if (this.inJumpCameraPause) {
            if (this.standOnMeshIdx!==-1) this.inJumpCameraPause=false;
        }
        
        if (cameraDiff<0) {
            if (!this.inJumpCameraPause) {
                this.currentCameraY-=(cameraDiff*this.platformCameraYUpMoveFactor);
                if (this.currentCameraY>this.position.y) this.currentCameraY=this.position.y;
            }
        }
        else {
            this.currentCameraY-=(cameraDiff*this.platformCameraYDownMoveFactor);
            if (this.currentCameraY<this.position.y) this.currentCameraY=this.position.y;
        }

        this.core.camera.setPlatformYOffset(this.currentCameraY-this.position.y);
        
        
        let cube=this.core.map.cubeList.findCubeContainingEntity(this);
        if (cube!==null) console.info(cube.name);
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

