import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import MapClass from '../../code/map/map.js';
import MeshClass from '../../code/mesh/mesh.js';
import LightClass from '../light/light.js';
import GeneratePieceClass from '../generate/generate_piece.js';
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
        
    buildFlatFloorCeiling(vIdx,vertexArray,nIdx,normalArray,iIdx,indexArray,trigIdx,y,normalY,gridSize,offX,offZ)
    {
        vertexArray[vIdx++]=offX;
        vertexArray[vIdx++]=y;
        vertexArray[vIdx++]=offZ;

        normalArray[nIdx++]=0;
        normalArray[nIdx++]=normalY;
        normalArray[nIdx++]=0;

        vertexArray[vIdx++]=offX+gridSize;
        vertexArray[vIdx++]=y;
        vertexArray[vIdx++]=offZ;

        normalArray[nIdx++]=0;
        normalArray[nIdx++]=normalY;
        normalArray[nIdx++]=0;

        vertexArray[vIdx++]=offX+gridSize;
        vertexArray[vIdx++]=y;
        vertexArray[vIdx++]=offZ+gridSize;

        normalArray[nIdx++]=0;
        normalArray[nIdx++]=normalY;
        normalArray[nIdx++]=0;

        vertexArray[vIdx++]=offX;
        vertexArray[vIdx++]=y;
        vertexArray[vIdx++]=offZ+gridSize;

        normalArray[nIdx++]=0;
        normalArray[nIdx++]=normalY;
        normalArray[nIdx++]=0;

        indexArray[iIdx++]=trigIdx;
        indexArray[iIdx++]=trigIdx+1;
        indexArray[iIdx++]=trigIdx+2;
        indexArray[iIdx++]=trigIdx;
        indexArray[iIdx++]=trigIdx+2;
        indexArray[iIdx++]=trigIdx+3;
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let n,k,k2,offX,offZ;
        let mesh,bitmap;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let nLine,vIdx,nIdx,uvIdx,iIdx,trigIdx;
        let light;
        let roomCount,gridSize,piece
        let entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        let map=this.core.map;
        
        roomCount=10;
        
            // grid size
            
        gridSize=60000; // GenerateMapClass.GRID_SIZE*importSettings.scale;
        offX=0;
        offZ=0;
        
            // todo -- hard coded test, in importSettings
            
        bitmap=this.core.bitmapList.add('models/dungeon/textures/floor_color.png','models/dungeon/textures/floor_normals.png','models/dungeon/textures/floor_specular.png',new ColorClass(5,5,5),null);

            // pieces
            
        for (n=0;n!=roomCount;n++) {
            piece=GeneratePieceClass.getRandomPiece();
            
                // space for vertexes (none shared so normals
                // can be different) on every wall and floor/ceiling
                
            nLine=piece.vertexes.length;
            
            vertexArray=new Float32Array((nLine+2)*(4*6));
            normalArray=new Float32Array((nLine+2)*(4*6));
            tangentArray=new Float32Array((nLine+2)*(4*6));
            uvArray=new Float32Array((nLine+2)*(4*6));
            indexArray=new Uint16Array((nLine+2)*6);

            vIdx=0;
            nIdx=0;
            uvIdx=0;
            iIdx=0;
            trigIdx=0;
            
                // create the walls
            
            for (k=0;k!=nLine;k++) {
                k2=k+1;
                if (k2===nLine) k2=0;

                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+offX;
                vertexArray[vIdx++]=gridSize;
                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+offZ;

                normalArray[nIdx++]=piece.normals[k][0];
                normalArray[nIdx++]=0;
                normalArray[nIdx++]=piece.normals[k][1];

                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+offX;
                vertexArray[vIdx++]=gridSize;
                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+offZ;

                normalArray[nIdx++]=piece.normals[k][0];
                normalArray[nIdx++]=0;
                normalArray[nIdx++]=piece.normals[k][1];

                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k2][0]*0.1)*gridSize)+offX;
                vertexArray[vIdx++]=0;
                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k2][1]*0.1)*gridSize)+offZ;

                normalArray[nIdx++]=piece.normals[k][0];
                normalArray[nIdx++]=0;
                normalArray[nIdx++]=piece.normals[k][1];

                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k][0]*0.1)*gridSize)+offX;
                vertexArray[vIdx++]=0;
                vertexArray[vIdx++]=Math.trunc((piece.vertexes[k][1]*0.1)*gridSize)+offZ;

                normalArray[nIdx++]=piece.normals[k][0];
                normalArray[nIdx++]=0;
                normalArray[nIdx++]=piece.normals[k][1];

                indexArray[iIdx++]=trigIdx;
                indexArray[iIdx++]=trigIdx+1;
                indexArray[iIdx++]=trigIdx+2;
                indexArray[iIdx++]=trigIdx;
                indexArray[iIdx++]=trigIdx+2;
                indexArray[iIdx++]=trigIdx+3;
                
                trigIdx+=4;
            }
            
                // floor
            
            this.buildFlatFloorCeiling(vIdx,vertexArray,nIdx,normalArray,iIdx,indexArray,trigIdx,0,1,gridSize,offX,offZ);
            vIdx+=12;
            nIdx+=12;
            iIdx+=6;
            trigIdx+=4;
                
            this.buildFlatFloorCeiling(vIdx,vertexArray,nIdx,normalArray,iIdx,indexArray,trigIdx,gridSize,-1,gridSize,offX,offZ);
            vIdx+=12;
            nIdx+=12;
            iIdx+=6;
            trigIdx+=4;
        
                // auto generate the uvs and tangents
                
            GenerateUtilityClass.buildUVs(vertexArray,normalArray,uvArray,0.00005);
            GenerateUtilityClass.buildTangents(vertexArray,uvArray,tangentArray,indexArray);
        
                // add this mesh and a single light
                
            mesh=new MeshClass(this.core,'test',bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray);
            map.meshList.add(mesh);
            
            light=new LightClass(new PointClass((offX+(Math.trunc(gridSize*0.5))),Math.trunc(gridSize*0.75),(offZ+(Math.trunc(gridSize*0.5)))),new ColorClass(1,1,1),(gridSize*2),1.0);
            map.lightList.add(light);
            
                // move onto next room
                
            offZ+=60000;
            //offX+=6000;
        }
        
            // delete any shared triangles
            
        GenerateUtilityClass.deleteSharedTriangles(map.meshList);
        
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
