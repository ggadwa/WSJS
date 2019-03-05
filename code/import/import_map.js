import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import LightClass from '../light/light.js';
import MapLiquidClass from '../map/map_liquid.js';
import MoveClass from '../map/move.js';
import MovementClass from '../map/movement.js';
import ImportGLTFClass from '../import/import_gltf.js';

export default class ImportMapClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        Object.seal(this);
    }
    
    async load(importSettings)
    {
        let n,k,scale,idx;
        let effect,effectDef,effectPos;
        let light,lightDef;
        let liquid,liquidDef,liquidBitmap;
        let movement,idxList,movementDef,moveDef,movePoint,moveRotate,rotateOffset;
        let glowDef,bitmap;
        let importMesh;
        
            // import the map itself
          
        importMesh=new ImportGLTFClass(this.view,importSettings);
        if (!(await importMesh.import(this.map.meshList,null))) return(false);
        
            // maps don't have rigging, so we need to recalculate
            // all the node matrixes and TRS and then scale to
            // the size we want (animations cover that for rigged
            // models)
            
        scale=importSettings.scale;
        if (scale===undefined) scale=1;
        
        this.map.meshList.recalcVertexesFromImportMatrixes(scale);
        
            // run through the effects so bitmaps get into list
            
        if (importSettings.effects!==undefined) {
            for (n=0;n!==importSettings.effects.length;n++) {
                effectDef=importSettings.effects[n];
                
                idx=this.map.meshList.find(effectDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach effect to: '+effectDef.mesh);
                    continue;
                }
                
                effectPos=new PointClass(effectDef.offset.x,effectDef.offset.y,effectDef.offset.z);
                effectPos.addPoint(this.map.meshList.meshes[idx].center);
                
                effect=new effectDef.effect(this.view,this.map,effectPos,effectDef.data);
                this.map.effectList.add(effect);
            }
        }
        
            // the lights
            
        this.view.ambient=importSettings.ambient;
        
        if (importSettings.lights!==undefined) {
            
            for (n=0;n!==importSettings.lights.length;n++) {
                lightDef=importSettings.lights[n];

                idx=this.map.meshList.find(lightDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach light to: '+lightDef.mesh);
                    continue;
                }

                light=new LightClass(this.map.meshList.meshes[idx].center.copy(),new ColorClass(lightDef.color.r,lightDef.color.g,lightDef.color.b),lightDef.intensity,lightDef.exponent);
                this.map.lightList.add(light);
            }
        }
        
            // the liquids
            
        if (importSettings.liquids!==undefined) {
            for (n=0;n!==importSettings.liquids.length;n++) {
                liquidDef=importSettings.liquids[n];
                
                this.view.bitmapList.add(liquidDef.bitmap,null,null,null,null);

                liquidBitmap=this.view.bitmapList.get(liquidDef.bitmap);
                liquidBitmap.alpha=liquidDef.alpha;
                liquid=new MapLiquidClass(this.view,liquidBitmap,liquidDef.waveSize,liquidDef.waveFrequency,liquidDef.waveHeight,liquidDef.waveUVStamp,liquidDef.uShift,liquidDef.vShift,new ColorClass(liquidDef.tint.r,liquidDef.tint.g,liquidDef.tint.b),new BoundClass(liquidDef.xBound.min,liquidDef.xBound.max),new BoundClass(liquidDef.yBound.min,liquidDef.yBound.max),new BoundClass(liquidDef.zBound.min,liquidDef.zBound.max))
                this.map.liquidList.add(liquid);
            }
        }
       
            // the movements
            
        if (importSettings.movements!==undefined) {

            for (n=0;n!==importSettings.movements.length;n++) {
                movementDef=importSettings.movements[n];

                idxList=[];
                
                for (k=0;k!==movementDef.meshes.length;k++) {
                    idx=this.map.meshList.find(movementDef.meshes[k]);
                    if (idx===-1) {
                        console.log('Unknown mesh to attach movement to: '+movementDef.meshes[k]);
                        continue;
                    }
                    idxList.push(idx);
                }
                    
                rotateOffset=new PointClass(0,0,0);
                if (movementDef.rotateOffset!==undefined) rotateOffset.setFromValues(movementDef.rotateOffset.x,movementDef.rotateOffset.y,movementDef.rotateOffset.z);

                movement=new MovementClass(idxList,rotateOffset,movementDef.looping,movementDef.approachDistance);

                for (k=0;k!==movementDef.moves.length;k++) {
                    moveDef=movementDef.moves[k];
                    
                    movePoint=new PointClass(0,0,0);
                    if (moveDef.move!==undefined) movePoint.setFromValues(moveDef.move.x,moveDef.move.y,moveDef.move.z);
                    
                    moveRotate=new PointClass(0,0,0);
                    if (moveDef.rotate!==undefined) moveRotate.setFromValues(moveDef.rotate.x,moveDef.rotate.y,moveDef.rotate.z);
                    
                    movement.addMove(new MoveClass(moveDef.tick,movePoint,moveRotate));
                }

                this.map.movementList.add(movement);
            }
        }
        
            // the sky
            
        if (importSettings.skyBox===undefined) {
            this.map.sky.on=false;
        }
        else {
            this.map.sky.on=true;
            this.map.sky.skyBoxSettings=importSettings.skyBox;
            
            this.view.bitmapList.add(importSettings.skyBox.bitmapNegX,null,null,null,null);
            this.view.bitmapList.add(importSettings.skyBox.bitmapPosX,null,null,null,null);
            this.view.bitmapList.add(importSettings.skyBox.bitmapNegY,null,null,null,null);
            this.view.bitmapList.add(importSettings.skyBox.bitmapPosY,null,null,null,null);
            this.view.bitmapList.add(importSettings.skyBox.bitmapNegZ,null,null,null,null);
            this.view.bitmapList.add(importSettings.skyBox.bitmapPosZ,null,null,null,null);
        }
        
            // alter any bitmaps for glow settings
            // normally nothing loads glows, we reset that here
            
        if (importSettings.glows!==undefined) {
            for (n=0;n!==importSettings.glows.length;n++) {
                glowDef=importSettings.glows[n];
                
                bitmap=this.view.bitmapList.getSimpleName(glowDef.bitmap);
                if (bitmap===null) {
                    console.log('Missing bitmap to set glow to: '+glowDef.bitmap);
                    return;
                }
                
                bitmap.glowURL=glowDef.url;
                bitmap.glowFrequency=glowDef.frequency;
                bitmap.glowMax=glowDef.max;
            }
        }
        
            // and turn off any collisions for certain
            // bitmaps, mostly for things like bushes
            // and webs, etc
            
        if (importSettings.noCollideBitmaps!==undefined) {
            for (n=0;n!==importSettings.noCollideBitmaps.length;n++) {
                
                bitmap=this.view.bitmapList.getSimpleName(importSettings.noCollideBitmaps[n]);                
                if (bitmap===null) {
                    console.log('Missing bitmap to set no collisions to: '+importSettings.noCollideBitmaps[n]);
                    return(false);
                }
                
                this.map.meshList.setNoCollisionsForBitmap(bitmap);
            }
        }
        
        return(true);
    }
}
