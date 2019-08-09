import CoreClass from '../main/core.js';
import MapCubeClass from '../map/map_cube.js';

//
// map cube list class
//

export default class MapCubeListClass
{
    constructor(core)
    {
        this.core=core;
        this.cubes=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release cube list
        //

    initialize()
    {
        this.cubes=[];
        return(true);
    }

    release()
    {
    }

        //
        // cube list
        //

    add(cube)
    {
        this.cubes.push(cube);
    }
    
    clear()
    {
        this.cubes=[];
    }
    
        //
        // find cube for entity
        //
        
    findCubeContainingEntity(entity)
    {
        let cube;
        
        for (cube of this.cubes) {
            if (cube.entityInCube(entity)) return(cube);
        }
        
        return(null);
    }
}
