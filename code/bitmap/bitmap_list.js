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
        
    addGameBitmaps()
    {
        let game=this.core.game;
        
        this.addInterface(game.json.config.interfaceHitBitmap);
        this.addInterface(game.json.config.touchStickRingBitmap);
        this.addInterface(game.json.config.touchStickThumbBitmap);
        this.addInterface(game.json.config.touchMenuBitmap);
        if (game.interface!==undefined) {
            this.addInterfaceFromJson(game.json.interface.elements);
            this.addInterfaceFromJson(game.json.interface.counts);
        }
    }
    
    addEntityBitmaps()
    {
        let entity,jsonEntity;
        let weapon,jsonWeapon;
        let game=this.core.game;
        
        for (entity of this.core.map.entityList.entities) {
            jsonEntity=game.getCachedJsonEntity(entity.jsonName);
            if (jsonEntity.interface!==undefined) {
                this.addInterfaceFromJson(jsonEntity.interface.elements);
                this.addInterfaceFromJson(jsonEntity.interface.counts);
            }
            if (jsonEntity.weapons!==undefined) {
                for (weapon of jsonEntity.weapons) {
                    jsonWeapon=game.getCachedJsonEntity(weapon.json);
                    if (jsonWeapon.interface!==undefined) {
                        this.addInterfaceFromJson(jsonWeapon.interface.elements);
                        this.addInterfaceFromJson(jsonWeapon.interface.counts);
                    }
                }
            }
        }
    }
    
    addEffectBitmaps()
    {
        let jsonEffect;
        let game=this.core.game;
        
        for (jsonEffect of game.jsonEffectMap.values())
        {
            this.addEffectFromJson(jsonEffect.billboards);
            this.addEffectFromJson(jsonEffect.particles);
            this.addEffectFromJson(jsonEffect.triangles);
        }
    }
        
    async loadAllBitmaps()
    {
        let keyIter,rtn,bitmap;
        let success,promises;
        
            // we will already have bitmaps that
            // were added by importing glTF models,
            // so we only add the rest here
            // we look at the game, loaded entities, and
            // all effects
            
        this.addGameBitmaps();
        this.addEntityBitmaps();
        this.addEffectBitmaps();
     
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
