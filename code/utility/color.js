/**
 * A utility class that contains a single color by three RGB floats,
 * range of 0.0 to 1.0.
 */
export default class ColorClass
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
    
    setFromColor(col)
    {
        this.r=col.r;
        this.g=col.g;
        this.b=col.b;
    }
    
    setFromColorFactor(col1,col2,factor)
    {
        let f2=1.0-factor;
        
        this.r=(col1.r*factor)+(col2.r*f2);
        this.g=(col1.g*factor)+(col2.g*f2);
        this.b=(col1.b*factor)+(col2.b*f2);
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
    
    factor(f)
    {
        this.r*=f;
        this.g*=f;
        this.b*=f;
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
