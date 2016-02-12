"use strict";

//
// map light class
//

function MapLightObject(position,color,inLightmap,intensity,exponent)
{
    this.position=position;                 // should be wsPoint
    this.eyePosition=new wsPoint(0,0,0);    // the eye position in the current render, set by the view
    this.color=color;                       // should be wsColor
    this.intensity=intensity;
    this.invertIntensity=1.0/intensity;
    this.exponent=exponent;
    
    this.inLightmap=inLightmap; // if used to generate the light map (color component ignored in shaders)
    
    this.origIndex=0;           // used to sort lights
    this.dist=0.0;
    
    this.meshIntersectList=null;      // list of mesh indexes that intersect with this light, is a Uint16Array
    
        //
        // functions
        //
        
    this.distance=function(pt)
    {
        return(this.position.distance(pt));
    };
                
    this.distanceByTriplet=function(x,y,z)
    {
        return(this.position.distanceByTriplet(x,y,z));
    };
                
    this.withinLightRadius=function(pt)
    {
        return(this.position.distance(pt)<this.intensity);
    };
    
    this.getXBound=function(xBound)
    {
        xBound.set((this.position.x-intensity),(this.position.x+intensity));
    };
    
    this.getYBound=function(yBound)
    {
        yBound.set((this.position.y-intensity),(this.position.y+intensity));
    };
    
    this.getZBound=function(zBound)
    {
        zBound.set((this.position.z-intensity),(this.position.z+intensity));
    };
}

