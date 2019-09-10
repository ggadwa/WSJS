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
    GRID_SIZE=100;
    
    constructor(core)
    {
        this.core=core;
    }
    
        //
        // mesh building utilities
        //
        
    buildFlatFloorCeiling(vertexArray,normalArray,indexArray,trigIdx,y,normalY,gridSize,offset)
    {
        vertexArray.push(offset.x,y,offset.z);
        normalArray.push(0,normalY,0);

        vertexArray.push((offset.x+gridSize),y,offset.z);
        normalArray.push(0,normalY,0);

        vertexArray.push((offset.x+gridSize),y,(offset.z+gridSize));
        normalArray.push(0,normalY,0);

        vertexArray.push(offset.x,y,(offset.z+gridSize));
        normalArray.push(0,normalY,0);

        indexArray.push(trigIdx,(trigIdx+1),(trigIdx+2),trigIdx,(trigIdx+2),(trigIdx+3));
    }
    
    removeSharedWalls(rooms,gridSize)
    {
        let n,k,room,room2;
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
                            room.hideVertex(vIdx);
                            room2.hideVertex(vIdx2);
                        }
                        
                        vIdx2++;
                    }
                    
                    vIdx++;
                }
            }
            
        }
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n,k,k2;
        let mesh,bitmap;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let nVertex,trigIdx;
        let room,light,genPiece;
        let roomCount,roomHigh,gridSize,piece
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        let rooms=[];
        let roomOffset=new PointClass(0,0,0);
        
        roomCount=15;
        
            // grid size
            
        gridSize=60000; // GenerateMapClass.GRID_SIZE*importSettings.scale;
        roomHigh=20000;
        
            // todo -- hard coded test, in importSettings
            
        bitmap=this.core.bitmapList.add('models/dungeon/textures/floor_color.png','models/dungeon/textures/floor_normals.png','models/dungeon/textures/floor_specular.png',new ColorClass(5,5,5),null);

            // create the random rooms
            
        genPiece=new GeneratePieceClass();
        
        for (n=0;n!=roomCount;n++) {
            
                // create the room
                
            rooms.push(new GenerateRoomClass(genPiece.getRandomPiece(),roomOffset));
            
                // find a random place to continue
                
            switch (Math.trunc(Math.random()*4)) {
                case 0:
                    roomOffset.addValues(0,0,60000);
                    break;
                case 1:
                    roomOffset.addValues(0,0,-60000);
                    break;
                case 2:
                    roomOffset.addValues(60000,0,0);
                    break;
                case 3:
                    roomOffset.addValues(-60000,0,0);
                    break;
            }
            
        }
        
            // eliminate all combined walls
            
        this.removeSharedWalls(rooms,gridSize);
        
            // now create the meshes
        
        for (n=0;n!=roomCount;n++) {
            room=rooms[n];
            piece=rooms[n].piece;
            
                // we start these as non-typed arrays because
                // we aren't sure of the size as walls could get
                // eliminated, we typed them later
                
            nVertex=piece.vertexes.length;
            
            vertexArray=[];
            normalArray=[];
            indexArray=[];

            trigIdx=0;
            
                // create the walls
            
            for (k=0;k!=nVertex;k++) {
                k2=k+1;
                if (k2===nVertex) k2=0;
                
                if (room.isLineHidden(k)) continue;
                
                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+room.offset.x),roomHigh,(Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+room.offset.z));
                normalArray.push(piece.normals[k][0],0,piece.normals[k][1]);

                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+room.offset.x),roomHigh,(Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+room.offset.z));
                normalArray.push(piece.normals[k][0],0,piece.normals[k][1]);

                vertexArray.push((Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+room.offset.x),0,(Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+room.offset.z));
                normalArray.push(piece.normals[k][0],0,piece.normals[k][1]);

                vertexArray.push((Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+room.offset.x),0,(Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+room.offset.z));
                normalArray.push(piece.normals[k][0],0,piece.normals[k][1]);

                indexArray.push(trigIdx,(trigIdx+1),(trigIdx+2),trigIdx,(trigIdx+2),(trigIdx+3));
                
                trigIdx+=4;
            }
            
                // floor
            
            this.buildFlatFloorCeiling(vertexArray,normalArray,indexArray,trigIdx,0,1,gridSize,room.offset);
            trigIdx+=4;
                
            this.buildFlatFloorCeiling(vertexArray,normalArray,indexArray,trigIdx,roomHigh,-1,gridSize,room.offset);
            trigIdx+=4;
            
                // turn the arrays into typed arrays
            
            vertexArray=new Float32Array(vertexArray);
            normalArray=new Float32Array(normalArray);
            indexArray=new Uint16Array(indexArray);
        
                // auto generate the uvs and tangents
                
            uvArray=GenerateUtilityClass.buildUVs(vertexArray,normalArray,0.00005);
            tangentArray=GenerateUtilityClass.buildTangents(vertexArray,uvArray,indexArray);
        
                // add this mesh and a single light
                
            mesh=new MeshClass(this.core,'test',bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray);
            map.meshList.add(mesh);
            
            light=new LightClass(new PointClass((room.offset.x+(Math.trunc(gridSize*0.5))),Math.trunc(roomHigh*0.9),(room.offset.z+(Math.trunc(gridSize*0.5)))),new ColorClass(1,1,1),(gridSize*2),1.0);
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
