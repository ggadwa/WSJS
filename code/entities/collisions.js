"use strict";

//
// primitive collisions
//








//
// collision class
//

function CollisionObject()
{
    
    //
    // collision routines
    //
    
    this.lineLineIntersection=function(line1,line2)
    {
        var fx0=line1.p1.x;
        var fy0=line1.p1.y;
        var fx1=line1.p2.x;
        var fy1=line1.p2.y;
        var fx2=line2.p1.x;
        var fy2=line2.p1.y;
        var fx3=line2.p2.x;
        var fy3=line2.p2.y;

        var ax=fx0-fx2;
        var bx=fx1-fx0;
        var dx=fx3-fx2;

        var ay=fy0-fy2;
        var by=fy1-fy0;
        var dy=fy3-fy2;

        var denom=(bx*dy)-(by*dx);
        if (denom===0.0) return(null);

        var r=((ay*dx)-(ax*dy))/denom;
        if ((r<0.0) || (r>1.0)) return(null);

        var s=((ay*bx)-(ax*by))/denom;
        if ((s<0.0) || (s>1.0)) return(null);

        if ((r===0.0) && (s===0.0)) return(null);

        return(new ws2DPoint((fx0+(r*bx)),(fy0+(r*by))));
    };

    this.circleLineIntersection=function(line,circlePt,radius)
    {
        var n;
        var hitPt=null;
	
            // cast rays from the center of the circle
            // like spokes to check for collisions
            // we do it instead of just checking the
            // perpendicular so you can't wade into corners

        var dist;
        var currentDist=-1;
        
        var hitPt;
        var currentHitPt=null;

        var rad=0.0;
        var radAdd=(Math.PI*2.0)/24.0;
        
        var spokePt=new ws2DPoint(circlePt.x,circlePt.z);
        var spoke=new wsLine(circlePt,spokePt);

        for (n=0;n!==24;n++) {
            
            spokePt.x=circlePt.x+radius*Math.sin(rad);
            spokePt.y=circlePt.y-radius*Math.cos(rad);   // everything is passed by pointer so this will change the spoke line

            hitPt=this.lineLineIntersection(line,spoke);
            if (hitPt!==null) {
                
                if (currentHitPt===null) {
                    hitPt=currentHitPt;
                    currentDist=circlePt.noSquareDistance(currentHitPt);
                }
                else {
                    dist=circlePt.noSquareDistance(hitPt);
                    if (dist<currentDist) {
                        hitPt=currentHitPt;
                        currentDist=dist;
                    }
                }
            }

            rad+=radAdd;
        }

        return(currentHitPt);
    };

        //
        // colliding objects
        //

    this.moveObjectInMap=function(map,pt,radius)
    {
        var n,k;
        var mesh,nMesh;
        var collisionLine,nCollisionLine;
        
            // this is a 2D calculation, so
            // we need to convert the pt
            
        var circlePt=new ws2DPoint(pt.x,pt.z);
        
        var hitPt;
        var currentHitPt=null;
        
        var dist;
        var currentDist=-1;
        
            // run through the meshes and
            // check against x/z collision lines
            
        nMesh=map.meshes.length;
        
        for (n=0;n!==nMesh;n++) {
            mesh=map.meshes[n];
            nCollisionLine=mesh.collisionLines.length;
            
            for (k=0;k!==nCollisionLine;k++) {
                collisionLine=mesh.collisionLines[k];
                
                    // check against line
                    
                hitPt=this.circleLineIntersection(collisionLine,circlePt,radius);
                if (hitPt===null) continue;
                
                    // find closest hit point
                    
                if (currentHitPt===null) {
                    currentHitPt=hitPt;
                    currentDist=circlePt.noSquareDistance(currentHitPt);
                }
                else {
                    dist=circlePt.noSquareDistance(hitPt);
                    if (dist<currentDist) {
                        currentHitPt=hitPt;
                        currentDist=dist;
                    }
                }
            }
        }
        
            // any hits?
            
        if (currentHitPt!==null) {
            pt.x=currentHitPt.x;
            pt.z=currentHitPt.y;
        }
        
            // return moved point

        return(pt);
    };
}
