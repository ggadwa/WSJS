import * as constants from '../main/constants.js';

export default class Matrix4Class
{
    constructor()
    {
        this.data=new Float32Array(9);
        
            // start with identity matrix
            // this is in COLUMN MAJOR order

        this.data[0]=1.0;
        this.data[4]=1.0;
        this.data[8]=1.0;
        
        Object.seal(this);
    }
    
    setIdentity()
    {
        this.data[0]=1.0;
        this.data[1]=0.0;
        this.data[2]=0.0;
        this.data[3]=0.0;
        this.data[4]=1.0;
        this.data[5]=0.0;
        this.data[6]=0.0;
        this.data[7]=0.0;
        this.data[8]=1.0;
    }
    
    fromArray(array)
    {
        let n;
        
        for (n=0;n!==9;n++) {
            this.data[n]=array[n];
        }
    }
    
    setInvertTransposeFromMat4(mat4)
    {
            // create the inversion
            
        let m00=(mat4.data[0]*mat4.data[5])-(mat4.data[1]*mat4.data[4]);
        let m01=(mat4.data[0]*mat4.data[6])-(mat4.data[2]*mat4.data[4]);
        let m02=(mat4.data[0]*mat4.data[7])-(mat4.data[3]*mat4.data[4]);
        let m03=(mat4.data[1]*mat4.data[6])-(mat4.data[2]*mat4.data[5]);
        let m04=(mat4.data[1]*mat4.data[7])-(mat4.data[3]*mat4.data[5]);
        let m05=(mat4.data[2]*mat4.data[7])-(mat4.data[3]*mat4.data[6]);
        let m06=(mat4.data[8]*mat4.data[13])-(mat4.data[9]*mat4.data[12]);
        let m07=(mat4.data[8]*mat4.data[14])-(mat4.data[10]*mat4.data[12]);
        let m08=(mat4.data[8]*mat4.data[15])-(mat4.data[11]*mat4.data[12]);
        let m09=(mat4.data[9]*mat4.data[14])-(mat4.data[10]*mat4.data[13]);
        let m10=(mat4.data[9]*mat4.data[15])-(mat4.data[11]*mat4.data[13]);
        let m11=(mat4.data[10]*mat4.data[15])-(mat4.data[11]*mat4.data[14]);

        let det=(m00*m11)-(m01*m10)+(m02*m09)+(m03*m08)-(m04*m07)+(m05*m06);
        if (det!==0.0) det=1.0/det;

            // transpose while finishing the inversion
            // and dropping into 3x3
            
        this.data[0]=((mat4.data[5]*m11)-(mat4.data[6]*m10)+(mat4.data[7]*m09))*det;
        this.data[3]=((mat4.data[2]*m10)-(mat4.data[1]*m11)-(mat4.data[3]*m09))*det;
        this.data[6]=((mat4.data[13]*m05)-(mat4.data[14]*m04)+(mat4.data[15]*m03))*det;
        this.data[1]=((mat4.data[6]*m08)-(mat4.data[4]*m11)-(mat4.data[7]*m07))*det;
        this.data[4]=((mat4.data[0]*m11)-(mat4.data[2]*m08)+(mat4.data[3]*m07))*det;
        this.data[7]=((mat4.data[14]*m02)-(mat4.data[12]*m05)-(mat4.data[15]*m01))*det;
        this.data[2]=((mat4.data[4]*m10)-(mat4.data[5]*m08)+(mat4.data[7]*m06))*det;
        this.data[5]=((mat4.data[1]*m08)-(mat4.data[0]*m10)-(mat4.data[3]*m06))*det;
        this.data[8]=((mat4.data[12]*m04)-(mat4.data[13]*m02)+(mat4.data[15]*m00))*det;
    }
    
}
