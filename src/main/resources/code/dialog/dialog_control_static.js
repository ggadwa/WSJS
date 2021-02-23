import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlClass extends DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y)
    {
        super(core,dialog,tabId,x,y,'');
        
        this.valueText=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        let fontSize;
        
            // the title text
            
        fontSize=Math.trunc(this.CONTROL_HEIGHT*0.6);
        
        this.valueText=new TextClass(this.core,this.title,this.x,((this.y+this.CONTROL_HEIGHT)-this.FONT_MARGIN),fontSize,this.core.TEXT_ALIGN_CENTER,new ColorClass(1,1,1,1),1);
        this.valueText.initialize();
        
        return(this.CONTROL_HEIGHT);
    }
    
    release()
    {
        this.valueText.release();
    }
        
    click()
    {
        return(false);
    }
        
    draw()
    {
        this.valueText.str=this.value;
        
        this.core.shaderList.textShader.drawStart();
        this.valueText.draw();
        this.core.shaderList.textShader.drawEnd();
    }
}
