const DEGREE_TO_RAD=Math.PI/180.0;
const RAD_TO_DEGREE=180.0/Math.PI;

export default class Point2DClass
{
    constructor(x,y)
    {
        this.x=x;
        this.y=y;
        
        Object.seal(this);
    }
    
    setFromValues(xSet,ySet)
    {
        this.x=xSet;
        this.y=ySet;
    }
    
    setFromPoint(pt)
    {
        this.x=pt.x;
        this.y=pt.y;
    }
                
    addValues(xAdd,yAdd)
    {
        this.x+=xAdd;
        this.y+=yAdd;
    }
    
    noSquareDistance(pt)
    {
        let px=this.x-pt.x;
        let py=this.y-pt.y;
        return((px*px)+(py*py));
    }
                
    distance(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    }
    
    equals(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y));
    }
    
    rotate(centerPt,rot)
    {
        let rd,x,y;
        
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        rd=rot*DEGREE_TO_RAD;
        
        x=(this.y*Math.sin(rd))+(this.x*Math.cos(rd));
        y=(this.y*Math.cos(rd))-(this.x*Math.sin(rd));
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=x;
        this.y=y;
    }
    
    copy()
    {
        return(new Point2DClass(this.x,this.y));
    }
}
