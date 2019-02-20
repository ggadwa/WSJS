import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import LightClass from '../light/light.js';
import MapLiquidClass from '../map/map_liquid.js';
import MoveClass from '../map/move.js';
import MovementClass from '../map/movement.js';
import ImportSettingsClass from '../import/import_settings.js';
import ImportObjClass from '../import/import_obj.js';
import ImportGLTFClass from '../import/import_gltf.js';
import ImportJSONClass from '../import/import_json.js';

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
        let n,k,idx;
        let effect,effectDef,effectPos,effectClass;
        let light,lightDef;
        let liquid,liquidDef,liquidBitmap;
        let movement,idxList,movementDef,moveDef,movePoint,moveRotate,rotateOffset;
        let glowDef,bitmap;
        let importMesh,importJSON,mapSettings;
        
            // import the map itself
          
        if (importSettings.format===ImportSettingsClass.FORMAT_OBJ) {
            importMesh=new ImportObjClass(this.view,importSettings); 
        }
        else {
            importMesh=new ImportGLTFClass(this.view,importSettings); 
        }
        if (!(await importMesh.import(this.map.meshList,null))) return(false);
        
            // import the json
            
        importJSON=new ImportJSONClass(this.view,importSettings);
        mapSettings=(await importJSON.import());
        
            // run through the effects so bitmaps get into list
            
        if (mapSettings.effects!==null) {
            for (n=0;n!==mapSettings.effects.length;n++) {
                effectDef=mapSettings.effects[n];
                
                idx=this.map.meshList.find(effectDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach light to: '+lightDef.mesh);
                    continue;
                }
                
                effectClass=importSettings.lookupEffectClass(effectDef.effect);
                if (effectClass===null) throw('Could not find a class in effectClassLookup for effect named: '+effectDef.effect);
                
                effectPos=new PointClass(effectDef.offset.x,effectDef.offset.y,effectDef.offset.z);
                effectPos.addPoint(this.map.meshList.meshes[idx].center);
                
                effect=new effectClass(this.view,this.map,effectPos,effectDef.data);
                this.map.effectList.add(effect);
            }
        }
        
            // the lights
            
        this.view.ambient=mapSettings.ambient;
        
        if (mapSettings.lights!==null) {
            
            for (n=0;n!==mapSettings.lights.length;n++) {
                lightDef=mapSettings.lights[n];

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
            
        if (mapSettings.liquids!==null) {
            for (n=0;n!==mapSettings.liquids.length;n++) {
                liquidDef=mapSettings.liquids[n];
                
                this.view.bitmapList.add(liquidDef.bitmap,true);

                liquidBitmap=this.view.bitmapList.get(liquidDef.bitmap);
                liquidBitmap.alpha=liquidDef.alpha;
                liquid=new MapLiquidClass(this.view,liquidBitmap,liquidDef.waveSize,liquidDef.waveFrequency,liquidDef.waveHeight,liquidDef.uShift,liquidDef.vShift,new ColorClass(liquidDef.tint.r,liquidDef.tint.g,liquidDef.tint.b),new BoundClass(liquidDef.xBound.min,liquidDef.xBound.max),new BoundClass(liquidDef.yBound.min,liquidDef.yBound.max),new BoundClass(liquidDef.zBound.min,liquidDef.zBound.max))
                this.map.liquidList.add(liquid);
            }
        }
       
            // the movements
            
        if (mapSettings.movements!==null) {

            for (n=0;n!==mapSettings.movements.length;n++) {
                movementDef=mapSettings.movements[n];

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
            
        if (mapSettings.skyBox===null) {
            this.map.sky.on=false;
        }
        else {
            this.map.sky.on=true;
            this.map.sky.skyBoxSettings=mapSettings.skyBox;
            
            this.view.bitmapList.add(mapSettings.skyBox.bitmapNegX,true);
            this.view.bitmapList.add(mapSettings.skyBox.bitmapPosX,true);
            this.view.bitmapList.add(mapSettings.skyBox.bitmapNegY,true);
            this.view.bitmapList.add(mapSettings.skyBox.bitmapPosY,true);
            this.view.bitmapList.add(mapSettings.skyBox.bitmapNegZ,true);
            this.view.bitmapList.add(mapSettings.skyBox.bitmapPosZ,true);
        }
        
            // alter any bitmaps for glow settings
            
        if (mapSettings.glows!==null) {
            for (n=0;n!==mapSettings.glows.length;n++) {
                glowDef=mapSettings.glows[n];
                
                bitmap=this.view.bitmapList.get(glowDef.bitmap);
                if (bitmap===undefined) {
                    console.log('Missing bitmap to set glow to: '+glowDef.bitmap);
                    return;
                }
                
                bitmap.glowFrequency=glowDef.frequency;
                bitmap.glowMax=glowDef.max;
            }
        }
        
        return(true);
    }
}
