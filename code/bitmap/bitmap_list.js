import BitmapClass from '../../code/bitmap/bitmap.js';

//
// view bitmap list class
//

export default class BitmapListClass
{
    constructor(view)
    {
        this.view=view;
        
        this.BITMAP_LOAD_WAIT_TIMEOUT=100;

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
        
    add(name,colorOnly)
    {
        let bitmap;
            
            // already in list?
            
        if (this.bitmaps.has(name)) return;
        
            // add new one to list, will be loaded
            // by another call that force loads unloaded
            // bitmaps
                    
        bitmap=new BitmapClass(this.view,name,colorOnly);
        bitmap.initialize();
        this.bitmaps.set(name,bitmap);
    }

    get(name)
    {
        return(this.bitmaps.get(name));
    }
    
        //
        // loading
        //
        
        
    loadTexturesProcess(keyIter,callback)
    {
        let rtn,bitmap;
        
            // get next key
            
        rtn=keyIter.next();
        if (rtn.done) {
            callback();
            return;
        }
        
        bitmap=this.bitmaps.get(rtn.value);
        if (bitmap.loaded) {
            loadTexturesProcess(keyIter,callback);
            return;
        }
        
        bitmap.initialize(this.loadTexturesProcess.bind(this,keyIter,callback));
    }
    
    loadAllBitmaps(callback)
    {
        let keyIter,rtn,bitmap;
        
            // start all the unloaded bitmaps
            // loading
            
        keyIter=this.bitmaps.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            bitmap=this.bitmaps.get(rtn.value);
            if (bitmap.loadState===bitmap.LOAD_STATE_UNLOADED) bitmap.load();
        }
        
            // now wait for a completion
            
        setTimeout(this.loadAllBitmapsWaitForCompletition.bind(this,callback),this.BITMAP_LOAD_WAIT_TIMEOUT); 
    }
    
    loadAllBitmapsWaitForCompletition(callback)
    {
        let keyIter,rtn,bitmap;
        
            // is everybody loaded?  If so time
            // to continue on with callback
            // if any errors, halt the code
            
        keyIter=this.bitmaps.keys();
        
        while (true) {
            rtn=keyIter.next();
            if (rtn.done) break;
            
            bitmap=this.bitmaps.get(rtn.value);
            if (bitmap.loadState===bitmap.LOAD_STATE_UNLOADED) {
                setTimeout(this.loadAllBitmapsWaitForCompletition.bind(this,callback),this.BITMAP_LOAD_WAIT_TIMEOUT); 
                return;
            }
            
            if (bitmap.loadState===bitmap.LOAD_STATE_ERROR) return;
        }
        
            // continue on with whatever called this
            
        callback();
    }
    
}
