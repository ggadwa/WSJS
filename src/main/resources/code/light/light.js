import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';

//
// map light class
// 
// generic class for map, particle, etc lights
//

export default class LightClass
{
    constructor(position,color,intensity,exponent,ambient)
    {
        this.position=position;                 // should be PointClass
        this.eyePosition=new PointClass(0,0,0);    // the eye position in the current render, set by the view
        this.color=color;                       // should be ColorClass
        this.intensity=intensity;
        this.invertIntensity=1.0/intensity;
        this.exponent=exponent;
        this.ambient=ambient;                   // these lights always make it into the light list, so be careful with them, usually a single light source (like sun)
        
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
    
    isInsideFrustrum(core)
    {
        this.frustumXBound.setFromValues((this.position.x-this.intensity),(this.position.x+this.intensity));
        this.frustumYBound.setFromValues((this.position.y-this.intensity),(this.position.y+this.intensity));
        this.frustumZBound.setFromValues((this.position.z-this.intensity),(this.position.z+this.intensity));
        
        return(core.game.boundBoxInFrustum(this.frustumXBound,this.frustumYBound,this.frustumZBound));
    }
}

