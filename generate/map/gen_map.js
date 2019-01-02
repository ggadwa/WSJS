import * as constants from '../../code/main/constants.js';
import config from '../../code/main/config.js';
import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ColorClass from '../../code/utility/color.js';
import LightClass from '../../code/light/light.js';
import MapLiquidClass from '../../code/map/map_liquid.js';
import GenRoomHallwayClass from '../../generate/map/gen_map_hallway.js';
import GenRoomClosetClass from '../../generate/map/gen_map_closet.js';
import GenRoomWindowClass from '../../generate/map/gen_map_window.js';
import GenRoomLedgeClass from '../../generate/map/gen_map_ledge.js';
import GenRoomPlatformClass from '../../generate/map/gen_map_platform.js';
import GenRoomStairsClass from '../../generate/map/gen_map_stair.js';
import GenRoomDecorationPillarClass from '../../generate/map/gen_map_decoration_pillar.js';
import GenRoomDecorationStorageClass from '../../generate/map/gen_map_decoration_storage.js';
import GenRoomDecorationComputerClass from '../../generate/map/gen_map_decoration_computer.js';
import GenRoomDecorationPipeClass from '../../generate/map/gen_map_decoration_pipe.js';
import GenRoomDecorationBlockClass from '../../generate/map/gen_map_decoration_block.js';
import GenRoomDecorationLabClass from '../../generate/map/gen_map_decoration_lab.js';
import MeshPrimitivesClass from '../../generate/utility/mesh_primitives.js';
import GenBitmapBrickClass from '../../generate/bitmap/gen_bitmap_brick.js';
import GenBitmapStoneClass from '../../generate/bitmap/gen_bitmap_stone.js';
import GenBitmapBlockClass from '../../generate/bitmap/gen_bitmap_block.js';
import GenBitmapPlasterClass from '../../generate/bitmap/gen_bitmap_plaster.js';
import GenBitmapScifiClass from '../../generate/bitmap/gen_bitmap_scifi.js';
import GenBitmapTileClass from '../../generate/bitmap/gen_bitmap_tile.js';
import GenBitmapMetalClass from '../../generate/bitmap/gen_bitmap_metal.js';
import GenBitmapDoorClass from '../../generate/bitmap/gen_bitmap_door.js';
import GenBitmapCementClass from '../../generate/bitmap/gen_bitmap_cement.js';
import GenBitmapGrateClass from '../../generate/bitmap/gen_bitmap_grate.js';
import GenBitmapHexigonClass from '../../generate/bitmap/gen_bitmap_hexigon.js';
import GenBitmapMosaicClass from '../../generate/bitmap/gen_bitmap_mosaic.js';
import GenBitmapWoodClass from '../../generate/bitmap/gen_bitmap_wood.js';
import GenBitmapLiquidClass from '../../generate/bitmap/gen_bitmap_liquid.js';
import GenBitmapGroundClass from '../../generate/bitmap/gen_bitmap_ground.js';
import genRandom from '../../generate/utility/random.js';

//
// generate map class
//

export default class GenMapClass
{
    constructor(view,map,callbackFunc)
    {
        this.view=view;
        this.map=map;

            // the callback function when
            // generation concludes

        this.callbackFunc=callbackFunc;
        
            // the base Y for the path part
            // of the map
            
        this.yBase=Math.trunc(this.view.OPENGL_FAR_Z/2);
        
            // preload data objects
            
        this.wallBitmap=null;
        this.floorBitmap=null;
        this.ceilingBitmap=null;
        this.platformBitmap=null;
        this.frameBitmap=null;
        this.lightBitmap=null;
        this.doorBitmap=null;
        this.liquidBitmap=null;
        this.fenceBitmap=null;
        this.groundBitmap=null;
        
        this.genRoomHallway=null;
        this.genRoomStairs=null;
        
        this.hasOutdoorRoom=false;
        
            // constants
            
        this.HALLWAY_NONE=0;
        this.HALLWAY_SHORT=1;
        this.HALLWAY_LONG=2;
        
            // generation constants

        this.ROOM_MIN_BLOCK_PER_SIDE=5;                 // minimum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_PER_SIDE=10;                // maximum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_COUNT=100;                  // maximum number of blocks in total for a room (x * z block count)
            
        this.ROOM_MAX_CONNECT_TRY=20;                   // number of times we try to find a place to connect rooms
        
        this.ROOM_LONG_HALLWAY_PERCENTAGE=0.3;          // what percentage of the time the general room path will have a long hallway
        this.ROOM_LIQUID_PERCENTAGE=0.3;                // what % of time a lower room can have a liquid
        this.ROOM_OUTDOOR_PERCENTAGE=0.1;               // what % of time a outdoor room is created
        
        this.ROOM_LIGHT_FACTOR=0.45;                     // lights are initially set to room radius, this factor is multipled in
        this.ROOM_LIGHT_FACTOR_EXTRA=0.25;               // random addition to light factor above
        this.ROOM_LIGHT_PER_STORY_BOOST=0.12;            // add in for each extra story

        this.ROOM_LIGHT_EXPONENT_MINIMUM=1.0;           // minimum light exponent (0.0 is completely hard light with no fall off)
        this.ROOM_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add

        this.ROOM_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
        this.ROOM_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights

        this.MAP_LIGHT_ALWAYS_WHITE=false;              // make sure map lights are always white
        
        this.HALLWAY_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*1.6;                 // intensity of hallway lights
        this.DOOR_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*1.3;                    // intensity of lights over doors
        this.WINDOW_LIGHT_INTENSITY=constants.ROOM_FLOOR_HEIGHT*4.2;                  // intensity of window light
        this.WINDOW_MAIN_LIGHT_INTENSITY_CUT=constants.ROOM_FLOOR_HEIGHT*0.05;         // how much to cut main room light for each window

        Object.seal(this);
    }
    
