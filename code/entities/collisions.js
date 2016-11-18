/* global entityList, map, MESH_FLAG_ROOM_CEILING, MESH_FLAG_ROOM_WALL */

"use strict";

//
// collision class
//

class CollisionClass
{
    constructor()
    {
        this.BUMP_HIGH=1000;

        this.spokePt=new wsPoint(0,0,0);        // these are global to avoid it being local and GCd
        this.spokeHitPt=new wsPoint(0,0,0);
        this.spokeLine=new wsLine(null,null);

        this.testPt=new wsPoint(0,0,0);
        this.moveIntersectPt=new wsPoint(0,0,0);
        this.radiusPt=new wsPoint(0,0,0);

        this.objXBound=new wsBound(0,0);
        this.objYBound=new wsBound(0,0);
        this.objZBound=new wsBound(0,0);
        
        Object.seal(this);
    }
    
        //
        // collision routines
        //
    
    lineLineXZIntersection(line1,line2,lineIntersectPt)
    {
        var fx0=line1.p1.x;
        var fz0=line1.p1.z;
        var fx1=line1.p2.x;
        var fz1=line1.p2.z;
        var fx2=line2.p1.x;
        var fz2=line2.p1.z;
        var fx3=line2.p2.x;
        var fz3=line2.p2.z;

        var ax=fx0-fx2;
        var bx=fx1-fx0;
        var dx=fx3-fx2;

        var az=fz0-fz2;
        var bz=fz1-fz0;
        var dz=fz3-fz2;

        var denom=(bx*dz)-(bz*dx);
        if (denom===0.0) return(false);

        var r=((az*dx)-(ax*dz))/denom;
        if ((r<0.0) || (r>1.0)) return(false);

        var s=((az*bx)-(ax*bz))/denom;
        if ((s<0.0) || (s>1.0)) return(false);

        if ((r===0.0) && (s===0.0)) return(false);

        lineIntersectPt.setFromValues((fx0+(r*bx)),line1.p1.y,(fz0+(r*bz)));
        return(true);
    }

    circleLineXZIntersection(line,circlePt,radius,lineIntersectPt)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            // we do it instead of just checking the
            // perpendicular so you can't wade into corners
            
        var n,dist;
        var currentDist=-1;
        
        var rad=0.0;
        var radAdd=(Math.PI*2.0)/24.0;
        
        this.spokePt.setFromValues(circlePt.x,circlePt.y,circlePt.z);
        this.spokeLine.setFromValues(circlePt,this.spokePt);

        for (n=0;n!==24;n++) {
            
            this.spokePt.x=circlePt.x+(radius*Math.sin(rad));
            this.spokePt.z=circlePt.z-(radius*Math.cos(rad));   // everything is passed by pointer so this will change the spoke line

            if (this.lineLineXZIntersection(line,this.spokeLine,this.spokeHitPt)) {
                dist=circlePt.noSquareDistance(this.spokeHitPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    lineIntersectPt.setFromPoint(this.spokeHitPt);
                    currentDist=dist;
                }
            }

            rad+=radAdd;
        }
        
