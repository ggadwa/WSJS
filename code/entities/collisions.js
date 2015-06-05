"use strict";

//
// collision class
//

function CollisionObject()
{
    this.BUMP_HIGH=550;
    
    //
    // collision routines
    //
    
    this.lineLineXZIntersection=function(line1,line2)
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
        if (denom===0.0) return(null);

        var r=((az*dx)-(ax*dz))/denom;
        if ((r<0.0) || (r>1.0)) return(null);

        var s=((az*bx)-(ax*bz))/denom;
        if ((s<0.0) || (s>1.0)) return(null);

        if ((r===0.0) && (s===0.0)) return(null);

        return(new wsPoint((fx0+(r*bx)),line1.p1.y,(fz0+(r*bz))));
    };

    this.circleLineXZIntersection=function(line,circlePt,radius)
    {
            // cast rays from the center of the circle
            // like spokes to check for collisions
            // we do it instead of just checking the
            // perpendicular so you can't wade into corners
            
        var n;
        var hitPt=null;

        var dist;
        var currentDist=-1;
        
        var hitPt;
        var currentHitPt=null;

        var rad=0.0;
        var radAdd=(Math.PI*2.0)/24.0;
        
        var spokePt=new wsPoint(circlePt.x,circlePt.y,circlePt.z);
        var spoke=new wsLine(circlePt,spokePt);

        for (n=0;n!==24;n++) {
            
            spokePt.x=circlePt.x+radius*Math.sin(rad);
            spokePt.z=circlePt.z-radius*Math.cos(rad);   // everything is passed by pointer so this will change the spoke line

            hitPt=this.lineLineXZIntersection(line,spoke);
            if (hitPt!==null) {
                dist=circlePt.noSquareDistance(hitPt);
                if ((dist<currentDist) || (currentDist===-1)) {
                    currentHitPt=hitPt;
                    currentDist=dist;
                }
            }

            rad+=radAdd;
        }

        return(currentHitPt);
    };

        //
        // colliding objects
        //

    this.moveObjectInMap=function(map,pt,radius,bump)
    {
        var n,k;
        var mesh;
        var collisionLine,nCollisionLine;        
        var hitPt,currentHitPt;        
        var dist,currentDist;
        
        var nMesh=map.meshes.length;
        
            // only bump once
            
        var bumpOnce=false;
        var bumpY;
        var yBound;
        
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
                nCollisionLine=mesh.collisionLines.length;

                for (k=0;k!==nCollisionLine;k++) {
                    collisionLine=mesh.collisionLines[k];
                    
                        // skip if not in the Y of the line
            
                    yBound=collisionLine.getYBound();
                    if ((pt.y>=yBound.max) || (pt.y<=yBound.min)) continue;

                        // check against line

                    hitPt=this.circleLineXZIntersection(collisionLine,pt,radius);
                    if (hitPt===null) continue;

                        // find closest hit point

                    dist=pt.noSquareDistance(hitPt);
                    if ((dist<currentDist) || (currentDist===-1)) {
                        currentHitPt=hitPt;
                        currentDist=dist;
                        bumpY=-1;
                        if ((pt.y-yBound.min)<this.BUMP_HIGH) bumpY=yBound.min;
                    }
                }
            }
            
                // if no hits, just return
                // original move
                
            if (currentHitPt===null) return(pt);
            
                // if no bump, not a bumpable
                // hit, or we've already bumped,
                // just return hit
                
            if ((!bump) || (bumpY===-1) || (bumpOnce)) {
                pt.x=currentHitPt.x;
                pt.z=currentHitPt.z;
                return(pt);
            }
                
                // do the bump, but only
                // once
                
            bumpOnce=true;
            pt.y=bumpY;
        }
        
            // return moved point

        pt.x=currentHitPt.x;
        pt.z=currentHitPt.z;
        
        return(pt);
    };
}
