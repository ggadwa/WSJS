import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import LineClass from '../utility/line.js';
import BoundClass from '../utility/bound.js';
import CollisionTrigClass from '../collision/collision_trig.js';

//
// collision class
//

export default class CollisionClass
{
    constructor(core)
    {
        this.core=core;
        
        this.spokeCenterPt=new PointClass(0,0,0);
        this.spokeCalcSin=new Float32Array(24);    // circular collision pre-calcs
        this.spokeCalcCos=new Float32Array(24);
        this.createSpokeSinCos();

        this.entityTestPnt=new PointClass(0,0,0);
        this.entityTestIntersectPnt=new PointClass(0,0,0);
        this.entityClosestIntersectPnt=new PointClass(0,0,0);
        this.entityRadiusPushPnt=new PointClass(0,0,0);
        
        this.rayHitPnt=new PointClass(0,0,0);
        this.rayIntersectPnt=new PointClass(0,0,0);
        this.rayPoints=[];
        this.createRayPoints();
        
        this.rayVector=new PointClass(0,0,0);
        
        this.tempCollisionTrig=new CollisionTrigClass(new PointClass(0,0,0),new PointClass(0,0,0),new PointClass(0,0,0));
        
        this.objXBound=new BoundClass(0,0);
        this.objYBound=new BoundClass(0,0);
        this.objZBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    createSpokeSinCos()
    {
        let n;
        let rad=0.0;
        let radAdd=(Math.PI*2.0)/24.0;
        
        for (n=0;n!==24;n++) {
            this.spokeCalcSin[n]=Math.sin(rad);
            this.spokeCalcCos[n]=Math.cos(rad);
            rad+=radAdd;
        }
    }
    
    createRayPoints()
    {
        let n;
        
        for (n=0;n!=25;n++) {
            this.rayPoints.push(new PointClass(0,0,0));
        }
    }
    
        //
        // collision utilities
        //
    
    circleTrigIntersection(collisionTrig,circlePnt,radius,high,lineIntersectPnt)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            
        let n,k,yAdd,segmentCount,dist;
        let currentDist=-1;
        
            // always directly out of the center, so
            // y is always 0
            
        this.rayVector.y=0;
        
            // we need to do the height in parts so we
            // hit things collisions up and down the cylinder
            
        segmentCount=(high<500)?1:Math.trunc(high/500);
        yAdd=Math.trunc(high/segmentCount);

            // now the spokes across the y
            
        this.spokeCenterPt.setFromValues(circlePnt.x,circlePnt.y,circlePnt.z);
            
        for (n=0;n!==segmentCount;n++) {
 
            for (k=0;k!==24;k++) {
                this.rayVector.x=this.spokeCenterPt.x+(radius*this.spokeCalcSin[k]);
                this.rayVector.z=this.spokeCenterPt.z-(radius*this.spokeCalcCos[k]);

                if (collisionTrig.rayTrace(this.spokeCenterPt,this.rayVector,this.rayHitPnt)) {
                    dist=this.spokeCenterPt.distance(this.rayHitPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        lineIntersectPnt.setFromPoint(this.rayHitPnt);
                        currentDist=dist;
                    }
                }
            }
            
            this.spokeCenterPt.y+=yAdd;
        }
        
        return(currentDist!==-1);
    }
    
    circleCircleIntersection(circlePnt1,radius1,circlePnt2,radius2,circleIntersectPnt)
    {
        let dist;
        let totalRadius=radius1+radius2;
        
            // get distance between center points
            // (x,z only, scrub out the Y)
            // if less than r1+r2 then it's a hit
            
        dist=circlePnt1.distanceScrubY(circlePnt2);
        if (dist>totalRadius) return(false);
        
            // hit point needs to be on the
            // radius of circle2
            
        circleIntersectPnt.setFromValues((circlePnt1.x-circlePnt2.x),0,(circlePnt1.z-circlePnt2.z));
        circleIntersectPnt.normalize();
        circleIntersectPnt.scale(radius2);
        circleIntersectPnt.addPoint(circlePnt2);
        
        return(true);
    }
    
