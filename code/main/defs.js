"use strict";

//
// some math constants
//

const DEGREE_TO_RAD=Math.PI/180.0;
const RAD_TO_DEGREE=180.0/Math.PI;

//
// utility classes
//

class wsPoint
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

class ws2DPoint
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
        return(new ws2DPoint(this.x,this.y));
    }
}

class ws2DIntPoint
{
    constructor(x,y)
    {
        this.x=Math.trunc(x);
        this.y=Math.trunc(y);
        
        Object.seal(this);
    }
    
    setFromValues(xSet,ySet)
    {
        this.x=Math.trunc(xSet);
        this.y=Math.trunc(ySet);
    }
                
    addValues(xAdd,yAdd)
    {
        this.x=Math.trunc(this.x+xAdd);
        this.y=Math.trunc(this.y+yAdd);
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
        
        this.x=Math.trunc(x);
        this.y=Math.trunc(y);
    }
    
    copy()
    {
        return(new ws2DIntPoint(this.x,this.y));
    }
}

class wsLine
{
    constructor(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
        
        this.xBound=new wsBound(0,0);   // cached to avoid GC
        this.yBound=new wsBound(0,0);
        this.zBound=new wsBound(0,0);
        
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

class ws2DLine
{
    constructor(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
        
        this.xBound=new wsBound(0,0);   // cached to avoid GC
        this.yBound=new wsBound(0,0);
        
        Object.seal(this);
    }
    
    setFromValues(p1,p2)
    {
        this.p1=p1;
        this.p2=p2;
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
}

class wsBound
{
    constructor(value1,value2)
    {
        if (value1<value2) {
            this.min=value1;
            this.max=value2;
        }
        else {
            this.min=value2;
            this.max=value1;
        }
        
        Object.seal(this);
    }
    
    setFromValues(value1,value2)
    {
        if (value1<value2) {
            this.min=value1;
            this.max=value2;
        }
        else {
            this.min=value2;
            this.max=value1;
        }
    }
    
    add(addValue)
    {
        this.min+=addValue;
        this.max+=addValue;
    }
                
    getMidPoint()
    {
        return((this.max+this.min)/2);
    }
                
    getSize()
    {
        return(Math.trunc(this.max-this.min));
    }
                
    adjust(value)
    {
        if (value<this.min) this.min=value;
        if (value>this.max) this.max=value;
    }
    
    copy()
    {
        return(new wsBound(this.min,this.max));
    }
}

class wsRect
{
    constructor(lft,top,rgt,bot)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
        
        Object.seal(this);
    }
    
    setFromValues(lft,top,rgt,bot)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
    }
    
    overlap(rect)
    {
        if (this.lft>=rect.rgt) return(false);
        if (this.rgt<=rect.lft) return(false);
        if (this.top>=rect.bot) return(false);
        return(!(this.bot<=rect.top));
    }
    
    pointIn(x,y)
    {
        return((x>=this.lft) && (x<this.rgt) && (y>=this.top) && (y<this.bot));     
    }
    
    move(x,y)
    {
        this.lft+=x;
        this.rgt+=x;
        this.top+=y;
        this.bot+=y;
    }
                
    copy()
    {
        return(new wsRect(this.lft,this.top,this.rgt,this.bot));
    }
}

class wsCollisionRect
{
    constructor(lft,top,rgt,bot,y)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
        this.y=y;
        
        Object.seal(this);
    }
    
    addPoint(pnt)
    {
        this.lft+=pnt.x;
        this.rgt+=pnt.x;
        this.top+=pnt.z;
        this.bot+=pnt.z;
        this.y+=pnt.y;
    }
    
    equals(cRect)
    {
        if (this.lft!==cRect.lft) return(false);
        if (this.top!==cRect.top) return(false);
        if (this.rgt!==cRect.rgt) return(false);
        if (this.bot!==cRect.bot) return(false);
        return(this.y===cRect.y);
    }
    
    overlapBounds(xBound,yBound,zBound)
    {
        if (this.y<yBound.min) return(false);
        if (this.y>yBound.max) return(false);
        if (this.lft>=xBound.max) return(false);
        if (this.rgt<=xBound.min) return(false);
        if (this.top>=zBound.max) return(false);
        return(!(this.bot<=zBound.min));
    }
}

class wsPlane
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

//
// colors
//

class wsColor
{
    constructor(r,g,b)
    {
        this.r=r;
        this.g=g;
        this.b=b;
        
        Object.seal(this);
    }
    
    setFromValues(r,g,b)
    {
        this.r=r;
        this.g=g;
        this.b=b;
    }
                
    add(col)
    {
        this.r+=col.r;
        this.g+=col.g;
        this.b+=col.b;
    }
    
    addFromValues(r,g,b)
    {
        this.r+=r;
        this.g+=g;
        this.b+=b;
    }
    
    addAttenuate(col,att)
    {
        this.r+=(col.r*att);
        this.g+=(col.g*att);
        this.b+=(col.b*att);
    }
                
    fixOverflow()
    {
        let f;
        
            // find the largest overflow
            // and reduce that to 1 so we don't
            // end up clipping to white all the time
            
        if ((this.r>this.g) && (this.r>this.b)) {
            if (this.r>1.0) {
                f=this.r-1.0;
                this.g-=f;
                this.b-=f;
                this.r=1.0;
            }
        }
        else {
            if (this.g>this.b) {
                if (this.g>1.0) {
                    f=this.g-1.0;
                    this.r-=f;
                    this.b-=f;
                    this.g=1.0;
                }
            }
            else {
                if (this.b>1.0) {
                    f=this.b-1.0;
                    this.r-=f;
                    this.g-=f;
                    this.b=1.0;
                }
            }
        }
        
            // clip to black

        if (this.r<0.0) this.r=0.0;
        if (this.g<0.0) this.g=0.0;
        if (this.b<0.0) this.b=0.0;
    }
}

//
// grid
//

class wsGrid
{
    constructor(xSize,zSize)
    {
        this.xSize=xSize;
        this.zSize=zSize;
        
        this.grid=new Uint8Array(xSize*zSize);
        
        Object.seal(this);
    }
    
    setCell(x,z,value)
    {
        this.grid[(z*this.xSize)+x]=value;
    }
    
    getCell(x,z)
    {
        return(this.grid[(z*this.xSize)+x]);
    }
    
    setCellAll(value)
    {
        let n;
        let cellSize=this.xSize*this.zSize;
        
        for (n=0;n!==cellSize;n++) {
            this.grid[n]=value;
        }
    }
    
    copy()
    {
        let copyGrid=new wsGrid(this.xSize,this.zSize);
        
        let n;
        let cellSize=this.xSize*this.zSize;
        
        for (n=0;n!==cellSize;n++) {
            copyGrid.grid[n]=this.grid[n];
        }
        
        return(copyGrid);
    }

}
