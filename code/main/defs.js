"use strict";

/* class testing
class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.yup=1.2345;
        }
        toString() {
            return '(' + this.x + ', ' + this.y + ')';
        }
        static get staticYup()
        {
            return('static yup');
        }
    }
    
    var testPt=new Point(5,6);
    var testPt2=new Point(1,2);
    console.log(testPt.toString());
    console.log(testPt.x);  // shouldn't be legal
    console.log(testPt.yup);
    testPt.yup=5.4321;
    console.log(testPt.yup);
    console.log(testPt2.yup);
    console.log(Point.staticYup);
*/
 
//
// points and rects objects
//

function wsPoint(x,y,z)
{
    this.x=x;
    this.y=y;
    this.z=z;
    
    this.set=function(xSet,ySet,zSet)
    {
        this.x=xSet;
        this.y=ySet;
        this.z=zSet;
    };
    
    this.setFromPoint=function(pt)
    {
        this.x=pt.x;
        this.y=pt.y;
        this.z=pt.z;
    };
    
    this.setFromAddPoint=function(pt1,pt2)
    {
        this.x=pt1.x+pt2.x;
        this.y=pt1.y+pt2.y;
        this.z=pt1.z+pt2.z;
    };
    
    this.setFromSubPoint=function(pt1,pt2)
    {
        this.x=pt1.x-pt2.x;
        this.y=pt1.y-pt2.y;
        this.z=pt1.z-pt2.z;
    };
    
    this.setFromCross=function(pt1,pt2)
    {
        this.x=pt1.x;
        this.y=pt1.y;
        this.z=pt1.z;
        this.cross(pt2);
    };
    
    this.setFromScale=function(pt,f)
    {
        this.x=pt.x*f;
        this.y=pt.y*f;
        this.z=pt.z*f;
    };
                
    this.move=function(xAdd,yAdd,zAdd)
    {
        this.x+=xAdd;
        this.y+=yAdd;
        this.z+=zAdd;
    };
    
    this.addPoint=function(pt)
    {
        this.x+=pt.x;
        this.y+=pt.y;
        this.z+=pt.z;
    };
    
    this.subPoint=function(pt)
    {
        this.x-=pt.x;
        this.y-=pt.y;
        this.z-=pt.z;
    };
    
    this.tween=function(pt1,pt2,factor)
    {
        this.x=pt1.x+(pt2.x-pt1.x)*factor;
        this.y=pt1.y+(pt2.y-pt1.y)*factor;
        this.z=pt1.z+(pt2.z-pt1.z)*factor;
    };
    
    this.equals=function(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y)&&(this.z===pt.z));
    };
    
    this.rotateX=function(centerPt,rotX)
    {
        if (centerPt!==null) {
            this.y-=centerPt.y;
            this.z-=centerPt.z;
        }
        
        var rd=rotX*DEGREE_TO_RAD;
        var sn=Math.sin(rd);
        var cs=Math.cos(rd);
        
        var y=(this.y*cs)-(this.z*sn);
        var z=(this.y*sn)+(this.z*cs);

        if (centerPt!==null) {
            y+=centerPt.y;
            z+=centerPt.z;
        }
        
        this.y=y;
        this.z=z;
    };
    
    this.rotateY=function(centerPt,rotY)
    {
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.z-=centerPt.z;
        }
        
        var rd=rotY*DEGREE_TO_RAD;
        var sn=Math.sin(rd);
        var cs=Math.cos(rd);
        
        var x=(this.z*sn)+(this.x*cs);
        var z=(this.z*cs)-(this.x*sn);

        if (centerPt!==null) {
            x+=centerPt.x;
            z+=centerPt.z;
        }
        
        this.x=x;
        this.z=z;
    };
    
    this.rotateZ=function(centerPt,rotZ)
    {
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        var rd=rotZ*DEGREE_TO_RAD;
        var sn=Math.sin(rd);
        var cs=Math.cos(rd);
        
        var x=(this.x*cs)-(this.y*sn);
        var y=(this.x*sn)+(this.y*cs);
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=x;
        this.y=y;
    };
    
    this.rotate=function(ang)
    {
        var rd,sn,cs,x,y,z;
        
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
    };
      
    this.rotateAroundPoint=function(centerPt,ang)
    {
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
            this.z-=centerPt.z;
        }
        
        var rd,sn,cs,x,y,z;
        
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
            x+=centerPt.x;
            y+=centerPt.y;
            z+=centerPt.z;
        }
    };
                
    this.noSquareDistance=function(pt)
    {
        var px=this.x-pt.x;
        var py=this.y-pt.y;
        var pz=this.z-pt.z;
        return((px*px)+(py*py)+(pz*pz));
    };
                
    this.noSquareDistanceByTriplet=function(kx,ky,kz)
    {
        var px=this.x-kx;
        var py=this.y-ky;
        var pz=this.z-kz;
        return((px*px)+(py*py)+(pz*pz));
    };
    
    this.distance=function(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    };
                
    this.distanceByTriplet=function(kx,ky,kz)
    {
        return(Math.sqrt(this.noSquareDistanceByTriplet(kx,ky,kz)));
    };
    
    this.normalize=function()
    {
        var f=Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
        this.z*=f;
    };
    
    this.dot=function(pt)
    {
        return((this.x*pt.x)+(this.y*pt.y)+(this.z*pt.z));
    };

    this.cross=function(pt)
    {
        var x=(this.y*pt.z)-(this.z*pt.y);
        var y=(this.z*pt.x)-(this.x*pt.z);
        var z=(this.x*pt.y)-(this.y*pt.x);
        this.x=x;
        this.y=y;
        this.z=z;
    };
    
    this.scale=function(f)
    {
        this.x*=f;
        this.y*=f;
        this.z*=f;
    };
    
    this.matrixMultiply=function(mat)
    {
        var mx=(this.x*mat[0])+(this.y*mat[4])+(this.z*mat[8])+mat[12];
        var my=(this.x*mat[1])+(this.y*mat[5])+(this.z*mat[9])+mat[13];
        var mz=(this.x*mat[2])+(this.y*mat[6])+(this.z*mat[10])+mat[14];
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    };
    
    this.matrixMultiplyIgnoreTransform=function(mat)
    {
        var mx=(this.x*mat[0])+(this.y*mat[4])+(this.z*mat[8]);
        var my=(this.x*mat[1])+(this.y*mat[5])+(this.z*mat[9]);
        var mz=(this.x*mat[2])+(this.y*mat[6])+(this.z*mat[10]);
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    };
    
    this.copy=function()
    {
        return(new wsPoint(this.x,this.y,this.z));
    };
}

