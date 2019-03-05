import BoundClass from '../utility/bound.js';

export default class CollisionLineClass
{
    constructor(x0,z0,x1,z1,yBound)
    {
        this.x0=x0;
        this.z0=z0;
        this.x1=x1;
        this.z1=z1;
        this.yBound=yBound;
        
        this.xBound=new BoundClass(x0,x1);
        this.zBound=new BoundClass(z0,z1);
        
        Object.seal(this);
    }
    
    addPoint(pnt)
    {
        this.x0+=pnt.x;
        this.x1+=pnt.x;
        this.z0+=pnt.z;
        this.z1+=pnt.z;
        
        this.xBound.add(pnt.x);
        this.yBound.add(pnt.y);
        this.zBound.add(pnt.z);
    }
    
    equals(collisionLine)
    {
        if ((this.yBound.min!==collisionLine.yBound.min) || (this.yBound.max!==collisionLine.yBound.max)) return(false);
        if ((this.x0===collisionLine.x0) && (this.x1===collisionLine.x1) && (this.z0===collisionLine.z0) && (this.z1===collisionLine.z1)) return(true);
        return((this.x0===collisionLine.x1) && (this.x1===collisionLine.x0) && (this.z0===collisionLine.z1) && (this.z1===collisionLine.z0));
    }
    
    boxBoundCollisionPlusStandOn(xBound,yBound,zBound)
    {
        if ((this.p1.x<xBound.min) && (this.p2.x<xBound.min)) return(false);
        if ((this.p1.x>xBound.max) && (this.p2.x>xBound.max)) return(false);
        if ((this.p1.y<yBound.min) && (this.p2.y<yBound.min)) return(false);
        if ((this.p1.y>yBound.max) && (this.p2.y>yBound.max)) return(false);
        if ((this.p1.z<zBound.min) && (this.p2.z<zBound.min)) return(false);
        return(!((this.p1.z>zBound.max) && (this.p2.z>zBound.max)));
    }
}
