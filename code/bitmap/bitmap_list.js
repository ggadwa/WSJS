import ColorClass from '../utility/color.js';
import BitmapClass from '../bitmap/bitmap.js';

//
// view bitmap list class
//

export default class BitmapListClass
{
    constructor(view)
    {
        this.view=view;
        
        this.bitmaps=new Map();

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
        
            // add new one to list, will be loaded
            // by another call that force loads unloaded
            // bitmaps
                    
        bitmap=new BitmapClass(this.view,colorURL,normalURL,specularURL,specularFactor,scale);
        bitmap.initialize();
        this.bitmaps.set(colorURL,bitmap);
        
        return(bitmap);
    }
    
    get(colorURL)
    {
        return(this.bitmaps.get(colorURL));
    }
    
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
        let keyIter,rtn,bitmap;
        let success,promises=[];
        
            // gather all the promises
            
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
