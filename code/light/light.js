import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ColorClass from '../../code/utility/color.js';
import genRandom from '../../generate/utility/random.js';

//
// map light class
// 
// generic class for map, particle, etc lights
//

export default class LightClass
{
    constructor(position,color,intensity,exponent)
    {
            // constants
            
        this.LIGHT_TYPE_NORMAL=0;
        this.LIGHT_TYPE_WAVE=1;
        
            // variables
            
        this.position=position;                 // should be PointClass
        this.eyePosition=new PointClass(0,0,0);    // the eye position in the current render, set by the view
        this.color=color;                       // should be ColorClass
        this.intensity=intensity;
        this.invertIntensity=1.0/intensity;
        this.exponent=exponent;
        
        this.lightType=this.LIGHT_TYPE_NORMAL;
        this.lightWaveFrequency=0;
        
        this.origIntensity=intensity;

        this.dist=0.0;           // used to sort lights
        
        this.frustumXBound=new BoundClass(0,0);        // set here to avoid gc
        this.frustumYBound=new BoundClass(0,0);
        this.frustumZBound=new BoundClass(0,0);
        
        Object.seal(this);
    }
    
    setPosition(x,y,z)
    {
        this.position.setFromValues(x,y,z);
    }
    
    setColor(r,g,b)
    {
        this.color.setFromValues(r,g,b);
    }
    
    setIntensity(intensity)
    {
        this.intensity=intensity;
        this.invertIntensity=1.0/intensity;
        
        this.origIntensity=this.intensity;
    }
    
    changeIntensity(intensityAdd)
    {
        this.intensity+=intensityAdd;
        if (this.intensity<1) this.intensity=1;
        
        this.invertIntensity=1.0/this.intensity;
        
        this.origIntensity=this.intensity;
    }
    
    setRandomLightType(timeStamp)
    {
        if (genRandom.randomPercentage(0.7)) {
            this.lightType=this.LIGHT_TYPE_NORMAL;
            return;
        }
        
        this.lightType=genRandom.randomIndex(2);
        
        switch (this.lightType) {
            case this.LIGHT_TYPE_WAVE:
                this.lightWaveFrequency=genRandom.randomInt(2000,2000);
                break;
        }
    }
    
    clear()
    {
        this.intensity=0.0;
        this.invertIntensity=0.0;
    }
    
    run(timeStamp)
    {
        let f;
        
        switch (this.lightType) {
            
            case this.LIGHT_TYPE_WAVE:
                f=(timeStamp%this.lightWaveFrequency)/this.lightWaveFrequency;
                f=Math.sin((2.0*Math.PI)*f);
                f=((f+1.0)*0.5);
                f=(f*0.25)+0.75;
                this.intensity=this.origIntensity*f;
                this.invertIntensity=1.0/this.intensity;
                break;
                
        }
        
    }
    
    distance(pt)
    {
        return(this.position.distance(pt));
    }
                
    distanceByTriplet(x,y,z)
    {
        return(this.position.distanceByTriplet(x,y,z));
    }
                
    withinLightRadius(pt)
    {
        return(this.position.distance(pt)<this.intensity);
    }
    
    getXBound(xBound)
    {
        xBound.setFromValues((this.position.x-this.intensity),(this.position.x+this.intensity));
    }
    
    getYBound(yBound)
    {
        yBound.setFromValues((this.position.y-this.intensity),(this.position.y+this.intensity));
    }
    
    getZBound(zBound)
    {
        zBound.setFromValues((this.position.z-this.intensity),(this.position.z+this.intensity));
    }
    
    isInsideFrustrum(view)
    {
        this.frustumXBound.setFromValues((this.position.x-this.intensity),(this.position.x+this.intensity));
        this.frustumYBound.setFromValues((this.position.y-this.intensity),(this.position.y+this.intensity));
        this.frustumZBound.setFromValues((this.position.z-this.intensity),(this.position.z+this.intensity));
        
        return(view.boundBoxInFrustum(this.frustumXBound,this.frustumYBound,this.frustumZBound));
    }
}