function ws2DPoint(x,y)
{
    this.x=x;
    this.y=y;
    
    this.set=function(xSet,ySet)
    {
        this.x=xSet;
        this.y=ySet;
    };
                
    this.move=function(xAdd,yAdd)
    {
        this.x+=xAdd;
        this.y+=yAdd;
    };
    
    this.noSquareDistance=function(pt)
    {
        var px=this.x-pt.x;
        var py=this.y-pt.y;
        return((px*px)+(py*py));
    };
                
    this.distance=function(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    };
    
    this.equals=function(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y));
    };
    
    this.rotate=function(centerPt,rot)
    {
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        var rd=rot*DEGREE_TO_RAD;
        
        var x=(this.y*Math.sin(rd))+(this.x*Math.cos(rd));
        var y=(this.y*Math.cos(rd))-(this.x*Math.sin(rd));
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=x;
        this.y=y;
    };
    
    this.copy=function()
    {
        return(new ws2DPoint(this.x,this.y));
    };
}

function ws2DIntPoint(x,y)
{
    this.x=Math.floor(x);
    this.y=Math.floor(y);
    
    this.set=function(xSet,ySet)
    {
        this.x=Math.floor(xSet);
        this.y=Math.floor(ySet);
    };
                
    this.move=function(xAdd,yAdd)
    {
        this.x+=xAdd;
        this.y+=yAdd;
    };
    
    this.noSquareDistance=function(pt)
    {
        var px=this.x-pt.x;
        var py=this.y-pt.y;
        return((px*px)+(py*py));
    };
                
    this.distance=function(pt)
    {
        return(Math.sqrt(this.noSquareDistance(pt)));
    };
    
    this.equals=function(pt)
    {
        return((this.x===pt.x)&&(this.y===pt.y));
    };
    
    this.rotate=function(centerPt,rot)
    {
        if (centerPt!==null) {
            this.x-=centerPt.x;
            this.y-=centerPt.y;
        }
        
        var rd=rot*DEGREE_TO_RAD;
        
        var x=(this.y*Math.sin(rd))+(this.x*Math.cos(rd));
        var y=(this.y*Math.cos(rd))-(this.x*Math.sin(rd));
        
        if (centerPt!==null) {
            x+=centerPt.x;
            y+=centerPt.y;
        }
        
        this.x=Math.floor(x);
        this.y=Math.floor(y);
    };
    
    this.copy=function()
    {
        return(new ws2DIntPoint(this.x,this.y));
    };
}

function wsAngle(x,y,z)
{
    this.x=x;
    this.y=y;
    this.z=z;
    
    this.set=function(xSet,ySet,zSet)
    {
        this.x=xSet;
        this.y=ySet;
        this.z=zSet;
    };
    
    this.setFromAngle=function(ang)
    {
        this.x=ang.x;
        this.y=ang.y;
        this.z=ang.z;
    };
                
    this.copy=function()
    {
        return(new wsAngle(this.x,this.y,this.z));
    };
}

