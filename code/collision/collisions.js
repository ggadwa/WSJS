import * as constants from '../main/constants.js';
import PointClass from '../utility/point.js';
import LineClass from '../utility/line.js';
import BoundClass from '../utility/bound.js';

//
// collision class
//

export default class CollisionClass
{
    constructor(core)
    {
        this.core=core;
        
        this.spokePt=new PointClass(0,0,0);        // these are global to avoid it being local and GCd
        this.spokeHitPt=new PointClass(0,0,0);
        this.spokeLine=new LineClass(null,null);
        
        this.spokeCalcSin=new Float32Array(24);    // circular collision pre-calcs
        this.spokeCalcCos=new Float32Array(24);
        this.preCalcSpokes();

        this.testPt=new PointClass(0,0,0);
        this.moveIntersectPt=new PointClass(0,0,0);
        this.radiusPt=new PointClass(0,0,0);
        
        this.rayPoints=[];
        this.createRayPoints();
        
        this.rayVector=new PointClass(0,0,0);
        
        this.objXBound=new BoundClass(0,0);
        this.objYBound=new BoundClass(0,0);
        this.objZBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    preCalcSpokes()
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
        // collision routines
        //
    
    collisionLineToLineXZIntersection(collisionLine,line,py,lineIntersectPt)
    {
        let denom,r,s,ax,az;
        
        let fx0=collisionLine.x0;
        let fz0=collisionLine.z0;
        let fx1=collisionLine.x1;
        let fz1=collisionLine.z1;
        let fx2=line.p1.x;
        let fz2=line.p1.z;
        let fx3=line.p2.x;
        let fz3=line.p2.z;

        let bx=fx1-fx0;
        let dx=fx3-fx2;

        let bz=fz1-fz0;
        let dz=fz3-fz2;

        denom=(bx*dz)-(bz*dx);
        if (denom===0.0) return(false);
        
        ax=fx0-fx2;
        az=fz0-fz2;

        r=((az*dx)-(ax*dz))/denom;
        if ((r<0.0) || (r>1.0)) return(false);

        s=((az*bx)-(ax*bz))/denom;
        if ((s<0.0) || (s>1.0)) return(false);

        if ((r===0.0) && (s===0.0)) return(false);

        lineIntersectPt.setFromValues((fx0+(r*bx)),py,(fz0+(r*bz)));
        return(true);
    }

    circleLineXZIntersection(collisionLine,circlePt,radius,lineIntersectPt)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            // we do it instead of just checking the
            // perpendicular so you can't wade into corners
            
        let n,dist;
        let currentDist=-1;
        
        this.spokePt.setFromValues(circlePt.x,circlePt.y,circlePt.z);
        this.spokeLine.setFromValues(circlePt,this.spokePt);

        for (n=0;n!==24;n++) {
            this.spokePt.x=circlePt.x+(radius*this.spokeCalcSin[n]);
            this.spokePt.z=circlePt.z-(radius*this.spokeCalcCos[n]);   // everything is passed by pointer so this will change the spoke line

            if (this.collisionLineToLineXZIntersection(collisionLine,this.spokeLine,circlePt.y,this.spokeHitPt)) {
                dist=circlePt.noSquareDistance(this.spokeHitPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    lineIntersectPt.setFromPoint(this.spokeHitPt);
                    currentDist=dist;
                }
            }
        }
        
        return(currentDist!==-1);
    }
    
    circleCircleIntersection(circlePt1,radius1,circlePt2,radius2,circleIntersectPt)
    {
        let dist;
        let totalRadius=radius1+radius2;
        
            // get distance between center points
            // (x,z only, scrub out the Y)
            // if less than r1+r2 then it's a hit
            
        dist=circlePt1.distanceScrubY(circlePt2);
        if (dist>totalRadius) return(false);
        
            // hit point needs to be on the
            // radius of circle2
            
        circleIntersectPt.setFromValues((circlePt1.x-circlePt2.x),0,(circlePt1.z-circlePt2.z));
        circleIntersectPt.normalize();
        circleIntersectPt.scale(radius2);
        circleIntersectPt.addPoint(circlePt2);
        
        return(true);
    }
    
        //
        // simple collision
        //
        
