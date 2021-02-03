export default class PointClass
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
    
    setFromPoint(pnt)
    {
        this.x=pnt.x;
        this.y=pnt.y;
        this.z=pnt.z;
    }
    
    setFromArray(arr)
    {
        this.x=arr[0];
        this.y=arr[1];
        this.z=arr[2];
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
    
    setFromInvertPoint(pnt)
    {
        this.x=-pnt.x;
        this.y=-pnt.y;
        this.z=-pnt.z;
    }
    
    setFromCross(pt1,pt2)
    {
        this.x=pt1.x;
        this.y=pt1.y;
        this.z=pt1.z;
        this.cross(pt2);
    }
    
    setFromScale(pnt,f)
    {
        this.x=pnt.x*f;
        this.y=pnt.y*f;
        this.z=pnt.z*f;
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
   
    addPoint(pnt)
    {
        this.x+=pnt.x;
        this.y+=pnt.y;
        this.z+=pnt.z;
    }
    
    addPointTrunc(pnt)
    {
        this.x=Math.trunc(this.x+pnt.x);
        this.y=Math.trunc(this.y+pnt.y);
        this.z=Math.trunc(this.z+pnt.z);
    }
    
    subPoint(pnt)
    {
        this.x-=pnt.x;
        this.y-=pnt.y;
        this.z-=pnt.z;
    }
    
    multiply(pnt)
    {
        this.x*=pnt.x;
        this.y*=pnt.y;
        this.z*=pnt.z;
    }
    
    setFromMultiply(pnt1,pnt2)
    {
        this.x=pnt1.x*pnt2.x;
        this.y=pnt1.y*pnt2.y;
        this.z=pnt1.z*pnt2.z;
    }
    
    multiplyValues(x,y,z)
    {
        this.x*=x;
        this.y*=y;
        this.z*=z;
    }
    
    tween(pnt1,pnt2,factor)
    {
        this.x=pnt1.x+(pnt2.x-pnt1.x)*factor;
        this.y=pnt1.y+(pnt2.y-pnt1.y)*factor;
        this.z=pnt1.z+(pnt2.z-pnt1.z)*factor;
    }
    
    average(pnt)
    {
        this.x=(this.x+pnt.x)*0.5;
        this.y=(this.y+pnt.y)*0.5;
        this.z=(this.z+pnt.z)*0.5;
    }
    
    equals(pnt)
    {
        return((this.x===pnt.x)&&(this.y===pnt.y)&&(this.z===pnt.z));
    }
    
    truncEquals(pnt)
    {
        return((Math.trunc(this.x)===Math.trunc(pnt.x))&&(Math.trunc(this.y)===Math.trunc(pnt.y))&&(Math.trunc(this.z)===Math.trunc(pnt.z)));
    }
    
    rotateX(centerPnt,rotX)
    {
        let rd,sn,cs,y,z;
        
        if (centerPnt!==null) {
            this.y-=centerPnt.y;
            this.z-=centerPnt.z;
        }
        
        rd=rotX*(Math.PI/180.0);
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        y=(this.y*cs)-(this.z*sn);
        z=(this.y*sn)+(this.z*cs);

        if (centerPnt!==null) {
            y+=centerPnt.y;
            z+=centerPnt.z;
        }
        
        this.y=y;
        this.z=z;
    }
    
    rotateY(centerPnt,rotY)
    {
        let rd,sn,cs,x,z;
        
        if (centerPnt!==null) {
            this.x-=centerPnt.x;
            this.z-=centerPnt.z;
        }
        
        rd=rotY*(Math.PI/180.0);
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        x=(this.z*sn)+(this.x*cs);
        z=(this.z*cs)-(this.x*sn);

        if (centerPnt!==null) {
            x+=centerPnt.x;
            z+=centerPnt.z;
        }
        
        this.x=x;
        this.z=z;
    }
    
    rotateZ(centerPnt,rotZ)
    {
        let rd,sn,cs,x,y;
        
        if (centerPnt!==null) {
            this.x-=centerPnt.x;
            this.y-=centerPnt.y;
        }
        
        rd=rotZ*(Math.PI/180.0);
        sn=Math.sin(rd);
        cs=Math.cos(rd);
        
        x=(this.x*cs)-(this.y*sn);
        y=(this.x*sn)+(this.y*cs);
        
        if (centerPnt!==null) {
            x+=centerPnt.x;
            y+=centerPnt.y;
        }
        
        this.x=x;
        this.y=y;
    }
    
    rotate(ang)
    {
        let rd,sn,cs,x,y,z;
        
            // rotate X
        
        if (ang.x!==0.0) {
            rd=ang.x*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            y=(this.y*cs)-(this.z*sn);
            z=(this.y*sn)+(this.z*cs);

            this.y=y;
            this.z=z;
        }
        
            // rotate Y
        
        if (ang.y!==0.0) {
            rd=ang.y*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.z*sn)+(this.x*cs);
            z=(this.z*cs)-(this.x*sn);

            this.x=x;
            this.z=z;
        }
        
            // rotate Z
        
        if (ang.z!==0.0) {
            rd=ang.z*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.x*cs)-(this.y*sn);
            y=(this.x*sn)+(this.y*cs);

            this.x=x;
            this.y=y;
        }
    }
      
    rotateAroundPoint(centerPnt,ang)
    {
        let rd,sn,cs,x,y,z;
        
        if (centerPnt!==null) {
            this.x-=centerPnt.x;
            this.y-=centerPnt.y;
            this.z-=centerPnt.z;
        }
        
            // rotate X
        
        if (ang.x!==0.0) {
            rd=ang.x*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            y=(this.y*cs)-(this.z*sn);
            z=(this.y*sn)+(this.z*cs);

            this.y=y;
            this.z=z;
        }
        
            // rotate Y
        
        if (ang.y!==0.0) {
            rd=ang.y*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.z*sn)+(this.x*cs);
            z=(this.z*cs)-(this.x*sn);

            this.x=x;
            this.z=z;
        }
        
            // rotate Z
        
        if (ang.z!==0.0) {
            rd=ang.z*(Math.PI/180.0);
            sn=Math.sin(rd);
            cs=Math.cos(rd);

            x=(this.x*cs)-(this.y*sn);
            y=(this.x*sn)+(this.y*cs);

            this.x=x;
            this.y=y;
        }
        
        if (centerPnt!==null) {
            this.x+=centerPnt.x;
            this.y+=centerPnt.y;
            this.z+=centerPnt.z;
        }
    }
    
    translationFromMatrix(mat)
    {
        this.x=mat.data[12];
        this.y=mat.data[13];
        this.z=mat.data[14];
    }
                
    distance(pnt)
    {
        let px=this.x-pnt.x;
        let py=this.y-pnt.y;
        let pz=this.z-pnt.z;
        return(Math.sqrt((px*px)+(py*py)+(pz*pz)));
    }
                
    distanceByTriplet(kx,ky,kz)
    {
        let px=this.x-kx;
        let py=this.y-ky;
        let pz=this.z-kz;
        return(Math.sqrt((px*px)+(py*py)+(pz*pz)));
    }
    
    distanceScrubY(pnt)
    {
        let px=this.x-pnt.x;
        let pz=this.z-pnt.z;
        return(Math.sqrt((px*px)+(pz*pz)));
    }
    
    length()
    {
        return(Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z)));
    }
    
    lengthXZ()
    {
        return(Math.sqrt((this.x*this.x)+(this.z*this.z)));
    }
    
    normalize()
    {
        let f=Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
        this.z*=f;
    }
    
    normalize2D()
    {
        let f=Math.sqrt((this.x*this.x)+(this.y*this.y));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
    }
    
    dot(pnt)
    {
        return((this.x*pnt.x)+(this.y*pnt.y)+(this.z*pnt.z));
    }

    cross(pnt)
    {
        let x=(this.y*pnt.z)-(this.z*pnt.y);
        let y=(this.z*pnt.x)-(this.x*pnt.z);
        let z=(this.x*pnt.y)-(this.y*pnt.x);
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
    
    scaleXZ(f)
    {
        this.x*=f;
        this.z*=f;
    }
    
    scaleFromPoint(pnt,scale)
    {
        this.x=((this.x-pnt.x)*scale.x)+pnt.x;
        this.y=((this.y-pnt.y)*scale.y)+pnt.y;
        this.z=((this.z-pnt.z)*scale.z)+pnt.z;
    }
    
    scaleFromMinMaxPoint(pnt,scaleMin,scaleMax)
    {
        let x=this.x-pnt.x;
        let y=this.y-pnt.y;
        let z=this.z-pnt.z;
        
        if (scaleMin!==null) {
            if (x<0) x*=scaleMin.x;
            if (y<0) y*=scaleMin.y;
            if (z<0) z*=scaleMin.z;
        }
        if (scaleMax!==null) {
            if (x>0) x*=scaleMax.x;
            if (y>0) y*=scaleMax.y;
            if (z>0) z*=scaleMax.z;
        }
        
        this.x=x+pnt.x;
        this.y=y+pnt.y;
        this.z=z+pnt.z;
    }
    
    scaleFromMatrix(mat)
    {
        this.x=Math.sqrt((mat.data[0]*mat.data[0])+(mat.data[1]*mat.data[1])+(mat.data[2]*mat.data[2]));
        this.y=Math.sqrt((mat.data[4]*mat.data[4])+(mat.data[5]*mat.data[5])+(mat.data[6]*mat.data[6]));
        this.z=Math.sqrt((mat.data[8]*mat.data[8])+(mat.data[9]*mat.data[9])+(mat.data[10]*mat.data[10]));
    }
    
    matrixMultiply(mat)
    {
        let mx=(this.x*mat.data[0])+(this.y*mat.data[4])+(this.z*mat.data[8])+mat.data[12];
        let my=(this.x*mat.data[1])+(this.y*mat.data[5])+(this.z*mat.data[9])+mat.data[13];
        let mz=(this.x*mat.data[2])+(this.y*mat.data[6])+(this.z*mat.data[10])+mat.data[14];
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    }
    
    matrixMultiplyIgnoreTransform(mat)
    {
        let mx=(this.x*mat.data[0])+(this.y*mat.data[4])+(this.z*mat.data[8]);
        let my=(this.x*mat.data[1])+(this.y*mat.data[5])+(this.z*mat.data[9]);
        let mz=(this.x*mat.data[2])+(this.y*mat.data[6])+(this.z*mat.data[10]);
        
        this.x=mx;
        this.y=my;
        this.z=mz;
    }
    
    angleYTo(pnt)
    {
            // z is pointing up, atan2 gives us the angle to the x vector,
            // so we need the Z up vector (positive) and the vector to pt
            // then subtract them for correct angle
        
        let fang=(Math.atan2(0,100)-Math.atan2((pnt.x-this.x),(pnt.z-this.z)))*(180.0/Math.PI);
        
            // now we need to switch it up for which side the x is on
            // (if greater, the #s are 0 to -180, if positive, 180 to 0)
            
        if (this.x>pnt.x) {
            fang=-fang;
        }
        else {
            fang=(180.0-fang)+180.0;
        }
        
        if (fang<0) fang=360.0+fang;
        if (fang>=360.0) fang-=360.0;
        
        return(fang);
    }
    
    angleXTo(pnt)
    {
            // z is pointing up, atan2 gives us the angle to the y vector,
            // so we need the Z up vector (positive) and the vector to pt
            // then subtract them for correct angle
        
        let fang=(Math.atan2(0,100)-Math.atan2((pnt.y-this.y),(pnt.z-this.z)))*(180.0/Math.PI);
        
            // now we need to switch it up for which side the y is on
            // (if greater, the #s are 0 to -180, if positive, 180 to 0)
            
        if (this.y>pnt.y) {
            fang=-fang;
        }
        else {
            fang=(180.0-fang)+180.0;
        }
        
        if (fang<0) fang=360.0+fang;
        if (fang>=360.0) fang-=360.0;
        
        return(fang);
    }
    
    getLookAngleTo(pnt)
    {
            // do this in 2D space as it doesn't matter what
            // the rotation is or getting numbers outside
            // of 180, just the look angle
             
        let dx=pnt.x-this.x;
        let dz=pnt.z-this.z;
        let x=Math.sqrt((dx*dx)+(dz*dz));
        
        return((Math.atan2(0,x)-Math.atan2((pnt.y-this.y),x))*(180.0/Math.PI));
    }
    
    turnXTowards(toX,speed)
    {
        let subway,addway;
        
        if (this.x===toX) return(0);
        
            // which way is faster?
	
	if (this.x>toX) {
            addway=360.0-(this.x-toX);
            subway=this.x-toX;
	}
	else {
            addway=toX-this.x;
            subway=360.0-(toX-this.x);
	}
        
            // if we are within speed, then
            // it's equal
            
        if ((subway<speed) || (addway<speed)) {
            this.x=toX;
            return(0);
        }
		
            // now turn and always
            // return the difference
	
	if (subway<addway) {
            this.x-=speed;
            return(subway);
	}

        this.x+=speed;
        return(addway);
    }
    
    turnYTowards(toY,speed)
    {
        let subway,addway;
        
        if (this.y===toY) return(0);
        
            // which way is faster?
	
	if (this.y>toY) {
            addway=360.0-(this.y-toY);
            subway=this.y-toY;
	}
	else {
            addway=toY-this.y;
            subway=360.0-(toY-this.y);
	}
        
            // if we are within speed, then
            // it's equal
            
        if ((subway<speed) || (addway<speed)) {
            this.y=toY;
            return(0);
        }
		
            // now turn and always
            // return the difference
	
	if (subway<addway) {
            this.y-=speed;
            return(subway);
	}

        this.y+=speed;
        return(addway);
    }
    
    getTurnYTowards(toY)
    {
        let subway,addway;
        
        if (this.y===toY) return(0);
        
            // which way is faster?
	
	if (this.y>toY) {
            addway=360.0-(this.y-toY);
            subway=this.y-toY;
	}
	else {
            addway=toY-this.y;
            subway=360.0-(toY-this.y);
	}
        
            // quickest turn
	
	return((subway<addway)?-subway:addway);
    }
    
    turnZTowards(toZ,speed)
    {
        let subway,addway;
        
        if (this.z===toZ) return(0);
        
            // which way is faster?
	
	if (this.z>toZ) {
            addway=360.0-(this.z-toZ);
            subway=this.z-toZ;
	}
	else {
            addway=toZ-this.z;
            subway=360.0-(toZ-this.z);
	}
        
            // if we are within speed, then
            // it's equal
            
        if ((subway<speed) || (addway<speed)) {
            this.z=toZ;
            return(0);
        }
		
            // now turn and always
            // return the difference
	
	if (subway<addway) {
            this.z-=speed;
            return(subway);
	}

        this.z+=speed;
        return(addway);
    }
    
    minFromPoint(pnt)
    {
        if (this.x>pnt.x) this.x=pnt.x;
        if (this.y>pnt.y) this.y=pnt.y;
        if (this.z>pnt.z) this.z=pnt.z;
    }
    
    maxFromPoint(pnt)
    {
        if (this.x<pnt.x) this.x=pnt.x;
        if (this.y<pnt.y) this.y=pnt.y;
        if (this.z<pnt.z) this.z=pnt.z;
    }
    
    isZero()
    {
        return((this.x===0) && (this.y===0) && (this.z===0));
    }
    
    moveXWithAcceleration(movePos,moveNeg,posAcceleration,posDeceleration,posMaxValue,negAcceleration,negDeceleration,negMaxValue)
    {
        if (movePos) {
            this.x+=posAcceleration;
            if (this.x>posMaxValue) this.x=posMaxValue;
            return;
        }
        else {
            if (!moveNeg) {
                this.x-=posDeceleration;
                if (this.x<0) this.x=0;
                return;
            }
        }
        
        if (moveNeg) {
            this.x-=negAcceleration;
            if (this.x<-negMaxValue) this.x=-negMaxValue;
            return;
        }
        else {
            if (!movePos) {
                this.x+=negDeceleration;
                if (this.x>0) this.x=0;
                return;
            }
        }
    }
    
    moveYWithAcceleration(movePos,moveNeg,posAcceleration,posDeceleration,posMaxValue,negAcceleration,negDeceleration,negMaxValue)
    {
        if (movePos) {
            this.y+=posAcceleration;
            if (this.y>posMaxValue) this.y=posMaxValue;
            return;
        }
        else {
            if (!moveNeg) {
                this.y-=posDeceleration;
                if (this.y<0) this.y=0;
                return;
            }
        }
        
        if (moveNeg) {
            this.y-=negAcceleration;
            if (this.y<-negMaxValue) this.y=-negMaxValue;
            return;
        }
        else {
            if (!movePos) {
                this.y+=negDeceleration;
                if (this.y>0) this.y=0;
                return;
            }
        }
    }
    
    moveZWithAcceleration(movePos,moveNeg,posAcceleration,posDeceleration,posMaxValue,negAcceleration,negDeceleration,negMaxValue)
    {
        if (movePos) {
            this.z+=posAcceleration;
            if (this.z>posMaxValue) this.z=posMaxValue;
            return;
        }
        else {
            if (!moveNeg) {
                this.z-=posDeceleration;
                if (this.z<0) this.z=0;
                return;
            }
        }
        
        if (moveNeg) {
            this.z-=negAcceleration;
            if (this.z<-negMaxValue) this.z=-negMaxValue;
            return;
        }
        else {
            if (!movePos) {
                this.z+=negDeceleration;
                if (this.z>0) this.z=0;
                return;
            }
        }
    }
    
    singleAxisAngleFix(f)
    {
        if (f===-0) return(0);
        f=Math.floor(f)%360;
        if (f<0) f=360+f;
        return(f);
    }
    
    angleFix()
    {
        this.x=this.singleAxisAngleFix(this.x);
        this.y=this.singleAxisAngleFix(this.y);
        this.z=this.singleAxisAngleFix(this.z);
    }
    
    copy()
    {
        return(new PointClass(this.x,this.y,this.z));
    }
    
    toString()
    {
        return('('+this.x+','+this.y+','+this.z+')');
    }
    
    toDisplayString()
    {
        return('('+Math.trunc(this.x)+','+Math.trunc(this.y)+','+Math.trunc(this.z)+')');
    }
}
