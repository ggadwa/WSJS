import * as constants from '../main/constants.js';

export default class QuaternionClass
{
    constructor()
    {
            // start with identity quaternion
            
        this.x=0;
        this.y=0;
        this.z=0;
        this.w=1;
        
        Object.seal(this);
    }
    
    setFromValues(x,y,z,w)
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
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
}