    simpleCollision(entity)
    {
        let n,k;
        let mesh,checkEntity,checkEntityPt;
        let collisionLine,nCollisionLine;        
        let currentHitPt;        
        let dist,currentDist;
        
        let origPt=entity.position;
        let radius=entity.xRadius;
        let high=entity.height;
        
        let nMesh=this.core.map.meshList.meshes.length;
        let nEntity=this.core.map.entityList.count();
        
            // only bump once
            
        let entityTopY;
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((entity.position.x-radius),(entity.position.x+radius));
        this.objYBound.setFromValues(entity.position.y,(entity.position.y+high));
        this.objZBound.setFromValues((entity.position.z-radius),(entity.position.z+radius));
        
            // no collisions yet
            
        entity.collideWallMeshIdx=-1;
        entity.collideWallLineIdx=-1;
        
        currentHitPt=null;
        currentDist=-1;

            // run through the meshes and
            // check against collision lines

        for (n=0;n!==nMesh;n++) {
            mesh=this.core.map.meshList.meshes[n];
            if (mesh.noCollisions) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide lines

            nCollisionLine=mesh.collisionLines.length;

            for (k=0;k!==nCollisionLine;k++) {
                collisionLine=mesh.collisionLines[k];

                    // skip if not in the Y of the line

                if (entity.position.y>=collisionLine.yBound.max) continue;
                if ((entity.position.y+high)<collisionLine.yBound.min) continue;

                    // check against line
                    
                if (!this.circleLineXZIntersection(collisionLine,entity.position,radius,this.moveIntersectPt)) continue;

                    // find closest hit point

                dist=entity.position.noSquareDistance(this.moveIntersectPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    entity.collideWallMeshIdx=n;
                    entity.collideWallLineIdx=k;
                    currentHitPt=this.moveIntersectPt;
                    currentDist=dist;
                }
            }
        }

            // check other entities

        for (n=0;n!==nEntity;n++) {
            checkEntity=this.core.map.entityList.get(n);
            if (checkEntity.id===entity.id) continue;
            if (checkEntity.heldBy===entity) continue;

            checkEntityPt=checkEntity.position;

                // skip if not in the Y of the object

            entityTopY=checkEntityPt.y+checkEntity.height;
            if (((entity.position.y+high)<checkEntityPt.y) || (entity.position.y>=entityTopY)) continue;

                // check the circle

            if (!this.circleCircleIntersection(entity.position,radius,checkEntityPt,checkEntity.xRadius,this.moveIntersectPt)) continue;

                // find closest hit point

            dist=entity.position.noSquareDistance(this.moveIntersectPt);
            if ((dist<currentDist) || (currentDist===-1)) {
                entity.collideWallMeshIdx=-1;

                    // set the touch

                entity.touchEntity=checkEntity;
                checkEntity.touchEntity=entity;

                    // the hit point

                currentHitPt=this.moveIntersectPt;
                currentDist=dist;
            }
        }

            // if no hits, return null
            
        if (currentHitPt===null) return(null);
        
            // we need to move the hit point so it's
            // always outside the radius of moving point
        
        this.radiusPt.setFromValues((origPt.x-currentHitPt.x),0,(origPt.z-currentHitPt.z));
        
        this.radiusPt.normalize();
        this.radiusPt.scale(radius);
        
        this.radiusPt.addPoint(currentHitPt);
        
        return(this.radiusPt);
    }

        //
        // colliding objects
        //

    moveObjectInMap(entity,movePt,bump,collideMovePt)
    {
        let n,k;
        let mesh,checkEntity,checkEntityPt;
        let collisionLine,nCollisionLine;        
        let currentHitPt;        
        let dist,currentDist;
        
        let origPt=entity.position;
        let radius=entity.xRadius;
        let high=entity.height;
        
        let nMesh=this.core.map.meshList.meshes.length;
        let nEntity=this.core.map.entityList.count();
        
            // only bump once
            
        let bumpOnce=false;
        let bumpY,entityTopY;
        
            // the moved point
            
        this.testPt.setFromPoint(origPt);
        this.testPt.addPoint(movePt);
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((this.testPt.x-radius),(this.testPt.x+radius));
        this.objYBound.setFromValues(this.testPt.y,(this.testPt.y+high));
        this.objZBound.setFromValues((this.testPt.z-radius),(this.testPt.z+radius));
        
            // no collisions yet
            
        entity.collideWallMeshIdx=-1;
        entity.collideWallLineIdx=-1;
        
            // we need to possible run through
            // this multiple times to deal with
            // bumps
            
        while (true) {
            
            currentHitPt=null;
            currentDist=-1;
            
            bumpY=-1;
        
                // run through the meshes and
                // check against collision lines

            for (n=0;n!==nMesh;n++) {
                mesh=this.core.map.meshList.meshes[n];
                if (mesh.noCollisions) continue;
                
                    // skip any mesh we don't collide with
                    
                if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;
                
                    // check the collide lines
                    
                nCollisionLine=mesh.collisionLines.length;

                for (k=0;k!==nCollisionLine;k++) {
                    collisionLine=mesh.collisionLines[k];
                    
                        // skip if not in the Y of the line
            
                    if (this.testPt.y>=collisionLine.yBound.max) continue;
                    if ((this.testPt.y+high)<collisionLine.yBound.min) continue;
                    
                        // check against line
                    
                    if (!this.circleLineXZIntersection(collisionLine,this.testPt,radius,this.moveIntersectPt)) continue;
                    
                        // find closest hit point

                    dist=this.testPt.noSquareDistance(this.moveIntersectPt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        entity.collideWallMeshIdx=n;
                        entity.collideWallLineIdx=k;
                        currentHitPt=this.moveIntersectPt;
                        currentDist=dist;
                        
                        bumpY=-1;
                        if ((collisionLine.yBound.max-this.testPt.y)<=constants.BUMP_HEIGHT) bumpY=collisionLine.yBound.max;
                    }
                }
            }
          
                // check other entities

            for (n=0;n!==nEntity;n++) {
                checkEntity=this.core.map.entityList.get(n);
                if (checkEntity.id===entity.id) continue;
                if (checkEntity.heldBy===entity) continue;
                
                checkEntityPt=checkEntity.position;
                
                    // skip if not in the Y of the line

                entityTopY=checkEntityPt.y+checkEntity.height;
                if (((this.testPt.y+high)<checkEntityPt.y) || (this.testPt.y>=entityTopY)) continue;
                
                    // check the circle
                    
                if (!this.circleCircleIntersection(this.testPt,radius,checkEntityPt,checkEntity.xRadius,this.moveIntersectPt)) continue;
                
                    // find closest hit point

                dist=this.testPt.noSquareDistance(this.moveIntersectPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    entity.collideWallMeshIdx=-1;
                    
                        // set the touch
                        
                    entity.touchEntity=checkEntity;
                    checkEntity.touchEntity=entity;
                    
                        // the hit point
                        
                    currentHitPt=this.moveIntersectPt;
                    currentDist=dist;
                    
                    bumpY=-1;
                    if ((entityTopY-this.testPt.y)<=constants.BUMP_HEIGHT) bumpY=entityTopY;
                }
            }

                // if no hits, just return
                // original move plus any bump
                // we might have had
                
            if (currentHitPt===null) {
                collideMovePt.setFromValues(movePt.x,(this.testPt.y-origPt.y),movePt.z);
                return;
            }
            
                // if no bump, not a bumpable
                // hit, or we've already bumped,
                // just return hit
                
            if ((!bump) || (bumpY===-1) || (bumpOnce)) break;
                
                // do the bump, but only
                // once
                
            bumpOnce=true;
            this.testPt.y=bumpY;
        }
        
            // we need to move the hit point so it's
            // always outside the radius of moving point
        
        this.radiusPt.setFromValues((origPt.x-currentHitPt.x),0,(origPt.z-currentHitPt.z));
        
        this.radiusPt.normalize();
        this.radiusPt.scale(radius);
        
        this.radiusPt.addPoint(currentHitPt);
        
            // and the new move is the original
            // point to this current hit point
            // always restore the bump move
        
        collideMovePt.setFromValues((this.radiusPt.x-origPt.x),(this.testPt.y-origPt.y),(this.radiusPt.z-origPt.z));
    }
    
