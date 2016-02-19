"use strict";

//
// collision class
//

function CollisionObject()
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
    
        //
        // collision routines
        //
    
    this.lineLineXZIntersection=function(line1,line2,lineIntersectPt)
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

        lineIntersectPt.set((fx0+(r*bx)),line1.p1.y,(fz0+(r*bz)));
        return(true);
    };

    this.circleLineXZIntersection=function(line,circlePt,radius,lineIntersectPt)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            // we do it instead of just checking the
            // perpendicular so you can't wade into corners
            
        var n,dist;
        var currentDist=-1;
        
        var rad=0.0;
        var radAdd=(Math.PI*2.0)/24.0;
        
        this.spokePt.set(circlePt.x,circlePt.y,circlePt.z);
        this.spokeLine.set(circlePt,this.spokePt);

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
    };
    
    this.circleCircleIntersection=function(circlePt1,radius1,circlePt2,radius2,circleIntersectPt)
    {
        var dist;
        var totalRadius=radius1+radius2;
        
            // get distance between center points
            // if less than r1+r2 then it's a hit
            
        dist=circlePt1.distance(circlePt2);
        if (dist>totalRadius) return(false);
        
            // hit point needs to be on the
            // radius of circle2
            
        circleIntersectPt.set((circlePt1.x-circlePt2.x),0,(circlePt1.z-circlePt2.z));
        circleIntersectPt.normalize();
        circleIntersectPt.scale(radius2);
        circleIntersectPt.addPoint(circlePt2);
        
        return(true);
    };

        //
        // colliding objects
        //

    this.moveObjectInMap=function(map,entityList,entity,movePt,bump,collideMovePt)
    {
        var n,k;
        var mesh,checkEntity,checkEntityPt;
        var collisionLine,nCollisionLine;        
        var currentHitPt;        
        var dist,currentDist;
        
        var origPt=entity.getPosition();
        var radius=entity.getRadius();
        var high=entity.getHigh();
        
        var nMesh=map.meshes.length;
        var nEntity=entityList.count();
        
            // only bump once
            
        var bumpOnce=false;
        var bumpY;
        var yBound;
        
            // the moved point
            
        this.testPt.setFromPoint(origPt);
        this.testPt.addPoint(movePt);
        
            // the rough collide boxes
            
        this.objXBound.set((this.testPt.x-radius),(this.testPt.x+radius));
        this.objYBound.set(this.testPt.y,(this.testPt.y-high));
        this.objZBound.set((this.testPt.z-radius),(this.testPt.z+radius));
        
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
                    if ((this.testPt.y>yBound.max) || (this.testPt.y<=yBound.min)) continue;

                        // check against line

                    if (!this.circleLineXZIntersection(collisionLine,this.testPt,radius,this.moveIntersectPt)) continue;
                    
                        // find closest hit point

                    dist=this.testPt.noSquareDistance(this.moveIntersectPt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        currentHitPt=this.moveIntersectPt;
                        currentDist=dist;
                        bumpY=-1;
                        if ((this.testPt.y-yBound.min)<this.BUMP_HIGH) bumpY=yBound.min;
                    }
                }
            }
            
                // check other entities

            for (n=0;n!==nEntity;n++) {
                checkEntity=entityList.get(n);
                if (checkEntity.getId()===entity.getId()) continue;
                
                checkEntityPt=checkEntity.getPosition();
                
                    // skip if not in the Y of the line

                if ((this.testPt.y>checkEntityPt.y) || (this.testPt.y<=(checkEntityPt.y-checkEntity.getHigh()))) continue;
                
                    // check the circle
                    
                if (!this.circleCircleIntersection(this.testPt,radius,checkEntityPt,checkEntity.getRadius(),this.moveIntersectPt)) continue;
                
                    // find closest hit point

                dist=this.testPt.noSquareDistance(this.moveIntersectPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    
                        // set the touch
                        
                    entity.setTouchEntity(checkEntity);
                    checkEntity.setTouchEntity(entity);
                    
                        // the hit point
                        
                    currentHitPt=this.moveIntersectPt;
                    currentDist=dist;
                    bumpY=-1;
                    if ((this.testPt.y-yBound.min)<this.BUMP_HIGH) bumpY=yBound.min;
                }
            }

                // if no hits, just return
                // original move plus any bump
                // we might have had
                
            if (currentHitPt===null) {
                collideMovePt.set(movePt.x,(this.testPt.y-origPt.y),movePt.z);
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
        
        this.radiusPt.set((origPt.x-currentHitPt.x),0,(origPt.z-currentHitPt.z));
        
        this.radiusPt.normalize();
        this.radiusPt.scale(radius);
        
        this.radiusPt.addPoint(currentHitPt);
        
            // and the new move is the original
            // point to this current hit point
            // always restore the bump move
        
        collideMovePt.set((this.radiusPt.x-origPt.x),(this.testPt.y-origPt.y),(this.radiusPt.z-origPt.z));
    };
    
    //
    // fall object in map
    //
    
    this.fallObjectInMap=function(map,pt,radius,fallY)
    {
        var n,k,nMesh,nCollisionRect;
        var mesh,collisionRect;

            // the rough collide boxes
            
        this.objXBound.set((pt.x-radius),(pt.x+radius));
        this.objYBound.set((pt.y-fallY),(pt.y+fallY));
        this.objZBound.set((pt.z-radius),(pt.z+radius));
        
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

            nCollisionRect=mesh.collisionRects.length;

            for (k=0;k!==nCollisionRect;k++) {
                collisionRect=mesh.collisionRects[k];
                if (collisionRect.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) return(collisionRect.y-pt.y);
            }
        }
        
            // else return the fall
            
        return(fallY);
    };
    
    
}