function wsLine(p1,p2)
{
    this.p1=p1;
    this.p2=p2;
    
    this.setPoint1=function(p1)
    {
        this.p1=p1;
    };
    
    this.setPoint2=function(p2)
    {
        this.p2=p2;
    };
    
    this.equals=function(line)
    {
        if ((this.p1.equals(line.p1)) && (this.p2.equals(line.p2))) return(true);
        return((this.p1.equals(line.p2)) && (this.p2.equals(line.p1)));
    };
    
    this.getXBound=function()
    {
        return(new wsBound(p1.x,p2.x));
    };
    
    this.getYBound=function()
    {
        return(new wsBound(p1.y,p2.y));
    };
    
    this.getZBound=function()
    {
        return(new wsBound(p1.z,p2.z));
    };
}

function ws2DLine(p1,p2)
{
    this.p1=p1;
    this.p2=p2;
    
    this.setPoint1=function(p1)
    {
        this.p1=p1;
    };
    
    this.setPoint2=function(p2)
    {
        this.p2=p2;
    };
    
    this.equals=function(line)
    {
        if ((this.p1.equals(line.p1)) && (this.p2.equals(line.p2))) return(true);
        return((this.p1.equals(line.p2)) && (this.p2.equals(line.p1)));
    };
    
    this.getXBound=function()
    {
        return(new wsBound(p1.x,p2.x));
    };
    
    this.getYBound=function()
    {
        return(new wsBound(p1.y,p2.y));
    };
}

function wsBound(value1,value2)
{
    if (value1<value2) {
        this.min=value1;
        this.max=value2;
    }
    else {
        this.min=value2;
        this.max=value1;
    }
    
    this.add=function(addValue)
    {
        this.min+=addValue;
        this.max+=addValue;
    };
                
    this.getMidPoint=function()
    {
        return((this.max+this.min)/2);
    };
                
    this.getSize=function()
    {
        return(this.max-this.min);
    };
                
    this.adjust=function(value)
    {
        if (value<this.min) this.min=value;
        if (value>this.max) this.max=value;
    };
    
    this.forceMinSize=function(value)
    {
        if (this.getSize()<value) {
            var mid=this.getMidPoint();
            this.min=mid-value;
            this.max=mid+value;
        }
    };
                
    this.copy=function()
    {
        return(new wsBound(this.min,this.max));
    };
}

function wsRect(lft,top,rgt,bot)
{
    this.lft=lft;
    this.top=top;
    this.rgt=rgt;
    this.bot=bot;
    
    this.overlap=function(rect)
    {
        if (this.lft>=rect.rgt) return(false);
        if (this.rgt<=rect.lft) return(false);
        if (this.top>=rect.bot) return(false);
        return(!(this.bot<=rect.top));
    };
    
    this.pointIn=function(x,y)
    {
        return((x>=this.lft) && (x<this.rgt) && (y>=this.top) && (y<this.bot));     
    };
    
    this.move=function(x,y)
    {
        this.lft+=x;
        this.rgt+=x;
        this.top+=y;
        this.bot+=y;
    };
                
    this.copy=function()
    {
        return(new wsRect(this.lft,this.top,this.rgt,this.bot));
    };
}

function wsCollisionRect(lft,top,rgt,bot,y)
{
    this.lft=lft;
    this.top=top;
    this.rgt=rgt;
    this.bot=bot;
    this.y=y;
    
    this.equals=function(cRect)
    {
        if (this.lft!==cRect.lft) return(false);
        if (this.top!==cRect.top) return(false);
        if (this.rgt!==cRect.rgt) return(false);
        if (this.bot!==cRect.bot) return(false);
        return(this.y===cRect.y);
    };
    
    this.overlapBounds=function(xBound,yBound,zBound)
    {
        if (this.y<yBound.min) return(false);
        if (this.y>yBound.max) return(false);
        if (this.lft>=xBound.max) return(false);
        if (this.rgt<=xBound.min) return(false);
        if (this.top>=zBound.max) return(false);
        return(!(this.bot<=zBound.min));
    };
}

function wsPlane(a,b,c,d)
{
    this.a=a;
    this.b=b;
    this.c=c;
    this.d=d;
    
    this.normalize=function()
    {
        var f=Math.sqrt((this.a*this.a)+(this.b*this.b)+(this.c*this.c));
        if (f===0.0) return;
        this.a/=f;
        this.b/=f;
        this.c/=f;
        this.d/=f;
    };
    
    this.boundBoxOutsidePlane=function(xBound,yBound,zBound)
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
    };
}

//
// colors
//

function wsColor(r,g,b)
{
    this.r=r;
    this.g=g;
    this.b=b;
    
    this.set=function(r,g,b)
    {
        this.r=r;
        this.g=g;
        this.b=b;
    };
                
    this.add=function(col)
    {
        this.r+=col.r;
        this.g+=col.g;
        this.b+=col.b;
    };
    
    this.attenuate=function(att)
    {
        return(new wsColor((this.r*att),(this.g*att),(this.b*att)));
    };
                
    this.fixOverflow=function()
    {
        var f;
        
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
    };
}
