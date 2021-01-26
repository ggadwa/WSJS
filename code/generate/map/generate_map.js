import PointClass from '../../utility/point.js';
import ColorClass from '../../utility/color.js';
import MapClass from '../../map/map.js';
import MeshClass from '../../mesh/mesh.js';
import LightClass from '../../light/light.js';
import MapPathNodeClass from '../../map/map_path_node.js';
import GeneratePieceClass from './generate_piece.js';
import GenerateRoomClass from './generate_room.js';
import GenerateMeshClass from './generate_mesh.js';
import GenerateStoryClass from './generate_story.js';
import GeneratePillarClass from './generate_pillar.js';
import GenerateStorageClass from './generate_storage.js';
import GenerateComputerClass from './generate_computer.js';
import GeneratePipeClass from './generate_pipe.js';
import GenerateAltarClass from './generate_altar.js';
import GenerateLightClass from './generate_light.js';
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
        
    buildDecoration(room,roomIdx,genMesh,genBitmap,segmentSize)
    {
            // build the decoration
            
        switch (this.core.randomIndex(6)) {
            case 0:
                (new GenerateStoryClass(this.core,room,('story_'+roomIdx),genMesh,genBitmap.generateStep(),genBitmap.generatePlatform(),segmentSize)).build();
                break;
            case 1:
                (new GeneratePillarClass(this.core,room,('pillar_'+roomIdx),genMesh,genBitmap.generatePillar(),segmentSize)).build();
                break;
            case 2:
                (new GenerateStorageClass(this.core,room,('storage'+roomIdx),genMesh,genBitmap.generateBox(),segmentSize)).build();
                break;
            case 3:
                (new GenerateComputerClass(this.core,room,('computer_'+roomIdx),genMesh,genBitmap.generatePlatform(),genBitmap.generateComputer(),segmentSize)).build();
                break;
            case 4:
                (new GeneratePipeClass(this.core,room,('pipe_'+roomIdx),genMesh,genBitmap.generatePipe(),segmentSize)).build();
                break;
            case 5:
                (new GenerateAltarClass(this.core,room,('alter_'+roomIdx),genMesh,genBitmap.generatePlatform(),segmentSize)).build();
                break;
        }
    }
    
        //
        // add additional room
        //
        
    buildSteps(core,room,name,toRoom,genMesh,stepBitmap,segmentSize)
    {
        let x,z,doAll,touchRange;
        let noSkipX,noSkipZ;
        let genStory=new GenerateStoryClass(core,room,name,genMesh,stepBitmap,null,segmentSize);
        
        if (room.offset.z===(toRoom.offset.z+toRoom.size.z)) {
            touchRange=room.getTouchWallRange(toRoom,true,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipX=this.core.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (x=touchRange.min;x<=touchRange.max;x++) {
                if ((this.core.randomPercentage(0.5)) || (x===noSkipX) || (doAll)) {
                    genStory.addStairs(x,0,genStory.PLATFORM_DIR_NEG_Z,0);
                }
            }
            return;
        }
        if ((room.offset.z+room.size.z)===toRoom.offset.z) {
            touchRange=room.getTouchWallRange(toRoom,true,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipX=this.core.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (x=touchRange.min;x<=touchRange.max;x++) {
                if ((this.core.randomPercentage(0.5)) || (x===noSkipX) || (doAll)) {
                    genStory.addStairs(x,room.piece.size.z-2,genStory.PLATFORM_DIR_POS_Z,0);
                }
            }
            return;
        }
        if (room.offset.x===(toRoom.offset.x+toRoom.size.x)) {
            touchRange=room.getTouchWallRange(toRoom,false,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipZ=this.core.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (z=touchRange.min;z<=touchRange.max;z++) {
                if ((this.core.randomPercentage(0.5)) || (z===noSkipZ) || (doAll)) {
                    genStory.addStairs(0,z,genStory.PLATFORM_DIR_NEG_X,0);
                }
            }
            return;
        }
        if ((room.offset.x+room.size.x)===toRoom.offset.x) {
            touchRange=room.getTouchWallRange(toRoom,false,segmentSize);
            doAll=(touchRange.getSize()<=2);
            noSkipZ=this.core.randomInBetween(touchRange.min,(touchRange.max+1));
            
            for (z=touchRange.min;z<=touchRange.max;z++) {
                if ((this.core.randomPercentage(0.5)) || (z===noSkipZ) || (doAll)) {
                    genStory.addStairs(room.piece.size.x-2,z,genStory.PLATFORM_DIR_POS_X,0);
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
            if (this.core.randomPercentage(0.25)) {
                room.offset.y+=segmentSize;
                touchRoom.requiredStairs.push(room);
            }
        }
                            
            // add the room
                            
        rooms.push(room);
    }
    
        //
        // random nodes
        //
        
    generateRandomNodes(rooms,segmentSize)
    {
        let x,z,nodeCount;
        let room,failCount,pathNode,offset;
        let roomCount=rooms.length;
        let path=this.core.game.map.path;
        
        failCount=0;
        nodeCount=roomCount*3;
        
        offset=Math.trunc(segmentSize*0.5);
        
        while (path.nodes.length<nodeCount) {
            
                // only put stuff in decorated rooms
                
            room=rooms[this.core.randomIndex(roomCount)];
            if (!room.piece.decorate) {
                failCount++;
                if (failCount>100) break;
            }
            
                // skip if it's filled
                
            x=this.core.randomInBetween(1,(room.piece.size.x-1));
            z=this.core.randomInBetween(1,(room.piece.size.z-1));
            
            if (room.getGrid(0,x,z)!==0) {
                failCount++;
                if (failCount>100) break;
            }
            
                // add this and block it off
                
            room.setGrid(0,x,z,1);
                
            x=room.offset.x+((x*segmentSize)+offset);
            z=room.offset.z+((z*segmentSize)+offset);
            pathNode=new MapPathNodeClass(path.nodes.length,new PointClass(x,room.offset.y,z),[],null,false,null,null);
            path.nodes.push(pathNode);
        }
    }

        //
        // build a map
        //
        
    build(autoGenerate)
    {
        let n,k,seed;
        let genPiece,genMesh,genBitmap;
        let roomTopY;
        let xAdd,zAdd,origX,origZ,touchIdx,failCount,placeCount,moveCount;
        let room,centerPnt;
        let roomCount,segmentSize;
        let rooms=[];
        
            // see the random number generator
            
        seed=(autoGenerate.randomSeed===undefined)?Date.now():autoGenerate.randomSeed;
        console.info('Random Seed: '+seed);
        
        this.core.setRandomSeed(seed);
        
            // some generators
            
        genPiece=new GeneratePieceClass(this.core);
        genMesh=new GenerateMeshClass(this.core);
        genBitmap=new GenerateBitmapRunClass(this.core,0);      // 0 is the random color scheme, we can just generate a random integer later for this
        
            // some global settings
            
        roomCount=autoGenerate.roomCount;
        segmentSize=autoGenerate.segmentSize;
        
            // first room in center of map
            
        room=new GenerateRoomClass(this.core,genPiece.getDefaultPiece(),segmentSize);
        room.offset.setFromValues(0,0,0);
        rooms.push(room);
        
            // other rooms start outside of center
            // room and gravity brings them in until they connect
        
        failCount=25;
        
        while ((rooms.length<roomCount) && (failCount>0)) {
                
            room=new GenerateRoomClass(this.core,genPiece.getRandomPiece(),segmentSize);
            
            placeCount=10;
            
            while (placeCount>0) {
                room.offset.x=this.core.randomInBetween(-100,100)*segmentSize;
                room.offset.y=0;
                room.offset.z=this.core.randomInBetween(-100,100)*segmentSize;
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

            genMesh.buildRoomWalls(room,centerPnt,('wall_'+n),genBitmap.generateWall(),segmentSize);
            genMesh.buildRoomFloorCeiling(room,centerPnt,('floor_'+n),genBitmap.generateFloor(),room.offset.y,segmentSize);
            genMesh.buildRoomFloorCeiling(room,centerPnt,('ceiling_'+n),genBitmap.generateCeiling(),roomTopY,segmentSize);
            
                // decorations

            if (room.piece.decorate) this.buildDecoration(room,n,genMesh,genBitmap,segmentSize);
            
                // room lights

            (new GenerateLightClass(this.core,room,('light_'+n),genMesh,genBitmap.generateStep(),segmentSize)).build();
        }
        
            // any steps
            
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            
            for (k=0;k!==room.requiredStairs.length;k++) {
                this.buildSteps(this.core,room,('room_'+n+'_step_'+k),room.requiredStairs[k],genMesh,genBitmap.generateStep(),segmentSize);
            }
        }
        
            // generate nodes
            
        this.generateRandomNodes(rooms,segmentSize);

        return(true);
    }
}
