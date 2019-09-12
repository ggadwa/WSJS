import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import MapClass from '../../code/map/map.js';
import MeshClass from '../../code/mesh/mesh.js';
import LightClass from '../light/light.js';
import GeneratePieceClass from '../generate/generate_piece.js';
import GenerateRoomClass from '../generate/generate_room.js';
import GenerateUtilityClass from '../generate/generate_utility.js';

export default class GenerateMapClass
{
    static UV_FACTOR=0.00005;
    static STAIR_STEP_COUNT=10;
    
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
    
    hasTwoSharedWalls(room,room2,roomSize)
    {
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        let count;
        
            // we note where these connections are
            // in case we need stairs
            
        room.stairVertexIdx=-1;
        room.stairVertexIdx2=-1;
        
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
                    
                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                    count++;
                    if (room.stairVertexIdx===-1) {
                        room.stairVertexIdx=vIdx;
                    }
                    else {
                        room.stairVertexIdx2=vIdx+1;
                        if (room.stairVertexIdx2===nVertex) room.stairVertexIdx2=0;
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
        
    setNextRoomPosition(rooms,previousRoom,nextRoom,roomSize,pathXDeviation)
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
                
            if (GenerateUtilityClass.random()>0.5) {
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
                
            randAdd=Math.trunc(GenerateUtilityClass.random()*9);
            origRandAdd=randAdd;
            
            while (true) {
                randShift=randAdd*Math.trunc(roomSize*0.1);
                
                nextRoom.offset.x=(previousRoom.offset.x+xAdd)+(randShift*xShift);
                nextRoom.offset.y=previousRoom.offset.y;
                nextRoom.offset.z=(previousRoom.offset.z+zAdd)+(randShift*zShift);

                if (this.hasTwoSharedWalls(previousRoom,nextRoom,roomSize)) break;
                
                randAdd++;
                if (randAdd===10) randAdd=0;

                if (randAdd===origRandAdd) {
                    console.log('Failed on shifting');
                    return(false);
                }
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
            
        console.log('Failed on finding spot');
        return(false);
    }
    
        //
        // room pieces
        //
        
    buildRoomFloorCeiling(room,centerPnt,name,bitmap,y,roomSize)
    {
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        
        vertexArray.push(room.offset.x,y,room.offset.z);
        vertexArray.push((room.offset.x+roomSize),y,room.offset.z);
        vertexArray.push((room.offset.x+roomSize),y,(room.offset.z+roomSize));
        vertexArray.push(room.offset.x,y,(room.offset.z+roomSize));

        indexArray.push(0,1,2,0,2,3);
        
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,GenerateMapClass.UV_FACTOR);
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        this.core.map.meshList.add(new MeshClass(this.core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
    buildRoomWalls(room,centerPnt,name,bitmap,roomSize,roomHigh)
    {
        let n,k,k2,y;
        let nVertex,trigIdx;
        let vertexArray,indexArray,uvArray,normalArray,tangentArray;
        let piece=room.piece;
        
        nVertex=piece.vertexes.length;
            
        vertexArray=[];
        indexArray=[];

        trigIdx=0;
        y=room.offset.y;

        for (n=0;n!==room.storyCount;n++) {

            for (k=0;k!=nVertex;k++) {
                k2=k+1;
                if (k2===nVertex) k2=0;

                if (room.isWallHidden(n,k)) continue;

                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*roomSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*roomSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k2][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*roomSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k2][1]*0.1)*roomSize)+room.offset.z));
                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*roomSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k][1]*0.1)*roomSize)+room.offset.z));

                indexArray.push(trigIdx,(trigIdx+1),(trigIdx+2),trigIdx,(trigIdx+2),(trigIdx+3));

                trigIdx+=4;
            }

            y+=roomHigh;
        }

        vertexArray=new Float32Array(vertexArray);
        indexArray=new Uint16Array(indexArray);
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,GenerateMapClass.UV_FACTOR);
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        this.core.map.meshList.add(new MeshClass(this.core,name,bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray));
    }
    
    buildRoomStairs(room,name,bitmap,roomSize,roomHigh)
    {
        let n,x,z,x2,z2,y,trigIdx,zDir;
        let sx,sx2,sz,sz2;
        let centerPnt;
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        let stepSize=Math.trunc(roomSize*0.02);
        let stepHigh=Math.trunc(roomHigh/GenerateMapClass.STAIR_STEP_COUNT);
        let stairSize=stepSize*GenerateMapClass.STAIR_STEP_COUNT;
        let pieceVertex=room.piece.vertexes[room.stairVertexIdx];
        let pieceVertex2=room.piece.vertexes[room.stairVertexIdx2];
        
            // depending on what vertex the connection was
            // is the direction of the stairs
        
        zDir=false;
        
        if ((pieceVertex[0]===0) && (pieceVertex[1]!==0)) {     // to the -X
            x=room.offset.x+stairSize;
            x2=room.offset.x;
            z=room.offset.z+(pieceVertex[1]*Math.trunc(roomSize*0.1));
            z2=room.offset.z+(pieceVertex2[1]*Math.trunc(roomSize*0.1));
        }
        else {
            if ((pieceVertex[0]===10) && (pieceVertex[1]!==10)) {       // to the +X
                x2=room.offset.x+roomSize;
                x=x2-stairSize;
                z=room.offset.z+(pieceVertex[1]*Math.trunc(roomSize*0.1));
                z2=room.offset.z+(pieceVertex2[1]*Math.trunc(roomSize*0.1));
            }
            else {          // to the +Z
                zDir=true;
                x=room.offset.x+(pieceVertex[0]*Math.trunc(roomSize*0.1));
                x2=room.offset.x+(pieceVertex2[0]*Math.trunc(roomSize*0.1));
                z2=room.offset.z+roomSize;
                z=z2-stairSize;
            }
        }

            // the stairs
        
        trigIdx=0;
        y=room.offset.y+stepHigh;
        
        for (n=0;n!==GenerateMapClass.STAIR_STEP_COUNT;n++) { 
            
            if (zDir) {
                sx=x;
                sx2=x2;
                sz=z+(n*stepSize);
                sz2=sz+stepSize;
            }
            else {
                if (x<x2) {
                    sx=x+(n*stepSize);
                    sx2=sx+stepSize;
                }
                else {
                    sx=x-(n*stepSize);
                    sx2=sx-stepSize;
                }
                sz=z;
                sz2=z2;
            }
            
            vertexArray.push(sx,y,sz);
            vertexArray.push(sx2,y,sz);
            vertexArray.push(sx2,y,sz2);
            vertexArray.push(sx,y,sz2);

            indexArray.push(trigIdx,(trigIdx+1),(trigIdx+2),trigIdx,(trigIdx+2),(trigIdx+3));
            trigIdx+=4;
            
            y+=stepHigh;
        }
        
        centerPnt=new PointClass(Math.trunc((x+x2)*0.5),(room.offset.y+Math.trunc(roomHigh*0.5)),Math.trunc((z+z2)*0.5));
        
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,false);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,GenerateMapClass.UV_FACTOR);
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        this.core.map.meshList.add(new MeshClass(this.core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n;
        let wallBitmap,floorBitmap,ceilingBitmap;
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
          
        wallBitmap=this.createBitmapFromSettings(importSettings.autoGenerate.wallBitmap);
        floorBitmap=this.createBitmapFromSettings(importSettings.autoGenerate.floorBitmap);
        ceilingBitmap=this.createBitmapFromSettings(importSettings.autoGenerate.ceilingBitmap);

            // we always proceed in a path, so get
            // the deviation for the path
        
        pathXDeviation=Math.sign(GenerateUtilityClass.random()-0.5);
        
            // create the random rooms
            // along a path
            
        genPiece=new GeneratePieceClass();
        
            // start room
            
        room=new GenerateRoomClass(genPiece.getRandomPiece(true));
        rooms.push(room);
        
            // path rooms
        
        for (n=1;n<roomCount;n++) {
            nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(false));
            if (!this.setNextRoomPosition(rooms,room,nextRoom,roomSize,pathXDeviation)) break;
            
                // do we have a stair?
                
            if (room.storyCount>1) {
                if (GenerateUtilityClass.random()>importSettings.autoGenerate.stairFactor) nextRoom.offset.y+=roomHigh;
            }
            
            rooms.push(nextRoom);
            
            room=nextRoom;
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
                
            this.buildRoomWalls(room,centerPnt,('wall_'+n),wallBitmap,roomSize,roomHigh);
            this.buildRoomFloorCeiling(room,centerPnt,('floor_'+n),floorBitmap,room.offset.y,roomSize);
            this.buildRoomFloorCeiling(room,centerPnt,('ceiling_'+n),ceilingBitmap,roomTopY,roomSize);
            
                // possible stairs
                
            if (n<(roomCount-1)) {
                if (rooms[n+1].offset.y>room.offset.y) this.buildRoomStairs(room,('stair_'+n),floorBitmap,roomSize,roomHigh);
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
            this.core.map.sky.bitmapName=importSettings.skyBox.bitmap;
            this.core.bitmapList.addSimple(importSettings.skyBox.bitmap);
        }
        
        return(true);
    }
}
