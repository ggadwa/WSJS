import * as constants from '../../code/main/constants.js';
import BoundClass from '../../code/utility/bound.js';
import GenBitmapClass from '../../generate/bitmap/gen_bitmap.js';
import MapRoomListClass from '../../code/map/map_room_list.js';
import MapRoomClass from '../../code/map/map_room.js';
import MapMeshListClass from '../../code/map/map_mesh_list.js';
import MapLiquidListClass from '../../code/map/map_liquid_list.js';
import MapLightListClass from '../../code/map/map_light_list.js';
import MapEntityListClass from '../../code/map/map_entity_list.js';
import MapParticleListClass from '../../code/map/map_particle_list.js';
import MapMovementListClass from '../../code/map/map_movement_list.js';
import MapOverlayClass from '../../code/map/map_overlay.js';
import SkyClass from '../../code/sky/sky.js';
import config from '../../code/main/config.js';
import genRandom from '../../generate/utility/random.js';

//
// map class
//

export default class MapClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.fileCache=this.fileCache;
        
        this.roomList=new MapRoomListClass(view,this);
        this.meshList=new MapMeshListClass(view,fileCache);
        this.liquidList=new MapLiquidListClass(view,fileCache);
        this.lightList=new MapLightListClass(view);
        this.entityList=new MapEntityListClass();
        this.movementList=new MapMovementListClass();
        this.overlay=new MapOverlayClass(view,fileCache);
        this.sky=new SkyClass(view,fileCache);
        this.particleList=new MapParticleListClass(view,fileCache);
        
        this.genBitmap=new GenBitmapClass(view);
        this.textureBitmaps=new Map();

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        if (!this.roomList.initialize()) return(false);
        if (!this.meshList.initialize()) return(false);
        if (!this.liquidList.initialize()) return(false);
        if (!this.lightList.initialize()) return(false);
        if (!this.entityList.initialize()) return(false);
        if (!this.movementList.initialize()) return(false);
        if (!this.particleList.initialize()) return(false);
        if (!this.overlay.initialize()) return(false);
        return(this.sky.initialize());
    }

    release()
    {
        this.roomList.release();
        this.meshList.release();
        this.liquidList.release();
        this.lightList.release();
        this.entityList.release();
        this.movementList.release();
        this.particleList.release();
        this.overlay.release();
        this.sky.release();
    }
    
        //
        // textures
        //
    
    releaseTextures()
    {
        for (let bitmap of this.textureBitmaps.values()) {
            bitmap.close();
        }
        
        this.textureBitmaps.clear();
    }
    
    getTexture(bitmapType)
    {
        let bitmap=this.textureBitmaps.get(bitmapType);
        if (bitmap!==undefined) return(bitmap);
        
        bitmap=this.genBitmap.generate(bitmapType,false);
        this.textureBitmaps.set(bitmapType,bitmap);
        
        return(bitmap);
    }
    
        //
        // clear map
        //

    clear()
    {
        this.roomList.clear();
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
