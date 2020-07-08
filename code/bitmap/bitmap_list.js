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
    
    get(colorURL)
    {
        return(this.bitmaps.get(colorURL));
    }
    
        //
        // loading
        //

    async loadAllBitmaps()
    {
        let keyIter,rtn,colorURL,bitmap;
        let entity,jsonEntity,jsonEffect;
        let success,promises;
        let bitmapSet;
        let game=this.core.game;
        
            // we will already have bitmaps that
            // were added by importing glTF models,
            // so we only add the rest here

            // game and entity interface bitmaps
            
        bitmapSet=new Set();
        
        game.addJsonObjectToLoadSet(bitmapSet,null,null,false,['bitmap','interfaceHitBitmap','touchStickRingBitmap','touchStickThumbBitmap','touchMenuBitmap'],game.json);
        
        for (entity of this.core.map.entityList.entities) {
            jsonEntity=game.jsonEntityCache.get(entity.jsonName);
            if (jsonEntity!==null) game.addJsonObjectToLoadSet(bitmapSet,entity.data,null,false,['bitmap'],jsonEntity);
        }
        
        for (colorURL of bitmapSet) {
            if (!this.bitmaps.has(colorURL)) {
                bitmap=new BitmapInterfaceClass(this.core,colorURL);
                this.bitmaps.set(colorURL,bitmap);
            }
        }
        
            // effect bitmaps
            
        bitmapSet=new Set();
        
        for (jsonEffect of game.jsonEffectCache.values())
        {
            game.addJsonObjectToLoadSet(bitmapSet,null,null,false,['bitmap'],jsonEffect);
        }
        
        for (colorURL of bitmapSet) {
            if (!this.bitmaps.has(colorURL)) {
                bitmap=new BitmapEffectClass(this.core,colorURL);
                this.bitmaps.set(colorURL,bitmap);
            }
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
