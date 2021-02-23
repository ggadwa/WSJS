export default class RectClass
{
    constructor(lft,top,rgt,bot)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
        
        Object.seal(this);
    }
    
    setFromValues(lft,top,rgt,bot)
    {
        this.lft=lft;
        this.top=top;
        this.rgt=rgt;
        this.bot=bot;
    }
    
    isSquare()
    {
        return((this.rgt-this.lft)===(this.bot-this.top));
    }
    
    isXLarger()
    {
        return((this.rgt-this.lft)>(this.bot-this.top));
    }
    
    overlap(rect)
    {
        if (this.lft>=rect.rgt) return(false);
        if (this.rgt<=rect.lft) return(false);
        if (this.top>=rect.bot) return(false);
        return(!(this.bot<=rect.top));
    }
    
    pointIn(x,y)
    {
        return((x>=this.lft) && (x<this.rgt) && (y>=this.top) && (y<this.bot));     
    }
    
    move(x,y)
    {
        this.lft+=x;
        this.rgt+=x;
        this.top+=y;
        this.bot+=y;
    }
                
    copy()
    {
        return(new RectClass(this.lft,this.top,this.rgt,this.bot));
    }
}