        return(currentDist!==-1);
    }
    
    circleCircleIntersection(circlePt1,radius1,circlePt2,radius2,circleIntersectPt)
    {
        var dist;
        var totalRadius=radius1+radius2;
        
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
        // colliding objects
        //

    moveObjectInMap(entity,movePt,bump,collideMovePt)
    {
        var n,k;
        var mesh,checkEntity,checkEntityPt;
        var collisionLine,nCollisionLine;        
        var currentHitPt;        
        var dist,currentDist;
        
        var origPt=entity.position;
        var radius=entity.radius;
        var high=entity.high;
        
        var nMesh=map.meshes.length;
        var nEntity=entityList.countEntity();
        
            // only bump once
            
        var bumpOnce=false;
        var bumpY,entityTopY;
        var yBound;
        
            // the moved point
            
        this.testPt.setFromPoint(origPt);
        this.testPt.addPoint(movePt);
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((this.testPt.x-radius),(this.testPt.x+radius));
        this.objYBound.setFromValues((this.testPt.y-high),this.testPt.y);
        this.objZBound.setFromValues((this.testPt.z-radius),(this.testPt.z+radius));
        
            // no collisions yet
            
        entity.collideWallMeshIdx=-1;
        
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
                mesh=map.meshes[n];
                
                    // skip any mesh we don't collide with
                    
                if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;
                
                    // check the collide lines
                    
                nCollisionLine=mesh.collisionLines.length;

                for (k=0;k!==nCollisionLine;k++) {
                    collisionLine=mesh.collisionLines[k];
                    
                        // skip if not in the Y of the line
            
                    yBound=collisionLine.getYBound();
                    if (this.testPt.y<=yBound.min) continue;
                    if ((this.testPt.y-high)>yBound.max) continue;
                    
                        // check against line

                    if (!this.circleLineXZIntersection(collisionLine,this.testPt,radius,this.moveIntersectPt)) continue;
                    
                        // find closest hit point

                    dist=this.testPt.noSquareDistance(this.moveIntersectPt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        entity.collideWallMeshIdx=n;
                        currentHitPt=this.moveIntersectPt;
                        currentDist=dist;
                        bumpY=-1;
                        if ((this.testPt.y-yBound.min)<this.BUMP_HIGH) bumpY=yBound.min;
                    }
                }
            }
            
                // check other entities

            for (n=0;n!==nEntity;n++) {
                checkEntity=entityList.getEntity(n);
                if (checkEntity.id===entity.id) continue;
                
                checkEntityPt=checkEntity.position;
                
                    // skip if not in the Y of the line

                entityTopY=checkEntityPt.y-checkEntity.high;
                if (((this.testPt.y-high)>checkEntityPt.y) || (this.testPt.y<=entityTopY)) continue;
                
                    // check the circle
                    
                if (!this.circleCircleIntersection(this.testPt,radius,checkEntityPt,checkEntity.radius,this.moveIntersectPt)) continue;
                
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
                    if ((this.testPt.y-entityTopY)<this.BUMP_HIGH) bumpY=entityTopY;
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
    
    fallObjectInMap(entity,fallY)
    {
        var n,k,nMesh,nCollisionRect;
        var mesh,collisionRect;

            // the rough collide boxes
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y-fallY),(entity.position.y+fallY));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
        nMesh=map.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=map.meshes[n];
            
                // skip walls or ceilings
                
            if (mesh.flag===MESH_FLAG_ROOM_CEILING) continue;
            if (mesh.flag===MESH_FLAG_ROOM_WALL) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide rects
                // if we are within the fall, then
                // return the ground

            nCollisionRect=mesh.collisionFloorRects.length;

            for (k=0;k!==nCollisionRect;k++) {
                collisionRect=mesh.collisionFloorRects[k];
                if (collisionRect.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    entity.standOnMeshIdx=n;
                    return(collisionRect.y-entity.position.y);
                }
            }
        }
        
            // else return the fall
        
        entity.standOnMeshIdx=-1;
        return(fallY);
    }
    
        //
        // ceiling collisions
        //
        
    riseObjectInMap(entity,riseY)
    {
        var n,k,nMesh,nCollisionRect;
        var mesh,collisionRect;

            // the rough collide boxes
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues(((entity.position.y-entity.high)+riseY),((entity.position.y-entity.high)-riseY));      // riseY is NEGATIVE
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // run through the meshes
        
        nMesh=map.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=map.meshes[n];
            
                // skip walls
                
            if (mesh.flag===MESH_FLAG_ROOM_WALL) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide rects
                // if we are within the rise, then
                // bound to the ceiling

            nCollisionRect=mesh.collisionCeilingRects.length;

            for (k=0;k!==nCollisionRect;k++) {
                collisionRect=mesh.collisionCeilingRects[k];
                if (collisionRect.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    entity.collideCeilingMeshIdx=n;
                    return(collisionRect.y-(entity.position.y-entity.high));
                }
            }
        }
        
            // no hits
        
        entity.collideCeilingMeshIdx=-1;
        return(riseY);
    }
    
}
