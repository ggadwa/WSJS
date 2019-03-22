export default class ProjectGameClass
{
    constructor(core)
    {
        this.core=core;
    }
    
    initialize()
    {
    }
    
        //
        // call this to add a bitmap
        //
        
    addBitmap(url)
    {
        this.core.bitmapList.add(url,null,null,null,null);
    }
    
        //
        // call this to add an interface element to the interface,
        // use must have previously used addInterfaceBitmap to add
        // the bitmap
        //
        
    addInterfaceElement(id,bitmapName,uvOffset,uvSize,rect,color,alpha)
    {
        let bitmap=this.core.bitmapList.getSimpleName(bitmapName);
        if (bitmap===null) {
            console.log('Missing bitmap to add to interface: '+bitmapName);
            return;
        }
                    
        this.core.interface.addElement(id,bitmap,uvOffset,uvSize,rect,color,alpha);
    }
    
    addInterfaceText(id,text,x,y,fontSize,align,color,alpha)
    {
        this.core.interface.addText(id,text,x,y,fontSize,align,color,alpha);
    }
    
    updateInterfaceText(id,str)
    {
        this.core.interface.updateText(id,str);
    }
    
    getInterfaceWidth()
    {
        return(this.core.wid);
    }
    
    getInterfaceHeight()
    {
        return(this.core.high);
    }
        
        //
        // override this to get initial startup project map for game
        // this returns a ProjectMapClass
        //
        
    getStartProjectMap()
    {
    }
    
        //
        // run entity
        // called during physics loops as entity is run
        //
        
    run()
    {
    }
}
