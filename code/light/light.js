"use strict";

//
// map light class
// 
// generic class for map, particle, etc lights
//

class LightClass
{
    constructor(position,color,intensity,exponent)
    {
        this.position=position;                 // should be wsPoint
        this.eyePosition=new wsPoint(0,0,0);    // the eye position in the current render, set by the view
        this.color=color;                       // should be wsColor
        this.intensity=intensity;
        this.invertIntensity=1.0/intensity;
        this.exponent=exponent;

        this.dist=0.0;           // used to sort lights
        
        this.frustumXBound=new wsBound(0,0);        // set here to avoid gc
        this.frustumYBound=new wsBound(0,0);
        this.frustumZBound=new wsBound(0,0);
        
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
    }
    
    changeIntensity(intensityAdd)
    {
        this.intensity+=intensityAdd;
        if (this.intensity<1) this.intensity=1;
        
        this.invertIntensity=1.0/this.intensity;
    }
    
    clear()
    {
        this.intensity=0.0;
        this.invertIntensity=0.0;
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
    
    isInsideFrustrum()
    {
        this.frustumXBound.setFromValues((this.position.x-this.intensity),(this.position.x+this.intensity));
        this.frustumYBound.setFromValues((this.position.y-this.intensity),(this.position.y+this.intensity));
        this.frustumZBound.setFromValues((this.position.z-this.intensity),(this.position.z+this.intensity));
        
        return(view.boundBoxInFrustum(this.frustumXBound,this.frustumYBound,this.frustumZBound));
    }
}

