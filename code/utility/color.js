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
