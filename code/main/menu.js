import ColorClass from '../utility/color.js';
import RectClass from '../utility/rect.js';
import TextClass from '../main/text.js';

export default class MenuClass
{
    constructor(core,items)
    {
        this.core=core;
        this.items=items;

        this.texts=[];
        this.ids=[];
        
        this.color=new ColorClass(this.core.json.title.menu.color.r,this.core.json.title.menu.color.g,this.core.json.title.menu.color.b);
        this.highlightColor=new ColorClass(this.core.json.title.menu.highlightColor.r,this.core.json.title.menu.highlightColor.g,this.core.json.title.menu.highlightColor.b);
        
        this.alignX=0;
        if (this.core.json.title.menu.alignX==='left') this.alignX=-1;
        if (this.core.json.title.menu.alignX==='right') this.alignX=1;
        this.alignY=0;
        if (this.core.json.title.menu.alignY==='top') this.alignY=-1;
        if (this.core.json.title.menu.alignY==='bottom') this.alignY=1;
        
        this.rect=new RectClass(0,0,0,0);
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let n,x,y,high,margin,align,itemCount,text;
        let textSize=this.core.json.title.menu.textSize;
        
        itemCount=this.items.length;
        margin=Math.trunc(textSize*0.1)
        high=textSize+margin;
        
            // the alignment
            
        switch (this.alignX) {
            case -1:
                x=margin;
                align=this.core.TEXT_ALIGN_LEFT;
                break;
            case 0:
                x=Math.trunc(this.core.canvas.width*0.5);
                align=this.core.TEXT_ALIGN_CENTER;
                break;
            case 1:
                x=this.core.canvas.width-margin;
                align=this.core.TEXT_ALIGN_RIGHT;
                break;
        }
        
        switch (this.alignY) {
            case -1:
                y=high+margin;
                break;
            case 0:
                y=(Math.trunc(this.core.canvas.height*0.5)-Math.trunc((high*itemCount)*0.5))+textSize;
                break;
            case 1:
                y=this.core.canvas.height-((high*(itemCount-1))+margin);
                break;
        }
        
            // the items
        
        for (n=0;n!==itemCount;n++) {    
            text=new TextClass(this.core,this.items[n][1],x,y,textSize,align,this.color,1,false);
            text.initialize();
            this.texts.push(text);
            
            this.ids.push(this.items[n][0]);
            
            y+=high;
        }
        
        return(true);
    }
    
    release()
    {
        let n;

        for (n=0;n!==this.texts.length;n++) {
            this.texts[n].release();
        }
    }
    
        //
        // running
        //
            
    cursorInItemForIndex(idx)
    {
        let text;
        
        text=this.texts[idx];
        text.getStringDrawBox(this.rect);
        return(this.rect.pointIn(this.core.cursor.x,this.core.cursor.y));
    }
    
    cursorInItem(itemId)
    {
        let n;
        
        for (n=0;n!==this.texts.length;n++) {
            if (this.ids[n]===itemId) return(this.cursorInItemForIndex(n));
        }
        
        return(false);
    }
    
        //
        // drawing
        //
        
    draw()
    {
        let n,text;
        let textSize=this.core.json.title.menu.textSize;
        let highlightTextSize=this.core.json.title.menu.highlightTextSize;
            
        this.core.shaderList.textShader.drawStart();
        
        for (n=0;n!==this.texts.length;n++) {
            text=this.texts[n];
            
            if (this.cursorInItemForIndex(n)) {
                text.fontSize=highlightTextSize;
                text.color=this.highlightColor;
            }
            else {
                text.fontSize=textSize;
                text.color=this.color;
            }
            
            text.draw();
        }
        
        this.core.shaderList.textShader.drawEnd();
    }
    
}
