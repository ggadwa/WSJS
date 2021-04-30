import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';

export default class DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y,title)
    {
        this.core=core;
        this.dialog=dialog;
        this.tabId=tabId;
        this.x=x;
        this.y=y;
        this.title=title;
        
        this.value=null;
        
        this.TITLE_MARGIN=5;
        this.TEXT_INPUT_WIDTH=300;
        this.CONTROL_HEIGHT=30;
        this.HEIGHT_MARGIN=5;
        this.FONT_MARGIN=4;
        
        this.widgetTopColor=new ColorClass(0.7,0.7,1.0);
        this.widgetBottomColor=new ColorClass(0.5,0.5,1.0);
        this.widgetTopHighlightColor=new ColorClass(0.9,0.75,1.0);
        this.widgetBottomHighlightColor=new ColorClass(0.8,0.55,1.0);
        this.widgetOutlineColor=new ColorClass(0.0,0.0,0.6);
        this.disableColor=new ColorClass(0.6,0.6,0.7);
        this.fillColor=new ColorClass(0.9,0.9,0.9);
        this.outlineColor=new ColorClass(0.6,0.6,1.0);
        this.highlightOutlineColor=new ColorClass(0.8,0.0,1.0);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        return(0);      // this initialize returns height of control
    }
    
    release()
    {
    }
        
        //
        // clicking
        //
        
    clickDown()
    {
    }
    
    clickUp()
    {
        return(false);
    }
    
        //
        // drawing
        //
        
    draw()
    {
    }
}
