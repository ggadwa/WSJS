import CoreClass from '../main/core.js';
import MapSpotClass from '../map/map_spot.js';

//
// map spot list class
//

export default class MapCubeListClass
{
    constructor(core)
    {
        this.core=core;
        this.spots=new Map();
        
        Object.seal(this);
    }
    
        //
        // initialize/release spot list
        //

    initialize()
    {
        this.spots.clear();
        return(true);
    }

    release()
    {
        this.spots.clear();
    }

        //
        // spot list
        //

    add(name,position,data)
    {
        this.spots.set(name,new MapSpotClass(position,data));
    }
    
    clear()
    {
        this.spots.clear();
    }
    
        //
        // find spots
        //
        
    getRandomUnusedSpotAndMark()
    {
        let spot;
        let count=this.spots.size;
        let idx=Math.trunc(Math.random()*count);
        let idx2=0;
        
        while (idx2<count) {
        
            for (spot of this.spots.values()) {
                if (!spot.used) {
                    if (idx===0) {
                        spot.used=true;
                        return(spot);
                    }
                    idx--;
                }
            }
            
            idx2++;
        }
        
        return(null);
    }
}
