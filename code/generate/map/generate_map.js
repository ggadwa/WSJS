import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MapClass from '../../map/map.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import GeneratePieceClass from './generate_piece.js';
import GenerateRoomClass from './generate_room.js';
import GenerateMeshClass from './generate_mesh.js';
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
        
    removeSharedWalls(rooms,roomSize,roomHigh)
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
                                        
                    ax=Math.trunc((room.piece.vertexes[vIdx][0]*0.1)*roomSize)+room.offset.x
                    az=Math.trunc((room.piece.vertexes[vIdx][1]*0.1)*roomSize)+room.offset.z
                    
                    ax2=Math.trunc((room.piece.vertexes[nextIdx][0]*0.1)*roomSize)+room.offset.x
                    az2=Math.trunc((room.piece.vertexes[nextIdx][1]*0.1)*roomSize)+room.offset.z
                    
                    vIdx2=0;
                    
                    while (vIdx2<nVertex2) {
                        nextIdx2=vIdx2+1;
                        if (nextIdx2===nVertex2) nextIdx2=0;
                        
                        bx=Math.trunc((room2.piece.vertexes[vIdx2][0]*0.1)*roomSize)+room2.offset.x
                        bz=Math.trunc((room2.piece.vertexes[vIdx2][1]*0.1)*roomSize)+room2.offset.z

                        bx2=Math.trunc((room2.piece.vertexes[nextIdx2][0]*0.1)*roomSize)+room2.offset.x
                        bz2=Math.trunc((room2.piece.vertexes[nextIdx2][1]*0.1)*roomSize)+room2.offset.z
                        
                        if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                            
                                // only blank out walls that are within the
                                // bounds of the other rooms y size
                                
                            for (t=0;t!==room.storyCount;t++) {
                                y=room.offset.y+(t*roomHigh);
                                if ((y>=(room2.offset.y+(room2.storyCount*roomHigh))) || ((y+roomHigh)<=room2.offset.y)) continue;
                                
                                room.hideVertex(t,vIdx);
                            }
                            for (t=0;t!==room2.storyCount;t++) {
                                y=room2.offset.y+(t*roomHigh);
                                if ((y>=(room.offset.y+(room.storyCount*roomHigh))) || ((y+roomHigh)<=room.offset.y)) continue;
                                
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
    
    hasTwoSharedWalls(room,room2,roomSize,sideRoom)
    {
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        let count;
        
            // we note where these connections are
            // in case we need stairs
            
        if (!sideRoom) {
            room.stairVertexIdx=-1;
            room.stairVertexIdx2=-1;
        }
        
            // check to see if two rooms share at
            // least two walls (so they can connect properly)
        
        nVertex=room.piece.vertexes.length;
        nVertex2=room2.piece.vertexes.length;
                
        vIdx=0;
        count=0;

        while (vIdx<nVertex) {
            nextIdx=vIdx+1;
            if (nextIdx===nVertex) nextIdx=0;

            ax=Math.trunc((room.piece.vertexes[vIdx][0]*0.1)*roomSize)+room.offset.x
            az=Math.trunc((room.piece.vertexes[vIdx][1]*0.1)*roomSize)+room.offset.z

            ax2=Math.trunc((room.piece.vertexes[nextIdx][0]*0.1)*roomSize)+room.offset.x
            az2=Math.trunc((room.piece.vertexes[nextIdx][1]*0.1)*roomSize)+room.offset.z

            vIdx2=0;

            while (vIdx2<nVertex2) {
                nextIdx2=vIdx2+1;
                if (nextIdx2===nVertex2) nextIdx2=0;

                bx=Math.trunc((room2.piece.vertexes[vIdx2][0]*0.1)*roomSize)+room2.offset.x
                bz=Math.trunc((room2.piece.vertexes[vIdx2][1]*0.1)*roomSize)+room2.offset.z

                bx2=Math.trunc((room2.piece.vertexes[nextIdx2][0]*0.1)*roomSize)+room2.offset.x
                bz2=Math.trunc((room2.piece.vertexes[nextIdx2][1]*0.1)*roomSize)+room2.offset.z

                    // as long as we have a count, keep
                    // adding on so we get entire size of hole
                    // if it's a normal room, remember where the steps
                    // so go
                    
                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                    count++;
                    if (!sideRoom) {
                        if (room.stairVertexIdx===-1) {
                            room.stairVertexIdx=vIdx;
                        }
                        else {
                            room.stairVertexIdx2=vIdx+1;
                            if (room.stairVertexIdx2===nVertex) room.stairVertexIdx2=0;
                        }
                    }
                }

                vIdx2++;
            }

            vIdx++;
        }
        
        return(count>=2);
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
        
    setNextRoomPosition(rooms,previousRoom,nextRoom,roomSize,pathXDeviation,pathTurnFactor,sideRoom)
    {
        let n,xAdd,zAdd,randAdd,origRandAdd,randShift,xShift,zShift;
        let room,badSpot;
        let tryCount;
        
            // we want to always move in a single
            // direction (in this case +Z) with a deviation
            
            // we try to create a random offset so things aren't
            // in a straight line

        tryCount=0;
        
        while (tryCount!==20) {
            
                // forward or turn
                
            if ((GenerateUtilityClass.randomPercentage(pathTurnFactor)) || (sideRoom)) {
                xAdd=(pathXDeviation*roomSize);
                zAdd=0;
                
                xShift=0;
                zShift=1;
            }
            else {
                xAdd=0;
                zAdd=roomSize;
                
                xShift=pathXDeviation;
                zShift=0;
            }
                
                // find an shift so they aren't all connected
                // on same x/z coords, we need to have at least
                // two walls in common
                
            randAdd=GenerateUtilityClass.randomInt(-9,18);        // we can connect across the entire edge, which is 9 grid units off of each side
            origRandAdd=randAdd;
            
            while (true) {
                randShift=randAdd*Math.trunc(roomSize*0.1);
                
                nextRoom.offset.x=(previousRoom.offset.x+xAdd)+(randShift*xShift);
                nextRoom.offset.y=previousRoom.offset.y;
                nextRoom.offset.z=(previousRoom.offset.z+zAdd)+(randShift*zShift);

                if (this.hasTwoSharedWalls(previousRoom,nextRoom,roomSize,sideRoom)) break;
                
                randAdd++;
                if (randAdd===10) randAdd=-9;

                if (randAdd===origRandAdd) return(false);
            }
                
                // are we colliding with any previous rooms?

            badSpot=false;

            for (n=0;n!==rooms.length;n++) {
                room=rooms[n];

                if (room.offset.x>=(nextRoom.offset.x+roomSize)) continue;
                if ((room.offset.x+roomSize)<=nextRoom.offset.x) continue;
                if (room.offset.z>=(nextRoom.offset.z+roomSize)) continue;
                if ((room.offset.z+roomSize)<=nextRoom.offset.z) continue;

                badSpot=true;
                break;
            }
                
            if (!badSpot) return(true);
            
            tryCount++;
        }
            
        return(false);
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n;
        let roomWallBitmap,hallWallBitmap,floorBitmap,ceilingBitmap;
        let roomTopY;
        let room,nextRoom,light,genPiece,centerPnt,intensity;
        let roomCount,roomHigh,roomSize,piece,pathXDeviation;
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        let rooms=[];
        
            // see the random number generator
            
        GenerateUtilityClass.setRandomSeed((importSettings.autoGenerate.randomSeed===undefined)?Date.now():importSettings.autoGenerate.randomSeed);
        
            // some global settings
            
        roomCount=importSettings.autoGenerate.roomCount;
        roomSize=importSettings.autoGenerate.roomSize;
        roomHigh=importSettings.autoGenerate.roomHeight;
        
            // bitmaps
            
        roomWallBitmap=GenerateBitmapRun.generateWall(this.core,0);
        hallWallBitmap=GenerateBitmapRun.generateWall(this.core,1);
        floorBitmap=GenerateBitmapRun.generateWall(this.core,2);
        ceilingBitmap=GenerateBitmapRun.generateWall(this.core,4);

            // we always proceed in a path, so get
            // the deviation for the path
        
        pathXDeviation=Math.sign(GenerateUtilityClass.random()-0.5);
        
            // create the random rooms
            // along a path
            
        genPiece=new GeneratePieceClass();
        
            // start room
            
        room=new GenerateRoomClass(genPiece.getRandomPiece(true),false);
        rooms.push(room);
        
            // path rooms
        
        for (n=1;n<roomCount;n++) {
            nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(false),false);
            if (!this.setNextRoomPosition(rooms,room,nextRoom,roomSize,pathXDeviation,importSettings.autoGenerate.pathTurnFactor,false)) break;
            
                // do we have a stair?
                
            if (room.storyCount>1) {
                if (GenerateUtilityClass.randomPercentage(importSettings.autoGenerate.stairFactor)) nextRoom.offset.y+=roomHigh;
            }
            
            rooms.push(nextRoom);
            
            room=nextRoom;
        }
        
            // side rooms, always rooms off of
            // other rooms but to the opposite side of path
            // these are allowed to fail and are skipped if no space
            
            console.info('path count='+rooms.length);

        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            if (GenerateUtilityClass.randomPercentage(importSettings.autoGenerate.sideRoomFactor)) {
                nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(true),true);
                if (this.setNextRoomPosition(rooms,room,nextRoom,roomSize,-pathXDeviation,importSettings.autoGenerate.pathTurnFactor,true)) {
                    nextRoom.offset.y=room.offset.y;
                    rooms.push(nextRoom);
                }
            }
        }

            // eliminate all combined walls
            
        this.removeSharedWalls(rooms,roomSize,roomHigh);
        
            // now create the meshes
        
        roomCount=rooms.length;
        
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            piece=room.piece;
            
            roomTopY=room.offset.y+(room.storyCount*roomHigh);
            centerPnt=new PointClass((room.offset.x+Math.trunc(roomSize*0.5)),(room.offset.y+Math.trunc((roomHigh*room.storyCount)*0.5)),(room.offset.z+Math.trunc(roomSize*0.5)));
                
                // meshes
                
            GenerateMeshClass.buildRoomWalls(this.core,room,centerPnt,('wall_'+n),(piece.multistory?roomWallBitmap:hallWallBitmap),roomSize,roomHigh);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('floor_'+n),floorBitmap,room.offset.y,roomSize,roomHigh);
            GenerateMeshClass.buildRoomFloorCeiling(this.core,room,centerPnt,('ceiling_'+n),ceilingBitmap,roomTopY,roomSize,roomHigh);
            
                // possible stairs
                
            if (n<(roomCount-1)) {
                if ((!room.sideRoom) && (!rooms[n+1].sideRoom)) {
                    if (rooms[n+1].offset.y>room.offset.y) GenerateMeshClass.buildRoomStairs(this.core,room,('stair_'+n),hallWallBitmap,floorBitmap,roomSize,roomHigh);
                }
            }
            
                // room light
            
            intensity=Math.trunc(roomSize*0.7)+((roomHigh*0.6)*(room.storyCount-1));
            light=new LightClass(new PointClass((room.offset.x+(Math.trunc(roomSize*0.5))),Math.trunc(roomTopY*0.9),(room.offset.z+(Math.trunc(roomSize*0.5)))),new ColorClass(1,1,1),intensity,0.3);
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
