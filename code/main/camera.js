import PointClass from '../utility/point.js';
import CollisionClass from '../collision/collisions.js';

export default class CameraClass
{
    constructor(core)
    {
        this.CAMERA_MODE_FIRST_PERSON=0;
        this.CAMERA_MODE_THIRD_PERSON=1;
        this.CAMERA_MODE_TOP_DOWN=2;
        this.CAMERA_MODE_PLATFORM=3;
        
        this.core=core;
    
        this.mode=this.CAMERA_MODE_FIRST_PERSON;
    
        this.glFOV=55.0;
        this.glNearZ=500;
        this.glFarZ=500000;

        this.thirdPersonDistance=0;
        this.thirdPersonLookAngle=null;
        
        this.topDownDistance=0;
        
        this.platformDistance=0;
        this.platformYOffset=0;
    
        this.position=new PointClass(0,0,0);
        this.angle=new PointClass(0,0,0);
        
        this.thirdPersonAngle=new PointClass(0,0,0);
        
        this.collision=new CollisionClass(core);
        this.rayVector=new PointClass(0,0,0);
        this.rayHitPosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // camera setup
        //
    
    setViewDistance(nearZ,farZ)
    {
        this.glNearZ=nearZ;
        this.glFarZ=farZ;
    }
    
    gotoFirstPerson()
    {
        this.mode=this.CAMERA_MODE_FIRST_PERSON;
    }
    
    isFirstPerson()
    {
        return(this.mode===this.CAMERA_MODE_FIRST_PERSON);
    }
    
    gotoThirdPerson(thirdPersonDistance,thirdPersonLookAngle)
    {
        this.mode=this.CAMERA_MODE_THIRD_PERSON;
        this.thirdPersonDistance=thirdPersonDistance;
        this.thirdPersonLookAngle=thirdPersonLookAngle;
    }
    
    isThirdPerson()
    {
        return(this.mode===this.CAMERA_MODE_THIRD_PERSON);
    }
    
    gotoTopDown(topDownDistance)
    {
        this.mode=this.CAMERA_MODE_TOP_DOWN;
        this.topDownDistance=topDownDistance;
    }
    
    isTopDown()
    {
        return(this.mode===this.CAMERA_MODE_TOP_DOWN);
    }
    
    gotoPlatform(platformDistance)
    {
        this.mode=this.CAMERA_MODE_PLATFORM;
        this.platformDistance=platformDistance;
        this.platformYOffset=0;
    }
    
    isPlatform()
    {
        return(this.mode===this.CAMERA_MODE_PLATFORM);
    }
    
    setPlatformYOffset(y)
    {
        this.platformYOffset=y;
    }
    
        //
        // setup the camera for this frame
        //
        
    setup(entity)
    {
        let dist,yAng;
        
            // third person camera
            
        if (this.mode===this.CAMERA_MODE_THIRD_PERSON) {
            
                // start at the eye point
                
            this.position.setFromPoint(entity.position);
            this.position.y+=entity.eyeOffset;

                // get the ray to trace
                
            yAng=entity.angle.y+this.thirdPersonLookAngle.y;
            if (yAng>360) yAng-=360;
            if (yAng<0) yAng=360+yAng;
            
            this.rayVector.setFromValues(0,0,this.thirdPersonDistance);
            this.rayVector.rotateX(null,this.thirdPersonLookAngle.x);
            this.rayVector.rotateZ(null,this.thirdPersonLookAngle.z);
            this.rayVector.rotateY(null,yAng);

                // if we hit something, than the distance to
                // put the camera is 10% of the distance back
                // from the hit point
                
            if (this.collision.rayCollisionCamera(entity,this.position,this.rayVector,false,this.rayHitPosition)) {
                dist=this.position.distance(this.rayHitPosition)-Math.trunc(this.thirdPersonDistance*0.1);
            }
            else {
                dist=this.thirdPersonDistance;
            }

                // get the final camera point

            this.rayVector.setFromValues(0,0,dist);
            this.rayVector.rotateX(null,this.thirdPersonLookAngle.x);
            this.rayVector.rotateZ(null,this.thirdPersonLookAngle.z);
            this.rayVector.rotateY(null,yAng);
            this.position.addPoint(this.rayVector);
            
                // look back at entity
                
            yAng+=180;
            if (yAng>360) yAng-=360;
            
            this.angle.setFromValues(-this.thirdPersonLookAngle.x,yAng,0);
            
            return;
        }
        
            // top down
            
        if (this.mode===this.CAMERA_MODE_TOP_DOWN) {
            
                // start at the eye point
                
            this.position.setFromPoint(entity.position);
            this.position.y+=entity.eyeOffset;

                // get the ray to trace
                
            this.rayVector.setFromValues(0,this.topDownDistance,0);
 
                // if we hit something, than the distance to
                // put the camera is 10% of the distance back
                // from the hit point
                
            if (this.collision.rayCollisionCamera(entity,this.position,this.rayVector,true,this.rayHitPosition)) {
                dist=this.position.distance(this.rayHitPosition)-Math.trunc(this.topDownDistance*0.1);
            }
            else {
                dist=this.topDownDistance;
            }

                // get the final camera point

            this.rayVector.setFromValues(0,dist,0);
            this.position.addPoint(this.rayVector);

                // and finally look down at entity
                
            this.angle.setFromValues(89,0,0);
            
            return;
        }
        
            // platform
            
        if (this.mode===this.CAMERA_MODE_PLATFORM) {
            
                // the eye point is always distance down the Z
                
            this.position.setFromPoint(entity.position);
            this.position.y+=(entity.eyeOffset+this.platformYOffset);
            this.position.z+=this.platformDistance;
            
                // look back at entity
                
            this.angle.setFromValues(0,180,0);
            
            return;
        }            
        
            // anything else defaults to first person
            
        this.position.setFromPoint(entity.position);
        this.position.y+=entity.eyeOffset;
        this.angle.setFromPoint(entity.angle);
    }
    
    setupDeveloper()
    {
        this.position.setFromPoint(this.core.game.developer.position);
        this.angle.setFromPoint(this.core.game.developer.angle);
    }
}
