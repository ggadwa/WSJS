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
    static GRID_SIZE=100;
    static UV_FACTOR=0.00005;
    
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // mesh building utilities
        //
        
    buildFlatFloorCeiling(room,centerPnt,name,bitmap,y,gridSize)
    {
        let vertexArray=[];
        let normalArray;
        let uvArray;
        let tangentArray;
        let indexArray=[];
        
        vertexArray.push(room.offset.x,y,room.offset.z);
        vertexArray.push((room.offset.x+gridSize),y,room.offset.z);
        vertexArray.push((room.offset.x+gridSize),y,(room.offset.z+gridSize));
        vertexArray.push(room.offset.x,y,(room.offset.z+gridSize));

        indexArray.push(0,1,2,0,2,3);
        
        normalArray=GenerateUtilityClass.buildNormals(vertexArray,indexArray,centerPnt,true);
        uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,GenerateMapClass.UV_FACTOR);
        tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
        this.core.map.meshList.add(new MeshClass(this.core,name,bitmap,-1,-1,new Float32Array(vertexArray),normalArray,tangentArray,uvArray,null,null,new Uint16Array(indexArray)));
    }
    
    removeSharedWalls(rooms,gridSize)
    {
        let n,k,t,room,room2;
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
                                        
                    ax=Math.trunc((room.piece.vertexes[vIdx][0]*0.1)*gridSize)+room.offset.x
                    az=Math.trunc((room.piece.vertexes[vIdx][1]*0.1)*gridSize)+room.offset.z
                    
                    ax2=Math.trunc((room.piece.vertexes[nextIdx][0]*0.1)*gridSize)+room.offset.x
                    az2=Math.trunc((room.piece.vertexes[nextIdx][1]*0.1)*gridSize)+room.offset.z
                    
                    vIdx2=0;
                    
                    while (vIdx2<nVertex2) {
                        nextIdx2=vIdx2+1;
                        if (nextIdx2===nVertex2) nextIdx2=0;
                        
                        bx=Math.trunc((room2.piece.vertexes[vIdx2][0]*0.1)*gridSize)+room2.offset.x
                        bz=Math.trunc((room2.piece.vertexes[vIdx2][1]*0.1)*gridSize)+room2.offset.z

                        bx2=Math.trunc((room2.piece.vertexes[nextIdx2][0]*0.1)*gridSize)+room2.offset.x
                        bz2=Math.trunc((room2.piece.vertexes[nextIdx2][1]*0.1)*gridSize)+room2.offset.z
                        
                        if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                            for (t=0;t!==room.storyCount;t++) {
                                if (t<room2.storyCount) room.hideVertex(t,vIdx);
                                
                            }
                            for (t=0;t!==room2.storyCount;t++) {
                                if (t<room.storyCount) room2.hideVertex(t,vIdx2);
                                
                            }
                        }
                        
                        vIdx2++;
                    }
                    
                    vIdx++;
                }
            }
        }
    }
    
    hasTwoSharedWalls(room,room2,gridSize)
    {
        let vIdx,vIdx2,nextIdx,nextIdx2,nVertex,nVertex2;
        let ax,az,ax2,az2,bx,bz,bx2,bz2;
        let count=0;
        
            // check to see if two rooms share at
            // least two walls (so they can connect properly)
        
        nVertex=room.piece.vertexes.length;
        nVertex2=room2.piece.vertexes.length;
                
        vIdx=0;

        while (vIdx<nVertex) {
            nextIdx=vIdx+1;
            if (nextIdx===nVertex) nextIdx=0;

            ax=Math.trunc((room.piece.vertexes[vIdx][0]*0.1)*gridSize)+room.offset.x
            az=Math.trunc((room.piece.vertexes[vIdx][1]*0.1)*gridSize)+room.offset.z

            ax2=Math.trunc((room.piece.vertexes[nextIdx][0]*0.1)*gridSize)+room.offset.x
            az2=Math.trunc((room.piece.vertexes[nextIdx][1]*0.1)*gridSize)+room.offset.z

            vIdx2=0;

            while (vIdx2<nVertex2) {
                nextIdx2=vIdx2+1;
                if (nextIdx2===nVertex2) nextIdx2=0;

                bx=Math.trunc((room2.piece.vertexes[vIdx2][0]*0.1)*gridSize)+room2.offset.x
                bz=Math.trunc((room2.piece.vertexes[vIdx2][1]*0.1)*gridSize)+room2.offset.z

                bx2=Math.trunc((room2.piece.vertexes[nextIdx2][0]*0.1)*gridSize)+room2.offset.x
                bz2=Math.trunc((room2.piece.vertexes[nextIdx2][1]*0.1)*gridSize)+room2.offset.z

                if (((ax===bx) && (az===bz) && (ax2===bx2) && (az2===bz2)) || ((ax2===bx) && (az2===bz) && (ax===bx2) && (az===bz2))) {
                    count++;
                    if (count===2) return(true);
                }

                vIdx2++;
            }

            vIdx++;
        }
        
        return(false);
    }
    
    setNextRoomPosition(rooms,previousRoom,nextRoom,gridSize,pathXDeviation)
    {
        let n,xAdd,zAdd,randAdd,xShift,zShift;
        let room,badSpot;
        let tryCount=0;
        let tryCount2;
        
            // we want to always move in a single
            // direction (in this case +Z) with a deviation
            
            // we try to create a random offset so things aren't
            // in a straight line

        while (tryCount!==20) {
            
                // forward or turn
                
            if (Math.random()>0.5) {
                xAdd=(pathXDeviation*gridSize);
                zAdd=0;
                
                xShift=0;
                zShift=1;
            }
            else {
                xAdd=0;
                zAdd=gridSize;
                
                xShift=pathXDeviation;
                zShift=0;
            }
                
                // find an shift so they aren't all connected
                // on same x/z coords, we need to have at least
                // two walls in common
                
            tryCount2=0;

            while (true) {
                randAdd=Math.trunc(Math.trunc(gridSize*0.1))*Math.trunc(Math.random()*10);

                nextRoom.offset.x=(previousRoom.offset.x+xAdd)+(randAdd*xShift);
                nextRoom.offset.y=previousRoom.offset.y;
                nextRoom.offset.z=(previousRoom.offset.z+zAdd)+(randAdd*zShift);

                if (this.hasTwoSharedWalls(previousRoom,nextRoom,gridSize)) break;

                tryCount2++;
                if (tryCount2===20) return(false);
            }
                
                // are we colliding with any previous rooms?

            badSpot=false;

            for (n=0;n!==rooms.length;n++) {
                room=rooms[n];

                if (room.offset.x>=(nextRoom.offset.x+gridSize)) continue;
                if ((room.offset.x+gridSize)<=nextRoom.offset.x) continue;
                if (room.offset.z>=(nextRoom.offset.z+gridSize)) continue;
                if ((room.offset.z+gridSize)<=nextRoom.offset.z) continue;

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
        let n,k,k2,t,y;
        let wallBitmap,floorBitmap,ceilingBitmap;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let nVertex,trigIdx;
        let room,nextRoom,light,genPiece,centerPnt,intensity;
        let roomCount,roomHigh,gridSize,piece,pathXDeviation;
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        let rooms=[];
        
        roomCount=15;
        
            // grid size
            
        gridSize=60000; // GenerateMapClass.GRID_SIZE*importSettings.scale;
        roomHigh=20000;
        
            // todo -- hard coded test, in importSettings
            
        wallBitmap=this.core.bitmapList.add('models/dungeon/textures/wall_color.png','models/dungeon/textures/wall_normals.png','models/dungeon/textures/wall_specular.png',new ColorClass(5,5,5),null);
        floorBitmap=this.core.bitmapList.add('models/dungeon/textures/floor_color.png','models/dungeon/textures/floor_normals.png','models/dungeon/textures/floor_specular.png',new ColorClass(5,5,5),null);
        ceilingBitmap=this.core.bitmapList.add('models/dungeon/textures/simple_rock_color.png','models/dungeon/textures/simple_rock_normals.png','models/dungeon/textures/simple_rock_specular.png',new ColorClass(5,5,5),null);

            // we always proceed in a path, so get
            // the deviation for the path
        
        pathXDeviation=Math.sign(Math.random()-0.5);
        
            // create the random rooms
            // along a path
            
        genPiece=new GeneratePieceClass();
        
            // start room
            
        room=new GenerateRoomClass(genPiece.getRandomPiece(true));
        rooms.push(room);
        
            // path rooms
        
        for (n=1;n<roomCount;n++) {
            nextRoom=new GenerateRoomClass(genPiece.getRandomPiece(false));
            if (!this.setNextRoomPosition(rooms,room,nextRoom,gridSize,pathXDeviation)) break;
            
            rooms.push(nextRoom);
            
            room=nextRoom;
        }
        
            // eliminate all combined walls
            
        this.removeSharedWalls(rooms,gridSize);
        
            // now create the meshes
        
        roomCount=rooms.length;
        
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            piece=room.piece;
            
            centerPnt=new PointClass((room.offset.x+Math.trunc(gridSize*0.5)),(room.offset.y+Math.trunc((roomHigh*room.storyCount)*0.5)),(room.offset.z+Math.trunc(gridSize*0.5)));
            
                // we start these as non-typed arrays because
                // we aren't sure of the size as walls could get
                // eliminated, we typed them later
                
                // create the walls
                
            nVertex=piece.vertexes.length;
            
            vertexArray=[];
            indexArray=[];

            trigIdx=0;
            y=room.offset.y;
            
            for (t=0;t!==room.storyCount;t++) {
                
                for (k=0;k!=nVertex;k++) {
                    k2=k+1;
                    if (k2===nVertex) k2=0;

                    if (room.isWallHidden(t,k)) continue;

                    vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+room.offset.z));
                    vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+room.offset.x),(y+roomHigh),(Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+room.offset.z));
                    vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+room.offset.z));
                    vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+room.offset.x),y,(Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+room.offset.z));

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
            map.meshList.add(new MeshClass(this.core,('wall_'+n),wallBitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray));
            
                // floor and ceiling
                
            this.buildFlatFloorCeiling(room,centerPnt,('floor_'+n),floorBitmap,0,gridSize);
            this.buildFlatFloorCeiling(room,centerPnt,('ceiling_'+n),ceilingBitmap,y,gridSize);
            
                // room light
            
            intensity=Math.trunc(gridSize*0.7)+((roomHigh*0.6)*(room.storyCount-1));
            light=new LightClass(new PointClass((room.offset.x+(Math.trunc(gridSize*0.5))),Math.trunc(y*0.9),(room.offset.z+(Math.trunc(gridSize*0.5)))),new ColorClass(1,1,1),intensity,0.3);
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
