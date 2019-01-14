export default class ProjectEffectClass
{
    constructor(view,map,position)
    {
        this.view=view;
        this.map=map;
        this.position=position;
    }
    
    initialize()
    {
        return(true);
    }
    
    release()
    {
    }
    
    addBitmap(name)
    {
        this.view.bitmapList.add(name,true);
    }
    
    getBitmap(name)
    {
        return(this.view.bitmapList.get(name));
    }
    
        //
        // override this if the effect needs to add
        // a light to the current frame
        //
        
    addFrameLight()
    {
    }
    
        //
        // override this to draw the effect into
        // the frame
        //
        
    frameDraw()
    {
    }
}
