export default class Matrix4Class
{
    constructor()
    {
        this.data=new Float32Array(16);
        
            // start with identity matrix
            // this is in COLUMN MAJOR order

        this.data[0]=1.0;
        this.data[5]=1.0;
        this.data[10]=1.0;
        this.data[15]=1.0;
        
        Object.seal(this);
    }
    
    setIdentity()
    {
        this.data[0]=1.0;
        this.data[1]=0.0;
        this.data[2]=0.0;
        this.data[3]=0.0;
        this.data[4]=0.0;
        this.data[5]=1.0;
        this.data[6]=0.0;
        this.data[7]=0.0;
        this.data[8]=0.0;
        this.data[9]=0.0;
        this.data[10]=1.0;
        this.data[11]=0.0;
        this.data[12]=0.0;
        this.data[13]=0.0;
        this.data[14]=0.0;
        this.data[15]=1.0;
    }
    
    fromArray(array)
    {
        let n;
        
        for (n=0;n!==16;n++) {
            this.data[n]=array[n];
        }
    }
    
    fromArrayOffset(array,offset)
    {
        let n;
        
        for (n=0;n!==16;n++) {
            this.data[n]=array[n+offset];
        }
    }
    
    setTranslationFromPoint(pnt)
    {
        this.setIdentity();

        this.data[12]=pnt.x;	
	this.data[13]=pnt.y;
	this.data[14]=pnt.z;
    }
    
    setScaleFromPoint(pnt)
    {
        this.setIdentity();
        
	this.data[0]=pnt.x;
	this.data[5]=pnt.y;
	this.data[10]=pnt.z;
    }
    
    setRotationFromXAngle(xAng)
    {
        let rad=xAng*(Math.PI/180.0);
        
        this.setIdentity();
        
        this.data[5]=this.data[10]=Math.cos(rad);
        this.data[6]=Math.sin(rad);
        this.data[9]=-this.data[6];
    }
    
    setRotationFromYAngle(yAng)
    {
        let rad=yAng*(Math.PI/180.0);
        
        this.setIdentity();
        
        this.data[0]=this.data[10]=Math.cos(rad);
        this.data[8]=Math.sin(rad);
        this.data[2]=-this.data[8];
    }
    
    setRotationFromZAngle(zAng)
    {
        let rad=zAng*(Math.PI/180.0);
        
        this.setIdentity();
        
        this.data[0]=this.data[5]=Math.cos(rad);
        this.data[1]=Math.sin(rad);
        this.data[4]=-this.data[1];
    }
    
    setRotationFromQuaternion(quant)
    {
        let xx=quant.x*quant.x;
        let xy=quant.x*quant.y;
        let xz=quant.x*quant.z;
        let xw=quant.x*quant.w;
        let yy=quant.y*quant.y;
        let yz=quant.y*quant.z;
        let yw=quant.y*quant.w;
        let zz=quant.z*quant.z;
        let zw=quant.z*quant.w;
        
        this.setIdentity();
        
        this.data[0]=1.0-(2.0*(yy+zz));
        this.data[4]=2.0*(xy-zw);
        this.data[8]=2.0*(xz+yw);
        this.data[1]=2.0*(xy+zw);
        this.data[5]=1.0-(2.0*(xx+zz));
        this.data[9]=2.0*(yz-xw);
        this.data[2]=2.0*(xz-yw);
        this.data[6]=2.0*(yz+xw);
        this.data[10]=1.0-(2.0*(xx+yy));
    }

