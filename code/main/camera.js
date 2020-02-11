/**
 * @module CameraClass
 * @ignore
*/

import PointClass from '../utility/point.js';
import CollisionClass from '../collision/collisions.js';

/**
 * The camera class for the project, returned from
 * ProjectEntityClass.getCamera(), ProjectGameClass.getCamera(),
 * and ProjectMapClass.getCamera().  You use this to change the
 * camera setup in your project.
 * 
 * @hideconstructor
 */
export default class CameraClass
{
    constructor(core)
    {
        this.CAMERA_MODE_FIRST_PERSON=0;
        this.CAMERA_MODE_THIRD_PERSON_BEHIND=1;
        
        this.CAMERA_MODE_LIST=['firstPerson','thirdPersonBehind'];
        
        this.core=core;
    
        this.mode=this.CAMERA_MODE_FIRST_PERSON;
    
        this.glFOV=55.0;
        this.glNearZ=500;
        this.glFarZ=500000;
        this.decalZ=10;            // how far to push the Z for decal meshes

        this.thirdPersonDistance=0;
        this.thirdPersonLookDegree=0;
    
        this.position=new PointClass(0.0,0.0,0.0);
        this.angle=new PointClass(0.0,0.0,0.0);
        
        this.thirdPersonAngle=new PointClass(0,0,0);
        
        this.collision=new CollisionClass(core);
        this.rayAngle=new PointClass(0,0,0);
        this.rayVector=new PointClass(0,0,0);
        this.rayHitPosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    /**
     * Set the min/max view distance (really the webGL near and far Z.)
     * 
     * @param {number} nearZ The distance of the near clip plane
     * @param {number} farZ The distance of the far clip plane
     */ 
    setViewDistance(nearZ,farZ)
    {
        this.glNearZ=nearZ;
        this.glFarZ=farZ;
    }
    
    /**
     * Sets the camera to first person view.
     */
    gotoFirstPerson()
    {
        this.mode=this.CAMERA_MODE_FIRST_PERSON;
    }
    
    /**
     * Returns TRUE if camera is in first person view.
     * 
     * @returns {boolean} TRUE if camera in first person view
     */
    isFirstPerson()
    {
        return(this.mode===this.CAMERA_MODE_FIRST_PERSON);
    }
    
    /**
     * Sets the camera to third person behind view, which is behind
     * the player back a distance and looked down/up on by an angle.
     * 
     * @param {number} thirdPersonDistance How far back the camera is
     * @param {number} thirdPersonLookDegree What angle above (negative) or below (postive) the camera is
     */
    gotoThirdPersonBehind(thirdPersonDistance,thirdPersonLookDegree)
    {
        this.mode=this.CAMERA_MODE_THIRD_PERSON_BEHIND;
        this.thirdPersonDistance=thirdPersonDistance;
        this.thirdPersonLookDegree=thirdPersonLookDegree;
    }
    
    /**
     * Returns TRUE if camera is in third person behind view.
     * 
     * @returns {boolean} TRUE if camera in third person behind view
     */
    isThirdPersonBehind()
    {
        return(this.mode===this.CAMERA_MODE_THIRD_PERSON_BEHIND);
    }
    
        //
        // setup the camera for this frame
        //
        
    setup(entity)
    {
        let dist,yAng;
        
            // third person cameras behind camera
            
        if (this.mode===this.CAMERA_MODE_THIRD_PERSON_BEHIND) {
            
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
