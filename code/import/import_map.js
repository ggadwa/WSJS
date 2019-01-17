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
    
    async load(name,scale,flipY,skyBoxSettings,lightSettings,glowSettings,effectSettings,liquidSettings,movementSettings)
    {
        let n,k,idx;
        let effect,effectDef,effectPos;
        let light,lightDef;
        let liquid,liquidDef,liquidBitmap;
        let movement,idxList,movementDef,moveDef,movePoint,moveRotate,rotateOffset;
        let glowDef,bitmap;
        let importObj;
        
        importObj=new ImportObjClass(this.view,('./data/objs/'+name+'.obj'),scale,flipY,false);
        if (!(await importObj.import(this.map.meshList))) return(false);
        
            // run through the effects so bitmaps get into list
            
        if (effectSettings!==null) {
            for (n=0;n!==effectSettings.effects.length;n++) {
                effectDef=effectSettings.effects[n];
                
                idx=this.map.meshList.find(effectDef.mesh);
                if (idx===-1) {
                    console.log('Unknown mesh to attach light to: '+lightDef.mesh);
                    continue;
                }
                
                effectPos=new PointClass(effectDef.offset.x,effectDef.offset.y,effectDef.offset.z);
                effectPos.addPoint(this.map.meshList.meshes[idx].center);
                
                effect=new effectDef.class(this.view,this.map,effectPos,effectDef.data);
                this.map.effectList.add(effectDef.name,effect);
            }
        }
        
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
                
                this.view.bitmapList.add(liquidDef.bitmap,true);

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
            
        if (skyBoxSettings===null) {
            this.map.sky.on=false;
        }
        else {
            this.map.sky.on=true;
            this.map.sky.skyBoxSettings=skyBoxSettings;
            
            this.view.bitmapList.add(skyBoxSettings.bitmapNegX,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosX,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapNegY,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosY,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapNegZ,true);
            this.view.bitmapList.add(skyBoxSettings.bitmapPosZ,true);
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
        
        return(true);
    }
}
