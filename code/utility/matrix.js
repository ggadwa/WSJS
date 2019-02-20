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
    
    setRotationFromQuaternion(x,y,z,w)
    {
        let xy=x*y;
        let zw=z*w;
        let xz=x*z;
        let yw=y*w;
        let yz=y*z;
        let xw=x*w;
        let sx=x*x;
        let sy=y*y;
        let sz=z*z;
        let sw=w*w;
        
        this.setIdentity();
        
        this.data[0]=sx+sy-sz-sw;
        this.data[1]=(yz+xw)*2.0;
        this.data[2]=(yw-xz)*2.0;
        
        this.data[4]=(yz-xw)*2.0;
        this.data[5]=sx-sy+sz-sw;
        this.data[6]=(zw+xy)*2.0;
        
        this.data[8]=(yw+xz)*2.0;
        this.data[9]=(zw-xy)*2.0;
        this.data[10]=sx-sy-sz+sw;
    }
    
    setScaleMatrix(x,y,z)
    {
        this.setIdentity();
        
	this.data[0]=x;
	this.data[5]=y;
	this.data[10]=z;
    }
    
    setTranslationMatrix(x,y,z)
    {
        this.setIdentity();

        this.data[12]=x;	
	this.data[13]=y;
	this.data[14]=z;
    }

    multiply(mat)
    {
	let productMat=new MatrixClass();
        
        productMat.data[0]=(this.data[0]*mat.data[0])+(this.data[4]*mat.data[1])+(this.data[8]*mat.data[2])+(this.data[12]*mat.data[3]);
        productMat.data[4]=(this.data[0]*mat.data[4])+(this.data[4]*mat.data[5])+(this.data[8]*mat.data[6])+(this.data[12]*mat.data[7]);
        productMat.data[8]=(this.data[0]*mat.data[8])+(this.data[4]*mat.data[9])+(this.data[8]*mat.data[10])+(this.data[12]*mat.data[11]);
        productMat.data[12]=(this.data[0]*mat.data[12])+(this.data[4]*mat.data[13])+(this.data[8]*mat.data[14])+(this.data[12]*mat.data[15]);
        
        productMat.data[1]=(this.data[1]*mat.data[0])+(this.data[5]*mat.data[1])+(this.data[9]*mat.data[2])+(this.data[13]*mat.data[3]);
        productMat.data[5]=(this.data[1]*mat.data[4])+(this.data[5]*mat.data[5])+(this.data[9]*mat.data[6])+(this.data[13]*mat.data[7]);
        productMat.data[9]=(this.data[1]*mat.data[8])+(this.data[5]*mat.data[9])+(this.data[9]*mat.data[10])+(this.data[13]*mat.data[11]);
        productMat.data[13]=(this.data[1]*mat.data[12])+(this.data[5]*mat.data[13])+(this.data[9]*mat.data[14])+(this.data[13]*mat.data[15]);
        
        productMat.data[2]=(this.data[2]*mat.data[0])+(this.data[6]*mat.data[1])+(this.data[10]*mat.data[2])+(this.data[14]*mat.data[3]);
        productMat.data[6]=(this.data[2]*mat.data[4])+(this.data[6]*mat.data[5])+(this.data[10]*mat.data[6])+(this.data[14]*mat.data[7]);
        productMat.data[10]=(this.data[2]*mat.data[8])+(this.data[6]*mat.data[9])+(this.data[10]*mat.data[10])+(this.data[14]*mat.data[11]);
        productMat.data[14]=(this.data[2]*mat.data[12])+(this.data[6]*mat.data[13])+(this.data[10]*mat.data[14])+(this.data[14]*mat.data[15]);

        productMat.data[3]=(this.data[3]*mat.data[0])+(this.data[7]*mat.data[1])+(this.data[11]*mat.data[2])+(this.data[15]*mat.data[3]);
        productMat.data[7]=(this.data[3]*mat.data[4])+(this.data[7]*mat.data[5])+(this.data[11]*mat.data[6])+(this.data[15]*mat.data[7]);
        productMat.data[11]=(this.data[3]*mat.data[8])+(this.data[7]*mat.data[9])+(this.data[11]*mat.data[10])+(this.data[15]*mat.data[11]);
        productMat.data[15]=(this.data[3]*mat.data[12])+(this.data[7]*mat.data[13])+(this.data[11]*mat.data[14])+(this.data[15]*mat.data[15]);
        
        this.data=productMat.data;
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
