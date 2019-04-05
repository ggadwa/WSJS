import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';

export default class CollisionTrigClass
{
    static FLOOR_MIN_XZ_ELIMINATION_SIZE=500;       // if the min x/z of a segment is less than this, then it's elimated as a floor/ceiling segment
    
    constructor(v0,v1,v2)
    {
        this.v0=v0;
        this.v1=v1;
        this.v2=v2;
        
        this.v0.trunc();
        this.v1.trunc();
        this.v2.trunc();
        
            // bounds
            
        this.xBound=null;
        this.yBound=null;
        this.zBound=null;
        
            // triangle vectors for ray tracing
            
        this.vct1=new PointClass(0,0,0);
        this.vct2=new PointClass(0,0,0);
        
            // precalc these so ray tracing doesn't
            // keep creating stuff to garbage collect
            
        this.perpVector=new PointClass(0,0,0);
        this.lineToTrigPointVector=new PointClass(0,0,0);
        this.lineToTrigPerpVector=new PointClass(0,0,0);
        
        this.rotVector=new PointClass(0,0,0);       // for mesh movement rotations
        
            // precalc some items
            
        this.precalc();
        
        Object.seal(this);
    }
    
    precalc()
    {
            // bounds

        this.xBound=new BoundClass(this.v0.x,this.v1.x);
        this.xBound.adjust(this.v2.x);
        
        this.yBound=new BoundClass(this.v0.y,this.v1.y);
        this.yBound.adjust(this.v2.y);

        this.zBound=new BoundClass(this.v0.z,this.v1.z);
        this.zBound.adjust(this.v2.z);
        
            // get triangle vectors
            // v0 is inbetween v1 and v2

	this.vct1.x=this.v1.x-this.v0.x;
	this.vct1.y=this.v1.y-this.v0.y;
	this.vct1.z=this.v1.z-this.v0.z;

	this.vct2.x=this.v2.x-this.v0.x;
	this.vct2.y=this.v2.y-this.v0.y;
	this.vct2.z=this.v2.z-this.v0.z;
    }
    
    resetFromValues(x0,y0,z0,x1,y1,z1,x2,y2,z2)
    {
        this.v0.setFromValues(x0,y0,z0);
        this.v1.setFromValues(x1,y1,z1);
        this.v2.setFromValues(x2,y2,z2);
        
        this.precalc();
    }
    
    move(pnt)
    {
        this.v0.addPoint(pnt);
        this.v1.addPoint(pnt);
        this.v2.addPoint(pnt);
        
        this.precalc();
    }
    
    rotate(rotateAngle,centerPnt)
    {
        this.rotVector.setFromSubPoint(this.v0,centerPnt);
        this.rotVector.rotate(rotateAngle);
        this.v0.setFromAddPoint(centerPnt,this.rotVector);
        
        this.rotVector.setFromSubPoint(this.v1,centerPnt);
        this.rotVector.rotate(rotateAngle);
        this.v1.setFromAddPoint(centerPnt,this.rotVector);

        this.rotVector.setFromSubPoint(this.v2,centerPnt);
        this.rotVector.rotate(rotateAngle);
        this.v2.setFromAddPoint(centerPnt,this.rotVector);
        
        this.precalc();
    }
    
    overlapBounds(xLapBound,yLapBound,zLapBound)
    {
        if (this.xBound.min>=xLapBound.max) return(false);
        if (this.xBound.max<=xLapBound.min) return(false);
        if (this.yBound.min>=yLapBound.max) return(false);
        if (this.yBound.max<=yLapBound.min) return(false);
        if (this.zBound.min>=zLapBound.max) return(false);
        return(!(this.zBound.max<=zLapBound.min));
    }
    
    getReflectionVector(vector)
    {
        if (this.v0.distance(this.v1)>this.v0.distance(this.v2)) {
            vector.setFromSubPoint(this.v0,this.v1);
        }
        else {
            vector.setFromSubPoint(this.v0,this.v2);
        }
    }
    
    rayTrace(pnt,rayVct,hitPnt)
    {
	let det,invDet,t,u,v;
        
            // calculate the cross product and
            // then the inner product to get the
            // determinate
		
	this.perpVector.x=(rayVct.y*this.vct2.z)-(this.vct2.y*rayVct.z);
	this.perpVector.y=(rayVct.z*this.vct2.x)-(this.vct2.z*rayVct.x);
	this.perpVector.z=(rayVct.x*this.vct2.y)-(this.vct2.x*rayVct.y);

	det=(this.vct1.x*this.perpVector.x)+(this.vct1.y*this.perpVector.y)+(this.vct1.z*this.perpVector.z);
	
		// is line on the same plane as triangle?
		
	if ((det>-0.00001) && (det<0.00001)) return(false);

		// get the inverse determinate

	invDet=1.0/det;

		// calculate triangle U and test
		// using the vector from spt to tpt_0
		// and the inner product of that result and
		// the perpVector
		
	this.lineToTrigPointVector.x=pnt.x-this.v0.x;
	this.lineToTrigPointVector.y=pnt.y-this.v0.y;
	this.lineToTrigPointVector.z=pnt.z-this.v0.z;

	u=invDet*((this.lineToTrigPointVector.x*this.perpVector.x)+(this.lineToTrigPointVector.y*this.perpVector.y)+(this.lineToTrigPointVector.z*this.perpVector.z));
	if ((u<0.0) || (u>1.0)) return(false);
	
		// calculate triangle V and test
		// using the cross product of lineToTrigPointVector
		// and vct1 and the inner product of that result and rayVct

	this.lineToTrigPerpVector.x=(this.lineToTrigPointVector.y*this.vct1.z)-(this.vct1.y*this.lineToTrigPointVector.z);
	this.lineToTrigPerpVector.y=(this.lineToTrigPointVector.z*this.vct1.x)-(this.vct1.z*this.lineToTrigPointVector.x);
	this.lineToTrigPerpVector.z=(this.lineToTrigPointVector.x*this.vct1.y)-(this.vct1.x*this.lineToTrigPointVector.y);
	
	v=invDet*((rayVct.x*this.lineToTrigPerpVector.x)+(rayVct.y*this.lineToTrigPerpVector.y)+(rayVct.z*this.lineToTrigPerpVector.z));
	if ((v<0.0) || ((u+v)>1.0)) return(false);
	
		// get line T for point(t) =  start_point + (vector*t)
		// use the inner product of vct2 and lineToTrigPerpVector
		// -t are on the negative vector behind the point, so ignore

	t=invDet*((this.vct2.x*this.lineToTrigPerpVector.x)+(this.vct2.y*this.lineToTrigPerpVector.y)+(this.vct2.z*this.lineToTrigPerpVector.z));
	if (t<0.0) return(false);
	
            // get point on line of intersection
		
	hitPnt.x=pnt.x+(rayVct.x*t);
	hitPnt.y=pnt.y+(rayVct.y*t);
	hitPnt.z=pnt.z+(rayVct.z*t);
		
	return(true);
    }

}
