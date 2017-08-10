import wsBound from '../../code/utility/bound.js';

export default class wsCollisionRect
{
    constructor(lft,top,rgt,bot,y)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
        this.y=y;
        
        Object.seal(this);
    }
    
    addPoint(pnt)
    {
        this.lft+=pnt.x;
        this.rgt+=pnt.x;
        this.top+=pnt.z;
        this.bot+=pnt.z;
        this.y+=pnt.y;
    }
    
    equals(cRect)
    {
        if (this.lft!==cRect.lft) return(false);
        if (this.top!==cRect.top) return(false);
        if (this.rgt!==cRect.rgt) return(false);
        if (this.bot!==cRect.bot) return(false);
        return(this.y===cRect.y);
    }
    
    overlapBounds(xBound,yBound,zBound)
    {
        if (this.y<yBound.min) return(false);
        if (this.y>yBound.max) return(false);
        if (this.lft>=xBound.max) return(false);
        if (this.rgt<=xBound.min) return(false);
        if (this.top>=zBound.max) return(false);
        return(!(this.bot<=zBound.min));
    }
}
