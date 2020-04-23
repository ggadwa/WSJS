import PointClass from '../utility/point.js';
import CoreClass from '../main/core.js';
import EffectClass from '../project/effect.js';

//
// map effect list class
//

export default class MapEffectListClass
{
    constructor(core)
    {
        this.core=core;
        this.effects=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release effect list
        //

    initialize()
    {
        this.effects=[];
        return(true);
    }

    release()
    {
        let effect;
        
        for (effect of this.effects) {
            effect.release();
        }
    }

        //
        // effect list
        //

    add(spawnedBy,jsonName,position,data,mapSpawn,show)
    {
        let effect;
        
        effect=new EffectClass(this.core,spawnedBy,jsonName,position,data,mapSpawn,show);
        if (!effect.initialize()) return(false);
        
        this.effects.push(effect);
        
        return(true);
    }
    
    cleanUpMarkedAsDeleted()
    {
        let n,effect;
         
        for (n=(this.effects.length-1);n>=0;n--) {
            effect=this.effects[n];
            if (effect.markDelete) {
                effect.release();
                this.effects.splice(n,1);
            }
        }
    }
    
        //
        // load map effects
        //
        
    loadMapEffects()
    {
        let effectList=this.core.map.json.effects;
        let n,effectDef,effectPosition,effectShow,meshIdx;
        
        if (effectList===undefined) return(true);
        
            // load effects from map import settings
             
        for (n=0;n!==effectList.length;n++) {
            effectDef=effectList[n];

                // determine the position

            if (effectDef.position!==undefined) {
                effectPosition=new PointClass(effectDef.position.x,effectDef.position.y,effectDef.position.z);
            }
            else {
                if (effectDef.attachMesh!==undefined) {
                    
                    meshIdx=this.core.map.meshList.find(effectDef.attachMesh);
                    if (meshIdx===-1) {
                        console.log('Unknown mesh to attach effect to: '+effectDef.attachMesh);
                        return(false);
                    }
                    
                    effectPosition=this.core.map.meshList.meshes[meshIdx].center.copy();
                    if (effectDef.attachOffset!==undefined) effectPosition.addValues(effectDef.attachOffset.x,effectDef.attachOffset.y,effectDef.attachOffset.z);
                }
                else {
                    effectPosition=new PointClass(0,0,0);
                }
            }

                // create the effect

            effectShow=true;
            if (effectDef.show!==undefined) effectShow=effectDef.show;

            if (!this.add(null,effectDef.json,effectPosition,effectDef.data,true,effectShow)) return(false);
        }
        
        return(true);
    }
    
        //
        // lights from effects
        // we need to run all the drawsetups before this
        // so intensity/positioning are all set
        //
        
    addLightsToViewLights()
    {
        let effect,light;
        let n,x,y,z,idx;
        
        for (effect of this.effects) {
            if (!effect.show) continue;
            
            light=effect.light;
            if (light===null) continue;
            if (light.intensity===0) continue;
            
                // always reset light to
                // effect position
                
            light.position.setFromPoint(effect.position);
            
                // skip any lights outside of frustrum
                
            if (!light.isInsideFrustrum(this.core)) continue;
            
                // add the light, find it's place in
                // the list
                
            x=this.core.camera.position.x-light.position.x;
            y=this.core.camera.position.y-light.position.y;
            z=this.core.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
                
            idx=-1;

            for (n=0;n!==this.core.lights.length;n++) {
                if (this.core.lights[n].dist>light.dist) {
                    idx=n;
                    break;
                }
            }
            
                // add the light to the list
                
            if (idx===-1) {
                if (this.core.lights.length<this.core.MAX_LIGHT_COUNT) this.core.lights.push(light);
            }
            else {
                this.core.lights.splice(idx,0,light);
                if (this.core.lights.length>this.core.MAX_LIGHT_COUNT) this.core.lights.pop();
            }
        }
    }
    
        //
        // run all the draw setups, we do this
        // so lights and position can get setup
        // before we run the lights
        //
        
    drawSetup()
    {
        let effect;
        
        for (effect of this.effects) {
            if (!effect.show) continue;
            effect.setupOK=effect.drawSetup();
        }
    }
        
        //
        // draw all effects
        //
        
    draw()
    {
        let effect,bitmap;
        
            // regular effect drawing
            // if the effects are shown, then draw them
            
        if (!this.core.game.developer.on) {
        
            for (effect of this.effects) {
                if ((effect.show) && (effect.setupOK)) effect.draw();
            }
            
            return;
        }
        
            // developer draw, just draw icons
            // for where effects are (only draw for
            // map spawned effects because that's all
            // we edit)
            
        bitmap=this.core.bitmapList.get('../developer/sprites/effect.png');
            
        for (effect of this.effects) {
            if (effect.mapSpawn) this.core.game.developer.developerSprite.drawBillboardSprite(bitmap,effect.position);
        }
    }

}
