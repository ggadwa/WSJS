//
// bitmap list class
//

class BitmapList
{
    constructor(view)
    {
        this.view=view;
        this.bitmaps=null;
    }
    
        //
        // initialize or release bitmap list
        //
        
    initialize()
    {
        this.bitmaps=[];
        
        return(true);
    }
    
    release()
    {
        var n;
        var nBitmap=this.bitmaps.length;
        
        for (n=0;n!==nBitmap;n++) {
            this.bitmaps[n].close();
        }

        this.bitmaps=[];
    }
    
        //
        // add or get a bitmap
        //
        
    addBitmap(bitmap)
    {
        this.bitmaps.push(bitmap);
    }
    
    getBitmap(name)
    {
        var n;
        var nBitmap=this.bitmaps.length;
        
        for (n=0;n!==nBitmap;n++) {
            if (this.bitmaps[n].name===name) return(this.bitmaps[n]);
        }
        
        return(null);
    }

}
