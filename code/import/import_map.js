import PointClass from '../../code/utility/point.js';
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
    
    load(name,scale,flipY,skyBoxSettings,lightSettings,liquidSettings,movementSettings,callback)
    {
        let importObj;
        
        importObj=new ImportObjClass(this.view,('./data/objs/'+name+'.obj'),scale,flipY);
        importObj.import(this.finishLoad.bind(this,importObj,skyBoxSettings,lightSettings,liquidSettings,movementSettings,callback));        
    }
    
    finishLoad(importObj,skyBoxSettings,lightSettings,liquidSettings,movementSettings,callback)
    {
        let n,k,idx;
        let light,lightDef;
        let liquid,liquidDef;
        let movement,move,movementDef,moveDef;
        
            // add the meshes to the map
            
        for (n=0;n!==importObj.meshes.length;n++) {
            this.map.meshList.add(importObj.meshes[n]);
        }
        
            // create the lights
            
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
            /*
            for (n=0;n!==liquidSettings.liquids.length;n++) {
                liquidDef=liquidSettings.liquids[n];
                
                liquid=new MapLiquidClass(this.view,bitmap,liquidDef.waveSize,liquidDef.waveFrequency,liquidDef.waveHeight,new BoundClass(liquidDef.xBound.min,liquidDef.xBound.max),liquidDef.y,new BoundClass(liquidDef.zBound.min,liquidDef.zBound.max))
                this.map.liquidList.add(liquid);
            }
            */
        }
       
            // create the movements
            
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
        
            // load the sky
            
        if (skyBoxSettings===null) {
            this.map.sky.on=false;
            callback();
        }
        else {
            this.map.sky.on=true;
            this.map.sky.loadBitmaps(skyBoxSettings,callback);
        }
    }
}
