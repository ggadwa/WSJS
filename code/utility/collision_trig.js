import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';

export default class CollisionTrigClass
{
    constructor(v0,v1,v2)
    {
        this.v0=v0;
        this.v1=v1;
        this.v2=v2;
        
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
        this.hitPoint=new PointClass(0,0,0);
        
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
    
    addPoint(pnt)
    {
        this.v0.addPoint(pnt);
        this.v1.addPoint(pnt);
        this.v2.addPoint(pnt);
        
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
    
    rayTrace(pnt,rayVct)
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
		
	if ((det>-0.00001) && (det<0.00001)) return(null);

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
	if ((u<0.0) || (u>1.0)) return(null);
	
		// calculate triangle V and test
		// using the cross product of lineToTrigPointVector
		// and vct1 and the inner product of that result and rayVct

	this.lineToTrigPerpVector.x=(this.lineToTrigPointVector.y*this.vct1.z)-(this.vct1.y*this.lineToTrigPointVector.z);
	this.lineToTrigPerpVector.y=(this.lineToTrigPointVector.z*this.vct1.x)-(this.vct1.z*this.lineToTrigPointVector.x);
	this.lineToTrigPerpVector.z=(this.lineToTrigPointVector.x*this.vct1.y)-(this.vct1.x*this.lineToTrigPointVector.y);
	
	v=invDet*((rayVct.x*this.lineToTrigPerpVector.x)+(rayVct.y*this.lineToTrigPerpVector.y)+(rayVct.z*this.lineToTrigPerpVector.z));
	if ((v<0.0) || ((u+v)>1.0)) return(null);
	
		// get line T for point(t) =  start_point + (vector*t)
		// use the inner product of vct2 and lineToTrigPerpVector
		// -t are on the negative vector behind the point, so ignore

	t=invDet*((this.vct2.x*this.lineToTrigPerpVector.x)+(this.vct2.y*this.lineToTrigPerpVector.y)+(this.vct2.z*this.lineToTrigPerpVector.z));
	if (t<0.0) return(null);
	
		// get point on line of intersection
		
	this.hitPoint.x=pnt.x+(rayVct.x*t);
	this.hitPoint.y=pnt.y+(rayVct.y*t);
	this.hitPoint.z=pnt.z+(rayVct.z*t);
	
		// return hit point
		
	return(this.hitPoint);
    }

}