    rayCylinderIntersection(rayPnt,rayVector,circlePnt,radius,high,intersectPnt)
    {
        let n,k,x1,z1,x2,z2;
        let dist,currentDist;
        let ty=circlePnt.y+high;
        
        currentDist=-1;
        
            // create a series of quads and ray trace
            // against their triangles
            
        for (n=0;n!==24;n++) {
            x1=circlePnt.x+(radius*this.spokeCalcSin[n]);
            z1=circlePnt.z-(radius*this.spokeCalcCos[n]);
            
            k=(n===23)?0:(n+1);
            x2=circlePnt.x+(radius*this.spokeCalcSin[k]);
            z2=circlePnt.z-(radius*this.spokeCalcCos[k]);
            
            this.tempCollisionTrig.resetFromValues(x1,circlePnt.y,z1,x1,ty,z1,x2,ty,z2);
            if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,this.rayHitPnt)) {
                dist=rayPnt.distance(this.rayHitPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    intersectPnt.setFromPoint(this.rayHitPnt);
                    currentDist=dist;
                }
                
                continue;           // if it hits one triangle, we are done with the quad
            }
            
            this.tempCollisionTrig.resetFromValues(x1,circlePnt.y,z1,x2,ty,z2,x2,circlePnt.y,z2);
            if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,this.rayHitPnt)) {
                dist=rayPnt.distance(this.rayHitPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    intersectPnt.setFromPoint(this.rayHitPnt);
                    currentDist=dist;
                }
            }
        }
        
        return(currentDist!==-1);
    }
    
        //
        // entity collisions
        //

    moveEntityInMap(entity,movePnt,bump,collideMovePnt)
    {
        let n,k;
        let mesh,checkEntity;
        let collisionTrig,nCollisionTrig;             
        let dist,currentDist;
        
        let nMesh=this.core.map.meshList.meshes.length;
        let nEntity=this.core.map.entityList.count();
        
            // only bump once
            
        let bumpOnce=false;
        let bumpY,entityTopY;
        
            // the moved point
            
        this.entityTestPnt.setFromValues((entity.position.x+movePnt.x),entity.position.y,(entity.position.z+movePnt.z));
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((this.entityTestPnt.x-entity.radius),(this.entityTestPnt.x+entity.radius));
        this.objYBound.setFromValues(this.entityTestPnt.y,(this.entityTestPnt.y+entity.height));
        this.objZBound.setFromValues((this.entityTestPnt.z-entity.radius),(this.entityTestPnt.z+entity.radius));
        
            // no collisions yet
            
        entity.collideWallMeshIdx=-1;
        entity.collideWallTrigIdx=-1;
        
            // we need to possible run through
            // this multiple times to deal with
            // bumps
          
        while (true) {
            currentDist=-1;
            bumpY=-1;
            
                // run through the meshes and
                // check against collision lines

            for (n=0;n!==nMesh;n++) {
                mesh=this.core.map.meshList.meshes[n];
                if (mesh.noCollisions) continue;
                
                    // skip any mesh we don't collide with
                    
                if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;
                
                    // check the collision wall trigs
                    
                nCollisionTrig=mesh.collisionWallTrigs.length;

                for (k=0;k!==nCollisionTrig;k++) {
                    collisionTrig=mesh.collisionWallTrigs[k];
                    if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;
                    
                        // check against wall trig
                    
                    if (!this.circleTrigIntersection(collisionTrig,this.entityTestPnt,entity.radius,entity.height,this.entityTestIntersectPnt)) continue;
                    
                        // find closest hit point

                    dist=this.entityTestPnt.distance(this.entityTestIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        entity.collideWallMeshIdx=n;
                        entity.collideWallTrigIdx=k;
                        this.entityClosestIntersectPnt.setFromPoint(this.entityTestIntersectPnt);
                        currentDist=dist;
                        
                        bumpY=-1;
                        if ((collisionTrig.yBound.max-this.entityTestPnt.y)<=constants.BUMP_HEIGHT) bumpY=collisionTrig.yBound.max;
                    }
                }
            }
            
                // check other entities

            for (n=0;n!==nEntity;n++) {
                checkEntity=this.core.map.entityList.get(n);
                if (checkEntity.id===entity.id) continue;
                if ((!checkEntity.show) || (checkEntity.heldBy!==null)) continue;
                
                    // skip if not in the Y of the line

                entityTopY=checkEntity.position.y+checkEntity.height;
                if (((this.entityTestPnt.y+entity.height)<checkEntity.position.y) || (this.entityTestPnt.y>=entityTopY)) continue;
                
                    // check the circle
                    
                if (!this.circleCircleIntersection(this.entityTestPnt,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) continue;
                
                    // find closest hit point

                dist=this.entityTestPnt.distance(this.entityTestIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    entity.collideWallMeshIdx=-1;
                    
                        // set the touch
                        
                    entity.touchEntity=checkEntity;
                    checkEntity.touchEntity=entity;
                    
                        // the hit point
                        
                    this.entityClosestIntersectPnt.setFromPoint(this.entityTestIntersectPnt);
                    currentDist=dist;
                    
                    bumpY=-1;
                    if ((entityTopY-this.entityTestPnt.y)<=constants.BUMP_HEIGHT) bumpY=entityTopY;
                }
            }

                // if no hits, just return
                // original move plus any bump
                // we might have had
                
            if (currentDist===-1) {
                collideMovePnt.setFromValues(movePnt.x,(this.entityTestPnt.y-entity.position.y),movePnt.z);
                return;
            }
            
                // if no bump or not a bumpable
                // hit or already bumped, just return hit
                
            if ((!bump) || (bumpY===-1) || (bumpOnce)) break;
                
                // do the bump, but only
                // once
                
            bumpOnce=true;
            this.entityTestPnt.y=bumpY;
        }
        
            // reverse the hit point and move it one
            // radius away so we are always outside the radius

        this.entityRadiusPushPnt.setFromPoint(movePnt);
        this.entityRadiusPushPnt.y=0;
        this.entityRadiusPushPnt.normalize();
        this.entityRadiusPushPnt.scale(-entity.radius);
        
        this.entityClosestIntersectPnt.addPoint(this.entityRadiusPushPnt);

            // and the new move is the original
            // point to this current hit point
            // always restore the bump move
        
        collideMovePnt.setFromValues((this.entityClosestIntersectPnt.x-entity.position.x),(this.entityTestPnt.y-entity.position.y),(this.entityClosestIntersectPnt.z-entity.position.z));
    }
    
        //
        // entity falling collisions
        //
    
    buildYCollisionRayPoints(entity,y)
    {
        let n,radius,x,z;
        
            // use spokes (around the radius) plus
            // an extra for the middle
        
        radius=entity.radius;
        
        x=entity.position.x;
        z=entity.position.z;
        
        for (n=0;n!==24;n++) {
            this.rayPoints[n].setFromValues((x+(radius*this.spokeCalcSin[n])),y,(z-(radius*this.spokeCalcCos[n])));
        }
        
        this.rayPoints[24].setFromValues(x,y,z);
    }
    
    fallEntityInMap(entity)
    {
        let n,k,i,y,nMesh,nCollisionTrig;
        let mesh,collisionTrig;

            // the rough collide boxes
            // floor_rise_height is the farthest
            // we can move up and down a floor segment
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y-constants.FLOOR_RISE_HEIGHT),(entity.position.y+constants.FLOOR_RISE_HEIGHT));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // build the ray trace points
            // from the bottom of the entity cylinder
            // plus the floor rise height (so we can move up)
            // and the vector moving down the Y (which is negative
            // as the Y is up)
            
        this.buildYCollisionRayPoints(entity,(entity.position.y+constants.FLOOR_RISE_HEIGHT));
        
        this.rayVector.x=0;
        this.rayVector.y=-(constants.FLOOR_RISE_HEIGHT*2);
        this.rayVector.z=0;
       
            // start with no hits
       
        entity.standOnMeshIdx=-1;
        y=entity.position.y-constants.FLOOR_RISE_HEIGHT;
        
            // run through colliding trigs
        
        nMesh=this.core.map.meshList.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.core.map.meshList.meshes[n];
            if (mesh.noCollisions) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide triangles
                // if we are within the fall, then
                // return the ground
                
                // first check by a rough, then run all
                // the rays to find the highest hit

            nCollisionTrig=mesh.collisionFloorTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionFloorTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    for (i=0;i!==25;i++) {
                        if (collisionTrig.rayTrace(this.rayPoints[i],this.rayVector,this.rayHitPnt)) {
                            if (this.rayHitPnt.y>=y) {
                                entity.standOnMeshIdx=n;
                                y=this.rayHitPnt.y;
                            }
                        }
                    }
                }
            }
        }
         
            // get how far we've fallen (negative, y is up)

        if (entity.standOnMeshIdx!==-1) return(y-entity.position.y);
        
            // if no collisions, return the
            // farthest part of the ray
        
        return(-constants.FLOOR_RISE_HEIGHT);
    }
    
        //
        // entity rising collisions
        //
        
    riseEntityInMap(entity,riseY)
    {
        let n,k,i,y,nMesh,nCollisionTrig;
        let mesh,collisionTrig;
        
            // the rough collide boxes
            // we check from the top of the entity past the rise
            // (to catch things moving into us or pushing past ceiling)
            // to the furtherest we are trying to rise
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y+entity.height),((entity.position.y+entity.height)+riseY));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // build the ray trace points
            // from the top of the entity cylinder
            // and the vector moving up the Y (which is positive
            // as the Y is up)
            
        this.buildYCollisionRayPoints(entity,(entity.position.y+entity.height));
            
        this.rayVector.x=0;
        this.rayVector.y=riseY;
        this.rayVector.z=0;
        
            // start with no hits
       
        entity.collideCeilingMeshIdx=-1;
        y=(entity.position.y+entity.height)+riseY;
        
            // run through the meshes
        
        nMesh=this.core.map.meshList.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.core.map.meshList.meshes[n];
            if (mesh.noCollisions) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide triangles
                // if we are within the rise, then
                // bound to the ceiling
                
                // first check by a rough, then run all
                // the rays to find the lowest hit

            nCollisionTrig=mesh.collisionCeilingTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionCeilingTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    for (i=0;i!==25;i++) {
                        if (collisionTrig.rayTrace(this.rayPoints[i],this.rayVector,this.rayHitPnt)) {
                            if (this.rayHitPnt.y<=y) {
                                entity.collideCeilingMeshIdx=n;
                                y=this.rayHitPnt.y;
                            }
                        }
                    }
                }
            }
        }
        
        if (entity.collideCeilingMeshIdx!==-1) return(y-(entity.position.y+entity.height));
        
            // if no collisions, return the riseY
        
        return(riseY);
    }
    
        //
        // ray collision
        // mostly for hit scans
        //
        
    rayCollision(pnt,vector,hitPnt,sourceEntity)
    {
        let n,k;
        let mesh,entity;
        let collisionTrig,nCollisionTrig;              
        let dist,currentDist;
        
        let nMesh=this.core.map.meshList.meshes.length;
        let nEntity=this.core.map.entityList.count();
        
            // the rough collide boxes
            
        this.objXBound.setFromValues(pnt.x,(pnt.x+vector.x));
        this.objYBound.setFromValues(pnt.y,(pnt.y+vector.y));
        this.objZBound.setFromValues(pnt.z,(pnt.z+vector.z));
        
            // no collisions yet

        currentDist=-1;

            // run through the meshes and
            // check against all trigs

        for (n=0;n!==nMesh;n++) {
            mesh=this.core.map.meshList.meshes[n];
            if (mesh.noCollisions) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the wall trigs

            nCollisionTrig=mesh.collisionWallTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionWallTrigs[k];
                if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;

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
                if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;

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
                if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;

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
            
        sourceEntity.hitEntity=null;

        for (n=0;n!==nEntity;n++) {
            entity=this.core.map.entityList.get(n);
            if (entity.id===sourceEntity.id) continue;
            if ((!entity.show) || (entity.heldBy!==null)) continue;
            
            if (this.rayCylinderIntersection(pnt,vector,entity.position,entity.radius,entity.height,this.rayIntersectPnt)) {
                dist=pnt.distance(this.rayIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    sourceEntity.hitEntity=entity;
                    hitPnt.setFromPoint(this.rayIntersectPnt);
                    currentDist=dist;
                }
            }
        }
        
            // any hits
            
        return(currentDist!==-1);
    }
    
}