    multiply(mat)
    {
        let d0=(this.data[0]*mat.data[0])+(this.data[4]*mat.data[1])+(this.data[8]*mat.data[2])+(this.data[12]*mat.data[3]);
        let d4=(this.data[0]*mat.data[4])+(this.data[4]*mat.data[5])+(this.data[8]*mat.data[6])+(this.data[12]*mat.data[7]);
        let d8=(this.data[0]*mat.data[8])+(this.data[4]*mat.data[9])+(this.data[8]*mat.data[10])+(this.data[12]*mat.data[11]);
        let d12=(this.data[0]*mat.data[12])+(this.data[4]*mat.data[13])+(this.data[8]*mat.data[14])+(this.data[12]*mat.data[15]);
        
        let d1=(this.data[1]*mat.data[0])+(this.data[5]*mat.data[1])+(this.data[9]*mat.data[2])+(this.data[13]*mat.data[3]);
        let d5=(this.data[1]*mat.data[4])+(this.data[5]*mat.data[5])+(this.data[9]*mat.data[6])+(this.data[13]*mat.data[7]);
        let d9=(this.data[1]*mat.data[8])+(this.data[5]*mat.data[9])+(this.data[9]*mat.data[10])+(this.data[13]*mat.data[11]);
        let d13=(this.data[1]*mat.data[12])+(this.data[5]*mat.data[13])+(this.data[9]*mat.data[14])+(this.data[13]*mat.data[15]);
        
        let d2=(this.data[2]*mat.data[0])+(this.data[6]*mat.data[1])+(this.data[10]*mat.data[2])+(this.data[14]*mat.data[3]);
        let d6=(this.data[2]*mat.data[4])+(this.data[6]*mat.data[5])+(this.data[10]*mat.data[6])+(this.data[14]*mat.data[7]);
        let d10=(this.data[2]*mat.data[8])+(this.data[6]*mat.data[9])+(this.data[10]*mat.data[10])+(this.data[14]*mat.data[11]);
        let d14=(this.data[2]*mat.data[12])+(this.data[6]*mat.data[13])+(this.data[10]*mat.data[14])+(this.data[14]*mat.data[15]);

        let d3=(this.data[3]*mat.data[0])+(this.data[7]*mat.data[1])+(this.data[11]*mat.data[2])+(this.data[15]*mat.data[3]);
        let d7=(this.data[3]*mat.data[4])+(this.data[7]*mat.data[5])+(this.data[11]*mat.data[6])+(this.data[15]*mat.data[7]);
        let d11=(this.data[3]*mat.data[8])+(this.data[7]*mat.data[9])+(this.data[11]*mat.data[10])+(this.data[15]*mat.data[11]);
        let d15=(this.data[3]*mat.data[12])+(this.data[7]*mat.data[13])+(this.data[11]*mat.data[14])+(this.data[15]*mat.data[15]);
        
        this.data[0]=d0;
        this.data[1]=d1;
        this.data[2]=d2;
        this.data[3]=d3;
        this.data[4]=d4;
        this.data[5]=d5;
        this.data[6]=d6;
        this.data[7]=d7;
        this.data[8]=d8;
        this.data[9]=d9;
        this.data[10]=d10;
        this.data[11]=d11;
        this.data[12]=d12;
        this.data[13]=d13;
        this.data[14]=d14;
        this.data[15]=d15;
    }
    
    setFromMultiply(mat1,mat2)
    {
        this.data[0]=(mat1.data[0]*mat2.data[0])+(mat1.data[4]*mat2.data[1])+(mat1.data[8]*mat2.data[2])+(mat1.data[12]*mat2.data[3]);
        this.data[4]=(mat1.data[0]*mat2.data[4])+(mat1.data[4]*mat2.data[5])+(mat1.data[8]*mat2.data[6])+(mat1.data[12]*mat2.data[7]);
        this.data[8]=(mat1.data[0]*mat2.data[8])+(mat1.data[4]*mat2.data[9])+(mat1.data[8]*mat2.data[10])+(mat1.data[12]*mat2.data[11]);
        this.data[12]=(mat1.data[0]*mat2.data[12])+(mat1.data[4]*mat2.data[13])+(mat1.data[8]*mat2.data[14])+(mat1.data[12]*mat2.data[15]);
        
        this.data[1]=(mat1.data[1]*mat2.data[0])+(mat1.data[5]*mat2.data[1])+(mat1.data[9]*mat2.data[2])+(mat1.data[13]*mat2.data[3]);
        this.data[5]=(mat1.data[1]*mat2.data[4])+(mat1.data[5]*mat2.data[5])+(mat1.data[9]*mat2.data[6])+(mat1.data[13]*mat2.data[7]);
        this.data[9]=(mat1.data[1]*mat2.data[8])+(mat1.data[5]*mat2.data[9])+(mat1.data[9]*mat2.data[10])+(mat1.data[13]*mat2.data[11]);
        this.data[13]=(mat1.data[1]*mat2.data[12])+(mat1.data[5]*mat2.data[13])+(mat1.data[9]*mat2.data[14])+(mat1.data[13]*mat2.data[15]);
        
        this.data[2]=(mat1.data[2]*mat2.data[0])+(mat1.data[6]*mat2.data[1])+(mat1.data[10]*mat2.data[2])+(mat1.data[14]*mat2.data[3]);
        this.data[6]=(mat1.data[2]*mat2.data[4])+(mat1.data[6]*mat2.data[5])+(mat1.data[10]*mat2.data[6])+(mat1.data[14]*mat2.data[7]);
        this.data[10]=(mat1.data[2]*mat2.data[8])+(mat1.data[6]*mat2.data[9])+(mat1.data[10]*mat2.data[10])+(mat1.data[14]*mat2.data[11]);
        this.data[14]=(mat1.data[2]*mat2.data[12])+(mat1.data[6]*mat2.data[13])+(mat1.data[10]*mat2.data[14])+(mat1.data[14]*mat2.data[15]);

        this.data[3]=(mat1.data[3]*mat2.data[0])+(mat1.data[7]*mat2.data[1])+(mat1.data[11]*mat2.data[2])+(mat1.data[15]*mat2.data[3]);
        this.data[7]=(mat1.data[3]*mat2.data[4])+(mat1.data[7]*mat2.data[5])+(mat1.data[11]*mat2.data[6])+(mat1.data[15]*mat2.data[7]);
        this.data[11]=(mat1.data[3]*mat2.data[8])+(mat1.data[7]*mat2.data[9])+(mat1.data[11]*mat2.data[10])+(mat1.data[15]*mat2.data[11]);
        this.data[15]=(mat1.data[3]*mat2.data[12])+(mat1.data[7]*mat2.data[13])+(mat1.data[11]*mat2.data[14])+(mat1.data[15]*mat2.data[15]);
    }
    
