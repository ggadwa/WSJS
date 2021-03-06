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
        
        this.collisionSpokeCount=0;
        this.collisionHeightSegmentCount=0;
        this.collisionHeightMargin=0;
        
        this.spokeCenterPnt=new PointClass(0,0,0);
        this.spokeCalcSin=null;
        this.spokeCalcCos=null;

        this.entityTestPnt=new PointClass(0,0,0);
        this.entityTestIntersectPnt=new PointClass(0,0,0);
        
        this.rayHitPnt=new PointClass(0,0,0);
        this.rayIntersectPnt=new PointClass(0,0,0);
        this.rayPoints=null;
        
        this.rayVector=new PointClass(0,0,0);
        
        this.rigidPnt=[];
        this.rigidPnt.push(new PointClass(0,0,0));
        this.rigidPnt.push(new PointClass(0,0,0));
        this.rigidPnt.push(new PointClass(0,0,0));
        this.rigidPnt.push(new PointClass(0,0,0));      // 4 rigid points
        this.rigidVector=new PointClass(0,0,0);
        this.rigidHitPnt=new PointClass(0,0,0);
        
        this.tempCollisionTrig=new CollisionTrigClass(new PointClass(0,0,0),new PointClass(0,0,0),new PointClass(0,0,0));
        
        this.objXBound=new BoundClass(0,0);
        this.objYBound=new BoundClass(0,0);
        this.objZBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    initialize(entity)
    {
        let n,rad,radAdd;
        
        if (entity!==null) {
            this.collisionSpokeCount=entity.collisionSpokeCount;
            this.collisionHeightSegmentCount=entity.collisionHeightSegmentCount;
            this.collisionHeightMargin=entity.collisionHeightMargin;
        }
        else {
            this.collisionSpokeCount=24;
            this.collisionHeightSegmentCount=8;
            this.collisionHeightMargin=10;
        }
        
            // sin and cos for spokes
            
        this.spokeCalcSin=new Float32Array(this.collisionSpokeCount);
        this.spokeCalcCos=new Float32Array(this.collisionSpokeCount);
            
        rad=0.0;
        radAdd=(Math.PI*2.0)/this.collisionSpokeCount;
            
        for (n=0;n!==this.collisionSpokeCount;n++) {
            this.spokeCalcSin[n]=Math.sin(rad);
            this.spokeCalcCos[n]=Math.cos(rad);
            rad+=radAdd;
        }
        
            // ray points
            
        this.rayPoints=[];
        
        for (n=0;n!=(this.collisionSpokeCount+1);n++) {
            this.rayPoints.push(new PointClass(0,0,0));
        }
        
        return(true);
    }
    
    release()
    {
    }
    
        //
        // collision utilities
        //
    
    circleTrigIntersection(collisionTrig,circlePnt,radius,high,lineIntersectPnt)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            
        let n,k,yAdd,dist;
        let currentDist=-1;
        
            // always directly out of the center, so
            // y is always 0
            
        this.rayVector.y=0;
        
            // we need to do the height in parts so we
            // hit things collisions up and down the cylinder

        yAdd=Math.trunc((high-(this.collisionHeightMargin*2))/this.collisionHeightSegmentCount);

            // now the spokes across the y
            // we start up collisionHeightMargin because
            // sometimes walls can be a couple pixels above floors
            // and we'd get stuck on edges
            
        this.spokeCenterPnt.setFromValues(circlePnt.x,(circlePnt.y+this.collisionHeightMargin),circlePnt.z);
            
        for (n=0;n!==this.collisionHeightSegmentCount;n++) {
 
            for (k=0;k!==this.collisionSpokeCount;k++) {
                this.rayVector.x=radius*this.spokeCalcSin[k];
                this.rayVector.z=-(radius*this.spokeCalcCos[k]);
                
                if (!collisionTrig.rayOverlapBounds(this.spokeCenterPnt,this.rayVector)) continue;

                if (collisionTrig.rayTrace(this.spokeCenterPnt,this.rayVector,this.rayHitPnt)) {
                    dist=this.spokeCenterPnt.distance(this.rayHitPnt);
                    if (dist>radius) continue;
                    
                    if ((dist<currentDist) || (currentDist===-1)) {
                        lineIntersectPnt.setFromPoint(this.rayHitPnt);
                        currentDist=dist;
                    }
                }
            }
            
            this.spokeCenterPnt.y+=yAdd;
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
        let dist,currentDist,rayDist;
        let ty=circlePnt.y+high;
        
        currentDist=-1;
        rayDist=rayVector.length();
        
            // create a series of quads and ray trace
            // against their triangles
            
        for (n=0;n!==this.collisionSpokeCount;n++) {
            x1=circlePnt.x+(radius*this.spokeCalcSin[n]);
            z1=circlePnt.z-(radius*this.spokeCalcCos[n]);
            
            k=(n===(this.collisionSpokeCount-1))?0:(n+1);
            x2=circlePnt.x+(radius*this.spokeCalcSin[k]);
            z2=circlePnt.z-(radius*this.spokeCalcCos[k]);
            
            this.tempCollisionTrig.resetFromValues(x1,circlePnt.y,z1,x1,ty,z1,x2,ty,z2);
            
            if (this.tempCollisionTrig.rayOverlapBounds(rayPnt,rayVector)) {
                if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,this.rayHitPnt)) {
                    dist=rayPnt.distance(this.rayHitPnt);
                    if (dist>rayDist) continue;

                    if ((dist<currentDist) || (currentDist===-1)) {
                        intersectPnt.setFromPoint(this.rayHitPnt);
                        currentDist=dist;
                    }

                    continue;           // if it hits one triangle, we are done with the quad
                }
            }
            
            this.tempCollisionTrig.resetFromValues(x1,circlePnt.y,z1,x2,ty,z2,x2,circlePnt.y,z2);
            
            if (this.tempCollisionTrig.rayOverlapBounds(rayPnt,rayVector)) {
                if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,this.rayHitPnt)) {
                    dist=rayPnt.distance(this.rayHitPnt);
                    if (dist>rayDist) continue;

                    if ((dist<currentDist) || (currentDist===-1)) {
                        intersectPnt.setFromPoint(this.rayHitPnt);
                        currentDist=dist;
                    }
                }
            }
        }
        
        return(currentDist!==-1);
    }
    
    rayCubeQuadIntersection(rayPnt,rayVector,x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3,intersectPnt)
    {
        this.tempCollisionTrig.resetFromValues(x0,y0,z0,x2,y2,z2,x3,y3,z3);
        
        if (this.tempCollisionTrig.rayOverlapBounds(rayPnt,rayVector)) {
            if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,intersectPnt)) return(true);
        }

        this.tempCollisionTrig.resetFromValues(x0,y0,z0,x1,y1,z1,x2,y2,z2);
        
        if (this.tempCollisionTrig.rayOverlapBounds(rayPnt,rayVector)) {
            if (this.tempCollisionTrig.rayTrace(rayPnt,rayVector,intersectPnt)) return(true);
        }
        
        return(false);
    }
    
    rayCubeIntersection(rayPnt,rayVector,centerPnt,xSize,ySize,zSize,intersectPnt)
    {
        let dist,currentDist,rayDist;
        
        currentDist=-1;
        rayDist=rayVector.length();
        
            // create a series of quads and ray trace
            // against their triangles
            
        xSize=Math.trunc(xSize*0.5);
        ySize=Math.trunc(ySize*0.5);
        zSize=Math.trunc(zSize*0.5);
            
            // x
            
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
        
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
        
            // y
            
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
        
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
        
            // z
            
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z-zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z-zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
            
        if (this.rayCubeQuadIntersection(rayPnt,rayVector,(centerPnt.x-xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y-ySize),(centerPnt.z+zSize),(centerPnt.x+xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),(centerPnt.x-xSize),(centerPnt.y+ySize),(centerPnt.z+zSize),this.rayHitPnt)) {
            dist=rayPnt.distance(this.rayHitPnt);
            if ((dist<rayDist) && ((dist<currentDist) || (currentDist===-1))) {
                intersectPnt.setFromPoint(this.rayHitPnt);
                currentDist=dist;
            }
        }
            
        return(currentDist!==-1);
    }
    
        //
        // entity collisions
        //

    moveEntityInMap(entity,movePnt,bump)
    {
        let n,k;
        let mesh,checkEntity;
        let collisionTrig,nCollisionTrig;             
        let dist,currentDist;
        let map=this.core.game.map;
        let nEntity=map.entityList.count();
        
            // keep a bump and push count
            
        let bumpCount=0;
        let bumpY,entityTopY;
        
        let pushCount=0;
        let pushedEntity=false;
        
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
            // bumps or pushes
          
        while (true) {
            currentDist=-1;
            bumpY=-1;
            
                // run through the meshes and
                // check against collision lines

            for (n of map.meshList.collisionMeshIndexList) {
                mesh=map.meshList.meshes[n];
                
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
                        currentDist=dist;
                        
                            // set the wall collision
                            
                        entity.collideWallMeshIdx=n;
                        entity.collideWallTrigIdx=k;
                       
                            // if this is a bump target, it's not a wall
                            // collision but a bump
                            
                        bumpY=-1;

                        if (mesh.bump) {
                            if ((collisionTrig.yBound.max-this.entityTestPnt.y)<=map.bumpHeight) {
                                bumpY=collisionTrig.yBound.max;
                                entity.collideWallMeshIdx=-1;
                            }
                        }
                    }
                }
            }
            
                // check other entities

            pushedEntity=false;
            
            for (n=0;n!==nEntity;n++) {
                checkEntity=map.entityList.entities[n];
                if (checkEntity===entity) continue;
                if ((!checkEntity.show) || (checkEntity.heldBy!==null)) continue;
                
                    // skip if not in the Y of the line

                entityTopY=checkEntity.position.y+checkEntity.height;
                if (((this.entityTestPnt.y+entity.height)<checkEntity.position.y) || (this.entityTestPnt.y>=entityTopY)) continue;
                
                    // check the circle
                    
                if (!this.circleCircleIntersection(this.entityTestPnt,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) continue;
                
                    // find closest hit point

                dist=this.entityTestPnt.distance(this.entityTestIntersectPnt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    currentDist=dist;
                    
                        // set the touch
                        
                    entity.collideWallMeshIdx=-1;
                    entity.touchEntity=checkEntity;
                    checkEntity.touchEntity=entity;
                    
                        // can we bump?
                    
                    bumpY=-1;
                    if (checkEntity.canBeClimbed) {
                        if ((entityTopY-this.entityTestPnt.y)<=map.bumpHeight) bumpY=entityTopY;
                    }
                    
                        // can we push?
                        
                    if ((bumpY==-1) && (!checkEntity.passThrough)) {
                        pushedEntity=checkEntity.entityPush(entity,movePnt); 
                    }
                }
            }

                // if no hits, add in any bump
                // and return false
                
            if (currentDist===-1) {
                movePnt.y=this.entityTestPnt.y-entity.position.y;
                return(false);
            }
            
                // if it's a touched entity, but the
                // entity is passthrough, keep the entity touch
                // but return no hit
                
            if (entity.touchEntity!==null) {
                if (entity.touchEntity.passThrough) {
                    movePnt.y=this.entityTestPnt.y-entity.position.y;
                    return(false);
                }
            }
            
                // if we pushed an object, then we can go back
                // and try to move again (after the push got moved),
                // if we already tried once, then just return the hit
                
            if (pushedEntity) {
                if (pushCount!==0) return(true);
                
                pushCount++;
                continue;
            }
            
                // if no bump or not a bumpable
                // hit or already bumped then just return hit
                
            if ((!bump) || (bumpY===-1) || (bumpCount>=entity.maxBumpCount)) return(true);
                
                // can try the bump a couple times
                // as we might be moving fast enough to
                // hit more than one bump
                
            bumpCount++;
            this.entityTestPnt.y=bumpY;
        }
        
            // it's a hit, ignore any bumps and
            // stop movement
            
        return(true);
    }
    
    checkEntityCollision(entity)
    {
        let n,entityTopY;
        let checkEntity;
        let map=this.core.game.map;
        let nEntity=map.entityList.entities.length;

        for (n=0;n!==nEntity;n++) {
            checkEntity=map.entityList.entities[n];
            if (checkEntity===entity) continue;
            if ((!checkEntity.show) || (checkEntity.heldBy!==null)) continue;

                // skip if not in the Y of the line

            entityTopY=checkEntity.position.y+checkEntity.height;
            if (((this.entityTestPnt.y+entity.height)<checkEntity.position.y) || (this.entityTestPnt.y>=entityTopY)) continue;

                // check the circle

            if (this.circleCircleIntersection(entity.position,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) return(checkEntity);
        }
        
        return(null);
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
        
        for (n=0;n!==this.collisionSpokeCount;n++) {
            this.rayPoints[n].setFromValues((x+(radius*this.spokeCalcSin[n])),y,(z-(radius*this.spokeCalcCos[n])));
        }
        
        this.rayPoints[this.collisionSpokeCount].setFromValues(x,y,z);
    }
    
    fallEntityInMap(entity,fallY)
    {
        let n,k,i,y,nCollisionTrig;
        let mesh,collisionTrig;
        let nEntity,checkEntity,entityTop,entityBot,checkEntityTop;
        let map=this.core.game.map;
        
            // the rough collide boxes
            // floorRiseHeight is the farthest
            // we can move up and down a floor segment
            // and fallY is negative (moving down)
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y+fallY),(entity.position.y+entity.floorRiseHeight));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // build the ray trace points
            // from the bottom of the entity cylinder
            // plus the floor rise height (so we can move up on
            // slanted floors) to the floor rise height + fallY
            // (which is negative as the Y is up)
            
        this.buildYCollisionRayPoints(entity,(entity.position.y+entity.floorRiseHeight));
        
        this.rayVector.x=0;
        this.rayVector.y=(-entity.floorRiseHeight)+fallY;
        this.rayVector.z=0;
       
            // start with no hits
       
        entity.standOnMeshIdx=-1;
        entity.standOnEntity=null;
        
        y=entity.position.y+fallY;
        
            // run through colliding trigs
        
        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

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
                if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;
                
                for (i=0;i!==(this.collisionSpokeCount+1);i++) {
                    if (collisionTrig.rayTrace(this.rayPoints[i],this.rayVector,this.rayHitPnt)) {
                        if (this.rayHitPnt.y>=y) {
                            entity.standOnMeshIdx=n;
                            entity.standOnTrigIdx=k;
                            y=this.rayHitPnt.y;
                        }
                    }
                }
            }
        }
        
            // run through colliding entities
            // unless we are currently in passthrough
    
        if (!entity.passThrough) {
            nEntity=map.entityList.entities.length;

            entityTop=(entity.position.y+entity.height)+fallY;
            entityBot=entity.position.y+fallY;

            for (n=0;n!==nEntity;n++) {
                checkEntity=map.entityList.entities[n];
                if (checkEntity===entity) continue;
                if ((!checkEntity.show) || (checkEntity.passThrough) || (checkEntity.heldBy!==null)) continue;

                    // we can only hit the top of something if
                    // our bottom is within the check entity and our top
                    // is above it

                checkEntityTop=checkEntity.position.y+checkEntity.height;
                if ((entityTop<=checkEntityTop) || (entityBot>=checkEntityTop) || (entityBot<=checkEntity.position.y)) continue;

                    // check the circle

                if (this.circleCircleIntersection(entity.position,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) {
                    if (checkEntityTop>=y) {
                        entity.standOnMeshIdx=-1;
                        entity.standOnEntity=checkEntity;
                        y=checkEntityTop;
                    }
                }
            }
        }

            // get how far we've fallen (negative, y is up)

        if ((entity.standOnMeshIdx!==-1) || (entity.standOnEntity!==null)) return(y-entity.position.y);
        
            // if no collisions, return the
            // current fall
        
        return(fallY);
    }
    
        //
        // entity rising collisions
        //
        
    riseEntityInMap(entity,riseY)
    {
        let n,k,i,y,nCollisionTrig;
        let mesh,collisionTrig;
        let nEntity,checkEntity,entityTop,entityBot,checkEntityTop;
        let map=this.core.game.map;
        
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
        entity.hitHeadOnEntity=false;
        
        y=(entity.position.y+entity.height)+riseY;
        
            // run through the meshes
        
        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

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
                if (!collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) continue;
                
                for (i=0;i!==(this.collisionSpokeCount+1);i++) {
                    if (collisionTrig.rayTrace(this.rayPoints[i],this.rayVector,this.rayHitPnt)) {
                        if (this.rayHitPnt.y<=y) {
                            entity.collideCeilingMeshIdx=n;
                            y=this.rayHitPnt.y;
                        }
                    }
                }
            }
        }
            // run through colliding entities
            // unless we are currently in passthrough
            
        if (!entity.passThrough) {
            nEntity=map.entityList.entities.length;
        
            entityTop=(entity.position.y+entity.height)+riseY;
            entityBot=entity.position.y+riseY;

            for (n=0;n!==nEntity;n++) {
                checkEntity=map.entityList.entities[n];
                if (checkEntity===entity) continue;
                if ((!checkEntity.show) || (checkEntity.passThrough) || (checkEntity.heldBy!==null)) continue;

                    // we can only hit the bottom of something if
                    // our top is within the check entity and our bottom
                    // is below it

                checkEntityTop=checkEntity.position.y+checkEntity.height;
                if ((entityBot>=checkEntity.position.y) || (entityTop>=checkEntityTop) || (entityTop<=checkEntity.position.y)) continue;

                    // check the circle

                if (this.circleCircleIntersection(entity.position,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) {
                    if (checkEntity.position.y<=y) {
                        entity.collideCeilingMeshIdx=-1;
                        entity.hitHeadOnEntity=checkEntity;
                        y=checkEntity.position.y;
                    }
                }
            }
        }
        
            // get how far we've risen (positive, y is up)
            
        if ((entity.collideCeilingMeshIdx!==-1) || (entity.hitHeadOnEntity!==null)) return(y-(entity.position.y+entity.height));
        
            // if no collisions, return the riseY
        
        return(riseY);
    }
    
        //
        // ray collision
        // mostly for hit scans
        //
        
    rayCollision(entity,pnt,vector,hitPnt)
    {
        let n,k;
        let mesh,checkEntity;
        let collisionTrig,nCollisionTrig;              
        let dist,currentDist;
        let map=this.core.game.map;
        let nEntity=map.entityList.count();
        
            // the rough collide boxes
            
        this.objXBound.setFromValues(pnt.x,(pnt.x+vector.x));
        this.objYBound.setFromValues(pnt.y,(pnt.y+vector.y));
        this.objZBound.setFromValues(pnt.z,(pnt.z+vector.z));
        
            // no collisions yet

        currentDist=-1;
        entity.hitEntity=null;

            // run through the meshes and
            // check against all trigs

        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

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
            
        for (n=0;n!==nEntity;n++) {
            checkEntity=map.entityList.entities[n];
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
        
            // any hits
            
        return(currentDist!==-1);
    }
    
        //
        // ray collisions for cameras
        //
        
    rayCollisionCamera(entity,pnt,vector,skipEntities,hitPnt)
    {
        let n,k,nEntity;
        let mesh,checkEntity;
        let collisionTrig,nCollisionTrig;              
        let dist,currentDist;
        let map=this.core.game.map;
        
            // the rough collide boxes
            
        this.objXBound.setFromValues(pnt.x,(pnt.x+vector.x));
        this.objYBound.setFromValues(pnt.y,(pnt.y+vector.y));
        this.objZBound.setFromValues(pnt.z,(pnt.z+vector.z));
        
            // no collisions yet

        currentDist=-1;

            // run through the meshes and
            // check against all trigs

        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

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
            
        if (!skipEntities) {
            nEntity=map.entityList.count();
            
            for (n=0;n!==nEntity;n++) {
                checkEntity=map.entityList.entities[n];
                if (checkEntity===entity) continue;
                if (checkEntity===entity.heldBy) continue;         // skip source entity and anything holding source entity
                if ((!checkEntity.show) || (checkEntity.passThrough) || (checkEntity.heldBy!==null)) continue;

                    // run the collision

                if (this.rayCylinderIntersection(pnt,vector,checkEntity.position,checkEntity.radius,checkEntity.height,this.rayIntersectPnt)) {
                    dist=pnt.distance(this.rayIntersectPnt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        hitPnt.setFromPoint(this.rayIntersectPnt);
                        currentDist=dist;
                    }
                }
            }
        }
        
            // any hits
            
        return(currentDist!==-1);
    }
    
        //
        // rigid body calculations
        //
        
    getRigidBodyAngle(entity,rigidAngle,maxDrop,maxAngle)
    {
        let n,k,t,nCollisionTrig;
        let mesh,collisionTrig;
        let yHit=[0,0,0,0];
        let map=this.core.game.map;
        
            // build the four rigid body points
            
        this.rigidPnt[0].setFromValues(0,0,entity.radius);      // top
        this.rigidPnt[0].rotateY(null,entity.angle.y);
        this.rigidPnt[0].addPoint(entity.position);
        
        this.rigidPnt[1].setFromValues(0,0,-entity.radius);     // and bottom changes X
        this.rigidPnt[1].rotateY(null,entity.angle.y);
        this.rigidPnt[1].addPoint(entity.position);
        
        this.rigidPnt[2].setFromValues(entity.radius,0,0);      // left
        this.rigidPnt[2].rotateY(null,entity.angle.y);
        this.rigidPnt[2].addPoint(entity.position);
        
        this.rigidPnt[3].setFromValues(-entity.radius,0,0);      // and right changes Z
        this.rigidPnt[3].rotateY(null,entity.angle.y);
        this.rigidPnt[3].addPoint(entity.position);
        
            // our bound is around the X/Z
            // plus any rigid drop
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y-maxDrop),(entity.position.y+maxDrop));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // ray vector is always straight down
            
        this.rayVector.x=0;
        this.rayVector.y=-(maxDrop*2);
        this.rayVector.z=0;
        
            // the rigid point is maxDrop above and
            // maxDrop below so we can catch going up
            // or down, and we start with no hits which
            // is past the max drop
            
        for (n=0;n!==4;n++) {
            this.rigidPnt[n].y+=maxDrop;
            yHit[n]=this.rigidPnt[n].y+this.rayVector.y;
        }
        
            // run through colliding trigs
            // no entity checking as entities are always flat
        
        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

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
                    
                    for (t=0;t!==4;t++) {
                        if (collisionTrig.rayTrace(this.rigidPnt[t],this.rayVector,this.rayHitPnt)) {
                            if (this.rayHitPnt.y>=yHit[t]) yHit[t]=Math.trunc(this.rayHitPnt.y);
                        }
                    }
                }
            }
        }
        
            // calculate the X angle
            // if the same (both on flat land or in air) then angle is 0
            // otherwise it's the angle between the two rigid points
            
        if (yHit[0]===yHit[1]) {
            rigidAngle.x=0;
        }
        else {
            if ((this.rigidPnt[0].y+this.rayVector.y)===yHit[0]) {
                rigidAngle.x=maxAngle;
            }
            else {
                if ((this.rigidPnt[1].y+this.rayVector.y)===yHit[1]) {
                    rigidAngle.x=-maxAngle;
                }
                else {
                    rigidAngle.x=-((Math.atan2((yHit[0]-this.rigidPnt[0].y),entity.radius)-Math.atan2((yHit[1]-this.rigidPnt[1].y),entity.radius))*(180.0/Math.PI))*0.5;
                }
            }
        }
        
            // calculate the Z angle
            
        if (yHit[2]===yHit[3]) {
            rigidAngle.z=0;
        }
        else {
            if ((this.rigidPnt[2].y+this.rayVector.y)===yHit[2]) {
                rigidAngle.z=-maxAngle;
            }
            else {
                if ((this.rigidPnt[3].y+this.rayVector.y)===yHit[3]) {
                    rigidAngle.z=maxAngle;
                }
                else {
                    rigidAngle.z=((Math.atan2((yHit[2]-this.rigidPnt[2].y),entity.radius)-Math.atan2((yHit[3]-this.rigidPnt[3].y),entity.radius))*(180.0/Math.PI))*0.5;
                }
            }
        }
    }
    
        //
        // simple collisions
        // useful for things like simple projectiles
        //
    
    simpleMoveEntityInMap(entity,movePnt)
    {
        let n,k;
        let mesh,checkEntity,entityTopY;
        let collisionTrig,nCollisionTrig;
        let map=this.core.game.map;
        
        let nEntity=map.entityList.count();
        
        entity.touchEntity=null;
        
            // the moved point
            
        this.entityTestPnt.setFromValues((entity.position.x+movePnt.x),(entity.position.y+movePnt.y),(entity.position.z+movePnt.z));
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((this.entityTestPnt.x-entity.radius),(this.entityTestPnt.x+entity.radius));
        this.objYBound.setFromValues(this.entityTestPnt.y,(this.entityTestPnt.y+entity.height));
        this.objZBound.setFromValues((this.entityTestPnt.z-entity.radius),(this.entityTestPnt.z+entity.radius));
            
            // run through the meshes and
            // rough check trig collision boxes

        for (n of map.meshList.collisionMeshIndexList) {
            mesh=map.meshList.meshes[n];

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collision trigs

            nCollisionTrig=mesh.collisionWallTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionWallTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) return(true);
            }
            
            nCollisionTrig=mesh.collisionFloorTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionFloorTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) return(true);
            }
            
            nCollisionTrig=mesh.collisionCeilingTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionCeilingTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) return(true);
            }
        }
            
            // check other entities

        for (n=0;n!==nEntity;n++) {
            checkEntity=map.entityList.entities[n];
            if (checkEntity===entity) continue;
            if ((!checkEntity.show) || (checkEntity.heldBy!==null)) continue;

                // skip if not in the Y of the line

            entityTopY=checkEntity.position.y+checkEntity.height;
            if (((this.entityTestPnt.y+entity.height)<checkEntity.position.y) || (this.entityTestPnt.y>=entityTopY)) continue;

                // check the circle

            if (this.circleCircleIntersection(this.entityTestPnt,entity.radius,checkEntity.position,checkEntity.radius,this.entityTestIntersectPnt)) {
                entity.touchEntity=checkEntity;
                return(true);
            }
        }
            
        return(false);
    }
    
}