        //
        // preload some textures and objects
        //
        
    preloadData()
    {
        let genBitmap;
        
            // wall bitmap
            
        switch(genRandom.randomIndex(5)) {
            case 0:
                genBitmap=new GenBitmapBrickClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapStoneClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapBlockClass(this.view);
                break;
            case 3:
                genBitmap=new GenBitmapPlasterClass(this.view);
                break;
            case 4:
                genBitmap=new GenBitmapScifiClass(this.view);
                break;
        }
        
        this.wallBitmap=genBitmap.generate(false);
        
            // floor bitmap
            
        switch(genRandom.randomIndex(5)) {
            case 0:
                genBitmap=new GenBitmapTileClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapCementClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapGrateClass(this.view);
                break;
            case 3:
                genBitmap=new GenBitmapHexigonClass(this.view);
                break;
            case 4:
                genBitmap=new GenBitmapMosaicClass(this.view);
                break;
        }
        
        this.floorBitmap=genBitmap.generate(false);
        
            // ceiling bitmap
            
        switch(genRandom.randomIndex(4)) {
            case 0:
                genBitmap=new GenBitmapTileClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapCementClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapMetalClass(this.view);
                break;
            case 3:
                genBitmap=new GenBitmapWoodClass(this.view);
                break;
        }
            
        this.ceilingBitmap=genBitmap.generate(false);
        
            // platform bitmap
            
        switch(genRandom.randomIndex(5)) {
            case 0:
                genBitmap=new GenBitmapBrickClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapStoneClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapBlockClass(this.view);
                break;
            case 3:
                genBitmap=new GenBitmapMetalClass(this.view);
                break;
            case 4:
                genBitmap=new GenBitmapTileClass(this.view);
                break;
        }
        
        this.platformBitmap=genBitmap.generate(false);
        
            // frame bitmap
            
        switch(genRandom.randomIndex(3)) {
            case 0:
                genBitmap=new GenBitmapBrickClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapMetalClass(this.view);
                break;
            case 2:
                genBitmap=new GenBitmapPlasterClass(this.view);
                break;
        }
        
        this.frameBitmap=genBitmap.generate(false);
        
            // fence bitmap
            
        switch(genRandom.randomIndex(2)) {
            case 0:
                genBitmap=new GenBitmapBrickClass(this.view);
                break;
            case 1:
                genBitmap=new GenBitmapStoneClass(this.view);
                break;
        }
        
        this.fenceBitmap=genBitmap.generate(false);
        
            // ground bitmap
        
        genBitmap=new GenBitmapGroundClass(this.view);
        this.groundBitmap=genBitmap.generate(false);
        
            // other misc bitmaps
            
        genBitmap=new GenBitmapMetalClass(this.view);
        this.lightBitmap=genBitmap.generate(false);
            
        genBitmap=new GenBitmapDoorClass(this.view);
        this.doorBitmap=genBitmap.generate(false);
        
        genBitmap=new GenBitmapLiquidClass(this.view);
        this.liquidBitmap=genBitmap.generate(false);
        
            // misc constructors
            
        this.genRoomHallway=new GenRoomHallwayClass(this.view,this.map,this.wallBitmap,this.ceilingBitmap,this.floorBitmap,this.frameBitmap,this.doorBitmap);
        this.genRoomStairs=new GenRoomStairsClass(this.view,this.map,this.wallBitmap,this.platformBitmap);
    }

        //
        // create rooms
        //

