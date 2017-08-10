const DEGREE_TO_RAD=Math.PI/180.0;
const RAD_TO_DEGREE=180.0/Math.PI;

export default class wsPoint
{
    constructor(x,y,z)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        
        Object.seal(this);
    }
    
    setFromValues(xSet,ySet,zSet)
    {
        this.x=xSet;
        this.y=ySet;
        this.z=zSet;
    }
    
    setFromPoint(pt)
    {
        this.x=pt.x;
        this.y=pt.y;
        this.z=pt.z;
    }
    
    setFromAddPoint(pt1,pt2)
    {
        this.x=pt1.x+pt2.x;
        this.y=pt1.y+pt2.y;
        this.z=pt1.z+pt2.z;
    }
    
    setFromSubPoint(pt1,pt2)
    {
        this.x=pt1.x-pt2.x;
        this.y=pt1.y-pt2.y;
        this.z=pt1.z-pt2.z;
    }
    
    setFromCross(pt1,pt2)
    {
        this.x=pt1.x;
        this.y=pt1.y;
        this.z=pt1.z;
        this.cross(pt2);
    }
    
    setFromScale(pt,f)
    {
        this.x=pt.x*f;
        this.y=pt.y*f;
        this.z=pt.z*f;
    }
    
    trunc()
    {
        this.x=Math.trunc(this.x);
        this.y=Math.trunc(this.y);
        this.z=Math.trunc(this.z);
    }
    
    addValues(xAdd,yAdd,zAdd)
    {
        this.x+=xAdd;
        this.y+=yAdd;
        this.z+=zAdd;
    }
    
    addValuesTrunc(xAdd,yAdd,zAdd)
    {
        this.x=Math.trunc(this.x+xAdd);
        this.y=Math.trunc(this.y+yAdd);
        this.z=Math.trunc(this.z+zAdd);
    }
   
    addPoint(pt)
    {
        this.x+=pt.x;
        this.y+=pt.y;
        this.z+=pt.z;
    }
    
    addPointTrunc(pt)
    {
        this.x=Math.trunc(this.x+pt.x);
        this.y=Math.trunc(this.y+pt.y);
        this.z=Math.trunc(this.z+pt.z);
    }
    
    
    subPoint(pt)
    {
        this.x-=pt.x;
        this.y-=pt.y;
        this.z-=pt.z;
    }
    
    tween(pt1,pt2,factor)
    {
        this.x=pt1.x+(pt2.x-pt1.x)*factor;
        this.y=pt1.y+(pt2.y-pt1.y)*factor;
        this.z=pt1.z+(pt2.z-pt1.z)*factor;
    }
    
    average(pt)
    {
        this.x=(this.x+pt.x)*0.5;
        this.y=(this.y+pt.y)*0.5;
        this.z=(this.z+pt.z)*0.5;
    }
    
    equals(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y)&&(this.z===pt.z));
    }
    
    truncEquals(pt)
    {
        return((Math.trunc(this.x)===Math.trunc(pt.x))&&(Math.trunc(this.y)===Math.trunc(pt.y))&&(Math.trunc(this.z)===Math.trunc(pt.z)));
    }
    
    rotateX(centerPt,rotX)
    {
        let rd,sn,cs,y,z;
        
        if (centerPt!==null) {
            this.y-=centerPt.y;
            this.z-=centerPt.z;
        }
        
        rd=rotX*DEGREE_TO_RAD;
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        y=(this.y*cs)-(this.z*sn);
        z=(this.y*sn)+(this.z*cs);

        if (centerPt!==null) {
            y+=centerPt.y;
            z+=centerPt.z;
        }
        
        this.y=y;
        this.z=z;
    }
    
    rotateY(centerPt,rotY)
    {
        let rd,sn,cs,x,z;
        
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.z-=centerPt.z;
        }
        
        rd=rotY*DEGREE_TO_RAD;
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        x=(this.z*sn)+(this.x*cs);
        z=(this.z*cs)-(this.x*sn);

        if (centerPt!==null) {
            x+=centerPt.x;
            z+=centerPt.z;
        }
        
        this.x=x;
        this.z=z;
    }
    
    rotateZ(centerPt,rotZ)
    {
        let rd,sn,cs,x,y;
        
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        rd=rotZ*DEGREE_TO_RAD;
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        x=(this.x*cs)-(this.y*sn);
        y=(this.x*sn)+(this.y*cs);
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=x;
        this.y=y;
    }
    
    rotate(ang)
    {
        let rd,sn,cs,x,y,z;
        
            // rotate X
        
        if (ang.x!==0.0) {
            rd=ang.x*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            y=(this.y*cs)-(this.z*sn);
            z=(this.y*sn)+(this.z*cs);

            this.y=y;
            this.z=z;
        }
        
            // rotate Y
        
        if (ang.y!==0.0) {
            rd=ang.y*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.z*sn)+(this.x*cs);
            z=(this.z*cs)-(this.x*sn);

            this.x=x;
            this.z=z;
        }
        
            // rotate Z
        
        if (ang.z!==0.0) {
            rd=ang.z*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.x*cs)-(this.y*sn);
            y=(this.x*sn)+(this.y*cs);

            this.x=x;
            this.y=y;
        }
    }
      
    rotateAroundPoint(centerPt,ang)
    {
        let rd,sn,cs,x,y,z;
        
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
            this.z-=centerPt.z;
        }
        
            // rotate X
        
        if (ang.x!==0.0) {
            rd=ang.x*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            y=(this.y*cs)-(this.z*sn);
            z=(this.y*sn)+(this.z*cs);

            this.y=y;
            this.z=z;
        }
        
            // rotate Y
        
        if (ang.y!==0.0) {
            rd=ang.y*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.z*sn)+(this.x*cs);
            z=(this.z*cs)-(this.x*sn);

            this.x=x;
            this.z=z;
        }
        
            // rotate Z
        
        if (ang.z!==0.0) {
            rd=ang.z*DEGREE_TO_RAD;
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.x*cs)-(this.y*sn);
            y=(this.x*sn)+(this.y*cs);

            this.x=x;
            this.y=y;
        }
        
        if (centerPt!==null) {
            this.x+=centerPt.x;
            this.y+=centerPt.y;
            this.z+=centerPt.z;
        }
    }
                
    noSquareDistance(pt)
    {
        let px=this.x-pt.x;
        let py=this.y-pt.y;
        let pz=this.z-pt.z;
        return((px*px)+(py*py)+(pz*pz));
    }
                
    noSquareDistanceByTriplet(kx,ky,kz)
    {
        let px=this.x-kx;
        let py=this.y-ky;
        let pz=this.z-kz;
        return((px*px)+(py*py)+(pz*pz));
    }
    
    distance(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    }
                
    distanceByTriplet(kx,ky,kz)
    {
        return(Math.sqrt(this.noSquareDistanceByTriplet(kx,ky,kz)));
    }
    
    distanceScrubY(pt)
    {
        let px=this.x-pt.x;
        let pz=this.z-pt.z;
        return(Math.sqrt((px*px)+(pz*pz)));
    }
    
    length()
    {
        return(Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z)));
    }
    
    normalize()
    {
        let f=Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
        this.z*=f;
    }
    
    dot(pt)
    {
        return((this.x*pt.x)+(this.y*pt.y)+(this.z*pt.z));
    }

    cross(pt)
    {
        let x=(this.y*pt.z)-(this.z*pt.y);
        let y=(this.z*pt.x)-(this.x*pt.z);
        let z=(this.x*pt.y)-(this.y*pt.x);
        this.x=x;
        this.y=y;
        this.z=z;
    }
    
    scale(f)
    {
        this.x*=f;
        this.y*=f;
        this.z*=f;
    }
    
    scaleFromPoint(pt,scale)
    {
        this.x=((this.x-pt.x)*scale.x)+pt.x;
        this.y=((this.y-pt.y)*scale.y)+pt.y;
        this.z=((this.z-pt.z)*scale.z)+pt.z;
    }
    
    matrixMultiply(mat)
    {
        let mx=(this.x*mat[0])+(this.y*mat[4])+(this.z*mat[8])+mat[12];
        let my=(this.x*mat[1])+(this.y*mat[5])+(this.z*mat[9])+mat[13];
        let mz=(this.x*mat[2])+(this.y*mat[6])+(this.z*mat[10])+mat[14];
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    }
    
    matrixMultiplyIgnoreTransform(mat)
    {
        let mx=(this.x*mat[0])+(this.y*mat[4])+(this.z*mat[8]);
        let my=(this.x*mat[1])+(this.y*mat[5])+(this.z*mat[9]);
        let mz=(this.x*mat[2])+(this.y*mat[6])+(this.z*mat[10]);
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    }
    
    angleYTo(pt)
    {
            // z is pointing up, atan2 gives us the angle to the x vector,
            // so we need the Z up vector (positive) and the vector to pt
            // then subtract them for correct angle
        
        let fang=(Math.atan2(0,100)-Math.atan2((pt.x-this.x),(pt.z-this.z)))*RAD_TO_DEGREE;
        
            // now we need to switch it up for which side the x is on
            // (if greater, the #s are 0 to -180, if positive, 180 to 0)
            
        if (this.x>pt.x) {
            fang=-fang;
        }
        else {
            fang=(180.0-fang)+180.0;
        }
        
        if (fang<0) fang=360.0+fang;
        if (fang>=360.0) fang-=360.0;
        
        return(fang);
    }
    
    angleXTo(pt)
    {
            // z is pointing up, atan2 gives us the angle to the y vector,
            // so we need the Z up vector (positive) and the vector to pt
            // then subtract them for correct angle
        
        let fang=(Math.atan2(0,100)-Math.atan2((pt.y-this.y),(pt.z-this.z)))*RAD_TO_DEGREE;
        
            // now we need to switch it up for which side the y is on
            // (if greater, the #s are 0 to -180, if positive, 180 to 0)
            
        if (this.y>pt.y) {
            fang=-fang;
        }
        else {
            fang=(180.0-fang)+180.0;
        }
        
        if (fang<0) fang=360.0+fang;
        if (fang>=360.0) fang-=360.0;
        
        return(fang);
    }
    
    copy()
    {
        return(new wsPoint(this.x,this.y,this.z));
    }
}
