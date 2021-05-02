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
        
        this.rect=new RectClass(0,0,0,0);
        
        this.currentSelectIndex=-1;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    async initialize()
    {
        let n,x,y,high,margin,align,itemCount,text;
        let textSize=this.core.project.menuFontSize;
        
        itemCount=this.items.length;
        margin=Math.trunc(textSize*0.1)
        high=textSize+margin;
        
            // the alignment
            
        switch (this.core.project.menuAlignX) {
            case this.core.MENU_X_ALIGN_LEFT:
                x=margin;
                align=this.core.TEXT_ALIGN_LEFT;
                break;
            case this.core.MENU_X_ALIGN_CENTER:
                x=Math.trunc(this.core.canvas.width*0.5);
                align=this.core.TEXT_ALIGN_CENTER;
                break;
            case this.core.MENU_X_ALIGN_RIGHT:
                x=this.core.canvas.width-margin;
                align=this.core.TEXT_ALIGN_RIGHT;
                break;
        }
        
        switch (this.core.project.menuAlignY) {
            case this.core.MENU_Y_ALIGN_TOP:
                y=high+margin;
                break;
            case this.core.MENU_Y_ALIGN_CENTER:
                y=(Math.trunc(this.core.canvas.height*0.5)-Math.trunc((high*itemCount)*0.5))+textSize;
                break;
            case this.core.MENU_Y_ALIGN_BOTTOM:
                y=this.core.canvas.height-((high*(itemCount-1))+margin);
                break;
        }
        
            // the items
        
        for (n=0;n!==itemCount;n++) {    
            text=new TextClass(this.core,this.items[n][1],x,y,textSize,align,this.core.project.menuColor,1,false);
            text.initialize();
            this.texts.push(text);
            
            this.ids.push(this.items[n][0]);
            
            y+=high;
        }
        
        this.currentSelectIndex=-1;
        
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
        let n,text,selectIdx;
            
            // draw the list
            
        this.core.shaderList.textShader.drawStart();
        
        selectIdx=-1;
        
        for (n=0;n!==this.texts.length;n++) {
            text=this.texts[n];
            
            if (this.cursorInItemForIndex(n)) {
                text.fontSize=this.core.project.menuFontSizeHighlight;
                text.color=this.core.project.menuColorHighlight;
                selectIdx=n;
            }
            else {
                text.fontSize=this.core.project.menuFontSize;
                text.color=this.core.project.menuColor;
            }
            
            text.draw();
        }
        
        this.core.shaderList.textShader.drawEnd();
        
            // noise is select changes
            
        if (selectIdx!==-1) {
            if (selectIdx!==this.currentSelectIndex) {
                this.core.audio.soundStartUI(this.core.title.selectSound);
            }
        }
        
        this.currentSelectIndex=selectIdx;
    }
    
}
