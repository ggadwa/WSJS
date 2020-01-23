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
    
    /*
     * Override this to set the name of this game
     * This is needed so local storage saves can have
     * different names
     * 
     * @returns {String} Name of game
     */
    getName()
    {
        return('unknown');
    }
    
    /**
     * Override this and return a entity class that will
     * run any game bots
     * 
     * @returns {Class} ProjectEntityClass for bots 
     */
    getBotClass()
    {
        return(null);
    }
    
    /**
     * Override this to return a different name for each
     * indexed bot.  Default just returns 'bot '+idx.
     * 
     * @returns {String} Name for a bot at idx index
     */
    getBotName(idx)
    {
        return('bot '+idx);
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
    
    isMultiplayer()
    {
        return(this.core.isMultiplayer);
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
        this.core.bitmapList.addSimple(url);
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
    
    showInterfaceElement(id,show)
    {
        this.core.interface.showElement(id,show);
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
    
    updateInterfaceTemporaryText(id,str,tick)
    {
        this.core.interface.updateTemporaryText(id,str,tick);
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
