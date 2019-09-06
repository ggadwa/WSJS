import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import MapClass from '../../code/map/map.js';
import MeshClass from '../../code/mesh/mesh.js';
import LightClass from '../light/light.js';

export default class GenerateMapClass
{
    GRID_SIZE=100;
    
    constructor(core)
    {
        this.core=core;
    }

        //
        // build a map
        //
        
    build(importSettings)
    {
        let map=this.core.map;
        let mesh,bitmap;
        let vertexArray,normalArray,tangentArray,uvArray,indexArray;
        let vIdx,nIdx,uvIdx,iIdx;
        let light;
        let gridSize;
        let n,entity,entityDef,entityName,entityPosition,entityAngle,entityData;
        
            // grid size
            
        gridSize=GenerateMapClass.GRID_SIZE*importSettings.scale;
        
            // todo -- hard coded test, in importSettings
            
        bitmap=this.core.bitmapList.addColor('models/dungeon/textures/rough_brick_color.png','models/dungeon/textures/rough_brick_normals.png','models/dungeon/textures/rough_brick_specular.png',new ColorClass(5,5,5),null);

            // rooms
            
        vertexArray=new Float32Array(3*(4*6));
        normalArray=new Float32Array(3*(4*6));
        tangentArray=new Float32Array(3*(4*6));
        uvArray=new Float32Array(2*(4*6));
        indexArray=new Uint16Array(6*2);
        
        vIdx=0;
        nIdx=0;
        uvIdx=0;
        iIdx=0;
        
            // top
            
        vertexArray[vIdx++]=-gridSize;
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=-gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=-1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=0;
        uvArray[uvIdx++]=0;
        
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=-gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=-1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=1;
        uvArray[uvIdx++]=0;

        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=-1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=1;
        uvArray[uvIdx++]=1;

        vertexArray[vIdx++]=-gridSize;
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=-1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=0;
        uvArray[uvIdx++]=1;
        
        indexArray[iIdx++]=0;
        indexArray[iIdx++]=1;
        indexArray[iIdx++]=2;
        indexArray[iIdx++]=0;
        indexArray[iIdx++]=2;
        indexArray[iIdx++]=3;

            // bottom
            
        vertexArray[vIdx++]=-gridSize;
        vertexArray[vIdx++]=0;
        vertexArray[vIdx++]=-gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=0;
        uvArray[uvIdx++]=0;
        
        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=0;
        vertexArray[vIdx++]=-gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=1;
        uvArray[uvIdx++]=0;

        vertexArray[vIdx++]=gridSize;
        vertexArray[vIdx++]=0;
        vertexArray[vIdx++]=gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=1;
        uvArray[uvIdx++]=1;

        vertexArray[vIdx++]=-gridSize;
        vertexArray[vIdx++]=0;
        vertexArray[vIdx++]=gridSize;
        
        normalArray[nIdx++]=0;
        normalArray[nIdx++]=1;
        normalArray[nIdx++]=0;
        
        uvArray[uvIdx++]=0;
        uvArray[uvIdx++]=1;
        
        indexArray[iIdx++]=4;
        indexArray[iIdx++]=5;
        indexArray[iIdx++]=6;
        indexArray[iIdx++]=4;
        indexArray[iIdx++]=6;
        indexArray[iIdx++]=7;
        
        mesh=new MeshClass(this.core,'test',bitmap,-1,-1,vertexArray,normalArray,tangentArray,uvArray,null,null,indexArray);
        map.meshList.add(mesh);
        
        light=new LightClass(new PointClass(0,Math.trunc(gridSize*0.75),0),new ColorClass(1,1,1),gridSize,1.0);
        map.lightList.add(light);
        
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
