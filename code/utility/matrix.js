import * as constants from '../main/constants.js';

export default class MatrixClass
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
        let rad=xAng*constants.DEGREE_TO_RAD;
        
        this.setIdentity();
        
        this.data[5]=this.data[10]=Math.cos(rad);
        this.data[6]=Math.sin(rad);
        this.data[9]=-this.data[6];
    }
    
    setRotationFromYAngle(yAng)
    {
        let rad=yAng*constants.DEGREE_TO_RAD;
        
        this.setIdentity();
        
        this.data[0]=this.data[10]=Math.cos(rad);
        this.data[8]=Math.sin(rad);
        this.data[2]=-this.data[8];
    }
    
    setRotationFromZAngle(zAng)
    {
        let rad=zAng*constants.DEGREE_TO_RAD;
        
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
    
    consoleDebug()
    {
        console.log(this.data[0]+','+this.data[4]+','+this.data[8]+','+this.data[12]);
        console.log(this.data[1]+','+this.data[5]+','+this.data[9]+','+this.data[13]);
        console.log(this.data[2]+','+this.data[6]+','+this.data[10]+','+this.data[14]);
        console.log(this.data[3]+','+this.data[7]+','+this.data[11]+','+this.data[15]);
    }
    
    

/*

void matrix_average(matrix_type *mat,int nmatrix,matrix_type *mats)
{
	int				n,i;
	float			*f,*f2,f_count;

		// all zeros

	memset(mat,0x0,sizeof(matrix_type));

		// add up all the matrixes

	for (n=0;n!=nmatrix;n++) {
		f=(float*)mat->data;
		f2=(float*)mats[n].data;

		for (i=0;i!=16;i++) {
			*f=(*f)+(*f2++);
			f++;
		}
	}

		// average the matrixes

	f_count=(float)nmatrix;
	f=(float*)mat->data;

	for (i=0;i!=16;i++) {
		*f=(*f)/f_count;
		f++;
	}
}


 */
}
