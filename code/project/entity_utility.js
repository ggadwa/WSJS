import PointClass from '../utility/point.js';

export default class EntityUtilityClass
{
    constructor(core,entity)
    {
        this.core=core;
        this.entity=entity;
        
            // pre-allocates
            
        this.firePoint=new PointClass(0,0,0);
        this.fireVector=new PointClass(0,0,0);
        this.fireHitPoint=new PointClass(0,0,0);
    }

        //
        // weapon type utilities
        //
        
    hitScan(fromEntity,maxDistance,hitFilter,damage,hitEffectName)
    {
            // the hit scan, firing point is the eye
            // and we rotate with the look and then turn
            
        this.firePoint.setFromPoint(fromEntity.position);
        this.firePoint.y+=fromEntity.eyeOffset;
        
        this.fireVector.setFromValues(0,0,maxDistance);
        this.fireVector.rotateX(null,fromEntity.angle.x);
        this.fireVector.rotateY(null,fromEntity.angle.y);
        
        if (fromEntity.rayCollision(this.firePoint,this.fireVector,this.fireHitPoint,hitFilter,null)) {
            
                // is this an entity we can hit?
                
            if (fromEntity.hitEntity) {
                if (fromEntity.hitEntity.damage!==undefined) {
                    fromEntity.hitEntity.damage(fromEntity,damage,this.fireHitPoint);
                }
            }
            
                // hit effect
                // push effect point towards entity firing so it shows up better

            if (hitEffectName!==null) {
                this.fireVector.normalize();
                this.fireVector.scale(-100);
                this.fireHitPoint.addPoint(this.fireVector);
                this.core.map.effectList.add(hitEffectName,this.fireHitPoint,null,true);
            }
        }

    }
}
