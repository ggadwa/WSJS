export default class ProjectGameClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
    }
    
    initialize()
    {
    }
    
        //
        // override this to set the name of this game
        // this is needed so local storage saves can have
        // different names
        //
        
    getName()
    {
        return('unknown');
    }
    
        //
        // general info
        //
        
    getSetup()
    {
        return(this.core.setup);
    }
    
    getCamera()
    {
        return(this.core.camera);
    }
    
        //
        // create maps
        //
        
    createMap(mapClass)
    {
        return(new mapClass(this.core));
    }
    
        //
        // call this to add a bitmap
        //
        
    addBitmap(url)
    {
        this.core.bitmapList.add(url,null,null,null,null,0);
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
    
    pulseInterfaceElement(id,tick,expand)
    {
        this.core.interface.pulseElement(id,tick,expand);
    }
    
    addInterfaceText(id,text,x,y,fontSize,align,color,alpha)
    {
        this.core.interface.addText(id,text,x,y,fontSize,align,color,alpha);
    }
    
    removeInterfaceText(id)
    {
        this.core.interface.removeText(id);
    }
    
    showInterfaceText(id,show)
    {
        this.core.interface.showText(id,show);
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
        // some configuration APIs
        //
        
    setSoundVolume(volume)
    {
        this.core.soundList.soundVolume=volume;
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