    addRegularRoom(level,pathType,xBlockSize,zBlockSize,xBound,zBound,mainPath,mainPathSide,mainPathConnectedRoom,extensionDirection)
    {
        let n,mesh,mesh2;
        let yAdd,yBound,yWallBound,yFloorBound;
        let roomIdx,room;
        let storyCount,liquid,outdoor,forceOutdoor;
                
            // if the connecting room exists and is outdoors
            // reset the level
            
        forceOutdoor=false;
        
        if (mainPathConnectedRoom!==null) {
            if (mainPathConnectedRoom.outdoor) {
                level=constants.ROOM_LEVEL_NORMAL;
                forceOutdoor=true;
            }
        }
        
            // figure out room Y size from extension mode
            // all rooms need at least 2 stories
            
        switch (level) {
            case constants.ROOM_LEVEL_LOWER:
                storyCount=genRandom.randomInt(2,4);
                yAdd=(genRandom.randomInBetween(1,(storyCount-1)));
                yBound=new BoundClass(0,this.yBase+((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*yAdd));
                break;
            case constants.ROOM_LEVEL_HIGHER:
                storyCount=genRandom.randomInt(2,4);
                yBound=new BoundClass(0,this.yBase-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
                break;
            default:
                storyCount=genRandom.randomInt(2,3);
                yBound=new BoundClass(0,this.yBase);
                break;
        }
        
            // if a goal room, and we have a boss, always
            // make room taller
            
        if (pathType===constants.ROOM_PATH_TYPE_GOAL) {
            if (storyCount<4) storyCount=4;
        }
        
            // determine if this room has a liquid,
            // and lower it for pool and add a story
        
        liquid=(config.ROOM_LIQUIDS)&&(level===constants.ROOM_LEVEL_LOWER)&&(genRandom.randomPercentage(this.ROOM_LIQUID_PERCENTAGE))&&(!config.SIMPLE_TEST_MAP);
        
            // determine if outdoor
          
        outdoor=((genRandom.randomPercentage(this.ROOM_OUTDOOR_PERCENTAGE))&&(!this.hasOutdoorRoom)&&(!config.SIMPLE_TEST_MAP))||(forceOutdoor);

            // top of room
            
        yBound.min=yBound.max-((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*storyCount);
            
            // add this room to the tracking room list so
            // we can use it later to add entities and decorations and such

        roomIdx=this.map.roomList.add(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid,outdoor);
        room=this.map.roomList.get(roomIdx);
        
        this.hasOutdoorRoom|=outdoor;
        
            // if the room is higher, we need to mark that off
            // so we don't build decorations to close to steps
        
        if (mainPathConnectedRoom!==null) {    
            if (level===constants.ROOM_LEVEL_HIGHER) {
                mainPathConnectedRoom.markStairOnConnectionSide(mainPathSide);
            }
        }
        
            // indoor rooms
            
        if (!outdoor) {
            mesh=room.createMeshFloor(this.floorBitmap,constants.MESH_FLAG_ROOM_FLOOR);
            this.map.meshList.add(mesh);

                // walls
                // each wall is a tall piece and a short piece on top
                // the short piece is for headers on doors and places for platforms

            yWallBound=new BoundClass((yBound.max-constants.ROOM_FLOOR_HEIGHT),yBound.max);
            yFloorBound=new BoundClass((yWallBound.min-constants.ROOM_FLOOR_DEPTH),yWallBound.min);

            for (n=0;n!==storyCount;n++) {
                mesh=room.createMeshWalls(this.wallBitmap,yWallBound,constants.MESH_FLAG_ROOM_WALL);
                mesh2=room.createMeshWalls(this.wallBitmap,yFloorBound,constants.MESH_FLAG_ROOM_WALL);
                mesh.combineMesh(mesh2);

                this.map.meshList.add(mesh);
                if (n===0) this.map.overlay.addRoom(room);

                yWallBound.add(-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
                yFloorBound.add(-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH));
            }

            mesh=room.createMeshCeiling(this.ceilingBitmap);
            this.map.meshList.add(mesh);
        }
        else {
            mesh=room.createMeshFloor(this.groundBitmap,constants.MESH_FLAG_ROOM_GROUND);
            this.map.meshList.add(mesh);

                // walls
                // each wall is a tall piece and a short piece on top
                // the short piece is for headers on doors and places for platforms

            yWallBound=new BoundClass((yBound.max-constants.ROOM_FLOOR_HEIGHT),yBound.max);
            yFloorBound=new BoundClass((yWallBound.min-constants.ROOM_FLOOR_DEPTH),yWallBound.min);

            mesh=room.createMeshWalls(this.fenceBitmap,yWallBound,constants.MESH_FLAG_ROOM_FENCE);
            mesh2=room.createMeshWalls(this.fenceBitmap,yFloorBound,constants.MESH_FLAG_ROOM_FENCE);
            mesh.combineMesh(mesh2);
            
            this.map.meshList.add(mesh);
            this.map.overlay.addRoom(room);
        }
        
        return(roomIdx);
    }
   
        //
        // hallways and liquid steps
        //
        
    addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound)
    {
            // build the hallway
            
        let yHallwayBound=new BoundClass(this.yBase,(this.yBase-constants.ROOM_FLOOR_HEIGHT));        // don't count the upper header

        if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
            this.genRoomHallway.createHallwayX(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        else {
            this.genRoomHallway.createHallwayZ(xHallwayBound,yHallwayBound,zHallwayBound,(hallwayMode===this.HALLWAY_LONG));
        }
        
            // add to overlay
            
        this.map.overlay.addConnection(xHallwayBound,zHallwayBound);
    }
        
        //
        // lights
        //

    addGeneralLight(room,lightPos,fixturePos,rotAngle,intensity,allowNonStaticLight)
    {
        let light,red,green,blue,exponent,outdoor;
        let xFixtureBound,yFixtureBound,zFixtureBound;
        
            // outdoor lights are cast to a box boundary
            // instead of radial
            
        outdoor=false;
        if (room!==null) outdoor=room.outdoor;

            // light fixture

        if (fixturePos!==null) {
            xFixtureBound=new BoundClass((fixturePos.x-400),(fixturePos.x+400));
            yFixtureBound=new BoundClass(fixturePos.y,(fixturePos.y+1000));
            zFixtureBound=new BoundClass((fixturePos.z-400),(fixturePos.z+400));
            this.map.meshList.add(MeshPrimitivesClass.createMeshPryamid(this.view,this.lightBitmap,xFixtureBound,yFixtureBound,zFixtureBound,rotAngle,constants.MESH_FLAG_LIGHT));
        }
        
            // the color

        red=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
        if (this.MAP_LIGHT_ALWAYS_WHITE) {
            green=blue=red;
        }
        else {
            green=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
            blue=this.ROOM_LIGHT_RGB_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_RGB_MINIMUM_EXTRA);
        }
        
            // the exponent
            // if sunlight (for outdoors) than exponent
            // is 0.0 so it's hard light with no drop off
            // this is ignored in boundary rooms
        
        exponent=this.ROOM_LIGHT_EXPONENT_MINIMUM+(genRandom.random()*this.ROOM_LIGHT_EXPONENT_EXTRA);

            // add light to map

        light=new LightClass(lightPos,new ColorClass(red,green,blue),intensity,exponent);
        if (allowNonStaticLight) light.setRandomLightType(this.view.timeStamp);
        this.map.lightList.add(light);
        
            // outdoor lights are bound to their room
            
        if (outdoor) {
            light.isBoxBound=true;
            light.boxXBound.setFromBound(room.xBound);
            light.boxZBound.setFromBound(room.zBound);
        }

        return(light);
    }
    
    addRoomLight(roomIdx)
    {
        let lightY,fixturePos,lightPos,intensity;
        let room=this.map.roomList.get(roomIdx);
        
            // outdoor and indoor rooms have different
            // light types
            
        if (!room.outdoor) {

                // location

            lightY=room.yBound.max-((constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH)*room.storyCount);

            fixturePos=new PointClass(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());
            lightPos=new PointClass(fixturePos.x,(fixturePos.y+1100),fixturePos.z);

                // intensity

            intensity=Math.max(room.xBound.getSize(),room.yBound.getSize(),room.zBound.getSize());
            if (room.storyCount>=2) intensity+=(intensity*((room.storyCount-1)*this.ROOM_LIGHT_PER_STORY_BOOST));
            if (!config.SIMPLE_TEST_MAP) intensity=Math.trunc((intensity*this.ROOM_LIGHT_FACTOR)+(intensity*(genRandom.random()*this.ROOM_LIGHT_FACTOR_EXTRA)));

                // create the light
                // remember this because later windows can reduce indoor light

            room.mainLight=this.addGeneralLight(room,lightPos,fixturePos,null,intensity,true);
        }
        else {

                // location

            lightY=room.yBound.max-(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH);
            lightPos=new PointClass(room.xBound.getMidPoint(),lightY,room.zBound.getMidPoint());

                // intensity

            intensity=Math.trunc((room.xBound.getSize()+room.zBound.getSize())*0.25)+(constants.ROOM_FLOOR_HEIGHT+constants.ROOM_FLOOR_DEPTH);

                // create the light
                // remember this because later windows can reduce indoor light

            room.mainLight=this.addGeneralLight(room,lightPos,null,null,intensity,true);
        }
    }
    
    addHallwayLight(lastRoom,room,connectSide,hallwayMode,hallwaySize,xBound,zBound)
    {
        let xAdd,zAdd,xAdd2,zAdd2,y,fixturePos,lightPos;
        let rot1,rot2,startOK,endOK;
        
            // middle of hallway
            
        if (hallwayMode===this.HALLWAY_LONG) {
            fixturePos=new PointClass(xBound.getMidPoint(),(this.yBase-constants.ROOM_FLOOR_HEIGHT),zBound.getMidPoint());
            lightPos=new PointClass(fixturePos.x,(fixturePos.y+1100),fixturePos.z);
            this.addGeneralLight(null,lightPos,fixturePos,null,this.HALLWAY_LIGHT_INTENSITY,true);
        }
        
            // ends
        
        y=this.yBase-(constants.ROOM_FLOOR_HEIGHT+(constants.ROOM_FLOOR_DEPTH*4));
        
        if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
            xAdd=Math.trunc(hallwaySize*0.5)+constants.ROOM_FLOOR_DEPTH;
            xAdd2=1000;
            zAdd=zAdd2=0;
            rot1=new PointClass(90,90,0);
            rot2=new PointClass(0,90,90);
        }
        else {
            xAdd=xAdd2=0;
            zAdd=Math.trunc(hallwaySize*0.5)+constants.ROOM_FLOOR_DEPTH;
            zAdd2=1000;
            rot1=new PointClass(90,0,0);
            rot2=new PointClass(90,180,0);
        }
            
            // outside doesn't have end lights
            
        if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_TOP)) {
            startOK=!lastRoom.outdoor;
            endOK=!room.outdoor;
        }
        else {
            startOK=!room.outdoor;
            endOK=!lastRoom.outdoor;
        }
        
