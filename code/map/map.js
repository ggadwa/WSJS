import * as constants from '../main/constants.js';
import BoundClass from '../utility/bound.js';
import MeshListClass from '../mesh/mesh_list.js';
import MapLiquidListClass from '../map/map_liquid_list.js';
import MapLightListClass from '../map/map_light_list.js';
import MapEntityListClass from '../map/map_entity_list.js';
import MapEffectListClass from '../map/map_effect_list.js';
import MapMovementListClass from '../map/map_movement_list.js';
import SkyClass from '../map/sky.js';
import config from '../main/config.js';
import genRandom from '../utility/random.js';

//
// map class
//

export default class MapClass
{
    constructor(view)
    {
        this.view=view;
        
            // constants
            
        this.DESIGN_SPARSE=0;
        this.DESIGN_MEDIUM=1;
        this.DESIGN_COMPACT=2;
            
            // variables
        
        this.meshList=new MeshListClass(view);
        this.liquidList=new MapLiquidListClass(view);
        this.lightList=new MapLightListClass(view);
        this.entityList=new MapEntityListClass();
        this.movementList=new MapMovementListClass();
        this.sky=new SkyClass(view);
        this.effectList=new MapEffectListClass(view);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        if (!this.meshList.initialize(this.view.shaderList.mapMeshShader)) return(false);
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
