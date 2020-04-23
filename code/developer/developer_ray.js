import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';

export default class DeveloperRayClass
{
    constructor(core)
    {
        this.core=core;
        
        this.LOOK_DISTANCE=20000;
        
            // pre-allocates
            
        this.lookPoint=new PointClass(0,0,0);
        this.lookVector=new PointClass(0,0,0);
        this.lookEndPoint=new PointClass(0,0,0);
        
        this.rayIntersectPnt=new PointClass(0,0,0);
        
        this.rayXBound=new BoundClass(0,0,0);
        this.rayYBound=new BoundClass(0,0,0);
        this.rayZBound=new BoundClass(0,0,0);
        
            // some developer bitmaps
            
        this.core.bitmapList.addSimple('../developer/sprites/target.png');
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        return(true);
    }
    
    release()
    {
    }
    
        //
        // ray collisions and selection
        //
        
    rayCollision(pnt,vector,hitPnt)
    {
        let n,k;
        let mesh;
        let collisionTrig,nCollisionTrig;              
        let dist,currentDist;
        
            // the rough collide boxes
            
        this.rayXBound.setFromValues(pnt.x,(pnt.x+vector.x));
        this.rayYBound.setFromValues(pnt.y,(pnt.y+vector.y));
        this.rayZBound.setFromValues(pnt.z,(pnt.z+vector.z));
        
            // no collisions yet

        currentDist=-1;

            // run through the meshes and
            // check against all trigs

        for (n of this.core.map.meshList.collisionMeshIndexList) {
            mesh=this.core.map.meshList.meshes[n];

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                // check the wall trigs

            nCollisionTrig=mesh.collisionWallTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionWallTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
            
                // check the floor trigs

            nCollisionTrig=mesh.collisionFloorTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionFloorTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
            
                // check the ceiling trigs

            nCollisionTrig=mesh.collisionCeilingTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionCeilingTrigs[k];
                if (!collisionTrig.overlapBounds(this.rayXBound,this.rayYBound,this.rayZBound)) continue;

                if (collisionTrig.rayTrace(pnt,vector,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
        }

            // check entities
/*            
        for (n=0;n!==nEntity;n++) {
            checkEntity=this.core.map.entityList.get(n);
            if (checkEntity===entity) continue;
            if (checkEntity===entity.heldBy) continue;         // skip source entity and anything holding source entity
            if ((!checkEntity.show) || (checkEntity.passThrough) || (checkEntity.heldBy!==null)) continue;
            
                // run the collision
                
            if (this.rayCylinderIntersection(pnt,vector,checkEntity.position,checkEntity.radius,checkEntity.height,this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    entity.hitEntity=checkEntity;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }
        */
            // any hits
            
        return(currentDist!==-1);
    }
    
        //
        // main run and draw
        //
        
    run(position,angle)
    {
        this.lookPoint.setFromPoint(position);
        
        this.lookVector.setFromValues(0,0,this.LOOK_DISTANCE);
        this.lookVector.rotateX(null,angle.x);
        this.lookVector.rotateY(null,angle.y);
        
        if (this.rayCollision(this.lookPoint,this.lookVector,this.lookEndPoint)) {
        }
        else {
            this.lookEndPoint.setFromAddPoint(this.lookPoint,this.lookVector);
        }
    }

    draw()
    {
        let bitmap;
        let gl=this.core.gl;
        
            // the target
            
        gl.disable(gl.DEPTH_TEST);
            
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        
        bitmap=this.core.bitmapList.get('../developer/sprites/target.png');
        this.core.game.developer.developerSprite.drawBillboardSprite(bitmap,this.lookEndPoint);
        
        gl.disable(gl.BLEND);
        
        gl.enable(gl.DEPTH_TEST);
    }
}
