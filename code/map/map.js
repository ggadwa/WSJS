import * as constants from '../../code/main/constants.js';
import BoundClass from '../../code/utility/bound.js';
import MeshListClass from '../../code/mesh/mesh_list.js';
import MapLiquidListClass from '../../code/map/map_liquid_list.js';
import MapLightListClass from '../../code/map/map_light_list.js';
import MapEntityListClass from '../../code/map/map_entity_list.js';
import MapParticleListClass from '../../code/map/map_particle_list.js';
import MapMovementListClass from '../../code/map/map_movement_list.js';
import SkyClass from '../../code/sky/sky.js';
import config from '../../code/main/config.js';
import genRandom from '../../code/utility/random.js';

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
        this.particleList=new MapParticleListClass(view);
        
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
        if (!this.particleList.initialize()) return(false);
        return(this.sky.initialize());
    }

    release()
    {
        this.meshList.release();
        this.liquidList.release();
        this.lightList.release();
        this.entityList.release();
        this.movementList.release();
        this.particleList.release();
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
        this.particleList.clear();
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