    setFromInvertMatrix(mat)
    {
        let n,det;

        this.data[0]=(mat.data[5]*mat.data[10]*mat.data[15])-(mat.data[5]*mat.data[11]*mat.data[14])-(mat.data[9]*mat.data[6]*mat.data[15])+(mat.data[9]*mat.data[7]*mat.data[14])+(mat.data[13]*mat.data[6]*mat.data[11])-(mat.data[13]*mat.data[7]*mat.data[10]);
        this.data[4]=(-mat.data[4]*mat.data[10]*mat.data[15])+(mat.data[4]*mat.data[11]*mat.data[14])+(mat.data[8]*mat.data[6]*mat.data[15])-(mat.data[8]*mat.data[7]*mat.data[14])-(mat.data[12]*mat.data[6]*mat.data[11])+(mat.data[12]*mat.data[7]*mat.data[10]);
        this.data[8]=(mat.data[4]*mat.data[9]*mat.data[15])-(mat.data[4]*mat.data[11]*mat.data[13])-(mat.data[8]*mat.data[5]*mat.data[15])+(mat.data[8]*mat.data[7]*mat.data[13])+(mat.data[12]*mat.data[5]*mat.data[11])-(mat.data[12]*mat.data[7]*mat.data[9]);
        this.data[12]=(-mat.data[4]*mat.data[9]*mat.data[14])+(mat.data[4]*mat.data[10]*mat.data[13])+(mat.data[8]*mat.data[5]*mat.data[14])-(mat.data[8]*mat.data[6]*mat.data[13])-(mat.data[12]*mat.data[5]*mat.data[10])+(mat.data[12]*mat.data[6]*mat.data[9]);
        this.data[1]=(-mat.data[1]*mat.data[10]*mat.data[15])+(mat.data[1]*mat.data[11]*mat.data[14])+(mat.data[9]*mat.data[2]*mat.data[15])-(mat.data[9]*mat.data[3]*mat.data[14])-(mat.data[13]*mat.data[2]*mat.data[11])+(mat.data[13]*mat.data[3]*mat.data[10]);
        this.data[5]=(mat.data[0]*mat.data[10]*mat.data[15])-(mat.data[0]*mat.data[11]*mat.data[14])-(mat.data[8]*mat.data[2]*mat.data[15])+(mat.data[8]*mat.data[3]*mat.data[14])+(mat.data[12]*mat.data[2]*mat.data[11])-(mat.data[12]*mat.data[3]*mat.data[10]);
        this.data[9]=(-mat.data[0]*mat.data[9]*mat.data[15])+(mat.data[0]*mat.data[11]*mat.data[13])+(mat.data[8]*mat.data[1]*mat.data[15])-(mat.data[8]*mat.data[3]*mat.data[13])-(mat.data[12]*mat.data[1]*mat.data[11])+(mat.data[12]*mat.data[3]*mat.data[9]);
        this.data[13]=(mat.data[0]*mat.data[9]*mat.data[14])-(mat.data[0]*mat.data[10]*mat.data[13])-(mat.data[8]*mat.data[1]*mat.data[14])+(mat.data[8]*mat.data[2]*mat.data[13])+(mat.data[12]*mat.data[1]*mat.data[10])-(mat.data[12]*mat.data[2]*mat.data[9]);
        this.data[2]=(mat.data[1]*mat.data[6]*mat.data[15])-(mat.data[1]*mat.data[7]*mat.data[14])-(mat.data[5]*mat.data[2]*mat.data[15])+(mat.data[5]*mat.data[3]*mat.data[14])+(mat.data[13]*mat.data[2]*mat.data[7])-(mat.data[13]*mat.data[3]*mat.data[6]);
        this.data[6]=(-mat.data[0]*mat.data[6]*mat.data[15])+(mat.data[0]*mat.data[7]*mat.data[14])+(mat.data[4]*mat.data[2]*mat.data[15])-(mat.data[4]*mat.data[3]*mat.data[14])-(mat.data[12]*mat.data[2]*mat.data[7])+(mat.data[12]*mat.data[3]*mat.data[6]);
        this.data[10]=(mat.data[0]*mat.data[5]*mat.data[15])-(mat.data[0]*mat.data[7]*mat.data[13])-(mat.data[4]*mat.data[1]*mat.data[15])+(mat.data[4]*mat.data[3]*mat.data[13])+(mat.data[12]*mat.data[1]*mat.data[7])-(mat.data[12]*mat.data[3]*mat.data[5]);
        this.data[14]=(-mat.data[0]*mat.data[5]*mat.data[14])+(mat.data[0]*mat.data[6]*mat.data[13])+(mat.data[4]*mat.data[1]*mat.data[14])-(mat.data[4]*mat.data[2]*mat.data[13])-(mat.data[12]*mat.data[1]*mat.data[6])+(mat.data[12]*mat.data[2]*mat.data[5]);
        this.data[3]=(-mat.data[1]*mat.data[6]*mat.data[11])+(mat.data[1]*mat.data[7]*mat.data[10])+(mat.data[5]*mat.data[2]*mat.data[11])-(mat.data[5]*mat.data[3]*mat.data[10])-(mat.data[9]*mat.data[2]*mat.data[7])+(mat.data[9]*mat.data[3]*mat.data[6]);
        this.data[7]=(mat.data[0]*mat.data[6]*mat.data[11])-(mat.data[0]*mat.data[7]*mat.data[10])-(mat.data[4]*mat.data[2]*mat.data[11])+(mat.data[4]*mat.data[3]*mat.data[10])+(mat.data[8]*mat.data[2]*mat.data[7])-(mat.data[8]*mat.data[3]*mat.data[6]);
        this.data[11]=(-mat.data[0]*mat.data[5]*mat.data[11])+(mat.data[0]*mat.data[7]*mat.data[9])+(mat.data[4]*mat.data[1]*mat.data[11])-(mat.data[4]*mat.data[3]*mat.data[9])-(mat.data[8]*mat.data[1]*mat.data[7])+(mat.data[8]*mat.data[3]*mat.data[5]);
        this.data[15]=(mat.data[0]*mat.data[5]*mat.data[10])-(mat.data[0]*mat.data[6]*mat.data[9])-(mat.data[4]*mat.data[1]*mat.data[10])+(mat.data[4]*mat.data[2]*mat.data[9])+(mat.data[8]*mat.data[1]*mat.data[6])-(mat.data[8]*mat.data[2]*mat.data[5]);

        det=(mat.data[0]*this.data[0])+(mat.data[1]*this.data[4])+(mat.data[2]*this.data[8])+(mat.data[3]*this.data[12]);
        if (det==0) return;

        det=1.0/det;

        for (n=0;n!==16;n++) {
            this.data[n]*=det;
        }
    }
        
