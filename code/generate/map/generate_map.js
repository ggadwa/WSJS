import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MapClass from '../../map/map.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import GeneratePieceClass from './generate_piece.js';
import GenerateRoomClass from './generate_room.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateStoryClass from './generate_story.js';
import GeneratePillarClass from './generate_pillar.js';
import GenerateStorageClass from './generate_storage.js';
import GenerateComputerClass from './generate_computer.js';
import GeneratePipeClass from './generate_pipe.js';
import GenerateLightClass from './generate_light.js';
import GenerateUtilityClass from '../utility/generate_utility.js';
import GenerateBitmapBaseClass from '../bitmap/generate_bitmap_base.js';
import GenerateBitmapRunClass from '../bitmap/generate_bitmap_run.js';

export default class GenerateMapClass
{
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // mesh building utilities
        //
        
    removeSharedWalls(rooms,segmentSize)
    {
        let n,k,t,y,room,room2;
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        let nRoom=rooms.length;
        
            // run through ever room against every other room
            // and pull any walls that are equal as they will
            // be places the rooms connect
        
        for (n=0;n!==nRoom;n++) {
            room=rooms[n];
            nVertex=room.piece.vertexes.length;
            
            for (k=(n+1);k<nRoom;k++) {
                room2=rooms[k];
                nVertex2=room2.piece.vertexes.length;
                
                vIdx=0;
                
                while (vIdx<nVertex) {
                    nextIdx=vIdx+1;
                    if (nextIdx===nVertex) nextIdx=0;
                                        
                    ax=Math.trunc(room.piece.vertexes[vIdx][0]*segmentSize)+room.offset.x
                    az=Math.trunc(room.piece.vertexes[vIdx][1]*segmentSize)+room.offset.z
                    
                    ax2=Math.trunc(room.piece.vertexes[nextIdx][0]*segmentSize)+room.offset.x
                    az2=Math.trunc(room.piece.vertexes[nextIdx][1]*segmentSize)+room.offset.z
                    
                    vIdx2=0;
                    
                    while (vIdx2<nVertex2) {
                        nextIdx2=vIdx2+1;
                        if (nextIdx2===nVertex2) nextIdx2=0;
                        
                        bx=Math.trunc(room2.piece.vertexes[vIdx2][0]*segmentSize)+room2.offset.x
                        bz=Math.trunc(room2.piece.vertexes[vIdx2][1]*segmentSize)+room2.offset.z

                        bx2=Math.trunc(room2.piece.vertexes[nextIdx2][0]*segmentSize)+room2.offset.x
                        bz2=Math.trunc(room2.piece.vertexes[nextIdx2][1]*segmentSize)+room2.offset.z
                        
                        if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                            
                                // only blank out walls that are within the
                                // bounds of the other rooms y size
                                
                            for (t=0;t!==room.storyCount;t++) {
                                y=room.offset.y+(t*segmentSize);
                                if ((y>=(room2.offset.y+(room2.storyCount*segmentSize))) || ((y+segmentSize)<=room2.offset.y)) continue;
                                
                                room.hideVertex(t,vIdx);
                            }
                            for (t=0;t!==room2.storyCount;t++) {
                                y=room2.offset.y+(t*segmentSize);
                                if ((y>=(room.offset.y+(room.storyCount*segmentSize))) || ((y+segmentSize)<=room.offset.y)) continue;
                                
                                room2.hideVertex(t,vIdx2);
                            }
                        }
                        
                        vIdx2++;
                    }
                    
                    vIdx++;
                }
            }
        }
    }
    
        //
        // room decorations
        //
        
    buildDecoration(room,roomIdx,stepBitmap,platformBitmap,pillarBitmap,boxBitmap,computerBitmap,pipeBitmap,segmentSize)
    {
            // build the decoration
            
        switch (GenerateUtilityClass.randomIndex(5)) {
            case 0:
                GenerateStoryClass.buildRoomStories(this.core,room,('story_'+roomIdx),stepBitmap,platformBitmap,segmentSize);
                break;
            case 1:
                GeneratePillarClass.buildRoomPillars(this.core,room,('pillar_'+roomIdx),pillarBitmap,segmentSize);
                break;
            case 2:
                GenerateStorageClass.buildRoomStorage(this.core,room,('storage'+roomIdx),boxBitmap,segmentSize);
                break;
            case 3:
                GenerateComputerClass.buildRoomComputer(this.core,room,('computer_'+roomIdx),platformBitmap,computerBitmap,segmentSize);
                break;
            case 4:
                GeneratePipeClass.buildRoomPipes(this.core,room,('pipe_'+roomIdx),pipeBitmap,segmentSize);
                break;
        }
    }
    
        //
        // add additional room
        //
        
    buildSteps(core,room,name,toRoom,stepBitmap,segmentSize)
    {
        let x,z,doAll,touchRange;
        let noSkipX,noSkipZ;
        
        if (room.offset.z===(toRoom.offset.z+toRoom.size.z)) {
            touchRange=room.getTouchWallRange(toRoom,true,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipX=GenerateUtilityClass.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (x=touchRange.min;x<=touchRange.max;x++) {
                if ((GenerateUtilityClass.randomPercentage(0.5)) || (x===noSkipX) || (doAll)) {
                    GenerateStoryClass.addStairs(core,room,name,stepBitmap,segmentSize,x,0,GenerateStoryClass.PLATFORM_DIR_NEG_Z,0);
                }
            }
            return;
        }
        if ((room.offset.z+room.size.z)===toRoom.offset.z) {
            touchRange=room.getTouchWallRange(toRoom,true,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipX=GenerateUtilityClass.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (x=touchRange.min;x<=touchRange.max;x++) {
                if ((GenerateUtilityClass.randomPercentage(0.5)) || (x===noSkipX) || (doAll)) {
                    GenerateStoryClass.addStairs(core,room,name,stepBitmap,segmentSize,x,room.piece.size.z-2,GenerateStoryClass.PLATFORM_DIR_POS_Z,0);
                }
            }
            return;
        }
        if (room.offset.x===(toRoom.offset.x+toRoom.size.x)) {
            touchRange=room.getTouchWallRange(toRoom,false,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipZ=GenerateUtilityClass.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (z=touchRange.min;z<=touchRange.max;z++) {
                if ((GenerateUtilityClass.randomPercentage(0.5)) || (z===noSkipZ) || (doAll)) {
                    GenerateStoryClass.addStairs(core,room,name,stepBitmap,segmentSize,0,z,GenerateStoryClass.PLATFORM_DIR_NEG_X,0);
                }
            }
            return;
        }
        if ((room.offset.x+room.size.x)===toRoom.offset.x) {
            touchRange=room.getTouchWallRange(toRoom,false,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipZ=GenerateUtilityClass.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (z=touchRange.min;z<=touchRange.max;z++) {
                if ((GenerateUtilityClass.randomPercentage(0.5)) || (z===noSkipZ) || (doAll)) {
                    GenerateStoryClass.addStairs(core,room,name,stepBitmap,segmentSize,room.piece.size.x-2,z,GenerateStoryClass.PLATFORM_DIR_POS_X,0);
                }
            }
            return;
        }
        
    }
    
        //
        // add additional room
        //
    
    addAdditionalRoom(rooms,room,touchRoom,segmentSize)
    {
            // start at same height
            
        room.offset.y=touchRoom.offset.y;
        
            // can we change height?
            
        if ((room.offset.y===0) && (touchRoom.piece.decorate) && (touchRoom.storyCount>1)) {
            if (GenerateUtilityClass.randomPercentage(0.25)) {
                room.offset.y+=segmentSize;
                touchRoom.requiredStairs.push(room);
            }
        }
                            
            // add the room
                            
        rooms.push(room);
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n,k,seed;
        let roomWallBitmap,floorBitmap,ceilingBitmap,stepBitmap,pillarBitmap,platformBitmap,boxBitmap,computerBitmap,pipeBitmap;
        let roomTopY;
        let xAdd,zAdd,origX,origZ,touchIdx,failCount,placeCount,moveCount;
        let room,centerPnt;
        let roomCount,segmentSize,colorScheme;
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        let rooms=[];
        
            // see the random number generator
            
        seed=1578699158947; // (importSettings.autoGenerate.randomSeed===undefined)?Date.now():importSettings.autoGenerate.randomSeed;
        console.info('Random Seed: '+seed);
        
        GenerateUtilityClass.setRandomSeed(seed);
        
            // some global settings
            
        roomCount=importSettings.autoGenerate.roomCount;
        segmentSize=importSettings.autoGenerate.segmentSize;
        colorScheme=GenerateUtilityClass.randomIndex(GenerateBitmapBaseClass.COLOR_SCHEME_COUNT);
        colorScheme=GenerateBitmapBaseClass.COLOR_SCHEME_RANDOM;    // testing
        
            // bitmaps
            
        roomWallBitmap=GenerateBitmapRunClass.generateWall(this.core,colorScheme);
        floorBitmap=GenerateBitmapRunClass.generateFloor(this.core,colorScheme);
        ceilingBitmap=GenerateBitmapRunClass.generateCeiling(this.core,colorScheme);
        stepBitmap=GenerateBitmapRunClass.generateStep(this.core,colorScheme);
        pillarBitmap=GenerateBitmapRunClass.generateDecoration(this.core,colorScheme);
        platformBitmap=GenerateBitmapRunClass.generatePlatform(this.core,colorScheme);
        boxBitmap=GenerateBitmapRunClass.generateBox(this.core,colorScheme);
        computerBitmap=GenerateBitmapRunClass.generateComputer(this.core,colorScheme);
        pipeBitmap=GenerateBitmapRunClass.generatePipe(this.core,colorScheme);
        
            // first room in center of map
            
        room=new GenerateRoomClass(GeneratePieceClass.getDefaultPiece(),segmentSize);
        room.offset.setFromValues(0,0,0);
        rooms.push(room);
        
            // other rooms start outside of center
            // room and gravity brings them in until they connect
        
        roomCount=GenerateUtilityClass.randomInt(10,10);
        failCount=25;
        
        while ((rooms.length<roomCount) && (failCount>0)) {
                
            room=new GenerateRoomClass(GeneratePieceClass.getRandomPiece(),segmentSize);
            
            placeCount=10;
            
            while (placeCount>0) {
                room.offset.x=GenerateUtilityClass.randomInBetween(-100,100)*segmentSize;
                room.offset.y=0;
                room.offset.z=GenerateUtilityClass.randomInBetween(-100,100)*segmentSize;
                if (!room.collides(rooms)) break;
                
                placeCount--;
            }
            
            if (placeCount===0) {      // could not place this anywhere, so fail this room
                failCount--;
                continue;
            }
            
                // migrate it in to center of map
                
            xAdd=-(Math.sign(room.offset.x)*segmentSize);
            zAdd=-(Math.sign(room.offset.z)*segmentSize);
            
            moveCount=100;
            
            while (moveCount>0) {
                
                origX=room.offset.x;
                origZ=room.offset.z;
                
                    // we move each chunk independently, if we can't
                    // move either x or z, then fail this room
                    
                    // if we can move, check for a touch than a shared
                    // wall, if we have one, then the room is good
                    
                room.offset.x+=xAdd;
                if (room.collides(rooms)) {
                    room.offset.x-=xAdd;
                }
                else {
                    touchIdx=room.touches(rooms,n);
                    if (touchIdx!==-1) {
                        if (room.hasSharedWalls(rooms[touchIdx],segmentSize)) {
                            this.addAdditionalRoom(rooms,room,rooms[touchIdx],segmentSize);
                            break;
                        }
                    }
                }
                
                room.offset.z+=zAdd;
                if (room.collides(rooms)) {
                    room.offset.z-=zAdd;
                }
                else {
                    touchIdx=room.touches(rooms,n);
                    if (touchIdx!==-1) {
                        if (room.hasSharedWalls(rooms[touchIdx],segmentSize)) {
                            this.addAdditionalRoom(rooms,room,rooms[touchIdx],segmentSize);
                            break;
                        }
                    }
                }
                
                    // if we couldn't move at all, fail this room
                    
                if ((room.offset.x===origX) && (room.offset.z===origZ)) {
                    failCount--;
                    break;
                }
                
                moveCount--;
            }
        }
        
        console.info('room count='+rooms.length);

            // eliminate all combined walls
            
        this.removeSharedWalls(rooms,segmentSize);
        
            // now create the meshes
            
        roomCount=rooms.length;
        
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            
            roomTopY=room.offset.y+(room.storyCount*segmentSize);
            centerPnt=new PointClass((room.offset.x+Math.trunc(room.size.x*0.5)),(room.offset.y+Math.trunc((segmentSize*room.storyCount)*0.5)),(room.offset.z+Math.trunc(room.size.z*0.5)));
                
                // meshes

            GenerateMeshClass.buildRoomWalls(this.core,room,centerPnt,('wall_'+n),roomWallBitmap,segmentSize);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('floor_'+n),floorBitmap,room.offset.y,segmentSize);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('ceiling_'+n),ceilingBitmap,roomTopY,segmentSize);
            
                // decorations

            if (room.piece.decorate) this.buildDecoration(room,n,stepBitmap,platformBitmap,pillarBitmap,boxBitmap,computerBitmap,pipeBitmap,segmentSize);
            
                // room lights

            GenerateLightClass.buildRoomLight(this.core,room,('light_'+n),stepBitmap,segmentSize);
        }
        
            // any steps
            
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            
            for (k=0;k!==room.requiredStairs.length;k++) {
                this.buildSteps(this.core,room,('room_'+n+'_step_'+k),room.requiredStairs[k],stepBitmap,segmentSize);
            }
        }
        
            // entities
            
        for (n=0;n!==importSettings.entities.length;n++) {
            entityDef=importSettings.entities[n];
            
            entityName=(entityDef.name===undefined)?'':entityDef.name;
            
            if (entityDef.position!==undefined) {
                entityPosition=new PointClass(entityDef.position.x,entityDef.position.y,entityDef.position.z);
            }
            else {
                entityPosition=new PointClass(0,0,0);
            }
            if (entityDef.angle!==undefined) {
                entityAngle=new PointClass(entityDef.angle.x,entityDef.angle.y,entityDef.angle.z);
            }
            else {
                entityAngle=new PointClass(0,0,0);
            }
            
            entityData=(entityDef.data===undefined)?null:entityDef.data;
            
                // first entity is always assumed to be the player, anything
                // else is a map entity

            if (n===0) {
                entity=new entityDef.entity(this.core,entityName,entityPosition,entityAngle,entityData);
                entity.position.x=rooms[0].offset.x+Math.trunc(rooms[0].size.x*0.5);
                entity.position.y=rooms[0].offset.y;
                entity.position.z=rooms[0].offset.z+Math.trunc(rooms[0].size.z*0.5);
                this.core.map.entityList.setPlayer(entity);
            }
            else {
                entity=new entityDef.entity(this.core,entityName,entityPosition,entityAngle,entityData);
                this.core.map.entityList.add(entity);
            }
        }

            // the sky
            
        if (importSettings.skyBox===undefined) {
            this.core.map.sky.on=false;
        }
        else {
            this.core.map.sky.on=true;
            this.core.map.sky.size=importSettings.skyBox.size;
            this.core.map.sky.bitmap=this.core.bitmapList.addSimple(importSettings.skyBox.bitmap);
        }
        
        return(true);
    }
}
