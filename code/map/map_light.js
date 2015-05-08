"use strict";

//
// map light class
//

function MapLightObject(position,color,inLightmap,intensity,exponent)
{
    this.position=position;     // should be wsPoint
    this.color=color;           // should be wsColor
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
}