    setPerspectiveMatrix(viewFOV,viewAspect,glNearZ,glFarZ)
    {
        let fov=1.0/Math.tan(viewFOV*0.5);
        let dist=1.0/(glNearZ-glFarZ);
        
            // create the perspective matrix
            
        this.data[0]=fov/viewAspect;
        this.data[1]=0.0;
        this.data[2]=0.0;
        this.data[3]=0.0;
        this.data[4]=0.0;
        this.data[5]=fov;
        this.data[6]=0.0;
        this.data[7]=0.0;
        this.data[8]=0.0;
        this.data[9]=0.0;
        this.data[10]=(glFarZ+glNearZ)*dist;
        this.data[11]=-1.0;
        this.data[12]=0.0;
        this.data[13]=0.0;
        this.data[14]=((glFarZ*glNearZ)*2.0)*dist;
        this.data[15]=0.0;
        
            // now translate it for the near_z
                     
        this.data[12]+=(this.data[8]*glNearZ);
        this.data[13]+=(this.data[9]*glNearZ);
        this.data[14]+=(this.data[10]*glNearZ);
        this.data[15]+=(this.data[11]*glNearZ);
    }
    
    setLookAtMatrix(eyePnt,centerPnt,lookAtUpVector)
    {
        let x0,x1,x2,y0,y1,y2,z0,z1,z2;
        let f;

        z0=eyePnt.x-centerPnt.x;
        z1=eyePnt.y-centerPnt.y;
        z2=eyePnt.z-centerPnt.z;

        f=Math.sqrt((z0*z0)+(z1*z1)+(z2*z2));
        f=1.0/f;
        z0*=f;
        z1*=f;
        z2*=f;

        x0=(lookAtUpVector.y*z2)-(lookAtUpVector.z*z1);
        x1=(lookAtUpVector.z*z0)-(lookAtUpVector.x*z2);
        x2=(lookAtUpVector.x*z1)-(lookAtUpVector.y*z0);
        
        f=Math.sqrt((x0*x0)+(x1*x1)+(x2*x2));
        if (f!==0.0) f=1.0/f;
        x0*=f;
        x1*=f;
        x2*=f;

        y0=(z1*x2)-(z2*x1);
        y1=(z2*x0)-(z0*x2);
        y2=(z0*x1)-(z1*x0);

        f=Math.sqrt((y0*y0)+(y1*y1)+(y2*y2));
        if (f!==0.0) f=1.0/f;
        y0*=f;
        y1*=f;
        y2*=f;

        this.data[0]=x0;
        this.data[1]=y0;
        this.data[2]=z0;
        this.data[3]=0.0;
        this.data[4]=x1;
        this.data[5]=y1;
        this.data[6]=z1;
        this.data[7]=0.0;
        this.data[8]=x2;
        this.data[9]=y2;
        this.data[10]=z2;
        this.data[11]=0.0;
        this.data[12]=-((x0*eyePnt.x)+(x1*eyePnt.y)+(x2*eyePnt.z));
        this.data[13]=-((y0*eyePnt.x)+(y1*eyePnt.y)+(y2*eyePnt.z));
        this.data[14]=-((z0*eyePnt.x)+(z1*eyePnt.y)+(z2*eyePnt.z));
        this.data[15]=1.0;
    }
    
