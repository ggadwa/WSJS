import * as constants from '../../code/main/constants.js';
import PointClass from '../../code/utility/point.js';
import LineClass from '../../code/utility/line.js';
import BoundClass from '../../code/utility/bound.js';

//
// collision class
//

export default class CollisionClass
{
    constructor(map)
    {
        this.map=map;
        
        this.BUMP_HIGH=1000;

        this.spokePt=new PointClass(0,0,0);        // these are global to avoid it being local and GCd
        this.spokeHitPt=new PointClass(0,0,0);
        this.spokeLine=new LineClass(null,null);
        
        this.spokeCalcSin=new Float32Array(24);    // circular collision pre-calcs
        this.spokeCalcCos=new Float32Array(24);
        this.preCalcSpokes();

        this.testPt=new PointClass(0,0,0);
        this.moveIntersectPt=new PointClass(0,0,0);
        this.radiusPt=new PointClass(0,0,0);

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
    
        //
        // collision routines
        //
    
    lineLineXZIntersection(line1,line2,lineIntersectPt)
    {
        let denom,r,s,ax,az;
        
        let fx0=line1.p1.x;
        let fz0=line1.p1.z;
        let fx1=line1.p2.x;
        let fz1=line1.p2.z;
        let fx2=line2.p1.x;
        let fz2=line2.p1.z;
        let fx3=line2.p2.x;
        let fz3=line2.p2.z;

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

        lineIntersectPt.setFromValues((fx0+(r*bx)),line1.p1.y,(fz0+(r*bz)));
        return(true);
    }

    circleLineXZIntersection(line,circlePt,radius,lineIntersectPt)
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

            if (this.lineLineXZIntersection(line,this.spokeLine,this.spokeHitPt)) {
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
        let radius=entity.radius;
        let high=entity.high;
        
        let nMesh=this.map.meshList.meshes.length;
        let nEntity=this.map.entityList.count();
        
            // only bump once
            
        let bumpOnce=false;
        let bumpY,entityTopY;
        let yBound;
        
            // the moved point
            
        this.testPt.setFromPoint(origPt);
        this.testPt.addPoint(movePt);
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((this.testPt.x-radius),(this.testPt.x+radius));
        this.objYBound.setFromValues((this.testPt.y-high),this.testPt.y);
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
                mesh=this.map.meshList.meshes[n];
                
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
                        entity.collideWallLineIdx=k;
                        currentHitPt=this.moveIntersectPt;
                        currentDist=dist;
                        bumpY=-1;
                        if ((this.testPt.y-yBound.min)<this.BUMP_HIGH) bumpY=yBound.min;
                    }
                }
            }
            
                // check other entities

            for (n=0;n!==nEntity;n++) {
                checkEntity=this.map.entityList.get(n);
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
        let n,k,nMesh,nCollisionTrig;
        let mesh,collisionTrig;

            // the rough collide boxes
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues((entity.position.y-fallY),(entity.position.y+fallY));
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
        nMesh=this.map.meshList.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshList.meshes[n];
            
                // skip walls or ceilings
                
            if (mesh.flag===constants.MESH_FLAG_ROOM_CEILING) continue;
            if (mesh.flag===constants.MESH_FLAG_ROOM_WALL) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide triangles
                // if we are within the fall, then
                // return the ground

            nCollisionTrig=mesh.collisionFloorTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionFloorTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    entity.standOnMeshIdx=n;
                    return(collisionTrig.v0.y-entity.position.y);
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
        let n,k,nMesh,nCollisionTrig;
        let mesh,collisionTrig;
        
            // the rough collide boxes
            
        this.objXBound.setFromValues((entity.position.x-entity.radius),(entity.position.x+entity.radius));
        this.objYBound.setFromValues(((entity.position.y-entity.high)+riseY),((entity.position.y-entity.high)-riseY));      // riseY is NEGATIVE
        this.objZBound.setFromValues((entity.position.z-entity.radius),(entity.position.z+entity.radius));
        
            // run through the meshes
        
        nMesh=this.map.meshList.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshList.meshes[n];
            
                // skip walls
                
            if (mesh.flag===constants.MESH_FLAG_ROOM_WALL) continue;

                // skip any mesh we don't collide with

            if (!mesh.boxBoundCollision(this.objXBound,this.objYBound,this.objZBound)) continue;

                // check the collide rects
                // if we are within the rise, then
                // bound to the ceiling

            nCollisionTrig=mesh.collisionCeilingTrigs.length;

            for (k=0;k!==nCollisionTrig;k++) {
                collisionTrig=mesh.collisionCeilingTrigs[k];
                if (collisionTrig.overlapBounds(this.objXBound,this.objYBound,this.objZBound)) {
                    entity.collideCeilingMeshIdx=n;
                    return(collisionTrig.v0.y-(entity.position.y-entity.high));
                }
            }
        }
        
            // no hits
        
        entity.collideCeilingMeshIdx=-1;
        return(riseY);
    }
    
}
