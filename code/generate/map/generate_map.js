import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MapClass from '../../map/map.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import GeneratePieceClass from './generate_piece.js';
import GenerateRoomClass from './generate_room.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateStoryClass from './generate_story.js';
import GenerateUtilityClass from '../utility/generate_utility.js';
import GenerateBitmapRun from '../bitmap/generate_bitmap_run.js';

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
    
    hasSharedWalls(room,room2,segmentSize)
    {
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        
            // check to see if two rooms share a wall segment
        
        nVertex=room.piece.vertexes.length;
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

                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) return(true);

                vIdx2++;
            }

            vIdx++;
        }
        
        return(false);
    }
    
        //
        // bitmap utilities
        //
        
    createBitmapFromSettings(bitmapSettings)
    {
        let specFactor=new ColorClass(bitmapSettings.specularFactor.red,bitmapSettings.specularFactor.green,bitmapSettings.specularFactor.blue);
        return(this.core.bitmapList.add(bitmapSettings.color,bitmapSettings.normals,bitmapSettings.specular,specFactor,null));
    }
    
        //
        // room positioning
        //
        
    setNextRoomPosition(rooms,previousRoom,nextRoom,segmentSize,pathXDeviation,forwardPath)
    {
        let n,xAdd,zAdd;
        let randShift,xShift,zShift,shiftStart,shiftEnd;
        let room,badSpot;
        let connectTryCount,segmentTryCount;
        
            // we want to always move in a single
            // direction (in this case +Z) with a deviation
            
            // we try to create a random offset so things aren't
            // in a straight line

        connectTryCount=0;
        
        while (connectTryCount!==20) {
            
                // forward or turn

            if (forwardPath) {
                xAdd=0;
                zAdd=previousRoom.size.z;
                
                xShift=pathXDeviation;
                zShift=0;
                shiftStart=-Math.trunc(nextRoom.size.x*0.5);
                shiftEnd=Math.trunc(previousRoom.size.x*0.5);
            }
            else {
                if (pathXDeviation>0) {
                    xAdd=previousRoom.size.x;
                }
                else {
                    xAdd=-nextRoom.size.x;
                }
                zAdd=0;
                
                xShift=0;
                zShift=1;
                shiftStart=-Math.trunc(nextRoom.size.z*0.5);
                shiftEnd=Math.trunc(previousRoom.size.z*0.5);
            }
            
                // remember the path
                
            nextRoom.forwardPath=forwardPath;
            nextRoom.pathXDeviation=pathXDeviation;
            
                // find an shift so they aren't all connected
                // on same x/z coords, we need to have at least
                // a wall in common, if we can't randomly find
                // one default to connected directly with no offset
             
            segmentTryCount=0;
            
            while (segmentTryCount<20) {
                randShift=GenerateUtilityClass.randomInBetween(-5,5)*segmentSize;
                
                nextRoom.offset.x=(previousRoom.offset.x+xAdd)+(randShift*xShift);
                nextRoom.offset.y=previousRoom.offset.y;
                nextRoom.offset.z=(previousRoom.offset.z+zAdd)+(randShift*zShift);
                
                if (this.hasSharedWalls(previousRoom,nextRoom,segmentSize)) break;
                
                segmentTryCount++;
            }
            
                // if we can't find a connection, try 0,0 first
                // and if not that, then go across the entire edge
                // to find the first hit
                
            if (segmentTryCount===20) {
                nextRoom.offset.x=previousRoom.offset.x+xAdd;
                nextRoom.offset.y=previousRoom.offset.y;
                nextRoom.offset.z=previousRoom.offset.z+zAdd;
                
                if (!this.hasSharedWalls(previousRoom,nextRoom,segmentSize)) {
                    
                    badSpot=true;
                    
                    for (n=-9;n!=9;n++) {           // assume largest is 10x10
                        randShift=n*segmentSize;
                
                        nextRoom.offset.x=(previousRoom.offset.x+xAdd)+(randShift*xShift);
                        nextRoom.offset.y=previousRoom.offset.y;
                        nextRoom.offset.z=(previousRoom.offset.z+zAdd)+(randShift*zShift);
                
                        if (this.hasSharedWalls(previousRoom,nextRoom,segmentSize)) {
                            badSpot=false;
                            break;
                        }                        
                    }
                    
                    if (badSpot) console.log('failed connection, room='+previousRoom.piece.name+'; next='+nextRoom.piece.name+'; forwardPath='+forwardPath+'; dev='+pathXDeviation);
                }
            }
                
                // are we colliding with any previous rooms?

            badSpot=false;

            for (n=0;n!==rooms.length;n++) {
                room=rooms[n];

                if (room.offset.x>=(nextRoom.offset.x+nextRoom.size.x)) continue;
                if ((room.offset.x+room.size.x)<=nextRoom.offset.x) continue;
                if (room.offset.z>=(nextRoom.offset.z+nextRoom.size.z)) continue;
                if ((room.offset.z+room.size.z)<=nextRoom.offset.z) continue;

                badSpot=true;
                break;
            }
                
            if (!badSpot) return(true);
            
            connectTryCount++;
        }
            
        return(false);
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n,seed;
        let roomWallBitmap,hallWallBitmap,floorBitmap,ceilingBitmap,stepBitmap,platformBitmap;
        let roomTopY,forwardPath;
        let room,nextRoom,light,genPiece,centerPnt,intensity,isStairRoom;
        let roomCount,segmentSize,pathXDeviation;
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        let rooms=[];
        
            // see the random number generator
            
        seed=(importSettings.autoGenerate.randomSeed===undefined)?Date.now():importSettings.autoGenerate.randomSeed;
        console.info('seed='+seed);
        
        GenerateUtilityClass.setRandomSeed(seed);
        
            // some global settings
            
        roomCount=importSettings.autoGenerate.roomCount;
        segmentSize=importSettings.autoGenerate.segmentSize;
        
            // bitmaps
            
        roomWallBitmap=GenerateBitmapRun.generateWall(this.core,0);
        hallWallBitmap=GenerateBitmapRun.generateWall(this.core,1);
        floorBitmap=GenerateBitmapRun.generateWall(this.core,5);
        ceilingBitmap=GenerateBitmapRun.generateWall(this.core,4);
        stepBitmap=GenerateBitmapRun.generateWall(this.core,3);
        platformBitmap=GenerateBitmapRun.generateWall(this.core,2);
        
            // we always proceed in a path, so get
            // the deviation for the path
        
        pathXDeviation=Math.sign(GenerateUtilityClass.random()-0.5);
        
            // create the random rooms
            // along a path
            
        genPiece=new GeneratePieceClass();
        
            // start room

        room=new GenerateRoomClass(genPiece.getRandomPiece(true),segmentSize,false,false);
        rooms.push(room);
        
            // path rooms
        
        for (n=1;n<roomCount;n++) {
            
                // are we going to change levels?
            
            isStairRoom=false;
            
            if ((room.storyCount>1) && (!room.stairRoom)) {
                isStairRoom=(GenerateUtilityClass.randomPercentage(importSettings.autoGenerate.stairFactor));
            }

                // create the next room
                
            if (!isStairRoom) {
                
                    // pick the path, randomly forward or to side, but stay on
                    // the stair path if we had one
                    
                forwardPath=GenerateUtilityClass.randomPercentage(importSettings.autoGenerate.pathTurnFactor);
                if (room.stairRoom) forwardPath=(room.piece.size.z>room.piece.size.x);
                
                    // create the room
                        
                nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(false),segmentSize,false,false);
                if (!this.setNextRoomPosition(rooms,room,nextRoom,segmentSize,pathXDeviation,forwardPath)) break;
                
                if (room.stairRoom) nextRoom.offset.y+=segmentSize;     // last room was a step room, so this room needs to go up
            }
            else {
                if (GenerateUtilityClass.randomPercentage(0.5)) {
                    nextRoom=new GenerateRoomClass(genPiece.getStairZPiece(),segmentSize,false,true);
                    if (!this.setNextRoomPosition(rooms,room,nextRoom,segmentSize,pathXDeviation,true)) break;
                }
                else {
                    nextRoom=new GenerateRoomClass(genPiece.getStairXPiece(),segmentSize,false,true);
                    if (!this.setNextRoomPosition(rooms,room,nextRoom,segmentSize,pathXDeviation,false)) break;
                }
            }
            
            rooms.push(nextRoom);
            
            room=nextRoom;
        }
        
            // side rooms, always rooms off of
            // other rooms but to the opposite side of path
            // these are allowed to fail and are skipped if no space

        roomCount=rooms.length;
        
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            if (GenerateUtilityClass.randomPercentage(importSettings.autoGenerate.sideRoomFactor)) {
                nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(true),segmentSize,true,false);
                if (this.setNextRoomPosition(rooms,room,nextRoom,segmentSize,-pathXDeviation,true)) {
                    nextRoom.offset.y=room.offset.y;
                    rooms.push(nextRoom);
                }
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

            GenerateMeshClass.buildRoomWalls(this.core,room,centerPnt,('wall_'+n),((room.piece.multistory&&(!room.piece.stair))?roomWallBitmap:hallWallBitmap),segmentSize);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('floor_'+n),floorBitmap,room.offset.y,segmentSize);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('ceiling_'+n),ceilingBitmap,roomTopY,segmentSize);
            
                // stairs
                
            if (room.stairRoom) GenerateMeshClass.buildRoomStairs(this.core,room,('stair_'+n),stepBitmap,stepBitmap,segmentSize);
            
                // second stories
                
            if ((room.piece.multistory) && (room.piece.starter) && (room.storyCount>1)) {
                GenerateStoryClass.buildRoomStories(this.core,room,('story_'+n),platformBitmap,segmentSize);
            }

                // room light
            
            intensity=Math.trunc(((room.size.x+room.size.z)*0.5)*0.7)+((segmentSize*0.2)*(room.storyCount-1));
            light=new LightClass(new PointClass((room.offset.x+(Math.trunc(room.size.x*0.5))),Math.trunc(roomTopY*0.9),(room.offset.z+(Math.trunc(room.size.z*0.5)))),new ColorClass(1,1,1),intensity,0.5);
            map.lightList.add(light);
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
                this.core.map.entityList.setPlayer(new entityDef.entity(this.core,entityName,entityPosition,entityAngle,entityData));
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
