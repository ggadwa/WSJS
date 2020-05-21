import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';
import BitmapEffectClass from '../bitmap/bitmap_effect.js';
import BitmapInterfaceClass from '../bitmap/bitmap_interface.js';

//
// core bitmap list class
//

export default class BitmapListClass
{
    constructor(core)
    {
        this.core=core;
        
        this.bitmaps=new Map();
        this.generatedUniqueId=0;

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
        //
        // add and get
        //
        
    add(bitmap)
    {
        this.bitmaps.set(bitmap.colorURL,bitmap);
    }
    
    addEffect(colorURL)
    {
        let bitmap;
        
        if (!this.bitmaps.has(colorURL)) {
            bitmap=new BitmapEffectClass(this.core,colorURL);
            this.bitmaps.set(colorURL,bitmap);
        }
    }
    
    addEffectFromJson(arr)
    {
        let obj;
        
        if ((arr===undefined) || (arr===null)) return;
        
        for (obj of arr)
        {
            this.addEffect(obj.bitmap);
        }
    }
    
    addInterface(colorURL)
    {
        let bitmap;
            
        if (!this.bitmaps.has(colorURL)) {
            bitmap=new BitmapInterfaceClass(this.core,colorURL);
            this.bitmaps.set(colorURL,bitmap);
        }
    }
    
    addInterfaceFromJson(arr)
    {
        let obj;
        
        if ((arr===undefined) || (arr===null)) return;
        
        for (obj of arr)
        {
            this.addInterface(obj.bitmap);
        }
    }
    
    get(colorURL)
    {
        return(this.bitmaps.get(colorURL));
    }
    
        //
        // loading
        //
        
    async loadAllBitmaps()
    {
        let entityDef,effectDef,keys,key;
        let keyIter,rtn,bitmap;
        let success,promises;
        let game=this.core.game;
        
            // we will already have bitmaps that
            // were added by importing glTF models,
            // so we only add the rest here
            // we look at the game, entity, and effect json
            
        this.addInterface(game.json.config.interfaceHitBitmap);
        this.addInterface(game.json.config.touchStickRingBitmap);
        this.addInterface(game.json.config.touchStickThumbBitmap);
        this.addInterface(game.json.config.touchMenuBitmap);
        if (game.interface!==undefined) {
            this.addInterfaceFromJson(game.json.interface.elements);
            this.addInterfaceFromJson(game.json.interface.counts);
        }
        
        keys=Object.keys(game.jsonEntityCache);
        
        for (key of keys)
        {
            entityDef=game.jsonEntityCache[key];
            if (entityDef.interface!==undefined) {
                this.addInterfaceFromJson(entityDef.interface.elements);
                this.addInterfaceFromJson(entityDef.interface.counts);
            }
        }
        
        keys=Object.keys(game.jsonEffectCache);
        
        for (key of keys)
        {
            effectDef=game.jsonEffectCache[key];
            this.addEffectFromJson(effectDef.billboards);
            this.addEffectFromJson(effectDef.particles);
            this.addEffectFromJson(effectDef.triangles);
        }
     
            // gather all the promises
            
        promises=[];
        
        keyIter=this.bitmaps.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            bitmap=this.bitmaps.get(rtn.value);
            if (!bitmap.loaded) promises.push(bitmap.load());
        }
        
            // and await them all
            
        success=true;
        
        await Promise.all(promises)
            .then
                (
                    (values)=>{
                        success=!values.includes(false);
                    },
                );

        return(success);
    }
    
}
