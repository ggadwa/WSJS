import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import LightClass from '../light/light.js';
import MapLiquidClass from '../map/map_liquid.js';
import MoveClass from '../map/move.js';
import MovementClass from '../map/movement.js';
import MapCubeClass from '../map/map_cube.js';
import MapPathNodeClass from '../map/map_path_node.js';
import ImportGLTFClass from '../import/import_gltf.js';

export default class ImportMapClass
{
    constructor(core)
    {
        this.core=core;
        
        Object.seal(this);
    }
    
    async load(json)
    {
        let n,k,scale,idx;
        let light,lightDef,lightAmbient;
        let liquid,liquidDef,liquidBitmap;
        let movement,meshIdxList,reverseMeshIdxList,movementDef;
        let moveDef,movePoint,moveRotate,rotateOffset,centerOffset;
        let pathNode,pathDef,altPosition;
        let cube,cubeDef;
        let bitmap;
        let importMesh;
        
            // import the map itself
          
        importMesh=new ImportGLTFClass(this.core,json);
        if (!(await importMesh.import(this.core.map.meshList,null))) return(false);
        
            // some misc setup
            
        this.core.map.bumpHeight=json.bumpHeight;
        this.core.map.gravityMinValue=json.gravity.min;
        this.core.map.gravityMaxValue=json.gravity.max;
        this.core.map.gravityAcceleration=json.gravity.acceleration;
        
            // maps don't have rigging, so we need to recalculate
            // all the node matrixes and TRS and then scale to
            // the size we want (animations cover that for rigged
            // models)
            
        scale=json.scale;
        if (scale===undefined) scale=1;
        
        this.core.map.meshList.scaleMeshes(scale);
        
            // the lights
            
        if (json.lightMin!==undefined) this.core.map.lightList.lightMin.setFromValues(json.lightMin.r,json.lightMin.g,json.lightMin.b);
        if (json.lightMax!==undefined) this.core.map.lightList.lightMax.setFromValues(json.lightMax.r,json.lightMax.g,json.lightMax.b);
            
        if (json.lights!==undefined) {
            
            for (n=0;n!==json.lights.length;n++) {
                lightDef=json.lights[n];
                
                lightAmbient=false;
                if (lightDef.ambient!==undefined) lightAmbient=lightDef.ambient;
                
                    // positioned
                    
                if (lightDef.position!==undefined) {
                    light=new LightClass(new PointClass(lightDef.position.x,lightDef.position.y,lightDef.position.z),new ColorClass(lightDef.color.r,lightDef.color.g,lightDef.color.b),lightDef.intensity,lightDef.exponent,lightAmbient);
                    this.core.map.lightList.add(light);
                    continue;
                }
                
                    // positioned from a mesh

                idx=this.core.map.meshList.find(lightDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach light to: '+lightDef.mesh);
                    continue;
                }
                
                light=new LightClass(this.core.map.meshList.meshes[idx].center.copy(),new ColorClass(lightDef.color.r,lightDef.color.g,lightDef.color.b),lightDef.intensity,lightDef.exponent,lightAmbient);
                this.core.map.lightList.add(light);
            }
        }
        
            // the liquids
            
        if (json.liquids!==undefined) {
            for (n=0;n!==json.liquids.length;n++) {
                liquidDef=json.liquids[n];
                
                liquidBitmap=this.core.bitmapList.addSimple(liquidDef.bitmap);
                liquid=new MapLiquidClass(this.core,liquidBitmap,liquidDef.waveSize,liquidDef.wavePeriod,liquidDef.waveHeight,liquidDef.waveUVStamp,liquidDef.uShift,liquidDef.vShift,new ColorClass(liquidDef.tint.r,liquidDef.tint.g,liquidDef.tint.b),new BoundClass(liquidDef.xBound.min,liquidDef.xBound.max),new BoundClass(liquidDef.yBound.min,liquidDef.yBound.max),new BoundClass(liquidDef.zBound.min,liquidDef.zBound.max))
                this.core.map.liquidList.add(liquid);
            }
        }
       
            // the movements
            
        if (json.movements!==undefined) {

            for (n=0;n!==json.movements.length;n++) {
                movementDef=json.movements[n];

                meshIdxList=[];
                
                for (k=0;k!==movementDef.meshes.length;k++) {
                    idx=this.core.map.meshList.find(movementDef.meshes[k]);
                    if (idx===-1) {
                        console.log('Unknown mesh to attach movement to: '+movementDef.meshes[k]);
                        continue;
                    }
                    meshIdxList.push(idx);
                }
                
                reverseMeshIdxList=null;
                
                if (movementDef.reverseMeshes!==undefined) {
                    reverseMeshIdxList=[];

                    for (k=0;k!==movementDef.reverseMeshes.length;k++) {
                        idx=this.core.map.meshList.find(movementDef.reverseMeshes[k]);
                        if (idx===-1) {
                            console.log('Unknown mesh to attach reverse movement to: '+movementDef.reverseMeshes[k]);
                            continue;
                        }
                        reverseMeshIdxList.push(idx);
                    }
                }
                    
                rotateOffset=new PointClass(0,0,0);
                if (movementDef.rotateOffset!==undefined) rotateOffset.setFromValues(movementDef.rotateOffset.x,movementDef.rotateOffset.y,movementDef.rotateOffset.z);
                
                centerOffset=new PointClass(0,0,0);
                if (movementDef.centerOffset!==undefined) centerOffset.setFromValues(movementDef.centerOffset.x,movementDef.centerOffset.y,movementDef.centerOffset.z);

                movement=new MovementClass(this.core,meshIdxList,reverseMeshIdxList,rotateOffset,centerOffset);

                for (k=0;k!==movementDef.moves.length;k++) {
                    moveDef=movementDef.moves[k];
                    
                    movePoint=new PointClass(0,0,0);
                    if (moveDef.move!==undefined) movePoint.setFromValues(moveDef.move.x,moveDef.move.y,moveDef.move.z);
                    
                    moveRotate=new PointClass(0,0,0);
                    if (moveDef.rotate!==undefined) moveRotate.setFromValues(moveDef.rotate.x,moveDef.rotate.y,moveDef.rotate.z);
                    
                    movement.addMove(new MoveClass(moveDef.tick,movePoint,moveRotate,movement.lookupPauseType(moveDef.pauseType),((moveDef.pauseData===undefined)?null:moveDef.pauseData),((moveDef.sound===undefined)?null:moveDef.sound),((moveDef.trigger===undefined)?null:moveDef.trigger)));
                }

                this.core.map.movementList.add(movement);
            }
        }
        
            // the sky
            
        if (json.skyBox===undefined) {
            this.core.map.sky.on=false;
        }
        else {
            this.core.map.sky.on=true;
            this.core.map.sky.size=json.skyBox.size;
            this.core.map.sky.bitmap=this.core.bitmapList.addSimple(json.skyBox.bitmap);
        }
        
            // paths
            
        if (json.paths!==undefined) {
            for (n=0;n!==json.paths.length;n++) {
                pathDef=json.paths[n];
                
                altPosition=null;
                if (pathDef.altPosition!==undefined) altPosition=new PointClass(pathDef.altPosition.x,pathDef.altPosition.y,pathDef.altPosition.z);
                
                pathNode=new MapPathNodeClass(this.core.map.path.nodes.length,new PointClass(pathDef.position.x,pathDef.position.y,pathDef.position.z),altPosition,pathDef.links,pathDef.key,pathDef.data);
                this.core.map.path.nodes.push(pathNode);
            }
            
            this.core.map.path.buildPathHints();
        }
        
            // cubes
            
        if (json.cubes!==undefined) {
            for (n=0;n!==json.cubes.length;n++) {
                cubeDef=json.cubes[n];
                
                cube=new MapCubeClass(new BoundClass(cubeDef.xBound.min,cubeDef.xBound.max),new BoundClass(cubeDef.yBound.min,cubeDef.yBound.max),new BoundClass(cubeDef.zBound.min,cubeDef.zBound.max),cubeDef.key,cubeDef.data);
                this.core.map.cubeList.add(cube);
            }
        }
        
            // some physics settings
            
        if (json.maxFloorCeilingDetectionFactor!==undefined) {
            this.core.map.meshList.maxFloorCeilingDetectionFactor=1.0-json.maxFloorCeilingDetectionFactor;     // 0 = walls facing straight up only, to 1 which is pretty much anything
        }

            // and finally a number of mesh specific settings,
            // based either on bitmap associated or a prefix to a mesh name
            
        if (json.noCollideBitmaps!==undefined) {
            for (n=0;n!==json.noCollideBitmaps.length;n++) {
                
                bitmap=this.core.bitmapList.getSimpleName(json.noCollideBitmaps[n]);                
                if (bitmap===null) {
                    console.log('Missing bitmap to set no collisions to: '+json.noCollideBitmaps[n]);
                    return(false);
                }
                
                this.core.map.meshList.setNoCollisionsForBitmap(bitmap);
            }
        }
        
        if (json.noCollideMeshes!==undefined) {
            for (n=0;n!==json.noCollideMeshes.length;n++) {
                this.core.map.meshList.setNoCollisionsForBitmap(json.noCollideMeshes[n]);
            }
        }
        
        if (json.simpleCollideBitmaps!==undefined) {
            for (n=0;n!==json.simpleCollideBitmaps.length;n++) {
                
                bitmap=this.core.bitmapList.getSimpleName(json.simpleCollideBitmaps[n]);                
                if (bitmap===null) {
                    console.log('Missing bitmap to set no collisions to: '+json.simpleCollideBitmaps[n]);
                    return(false);
                }
                
                this.core.map.meshList.setSimpleCollisionsForBitmap(bitmap);
            }
        }
            
        if (json.simpleCollideMeshes!==undefined) {
            for (n=0;n!==json.simpleCollideMeshes.length;n++) {
                this.core.map.meshList.setSimpleCollisionsForMeshes(json.simpleCollideMeshes[n]);
            }
        }
        
        if (json.meshNoBumpMeshes!==undefined) {
            for (n=0;n!==json.meshNoBumpMeshes.length;n++) {
                this.core.map.meshList.setNoBumpForMeshes(json.meshNoBumpMeshes[n]);
            }
        }
        
        if (json.decalBitmaps!==undefined) {
            for (n=0;n!==json.decalBitmaps.length;n++) {
                
                bitmap=this.core.bitmapList.getSimpleName(json.decalBitmaps[n]);                
                if (bitmap===null) {
                    console.log('Missing bitmap to set as decal to: '+json.decalBitmaps[n]);
                    return(false);
                }
                
                this.core.map.meshList.setDecalsForBitmap(bitmap);
            }
        }
        
        return(true);
    }
}
