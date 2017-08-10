export default class wsPlane
{
    constructor(a,b,c,d)
    {
        this.a=a;
        this.b=b;
        this.c=c;
        this.d=d;
        
        Object.seal(this);
    }
    
    normalize()
    {
        let f=Math.sqrt((this.a*this.a)+(this.b*this.b)+(this.c*this.c));
        if (f===0.0) return;
        this.a/=f;
        this.b/=f;
        this.c/=f;
        this.d/=f;
    }
    
    boundBoxOutsidePlane(xBound,yBound,zBound)
    {
        if (((this.a*xBound.min)+(this.b*yBound.min)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.min)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.max)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.max)+(this.c*zBound.min)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.min)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.min)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.min)+(this.b*yBound.max)+(this.c*zBound.max)+this.d)>0.0) return(true);
		if (((this.a*xBound.max)+(this.b*yBound.max)+(this.c*zBound.max)+this.d)>0.0) return(true);
        
        return(false);
    }
}
