import BoundClass from '../utility/bound.js';
import ImportGLTFClass from '../import/import_gltf.js';
import MeshListClass from '../mesh/mesh_list.js';
import MapLiquidListClass from '../map/map_liquid_list.js';
import MapLightListClass from '../map/map_light_list.js';
import MapEntityListClass from '../map/map_entity_list.js';
import MapEffectListClass from '../map/map_effect_list.js';
import MapCubeListClass from '../map/map_cube_list.js';
import MapPathClass from '../map/map_path.js';
import MapSkyClass from '../map/map_sky.js';
import MapBackgroundClass from '../map/map_background.js';

//
// map class
//

export default class MapClass
{
    constructor(core,name)
    {
        this.core=core;
        this.name=name;
            
        this.bumpHeight=0;
        
        this.viewSetup=null;
        
        this.gravityMinValue=0;
        this.gravityMaxValue=0;
        this.gravityAcceleration=0;
        
        this.meshList=new MeshListClass(core);
        this.liquidList=new MapLiquidListClass(core);
        this.lightList=new MapLightListClass(core);
        this.entityList=new MapEntityListClass(core);
        this.effectList=new MapEffectListClass(core);
        this.cubeList=new MapCubeListClass(core);
        this.path=new MapPathClass(core);
        this.sky=new MapSkyClass(core);
        this.background=new MapBackgroundClass(core);
        
        this.musicName=null;
        this.musicLoopStart=0;
        this.musicLoopEnd=0;
        
        this.hasShadowmap=false;
        
        this.kartStartPositions=[];
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        if (!this.meshList.initialize()) return(false);
        if (!this.liquidList.initialize()) return(false);
        if (!this.lightList.initialize()) return(false);
        if (!this.entityList.initialize()) return(false);
        if (!this.effectList.initialize()) return(false);
        if (!this.cubeList.initialize()) return(false);
        if (!this.sky.initialize()) return(false);
        return(this.background.initialize());
    }

    release()
    {
        this.meshList.release();
        this.liquidList.release();
        this.lightList.release();
        this.entityList.release();
        this.effectList.release();
        this.cubeList.release();
        this.sky.release();
        this.background.release();
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
        this.effectList.clear();
        this.cubeList.clear();
    }
    
        //
        // setup all the mesh buffers
        //

    setupBuffers()
    {
        this.meshList.setupBuffers();
        this.liquidList.setupBuffers();
    }
    
        //
        // load the map and required json caches
        //
        
    async loadMap()
    {
        let importGLTF;
        
        importGLTF=new ImportGLTFClass(this.core,this.core.map.name);
        if (!(await importGLTF.import(this.core.map,this.core.map.meshList,null))) return(false);
       
            // paths json
            
        await this.path.load();

        return(true);
    }
    
        //
        // ready the map
        //
        
    ready()
    {
        let camera;
        
            // setup camera
            
        camera=this.core.camera;

        camera.gotoFirstPerson();   // default until player script runs
        camera.setViewDistance(this.viewSetup.nearZ,this.viewSetup.farZ);
    }
    
}
