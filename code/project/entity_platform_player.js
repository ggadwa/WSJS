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
        
        this.thirdPersonCameraDistance=0;
        this.thirdPersonCameraLookAngle=null;
        
        this.idleAnimation=null;
        this.walkAnimation=null;
        
            // variables
            
        this.inIdle=true;


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
        this.jumpHeight=this.core.game.lookupValue(this.json.config.jumpHeight,this.data,600);
        
        this.thirdPersonCameraDistance=this.core.game.lookupValue(this.json.config.thirdPersonCameraDistance,this.data,0);
        this.thirdPersonCameraLookAngle=new PointClass(this.json.config.thirdPersonCameraLookAngle.x,this.json.config.thirdPersonCameraLookAngle.y,this.json.config.thirdPersonCameraLookAngle.z);
        
        this.idleAnimation=this.json.animations.idleAnimation;
        this.walkAnimation=this.json.animations.walkAnimation;
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        this.movement.setFromValues(0,0,0);
        this.drawAngle.setFromValues(0,90,0);
        
        this.core.camera.gotoThirdPerson(this.thirdPersonCameraDistance,this.thirdPersonCameraLookAngle);
        
        this.inIdle=true;
        this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
    }
        
    run()
    {
        let speed,moveKeyDown;
        let input=this.core.input;
        
        super.run();
        
            // movement keys
            
        speed=this.walkSpeed;
        if ((this.runSpeed!==0) && (input.isKeyDown('Shift'))) speed=this.runSpeed;
            
        this.movement.x=0;
        moveKeyDown=false;
        
        if (input.isKeyDown('d')) {
            moveKeyDown=true;
            if (this.drawAngle.y>90) {
                this.drawAngle.y-=this.turnSpeed;
                if (this.drawAngle.y<90) this.drawAngle.y=90;
            }
            else {
                this.movement.x=speed;
            }
        }
        else {
            if (input.isKeyDown('a')) {
                moveKeyDown=true;
                if (this.drawAngle.y<270) {
                    this.drawAngle.y+=this.turnSpeed;
                    if (this.drawAngle.y>270) this.drawAngle.y=270;
                }
                else {
                    this.movement.x=-speed;
                }
            }
        }
        
            // jumping
            
        if (this.jumpHeight!==0) {
            if ((input.isKeyDown(' ')) && ((this.standOnMeshIdx!==-1) || (this.standOnEntity!==null))) {
                this.movement.y=this.jumpHeight;
            }
        }
        
            // run the movement
            
        this.movement.y=this.moveInMapY(this.movement,1.0,false);
        this.moveInMapXZ(this.movement,false,false);
        
            // animation changes
            
        if (moveKeyDown) {
            if (this.inIdle) {
                this.inIdle=false;
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.walkAnimation[0],this.walkAnimation[1]);
            }
        }
        else {
            if (!this.inIdle) {
                this.inIdle=true;
                this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
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

