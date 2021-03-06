import PointClass from '../utility/point.js';
import CoreClass from '../main/core.js';
import BitmapEffectClass from '../bitmap/bitmap_effect.js';
import EffectClass from '../game/effect.js';

//
// map effect list class
//

export default class MapEffectListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.sharedBitmapMap=new Map();
        this.effects=[];
        
        Object.seal(this);
    }
    
        //
        // initialize/release effect list
        //

    async initialize()
    {
        let name,bitmap;
        
            // get objects for all the shared bitmaps
            // to be loaded later
            
        this.sharedBitmapMap.clear();
        
        for (name of this.core.project.getBitmapList(this.core.game.multiplayerMode===this.core.game.MULTIPLAYER_MODE_NONE)) {
            bitmap=new BitmapEffectClass(this.core,name);
            this.sharedBitmapMap.set(name,bitmap);
        }
        
            // no running effects
            
        this.effects=[];
        
        return(true);
    }

    release()
    {
        let bitmap,effect;
        
        for (bitmap of this.sharedBitmapMap.values()) {
            bitmap.release();
        }
        
        for (effect of this.effects) {
            effect.release();
        }
    }
    
        //
        // effect shared bitmaps
        //
        
    addSharedBitmapToLoadList(bitmapLoadList)
    {
        let bitmap;
        
        for (bitmap of this.sharedBitmapMap.values()) {
            bitmapLoadList.push(bitmap);
        }
    }
    
    getSharedBitmap(name)
    {
        return(this.sharedBitmapMap.get(name));
    }

        //
        // effect list
        //

    add(spawnedByEntity,effectName,position,data,mapSpawn,show)
    {
        let effect,effectClass;
        
        effectClass=this.core.project.effectClasses.get(effectName);

        effect=new effectClass(this.core,spawnedByEntity,position,data,mapSpawn,show);
        if (!mapSpawn) {
            if (!effect.initialize()) return(false);            // if we are being spawn by a map, we do the init and ready later
            effect.ready();
        }
        
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
        // initialize map effects
        //
        
    initializeMapEffects()
    {
        let effect;
        
        for (effect of this.effects) {
            if (!effect.initialize()) return(false);
        }

        return(true);
    }
    
    ready()
    {
        let effect;
        
        for (effect of this.effects) {
            effect.ready();
        }
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
            
            light=effect.effectLight;
            if (light===null) continue;
            if (light.intensity===0) continue;
            
                // always reset light to
                // effect position
                
            light.position.setFromPoint(effect.position);
            
                // skip any lights outside of frustrum
                
            if (!light.isInsideFrustrum(this.core)) continue;
            
                // add the light, find it's place in
                // the list
                
            x=this.core.game.camera.position.x-light.position.x;
            y=this.core.game.camera.position.y-light.position.y;
            z=this.core.game.camera.position.z-light.position.z;
            light.dist=Math.sqrt((x*x)+(y*y)+(z*z));
                
            idx=-1;

            for (n=0;n!==this.core.game.lights.length;n++) {
                if (this.core.game.lights[n].dist>light.dist) {
                    idx=n;
                    break;
                }
            }
            
                // add the light to the list
                
            if (idx===-1) {
                if (this.core.game.lights.length<this.core.MAX_LIGHT_COUNT) this.core.game.lights.push(light);
            }
            else {
                this.core.game.lights.splice(idx,0,light);
                if (this.core.game.lights.length>this.core.MAX_LIGHT_COUNT) this.core.game.lights.pop();
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
        let effect;
        
        for (effect of this.effects) {
            if ((effect.show) && (effect.setupOK)) effect.draw();
        }
    }
    
    drawDeveloper()
    {
        let n,effect;
        
            // developer draw, just draw icons
            // for where effects are (only draw for
            // map spawned effects because that's all
            // we edit)
            
        for (n=0;n!==this.effects.length;n++) {
            effect=this.effects[n];
            if (effect.mapSpawn) this.core.developer.developerSprite.drawBillboardSprite(this.core.developer.bitmapEffect,effect.position,this.core.developer.isEffectSelected(n));
        }
    }

}
