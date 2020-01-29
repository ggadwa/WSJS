import PointClass from '../utility/point.js';
import CollisionClass from '../collision/collisions.js';

//
// camera class
//

export default class CameraClass
{
    static CAMERA_MODE_FIRST_PERSON=0;
    static CAMERA_MODE_THIRD_PERSON_BEHIND=1;
    
    mode=CameraClass.CAMERA_MODE_FIRST_PERSON;
    
    glFOV=55.0;
    glNearZ=500;
    glFarZ=500000;
    
    decalZ=10;            // how far to push the Z for decal meshes
    
    position=null;
    angle=null;
    
    thirdPersonDistance=0;
    thirdPersonLookDegree=0;
    
    collision=null;
    rayAngle=null;
    rayVector=null;
    rayHitPosition=null;
    
    constructor(core)
    {
        this.core=core;
        
        this.position=new PointClass(0.0,0.0,0.0);
        this.angle=new PointClass(0.0,0.0,0.0);
        
        this.thirdPersonAngle=new PointClass(0,0,0);
        
        this.collision=new CollisionClass(core);
        this.rayAngle=new PointClass(0,0,0);
        this.rayVector=new PointClass(0,0,0);
        this.rayHitPosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // camera changes
        //
        
    setViewDistance(nearZ,farZ)
    {
        this.glNearZ=nearZ;
        this.glFarZ=farZ;
    }
    
    gotoFirstPerson()
    {
        this.mode=CameraClass.CAMERA_MODE_FIRST_PERSON;
    }
    
    isFirstPerson()
    {
        return(this.mode===CameraClass.CAMERA_MODE_FIRST_PERSON);
    }
    
    gotoThirdPersonBehind(thirdPersonDistance,thirdPersonLookDegree)
    {
        this.mode=CameraClass.CAMERA_MODE_THIRD_PERSON_BEHIND;
        this.thirdPersonDistance=thirdPersonDistance;
        this.thirdPersonLookDegree=thirdPersonLookDegree;
    }
    
    isThirdPersonBehind()
    {
        return(this.mode===CameraClass.CAMERA_MODE_THIRD_PERSON_BEHIND);
    }
    
        //
        // setup the camera for this frame
        //
        
    setup(entity)
    {
        let dist,yAng;
        
            // third person cameras behind camera
            
        if (this.mode===CameraClass.CAMERA_MODE_THIRD_PERSON_BEHIND) {
            
                // start at the eye point
                
            this.position.setFromPoint(entity.position);
            this.position.y+=entity.eyeOffset;

                // get the ray to trace
                
            this.rayVector.setFromValues(0,0,this.thirdPersonDistance);
            
            yAng=entity.angle.y+180.0;
            if (yAng>=360) yAng=yAng-360;
            this.rayAngle.setFromValues(this.thirdPersonLookDegree,yAng,0);
            this.rayVector.rotate(this.rayAngle);

                // if we hit something, than the distance to
                // put the camera is 10% of the distance back
                // from the hit point
                
            if (this.collision.rayCollision(entity,this.position,this.rayVector,this.rayHitPosition,null,null)) {
                dist=this.position.distance(this.rayHitPosition)-Math.trunc(this.thirdPersonDistance*0.1);
            }
            else {
                dist=this.thirdPersonDistance;
            }

                // get the camera point and the
                // look back angle

            this.rayVector.setFromValues(0,0,dist);
            this.rayVector.rotate(this.rayAngle);
            this.position.addPoint(this.rayVector);

                // and finally look back at entity
                
            this.angle.setFromValues(0,this.position.angleYTo(entity.position),0);
            
            return;
        }
        
            // anything else defaults to first person
            
        this.position.setFromPoint(entity.position);
        this.position.y+=entity.eyeOffset;
        this.angle.setFromPoint(entity.angle);
    }
    
}
