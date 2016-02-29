"use strict";

//
// bitmap list class
//

function BitmapListObject(view)
{
    this.view=view;
    this.bitmaps=null;
    
    this.initialize=function()
    {
        this.bitmaps=[];
        
        return(true);
    };
    
    this.release=function()
    {
        var n;
        var nBitmap=this.bitmaps.length;
        
        for (n=0;n!==nBitmap;n++) {
            this.bitmaps[n].close();
        }

        this.bitmaps=[];
    };
    
    this.add=function(bitmap)
    {
        this.bitmaps.push(bitmap);
    };
    
    this.get=function(name)
    {
        var n;
        var nBitmap=this.bitmaps.length;
        
        for (n=0;n!==nBitmap;n++) {
            if (this.bitmaps[n].name===name) return(this.bitmaps[n]);
        }
        
        return(null);
    };
    

}
