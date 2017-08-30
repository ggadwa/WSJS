import * as constants from '../../code/main/constants.js';
import BoundClass from '../../code/utility/bound.js';
import GenBitmapClass from '../../generate/bitmap/gen_bitmap.js';
import MapRoomClass from '../../code/map/map_room.js';
import MapMeshListClass from '../../code/map/map_mesh_list.js';
import MapLiquidListClass from '../../code/map/map_liquid_list.js';
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
        
        this.lights=[];
        this.rooms=[];

        this.meshList=new MapMeshListClass(view,fileCache);
        this.liquidList=new MapLiquidListClass(view,fileCache);
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
        if (!this.meshList.initialize()) return(false);
        if (!this.liquidList.initialize()) return(false);
        if (!this.entityList.initialize()) return(false);
        if (!this.particleList.initialize()) return(false);
        if (!this.overlay.initialize()) return(false);
        return(this.sky.initialize());
    }

    release()
    {
        this.meshList.release();
        this.liquidList.release();
        this.entityList.release();
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
        this.lights=[];
        this.rooms=[];
        
        this.meshList.clear();
        this.liquidList.clear();
        this.entityList.clear();
        this.particleList.clear();
    }

        //
        // add items to map
        //

    addLight(light)
    {
        this.lights.push(light);
    }
    
        //
        // tracking rooms
        //
        
    addRoom(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid)
    {
        this.rooms.push(new MapRoomClass(this.view,this,pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid));
        return(this.rooms.length-1);
    }

        //
        // check if point is in light
        //

    pointInLight(pt)
    {
        let n;
        let nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            if (this.lights[n].position.distance(pt)<this.lights[n].intensity) return(true);
        }

        return(false);
    }

    pointInSingleLight(light,pt)
    {
        return(light.position.distance(pt)<light.intensity);
    }

        //
        // find all the map lights in this view
        // and add them to the view light list
        // 

    addLightsToViewLights()
    {
        let n,k,nLight,idx;
        let x,y,z;
        let light;

            // get the distance from the camera
            // to all the lights

        nLight=this.lights.length;

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];

            x=this.view.camera.position.x-light.position.x;
            y=this.view.camera.position.y-light.position.y;
            z=this.view.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
        }
        
            // find the view.MAX_LIGHT_COUNT closest lights
            // and put them into the view list

        for (n=0;n!==nLight;n++) {
            light=this.lights[n];
            
                // calculate if this lights bounds
                // are within the frustrum and eliminate if they arent
                
            if (!light.isInsideFrustrum(this.view)) continue;

                // find the light place
                
            idx=-1;

            for (k=0;k!==this.view.lights.length;k++) {
                if (this.view.lights[k].dist>light.dist) {
                    idx=k;
                    break;
                }
            }
            
                // add the light
                
            if (idx===-1) {
                if (this.view.lights.length<this.view.MAX_LIGHT_COUNT) this.view.lights.push(light);
            }
            else {
                this.view.lights.splice(idx,0,light);
                if (this.view.lights.length>this.view.MAX_LIGHT_COUNT) this.view.lights.pop();
            }
        }
    }

        //
        // find positions in map
        //
    
    findRoomForPathType(pathType)
    {
        let n;
        let nRoom=this.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            if (this.rooms[n].pathType===pathType) return(n);
        }
        
        return(-1);
    }
    
    findRandomMonsterPosition()
    {
        let roomIdx;
        let pos;
        let findTry=0;
        
        while (findTry<25) {

                // find a random room,            
                // only put in normal rooms, unless we are in
                // simple map mode where there's only one room
                
            if (config.SIMPLE_TEST_MAP) {
                roomIdx=0;
            }
            else {
                roomIdx=genRandom.randomIndex(this.rooms.length);
                
                if (this.rooms[roomIdx].pathType!==constants.ROOM_PATH_TYPE_NORMAL) {
                    findTry++;
                    continue;
                }
            }
            
                // find a random spot in room
                
            pos=this.rooms[roomIdx].findAndBlockSpawnPosition(false);
            if (pos!==null) return(pos);
            
            findTry++;
        }

        return(null);
    }
    
    findRandomPlayerPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_START);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
    findRandomBossPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_GOAL);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
        //
        // map movements
        //
    
    addMovement(movement)
    {
        this.movementList.addMovement(movement);
    }
    
    runMovements()
    {
        this.movementList.run(this.view,this);
    }
    
        //
        // pass-through for overlays
        //
        
    precalcOverlayDrawValues()
    {
        this.overlay.precalcDrawValues();
    }
        
    overlayDraw()
    {
        this.overlay.draw(this);
    }
    
    addOverlayRoom(room)
    {
        this.overlay.addRoom(room);
    }
    
    addOverlayCloset(xBound,zBound)
    {
        this.overlay.addCloset(xBound,zBound);
    }
    
    addOverlayConnection(xBound,zBound)
    {
        this.overlay.addConnection(xBound,zBound);
    };
    
    addOverlayDecorationWall(x,z,x2,z2)
    {
        this.overlay.addDecorationWall(x,z,x2,z2);
    }
    
    addOverlayPlatform(xBound,zBound)
    {
        this.overlay.addPlatform(xBound,zBound);
    }
    
    addOverlayLift(xBound,zBound)
    {
        this.overlay.addLift(xBound,zBound);
    }
    
    addOverlayStair(xBound,zBound)
    {
        this.overlay.addStair(xBound,zBound);
    }
    
    addOverlayDoor(xBound,zBound)
    {
        this.overlay.addDoor(xBound,zBound);
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
