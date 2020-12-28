import BitmapEffectClass from '../bitmap/bitmap_effect.js';
import SoundClass from '../sound/sound.js';

export default class EffectCacheClass
{
    constructor(core)
    {
        this.core=core;
        
        this.jsons=new Map();
        this.bitmaps=new Map();
        this.sounds=new Map();
    }
    
        //
        // initialize and release
        //
        
    async initialize()
    {
        let name,json;
        let resp,url;
        let billboard,particle,bitmap;
        let sound;
        
            // cache all items used for effects
            
        for (name of this.core.json.effects) {
            
                // load the json

            url='../effects/'+name+'.json';
        
            try {
                resp=await fetch(url);
                if (!resp.ok) {
                    console.log(`Unable to load ${url}: ${resp.statusText}`);
                    return(false);
                }
                json=await resp.json();
            }
            catch (e) {
                console.log(`Unable to load ${url}: ${e.message}`);
            }
            
                // add to cache
                
            this.jsons.set(name,json);
            
                // cache all bitmaps
                
            if (json.billboards!==undefined) {
                for (billboard of json.billboards) {
                    name=billboard.bitmap;
                    if (this.bitmaps.has(name)) continue;
                    
                    bitmap=new BitmapEffectClass(this.core,name);
                    if (!(await bitmap.load())) return(false);
                    this.bitmaps.set(name,bitmap);
                }
            }
            
            if (json.particles!==undefined) {
                for (particle of json.particles) {
                    name=particle.bitmap;
                    if (this.bitmaps.has(name)) continue;
                    
                    bitmap=new BitmapEffectClass(this.core,name);
                    if (!(await bitmap.load())) return(false);
                    this.bitmaps.set(name,bitmap);
                }
            }
                        
                // cache all sounds
                
            if (json.sounds!==undefined) {
                if (json.sounds.start!==undefined) {
                    name=json.sounds.start.name;
                    if (this.sounds.has(name)) continue;

                    sound=new SoundClass(this.core,name);
                    sound.initialize();
                    if (!(await sound.load())) return(false);
                    this.sounds.set(name,sound);
                }
            }
        }
        
        return(true);
    }
    
    release()
    {
        let bitmap,sound;
        
        this.jsons.clear();
        
        for (bitmap of this.bitmaps.values()) {
            bitmap.release();
        }
        
        for (sound of this.sounds.values()) {
            sound.release();
        }
    }
    
        //
        // get from caches
        //
        
    getJson(name)
    {
        return(this.jsons.get(name));
    }
    
    getBitmap(name)
    {
        return(this.bitmaps.get(name));
    }
    
    getSound(name)
    {
        return(this.sounds.get(name));
    }
    
}