    setOrthoMatrix(screenWidth,screenHeight,glNearZ,glFarZ)
    {
        let horz=1.0/screenWidth;
        let vert=1.0/screenHeight;
        let dist=1.0/(glNearZ-glFarZ);

        this.data[0]=horz*2.0;
        this.data[1]=0.0;
        this.data[2]=0.0;
        this.data[3]=0.0;
        this.data[4]=0.0;
        this.data[5]=vert*-2.0;
        this.data[6]=0.0;
        this.data[7]=0.0;
        this.data[8]=0.0;
        this.data[9]=0.0;
        this.data[10]=dist*2.0;
        this.data[11]=0.0;
        this.data[12]=-1.0; // wid*-horz;      // these will always equal these numbers,
        this.data[13]=1.0; // high*vert;     // but leave in the code for readability
        this.data[14]=(glFarZ+glNearZ)*dist;
        this.data[15]=1.0;
    }
    
    setFromMatrixMoveZ(mat,zAdd)
    {
        this.data[0]=mat.data[0];
        this.data[1]=mat.data[1];
        this.data[2]=mat.data[2];
        this.data[3]=mat.data[3];
        this.data[4]=mat.data[4];
        this.data[5]=mat.data[5];
        this.data[6]=mat.data[6];
        this.data[7]=mat.data[7];
        this.data[8]=mat.data[8];
        this.data[9]=mat.data[9];
        this.data[10]=mat.data[10];
        this.data[11]=mat.data[11];
        this.data[12]=mat.data[12];
        this.data[13]=mat.data[13];
        this.data[14]=mat.data[14]+zAdd;
        this.data[15]=mat.data[15];
    }
}