    //
    // floor collisions
    //
    
    buildYCollisionRayPoints(entity,y)
    {
        let n,radius,x,z;
        
            // use spokes (around the radius) plus
            // an extra for the middle
        
        radius=entity.xRadius;
        
        x=entity.position.x;
        z=entity.position.z;
        
        for (n=0;n!==24;n++) {
            this.rayPoints[n].setFromValues((x+(radius*this.spokeCalcSin[n])),y,(z+(radius*this.spokeCalcCos[n])));
        }
        
        this.rayPoints[24].setFromValues(x,y,z);
    }
    
    fallObjectInMap(entity)
    {
        let n,k,i,y,nMesh,nCollisionTrig;
        let mesh,collisionTrig,rayHitPnt;

            // the rough collide boxes
            // floor_rise_height is the farthest
            // we can move up and down a floor segment
            
        this.objXBound.setFromValues((entity.position.x-entity.xRadius),(entity.position.x+entity.xRadius));
        this.objYBound.setFromValues((entity.position.y-constants.FLOOR_RISE_HEIGHT),(entity.position.y+constants.FLOOR_RISE_HEIGHT));
        this.objZBound.setFromValues((entity.position.z-entity.zRadius),(entity.position.z+entity.zRadius));
        
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
                        rayHitPnt=collisionTrig.rayTrace(this.rayPoints[i],this.rayVector);
                        if (rayHitPnt!==null) {
                            if (rayHitPnt.y>=y) {
                                entity.standOnMeshIdx=n;
                                y=rayHitPnt.y;
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
        // ceiling collisions
        //
        
    riseObjectInMap(entity,riseY)
    {
        let n,k,i,y,nMesh,nCollisionTrig;
        let mesh,collisionTrig,rayHitPnt;
        
            // the rough collide boxes
            // we check from the top of the object past the rise
            // (to catch things moving into us or pushing past ceiling)
            // to the furtherest we are trying to rise
            
        this.objXBound.setFromValues((entity.position.x-entity.xRadius),(entity.position.x+entity.zRadius));
        this.objYBound.setFromValues((entity.position.y+entity.height),((entity.position.y+entity.height)+riseY));
        this.objZBound.setFromValues((entity.position.z-entity.zRadius),(entity.position.z+entity.zRadius));
        
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
                        rayHitPnt=collisionTrig.rayTrace(this.rayPoints[i],this.rayVector);
                        if (rayHitPnt!==null) {
                            if (rayHitPnt.y<=y) {
                                entity.collideCeilingMeshIdx=n;
                                y=rayHitPnt.y;
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
    
}