            // the lights
            
        if (startOK) {
            fixturePos=new PointClass((xBound.getMidPoint()+xAdd),y,(zBound.getMidPoint()+zAdd));
            lightPos=new PointClass((fixturePos.x+xAdd2),fixturePos.y,(fixturePos.z+zAdd2));
            this.addGeneralLight(null,lightPos,fixturePos,rot1,this.DOOR_LIGHT_INTENSITY,true);
        }
        
        if (endOK) {
            fixturePos=new PointClass((xBound.getMidPoint()-xAdd),y,(zBound.getMidPoint()-zAdd));
            lightPos=new PointClass((fixturePos.x-xAdd2),fixturePos.y,(fixturePos.z-zAdd2));
            this.addGeneralLight(null,lightPos,fixturePos,rot2,this.DOOR_LIGHT_INTENSITY,true);
        }
    }
  
        //
        // finds a single random block offset between two bounds
        //
        
    findRandomBlockOffsetBetweenTwoBounds(bound1,bound2)
    {
        let count,offset;
        let min=bound1.min;
        let max=bound1.max;
        
        if (bound2.min>min) min=bound2.min;
        if (bound2.max<max) max=bound2.max;
        
        count=Math.trunc((max-min)/constants.ROOM_BLOCK_WIDTH);
        offset=genRandom.randomIndex(count)*constants.ROOM_BLOCK_WIDTH;
        if (bound1.min<bound2.min) offset+=(bound2.min-bound1.min);           // need to align offset with bounds1
        
        return(offset);
    }

        //
        // build a path of rooms
        //

    buildMapRoomPath(lastRoom,hallwayMode)
    {
        let roomIdx,room,tryCount;
        let xBlockSize,zBlockSize;
        let connectSide,connectOffset,pathType,extensionDirection;
        let xBound,zBound;
        let doorOffset,doorAdd,xHallwayBound,zHallwayBound;
        let mapMid,halfSize;
        
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        if (config.SIMPLE_TEST_MAP) {
            xBlockSize=10;
            zBlockSize=10;
        }
        else {
            xBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
            zBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);

            while ((xBlockSize*zBlockSize)>this.ROOM_MAX_BLOCK_COUNT) {
                if (xBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
                if (zBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
            }
        }
        
            // get room location
            // if we don't have a previous room,
            // then it's the first room and it's
            // centered in the map

        if (lastRoom===null) {
            mapMid=Math.trunc(this.view.OPENGL_FAR_Z/2);

            halfSize=Math.trunc((xBlockSize/2)*constants.ROOM_BLOCK_WIDTH);
            xBound=new BoundClass((mapMid-halfSize),(mapMid+halfSize));

            halfSize=Math.trunc((zBlockSize/2)*constants.ROOM_BLOCK_WIDTH);
            zBound=new BoundClass((mapMid-halfSize),(mapMid+halfSize));
            
            pathType=constants.ROOM_PATH_TYPE_START;
            extensionDirection=constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT;
        }

            // otherwise we connect to the previous room

        else {

            tryCount=0;
            
            while (true) {
                
                    // most of the time we always path up, but 1/3rd
                    // of the time we can jog left or right, and this changes
                    // where the extension rooms go
                
                if (genRandom.randomPercentage(0.33)) {
                    connectSide=(genRandom.randomPercentage(0.5))?constants.ROOM_SIDE_LEFT:constants.ROOM_SIDE_RIGHT;
                    extensionDirection=constants.ROOM_EXTENSION_DIRECTION_TOP_BOTTOM;
                }
                else {
                    connectSide=constants.ROOM_SIDE_TOP;
                    extensionDirection=constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT;
                }
                
                if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                    connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
                }
                else {
                    connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
                }
                
                connectOffset*=constants.ROOM_BLOCK_WIDTH;
                
                    // get new room bounds and move it around
                    // if we need space for hallways
                
                doorAdd=(hallwayMode===this.HALLWAY_LONG)?(constants.ROOM_BLOCK_WIDTH*4):constants.ROOM_BLOCK_WIDTH;
                
                switch (connectSide) {

                    case constants.ROOM_SIDE_LEFT:
                        xBound=new BoundClass((lastRoom.xBound.min-(xBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                        zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min-doorAdd),lastRoom.xBound.min);
                            zHallwayBound=new BoundClass((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case constants.ROOM_SIDE_TOP:
                        xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass((lastRoom.zBound.min-(zBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(-doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new BoundClass((lastRoom.zBound.min-doorAdd),lastRoom.zBound.min);
                        }
                        
                        break;

                    case constants.ROOM_SIDE_RIGHT:
                        xBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            xBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.zBound,zBound);
                            xHallwayBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+doorAdd));
                            zHallwayBound=new BoundClass((lastRoom.zBound.min+doorOffset),((lastRoom.zBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                        }
                        
                        break;

                    case constants.ROOM_SIDE_BOTTOM:
                        xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        zBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                        
                        if (hallwayMode!==this.HALLWAY_NONE) {
                            zBound.add(doorAdd);
                            doorOffset=this.findRandomBlockOffsetBetweenTwoBounds(lastRoom.xBound,xBound);
                            xHallwayBound=new BoundClass((lastRoom.xBound.min+doorOffset),((lastRoom.xBound.min+doorOffset)+constants.ROOM_BLOCK_WIDTH));
                            zHallwayBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+doorAdd));
                        }
                        
                        break;

                }
                
                if ((this.map.meshList.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_WALL)===-1) && (this.map.meshList.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_FENCE)===-1)) break;

                tryCount++;
                if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
            }
                
                // path type for rooms on path is normal unless
                // this is the final room

            pathType=((this.map.roomList.count()+1)>=config.ROOM_PATH_COUNT)?constants.ROOM_PATH_TYPE_GOAL:constants.ROOM_PATH_TYPE_NORMAL;
        }

            // the room
            
        roomIdx=this.addRegularRoom(constants.ROOM_LEVEL_NORMAL,pathType,xBlockSize,zBlockSize,xBound,zBound,true,-1,null,extensionDirection);
        room=this.map.roomList.get(roomIdx);
        
            // add in hallways and a light
            // if the hallway is long
            
        if (hallwayMode!==this.HALLWAY_NONE) {
            this.addHallwayRoom(connectSide,hallwayMode,xHallwayBound,zHallwayBound);
            this.addHallwayLight(lastRoom,room,connectSide,hallwayMode,doorAdd,xHallwayBound,zHallwayBound);
        
                // mark off any doors we made
            
            lastRoom.markDoorOnConnectionSide(connectSide,false);
            room.markDoorOnConnectionSide(connectSide,true);
        }
        
            // mask off edges that have collided with
            // the newest room or hallway to room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            switch (hallwayMode) {
                case this.HALLWAY_SHORT:
                case this.HALLWAY_LONG:
                    lastRoom.maskEdgeGridBlockToBounds(xHallwayBound,zHallwayBound);
                    room.maskEdgeGridBlockToBounds(xHallwayBound,zHallwayBound);
                    break;
                default:
                    lastRoom.maskEdgeGridBlockToRoom(room);
                    room.maskEdgeGridBlockToRoom(lastRoom);
                    break;
            }
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
        
            // at end of path?
            
        if ((this.map.roomList.count()>=config.ROOM_PATH_COUNT) || (config.SIMPLE_TEST_MAP)) return;

            // compact mode has no hallways
        
        if (config.MAP_DESIGN_TYPE===this.map.DESIGN_COMPACT) {
            hallwayMode=this.HALLWAY_NONE;
        }
        else {
            hallwayMode=(genRandom.randomPercentage(this.ROOM_LONG_HALLWAY_PERCENTAGE))?this.HALLWAY_LONG:this.HALLWAY_SHORT;
        }
        
            // next room in path
        
        this.buildMapRoomPath(room,hallwayMode);
    }
    
        //
        // extend any of the rooms along the path
        //
    
    buildRoomExtensionSingle(level,lastRoom,connectSide)
    {
        let roomIdx,room,tryCount;
        let xBlockSize,zBlockSize;
        let connectOffset;
        let xBound,zBound;
        
        //level=constants.ROOM_LEVEL_LOWER;         // supergumba -- testing
        
            // get random block size for room
            // and make sure it stays under the max
            // blocks for room
        
        xBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
        zBlockSize=genRandom.randomInt(this.ROOM_MIN_BLOCK_PER_SIDE,this.ROOM_MAX_BLOCK_PER_SIDE);
        
        while ((xBlockSize*zBlockSize)>this.ROOM_MAX_BLOCK_COUNT) {
            if (xBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) xBlockSize--;
            if (zBlockSize>this.ROOM_MIN_BLOCK_PER_SIDE) zBlockSize--;
        }

            // connect to the previous
            // room by picking a side, and an offset into
            // that side

        tryCount=0;

        while (true) {

                // get random side and offset
                // we can start a new room half off the other
                // side and up the last room's side size


            if ((connectSide===constants.ROOM_SIDE_LEFT) || (connectSide===constants.ROOM_SIDE_RIGHT)) {
                connectOffset=genRandom.randomInt(-Math.trunc(zBlockSize*0.5),lastRoom.zBlockSize);
            }
            else {
                connectOffset=genRandom.randomInt(-Math.trunc(xBlockSize*0.5),lastRoom.xBlockSize);
            }
            connectOffset*=constants.ROOM_BLOCK_WIDTH;

                // get new room bounds

            switch (connectSide) {

                case constants.ROOM_SIDE_LEFT:
                    xBound=new BoundClass((lastRoom.xBound.min-(xBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.xBound.min);
                    zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

                case constants.ROOM_SIDE_TOP:
                    xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass((lastRoom.zBound.min-(zBlockSize*constants.ROOM_BLOCK_WIDTH)),lastRoom.zBound.min);
                    break;

                case constants.ROOM_SIDE_RIGHT:
                    xBound=new BoundClass(lastRoom.xBound.max,(lastRoom.xBound.max+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass((lastRoom.zBound.min+connectOffset),((lastRoom.zBound.min+connectOffset)+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

                case constants.ROOM_SIDE_BOTTOM:
                    xBound=new BoundClass((lastRoom.xBound.min+connectOffset),((lastRoom.xBound.min+connectOffset)+(xBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    zBound=new BoundClass(lastRoom.zBound.max,(lastRoom.zBound.max+(zBlockSize*constants.ROOM_BLOCK_WIDTH)));
                    break;

            }

            if ((this.map.meshList.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_WALL)===-1) && (this.map.meshList.boxBoundCollision(xBound,null,zBound,constants.MESH_FLAG_ROOM_FENCE)===-1)) break;
            
            tryCount++;
            if (tryCount>this.ROOM_MAX_CONNECT_TRY) return;
        }
        
            // the room
            
        roomIdx=this.addRegularRoom(level,constants.ROOM_PATH_TYPE_NORMAL,xBlockSize,zBlockSize,xBound,zBound,false,connectSide,lastRoom,lastRoom.extensionDirection);
        room=this.map.roomList.get(roomIdx);
        
            // mark where windows can be
        
        room.markExtensionLegalWindowSide(connectSide,lastRoom);
        
            // finally add the liquid
        
        if (room.liquid) this.map.liquidList.add(new MapLiquidClass(this.view,this.liquidBitmap,room));
        
            // mask off edges that have collided with
            // the newest room or stairs leading to a room
            // we use this mask to calculate ledges and other
            // outside wall hugging map pieces
        
        if (lastRoom!==null) {
            lastRoom.maskEdgeGridBlockToRoom(room);
            room.maskEdgeGridBlockToRoom(lastRoom);
        }
        
            // add the room light

        this.addRoomLight(roomIdx);
    }

    buildRoomExtensions()
    {
        let n,room;
        let nRoom=this.map.roomList.count();
        
            // sparse mode has no extensions
            
        if (config.MAP_DESIGN_TYPE===this.map.DESIGN_SPARSE) return;
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            
                // only do extensions on normal rooms
                
            if (room.pathType!==constants.ROOM_PATH_TYPE_NORMAL) continue;
            
                // extensions on side of path direction
            
            if (room.extensionDirection===constants.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT) {
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_LEFT);
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_RIGHT);
            }
            else {
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_TOP);
                if (genRandom.randomPercentage(0.5)) this.buildRoomExtensionSingle(genRandom.randomIndex(constants.ROOM_LEVEL_COUNT),room,constants.ROOM_SIDE_BOTTOM);
            }
        }
    }
    
        //
        // closets, ledges, and decorations
        //
        
    buildRoomClosets()
    {
        let n,room,closet;
        let nRoom=this.map.roomList.count();
        
        closet=new GenRoomClosetClass(this.view,this.map,this.wallBitmap,this.floorBitmap,this.ceilingBitmap);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if ((!room.liquid) && (!room.outdoor)) closet.addCloset(room);
        }
    }
    
    buildRoomWindows()
    {
        let n,room,windows;
        let nRoom=this.map.roomList.count();
        
        windows=new GenRoomWindowClass(this.view,this.map,this.wallBitmap,this.frameBitmap);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if ((!room.liquid) && (!room.outdoor)) windows.addWindow(this,room);
        }
    }
    
    buildRoomLedges()
    {
        let n,room,ledge;
        let nRoom=this.map.roomList.count();
        
        ledge=new GenRoomLedgeClass(this.view,this.map,this.platformBitmap);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if (!room.outdoor) ledge.createLedges(room);
        }
    }
    
    buildRoomPlatforms()
    {
        let n,room,platform;
        let nRoom=this.map.roomList.count();
        
        platform=new GenRoomPlatformClass(this.view,this.map,this.platformBitmap,this.genRoomStairs);
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if ((room.mainPath) || (room.outdoor)) continue;
            
            switch (room.level) {
                case constants.ROOM_LEVEL_LOWER:
                    platform.create(room);
                    break;
                case constants.ROOM_LEVEL_HIGHER:
                    this.genRoomStairs.createStairsExtension(room);
                    break;
            }
        }
    }
    
    buildRoomDecorations()
    {
        let n,room,rects;
        let k,nRect,decorationObj;
        let pillar=new GenRoomDecorationPillarClass(this.view,this.map,this.platformBitmap);
        let storage=new GenRoomDecorationStorageClass(this.view,this.map,this.platformBitmap);
        let computer=new GenRoomDecorationComputerClass(this.view,this.map,this.platformBitmap);
        let pipe=new GenRoomDecorationPipeClass(this.view,this.map,this.platformBitmap);
        let block=new GenRoomDecorationBlockClass(this.view,this.map,this.platformBitmap);
        let lab=new GenRoomDecorationLabClass(this.view,this.map,this.platformBitmap);
        let nRoom=this.map.roomList.count();
        
        let upperList=[pillar,storage,computer,lab];
        let normalList=[pillar,storage,computer,pipe,block,lab];
        let lowerList=[pillar,storage,computer,lab];
        
        for (n=0;n!==nRoom;n++) {
            room=this.map.roomList.get(n);
            if ((room.liquid) || (room.outdoor)) continue;
            
                // a random series of rectangles in the room
                // to place decorations
                
            rects=room.createRandomRects(room);
            
                // put items in the rects
                
            nRect=rects.length;
            
            for (k=0;k!==nRect;k++) {
                
                    // a number between 0 and 1 for how dense the decorations are
                    
                if (!genRandom.randomPercentage(config.DECORATION_DENSTIY)) continue;
            
                    // pick a random dectoration
                
                if (room.level===constants.ROOM_LEVEL_HIGHER) {
                    decorationObj=upperList[genRandom.randomIndex(upperList.length)];
                }
                else {
                    if (room.level===constants.ROOM_LEVEL_LOWER) {
                        decorationObj=lowerList[genRandom.randomIndex(lowerList.length)];
                    }
                    else {
                        decorationObj=normalList[genRandom.randomIndex(normalList.length)];
                    }
                }
                
                //decorationObj=storage; // supergumba -- testing
            
                decorationObj.create(room,rects[k]);
                room.blockGridForRect(rects[k]);
            }
        }
    }

        //
        // build map mainline
        //

    build()
    {
        this.preloadData();
        
        this.view.loadingScreenDraw(0.1);
        setTimeout(this.buildMapPath.bind(this),1);
    }
    
    buildMapPath()
    {
            // start the recursive
            // room adding

        this.buildMapRoomPath(null,this.HALLWAY_NONE);
        
        this.view.loadingScreenDraw(0.2);
        
        if (config.SIMPLE_TEST_MAP) {
            setTimeout(this.buildMapFinish.bind(this),1);
        }
        else {
            setTimeout(this.buildMapExtensions.bind(this),1);
        }
    }
    
    buildMapExtensions()
    {
            // start the recursive
            // room adding

        this.buildRoomExtensions();
        
        this.view.loadingScreenDraw(0.3);
        setTimeout(this.buildMapRoomPieces.bind(this),1);
    }
    
    buildMapRoomPieces()
    {
            // build room pieces
            
        this.buildRoomClosets();
        this.buildRoomWindows();
        this.buildRoomLedges();
        this.buildRoomPlatforms();
        this.buildRoomDecorations();
        
            // finish with the callback

        this.view.loadingScreenDraw(0.4);
        setTimeout(this.buildMapRemoveSharedTriangles1.bind(this),1);
    }
    
    buildMapRemoveSharedTriangles1()
    {
            // we do this in separate passes as some polygons
            // shouldn't remove others, and vice versa.  first
            // remove all the shared trigs between rooms and
            // remove them both
            
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_ROOM_WALL,constants.MESH_FLAG_ROOM_WALL,true,true);
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_ROOM_FENCE,constants.MESH_FLAG_ROOM_FENCE,true,true);
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_ROOM_WALL,constants.MESH_FLAG_ROOM_FENCE,true,true);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.6);
        setTimeout(this.buildMapRemoveSharedTriangles2.bind(this),1);
    }
    
    
    buildMapRemoveSharedTriangles2()
    {
            // now remove any platforms or ledges that are equal
            // in another platform or ledge wall
            
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_PLATFORM,constants.MESH_FLAG_PLATFORM,true,true);
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_LEDGE,constants.MESH_FLAG_LEDGE,true,true);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.7);
        setTimeout(this.buildMapRemoveSharedTriangles3.bind(this),1);
    }

    buildMapRemoveSharedTriangles3()
    {
            // and finally remove any platform or ledge triangles that
            // are enclosed by an outer wall
            
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_PLATFORM,constants.MESH_FLAG_ROOM_WALL,false,false);
        this.map.meshList.removeSharedTrianglesChunk(constants.MESH_FLAG_LEDGE,constants.MESH_FLAG_ROOM_WALL,false,false);
        
            // finish with the callback
            
        this.view.loadingScreenDraw(0.8);
        setTimeout(this.buildMapFinish.bind(this),1);
    }
    
    buildMapFinish()
    {
            // randomize outside rooms
            
        this.map.meshList.randomizeXZVertexes(constants.MESH_FLAG_ROOM_FENCE,[constants.MESH_FLAG_ROOM_WALL,constants.MESH_FLAG_DECORATION],this.yBase,0.9,0.1);
        this.map.meshList.randomizeYVertexes(constants.MESH_FLAG_ROOM_GROUND,[constants.MESH_FLAG_ROOM_FLOOR,constants.MESH_FLAG_DECORATION],this.yBase,0,constants.FLOOR_RISE_HEIGHT);
        
            // overlay precalc
            
        this.map.overlay.precalcDrawValues();
        
            // finish with the callback
            
        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    }

}
