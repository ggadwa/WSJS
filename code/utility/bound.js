/**
 * A utility class that defines two bounding values, and it keeps
 * them set to min and max.
 */
export default class BoundClass
{
    constructor(value1,value2)
    {
        if (value1<value2) {
            this.min=value1;
            this.max=value2;
        }
        else {
            this.min=value2;
            this.max=value1;
        }
        
        Object.seal(this);
    }
    
    setFromValues(value1,value2)
    {
        if (value1<value2) {
            this.min=value1;
            this.max=value2;
        }
        else {
            this.min=value2;
            this.max=value1;
        }
    }
    
    setFromBound(bound)
    {
        this.min=bound.min;
        this.max=bound.max;
    }
    
    add(addValue)
    {
        this.min+=addValue;
        this.max+=addValue;
    }
    
    grow(growValue)
    {
        this.min-=growValue;
        this.max+=growValue;
    }
    
    scale(scaleValue)
    {
        this.min*=scaleValue;
        this.max*=scaleValue;
    }
                
    getMidPoint()
    {
        return((this.max+this.min)*0.5);
    }
                
    getSize()
    {
        return(Math.trunc(this.max-this.min));
    }
                
    adjust(value)
    {
        if (value<this.min) this.min=value;
        if (value>this.max) this.max=value;
    }
    
    enlargeForSign(value)
    {
        if (value<0) {
            this.min+=value;
        }
        else {
            this.max+=value;
        }
    }
    
    trunc()
    {
        this.min=Math.trunc(this.min);
        this.max=Math.trunc(this.max);
    }
    
    copy()
    {
        return(new BoundClass(this.min,this.max));
    }
    
    toString()
    {
        return('('+this.min+','+this.max+')');
    }
}
