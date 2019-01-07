import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ColorClass from '../../code/utility/color.js';
import LightClass from '../../code/light/light.js';
import MapLiquidClass from '../../code/map/map_liquid.js';
import MoveClass from '../../code/map/move.js';
import MovementClass from '../../code/map/movement.js';
import ImportObjClass from '../../code/import/import_obj.js';

export default class ImportMapClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
    }
    
    load(name,scale,flipY,skyBoxSettings,lightSettings,glowSettings,liquidSettings,movementSettings,callback)
    {
        let importObj;
        
        importObj=new ImportObjClass(this.view,('./data/objs/'+name+'.obj'),scale,flipY);
        importObj.import(this.addMeshes.bind(this,importObj,skyBoxSettings,lightSettings,glowSettings,liquidSettings,movementSettings,callback));        
    }
    
    addMeshes(importObj,skyBoxSettings,lightSettings,glowSettings,liquidSettings,movementSettings,callback)
    {
        let n;
        
            // add the meshes to the map
            
        for (n=0;n!==importObj.meshes.length;n++) {
            this.map.meshList.add(importObj.meshes[n]);
        }
        
            // add in any liquid or sky textures so
            // they get loaded
            
        if (liquidSettings!==null) {
            for (n=0;n!==liquidSettings.liquids.length;n++) {
                this.view.bitmapList.add(liquidSettings.liquids[n].bitmap,true);
            }
        }
        
        if (skyBoxSettings!==null) {
            this.view.bitmapList.add(skyBoxSettings.bitmapNegX,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosX,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapNegY,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosY,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapNegZ,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosZ,true);
        }
        
        this.view.bitmapList.loadAllBitmaps(this.finishLoad.bind(this,skyBoxSettings,lightSettings,glowSettings,liquidSettings,movementSettings,callback));
    }
    
    finishLoad(skyBoxSettings,lightSettings,glowSettings,liquidSettings,movementSettings,callback)
    {
        let n,k,idx;
        let light,lightDef;
        let liquid,liquidDef,liquidBitmap;
        let movement,movementDef,moveDef;
        let glowDef,bitmap;
        
            // the lights
            
        this.view.ambient=lightSettings.ambient;
        
        if (lightSettings.lights!==null) {
            
            for (n=0;n!==lightSettings.lights.length;n++) {
                lightDef=lightSettings.lights[n];

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
            
        if (liquidSettings!==null) {
            for (n=0;n!==liquidSettings.liquids.length;n++) {
                liquidDef=liquidSettings.liquids[n];

                liquidBitmap=this.view.bitmapList.get(liquidDef.bitmap);
                liquidBitmap.alpha=liquidDef.alpha;
                liquid=new MapLiquidClass(this.view,liquidBitmap,liquidDef.waveSize,liquidDef.waveFrequency,liquidDef.waveHeight,liquidDef.uShift,liquidDef.vShift,new ColorClass(liquidDef.tint.r,liquidDef.tint.g,liquidDef.tint.b),new BoundClass(liquidDef.xBound.min,liquidDef.xBound.max),new BoundClass(liquidDef.yBound.min,liquidDef.yBound.max),new BoundClass(liquidDef.zBound.min,liquidDef.zBound.max))
                this.map.liquidList.add(liquid);
            }
        }
       
            // the movements
            
        if (movementSettings!==null) {

            for (n=0;n!==movementSettings.movements.length;n++) {
                movementDef=movementSettings.movements[n];

                idx=this.map.meshList.find(movementDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach movement to: '+movementDef.mesh);
                    continue;
                }

                movement=new MovementClass(idx,movementDef.looping,movementDef.approachDistance);

                for (k=0;k!==movementDef.moves.length;k++) {
                    moveDef=movementDef.moves[k];
                    movement.addMove(new MoveClass(moveDef.tick,new PointClass(moveDef.move.x,moveDef.move.y,moveDef.move.z)));
                }

                this.map.movementList.add(movement);
            }
        }
        
            // the sky
            
        if (skyBoxSettings===null) {
            this.map.sky.on=false;
        }
        else {
            this.map.sky.on=true;
            this.map.sky.skyBoxSettings=skyBoxSettings;
        }
        
            // alter any bitmaps for glow settings
            
        if (glowSettings!==null) {
            for (n=0;n!==glowSettings.glows.length;n++) {
                glowDef=glowSettings.glows[n];
                
                bitmap=this.view.bitmapList.get(glowDef.bitmap);
                if (bitmap===undefined) {
                    console.log('Missing bitmap to set glow to: '+glowDef.bitmap);
                    return;
                }
                
                bitmap.glowFrequency=glowDef.frequency;
                bitmap.glowMax=glowDef.max;
            }
        }
        
            // and return control to map script
            
        callback();
    }
}
