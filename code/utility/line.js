import BoundClass from '../../code/utility/bound.js';

export default class LineClass
{
    constructor(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
        
        this.xBound=new BoundClass(0,0);   // cached to avoid GC
        this.yBound=new BoundClass(0,0);
        this.zBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    setFromValues(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
    }
    
    addPoint(pnt)
    {
        this.p1.addPoint(pnt);
        this.p2.addPoint(pnt);
    }
    
    equals(line)
    {
        if ((this.p1.equals(line.p1)) && (this.p2.equals(line.p2))) return(true);
        return((this.p1.equals(line.p2)) && (this.p2.equals(line.p1)));
    }
    
    getXBound()
    {
        this.xBound.setFromValues(this.p1.x,this.p2.x);     // these can be dangerous but CG is worse
        return(this.xBound);
    }
    
    getYBound()
    {
        this.yBound.setFromValues(this.p1.y,this.p2.y);
        return(this.yBound);
    }
    
    getZBound()
    {
        this.zBound.setFromValues(this.p1.z,this.p2.z);
        return(this.zBound);
    }
}
