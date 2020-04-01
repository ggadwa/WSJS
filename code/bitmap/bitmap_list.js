import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

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
        // add and get a bitmap
        //
        
    add(colorURL,normalURL,specularURL,specularFactor,scale)
    {
        let bitmap;
        
            // already in list?
            
        if (this.bitmaps.has(colorURL)) return(this.bitmaps.get(colorURL));
            
            // add bitmap to list, these will be loaded
            // in a later call
                    
        bitmap=new BitmapClass(this.core);
        bitmap.initializeNormalURL(colorURL,normalURL,specularURL,specularFactor,scale);
        this.bitmaps.set(colorURL,bitmap);
        
        return(bitmap);
    }
    
    addColor(colorBase)
    {
        let bitmap;
        let hex,colorURL;
                
            // make up a name from the color
        
        hex=(Math.trunc(colorBase.r*255)<<16)+(Math.trunc(colorBase.g*255)<<8)+Math.trunc(colorBase.b*255);
        colorURL='_rgb_'+hex.toString(16);
            
            // already in list?
            
        if (this.bitmaps.has(colorURL)) return(this.bitmaps.get(colorURL));
        
            // add bitmap to list, these will be loaded
            // in a later call
                    
        bitmap=new BitmapClass(this.core);
        bitmap.initializeColor(colorURL,colorBase);
        this.bitmaps.set(colorURL,bitmap);
        
        return(bitmap);
    }
    
    addSimple(colorURL)
    {
        let bitmap;
            
            // already in list?
            
        if (this.bitmaps.has(colorURL)) return(this.bitmaps.get(colorURL));
        
            // add bitmap to list, these will be loaded
            // in a later call
                    
        bitmap=new BitmapClass(this.core);
        bitmap.initializeSimpleURL(colorURL);
        this.bitmaps.set(colorURL,bitmap);
        
        return(bitmap);
    }
    
    addGenerated(colorImage,normalImage,specularImage,specularFactor,glowImage,glowFrequency,glowMin,glowMax)
    {
        let bitmap;
        let colorURL;
                
            // generated bitmaps are always generated once
            // so they are guarenteed to be unique, we just need
            // fake colorURL for them
        
        colorURL='_generated_'+this.generatedUniqueId;
        this.generatedUniqueId++;
        
            // add bitmap to list, these will be loaded
            // in a later call
                    
        bitmap=new BitmapClass(this.core);
        bitmap.initializeGenerated(colorURL,colorImage,normalImage,specularImage,specularFactor,glowImage,glowFrequency,glowMin,glowMax);
        this.bitmaps.set(colorURL,bitmap);
        
        return(bitmap);
    }
    
    get(colorURL)
    {
        return(this.bitmaps.get(colorURL));
    }
    
        //
        // we can search out bitmaps by a "simple" name which removes
        // any extra URL gunk -- this is basically used for interface elements
        // or mass setting of meshes based on attached bitmaps
        //
    
    getSimpleName(name)
    {
        let key,value;
        
        for ([key,value] of this.bitmaps) {
            if (value.simpleName===name) return(value);
        }
        
        return(null);
    }
    
        //
        // loading
        //
        
    async loadAllBitmaps()
    {
        let loadBitmapList=this.core.map.json.bitmaps;
        let bitmapDef;
        let keyIter,rtn,bitmap;
        let success,promises;
        
            // we will already have bitmaps that
            // were added by importing glTF models,
            // so we only add the rest here
            
            /*
              game.json
                 "config":
        {
            "multiplayerMessageText":"multiplayer_message",
            "multiplayerMessageWaitTick":5000,
            "touchStickSize":128,
            "touchStickRingBitmap":"textures/stick_ring.png",
            "touchStickThumbBitmap":"textures/stick_thumb.png",
            "touchButtonSize":32,
            "touchMenuPosition":[5,5],
            "touchMenuBitmap":"textures/menu.png"
        },
    "interface":
            
            
            (all entities interface)
            
            "interface":
            {
                "elements":
                    [
                        {"id":"pistol_crosshair","bitmap":"textures/crosshair_dot.png","width":8,"height":8,"positionMode":"middle","positionOffset":{"x":-4,"y":-4},"color":{"r":1,"g":1,"b":1},"alpha":1,"show":true},
                        {"id":"pistol_bullet","bitmap":"textures/icon_beretta_bullet.png","width":25,"height":50,"positionMode":"bottomLeft","positionOffset":{"x":5,"y":-165},"color":{"r":1,"g":1,"b":1},"alpha":1,"show":true}
        
            effect.json
            
            "billboards": [multiple]
            [
                {
                    "bitmap":"textures/particle_hit.png","mode":"additive",


        "particles": [multiple]
            [
                {
                    "bitmap":"textures/particle_smoke.png","mode":"transparent","count":60,"motion":{"x":25000,"y":25000,"z":25000},"grid":"4","gridPeriod":600,"gridOffset":0,
                    "frames":


             */
        
        for (bitmapDef of loadBitmapList) {
            if (!this.bitmaps.has(bitmapDef.url)) {
                bitmap=new BitmapClass(this.core);
                if (bitmapDef.interface===true) {       // need to work around being undefined here
                    bitmap.initializeInterfaceURL(bitmapDef.url);
                }
                else {
                    bitmap.initializeSimpleURL(bitmapDef.url);
                }
                
                this.bitmaps.set(bitmapDef.url,bitmap);
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
