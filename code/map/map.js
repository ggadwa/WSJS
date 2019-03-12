import * as constants from '../main/constants.js';
import BoundClass from '../utility/bound.js';
import MeshListClass from '../mesh/mesh_list.js';
import MapLiquidListClass from '../map/map_liquid_list.js';
import MapLightListClass from '../map/map_light_list.js';
import MapEntityListClass from '../map/map_entity_list.js';
import MapEffectListClass from '../map/map_effect_list.js';
import MapMovementListClass from '../map/map_movement_list.js';
import MapPathClass from '../map/map_path.js';
import SkyClass from '../map/sky.js';
import config from '../main/config.js';
import genRandom from '../utility/random.js';

//
// map class
//

export default class MapClass
{
    constructor(core)
    {
        this.core=core;
            
            // variables
        
        this.meshList=new MeshListClass(core);
        this.liquidList=new MapLiquidListClass(core);
        this.lightList=new MapLightListClass(core);
        this.entityList=new MapEntityListClass();
        this.movementList=new MapMovementListClass();
        this.sky=new SkyClass(core);
        this.effectList=new MapEffectListClass(core);
        this.path=new MapPathClass(core);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        if (!this.meshList.initialize(this.core.shaderList.mapMeshShader)) return(false);
        if (!this.liquidList.initialize()) return(false);
        if (!this.lightList.initialize()) return(false);
        if (!this.entityList.initialize()) return(false);
        if (!this.movementList.initialize()) return(false);
        if (!this.effectList.initialize()) return(false);
        return(this.sky.initialize());
    }

    release()
    {
        this.meshList.release();
        this.liquidList.release();
        this.lightList.release();
        this.entityList.release();
        this.movementList.release();
        this.effectList.release();
        this.sky.release();
    }
    
        //
        // clear map
        //

    clear()
    {
        this.meshList.clear();
        this.liquidList.clear();
        this.lightList.clear();
        this.entityList.clear();
        this.movementList.clear();
        this.effectList.clear();
    }

        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        this.meshList.setupBuffers();
        this.liquidList.setupBuffers();
    }
    
    
}
