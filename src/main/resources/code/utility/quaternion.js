export default class QuaternionClass
{
    constructor(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
        
        Object.seal(this);
    }
    
    setIdentity()
    {
        this.x=0;
        this.y=0;
        this.z=0;
        this.w=1;
    }
    
    setFromValues(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
    }
    
    setFromQuaternion(quat)
    {
        this.x=quat.x;
        this.y=quat.y;
        this.z=quat.z;
        this.w=quat.w;
    }
    
    setFromArray(arr)
    {
        this.x=arr[0];
        this.y=arr[1];
        this.z=arr[2];
        this.w=arr[3];
    }
    
    setFromVectorAndAngle(x,y,z,ang)
    {
        let rd=ang*(Math.PI/180.0);
        let sn=Math.sin(rd*0.5);
        
        this.x=sn*x;
        this.y=sn*y;
        this.z=sn*z;
        this.w=Math.cos(rd*0.5);
    }
    
    normalize()
    {
        let f=Math.sqrt((this.x*this.x)+(this.y*this.y)+(this.z*this.z)+(this.w*this.w));
        if (f!==0.0) f=1.0/f;
        
        this.x*=f;
        this.y*=f;
        this.z*=f;
        this.w*=f;
    }
    
    setFromMultiply(q1,q2)
    {
        this.x=(q1.x*q2.w)+(q1.y*q2.z)-(q1.z*q2.y)+(q1.w*q2.x);
        this.y=(-q1.x*q2.z)+(q1.y*q2.w)+(q1.z*q2.x)+(q1.w*q2.y);
        this.z=(q1.x*q2.y)-(q1.y*q2.x)+(q1.z*q2.w)+(q1.w*q2.z);
        this.w=(-q1.x*q2.x)-(q1.y*q2.y)-(q1.z*q2.z)+(q1.w*q2.w);
    }
    
    multiply(quat)
    {
        let x2=(this.x*quat.w)+(this.y*quat.z)-(this.z*quat.y)+(this.w*quat.x);
        let y2=(-this.x*quat.z)+(this.y*quat.w)+(this.z*quat.x)+(this.w*quat.y);
        let z2=(this.x*quat.y)-(this.y*quat.x)+(this.z*quat.w)+(this.w*quat.z);
        let w2=(-this.x*quat.x)-(this.y*quat.y)-(this.z*quat.z)+(this.w*quat.w);
        
        this.x=x2;
        this.y=y2;
        this.z=z2;
        this.w=w2;
    }
    
    multiplyValues(qx,qy,qz,qw)
    {
        let x2=(this.x*qw)+(this.y*qz)-(this.z*qy)+(this.w*qx);
        let y2=(-this.x*qz)+(this.y*qw)+(this.z*qx)+(this.w*qy);
        let z2=(this.x*qy)-(this.y*qx)+(this.z*qw)+(this.w*qz);
        let w2=(-this.x*qx)-(this.y*qy)-(this.z*qz)+(this.w*qw);
        
        this.x=x2;
        this.y=y2;
        this.z=z2;
        this.w=w2;
    }
    
    fromMatrix(mat)
    {
        let w4;
        
        this.w=Math.sqrt(1.0+mat.data[0]+mat.data[5]+mat.data[10])/2.0;
	
        w4=this.w*4.0;
        this.x=(mat.data[6]-mat.data[9])/w4;
        this.y=(mat.data[8]-mat.data[2])/w4;
        this.z=(mat.data[1]-mat.data[4])/w4;
    }
    
    getEulerAngle(ang)
    {
        let f,fx,fy,fz,fw;
        let aFactor,sq;
        
        fx=this.x;
        fy=this.y;
        fz=this.z;
        fw=this.w;
        
            // might need to normalize
            
        if (fw>1.0) {
            f=Math.sqrt((fx*fx)+(fy*fy)+(fz*fz)+(fw*fw));
            if (f!==0.0) f=1.0/f;
        
            fx*=f;
            fy*=f;
            fz*=f;
            fw*=f;
        }
        
            // find the angles
            
        aFactor=(2*Math.acos(fw))*(180.0/Math.PI);
        sq=Math.sqrt(1-(fw*fw));
        if (sq<0.001) {
            ang.x=fx*aFactor;
            ang.y=fy*aFactor;
            ang.z=fz*aFactor;
        }
        else {
            ang.x=(fx/sq)*aFactor;
            ang.y=(fy/sq)*aFactor;
            ang.z=(fz/sq)*aFactor;
        }
    }
    
    copy()
    {
        return(new QuaternionClass(this.x,this.y,this.z,this.w));
    }
    
    toString()
    {
        return('('+this.x+','+this.y+','+this.z+','+this.w+')');
    }
}
