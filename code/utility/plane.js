export default class PlaneClass
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
    
    boundBoxOutsidePlane(xBound,yBound,zBound,translationPnt)
    {
        let xMin,yMin,zMin;
        let xMax,yMax,zMax;

        if (translationPnt===null) {
            xMin=xBound.min;
            yMin=yBound.min;
            zMin=zBound.min;

            xMax=xBound.max;
            yMax=yBound.max;
            zMax=zBound.max;
        }
        else {
            xMin=xBound.min+translationPnt.x;
            yMin=yBound.min+translationPnt.y;
            zMin=zBound.min+translationPnt.z;

            xMax=xBound.max+translationPnt.x;
            yMax=yBound.max+translationPnt.y;
            zMax=zBound.max+translationPnt.z;
        }
        
        if (((this.a*xMin)+(this.b*yMin)+(this.c*zMin)+this.d)>0.0) return(true);
		if (((this.a*xMax)+(this.b*yMin)+(this.c*zMin)+this.d)>0.0) return(true);
		if (((this.a*xMin)+(this.b*yMax)+(this.c*zMin)+this.d)>0.0) return(true);
		if (((this.a*xMax)+(this.b*yMax)+(this.c*zMin)+this.d)>0.0) return(true);
		if (((this.a*xMin)+(this.b*yMin)+(this.c*zMax)+this.d)>0.0) return(true);
		if (((this.a*xMax)+(this.b*yMin)+(this.c*zMax)+this.d)>0.0) return(true);
		if (((this.a*xMin)+(this.b*yMax)+(this.c*zMax)+this.d)>0.0) return(true);
		if (((this.a*xMax)+(this.b*yMax)+(this.c*zMax)+this.d)>0.0) return(true);
        
        return(false);
    }
}
