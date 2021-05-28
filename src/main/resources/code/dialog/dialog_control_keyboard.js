import ColorClass from '../utility/color.js';
import TextClass from '../main/text.js';
import DialogControlBaseClass from '../dialog/dialog_control_base.js';

export default class DialogControlKeyboardClass extends DialogControlBaseClass
{
    constructor(core,dialog,tabId,x,y,title)
    {
        super(core,dialog,tabId,x,y,title);
        
        this.CHARACTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890 ._-/  <';
        
        this.fontSize=0;
        this.width=0;
        this.height=0;
        
        this.keyText=null;
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
    
    initialize()
    {
        this.fontSize=Math.trunc(this.CONTROL_HEIGHT*0.9);
        this.width=this.fontSize*10;
        this.height=this.fontSize*7;
        
        this.keyText=new TextClass(this.core,'',0,0,this.fontSize,this.core.TEXT_ALIGN_CENTER,this.widgetTopColor,1);
        this.keyText.initialize();
        
        return(this.height);
    }
    
    release()
    {
        this.keyText.release();
    }
    
    clicked()
    {
        let keyIdx=this.keyIndexIn();
        this.value=(keyIdx===-1)?'':this.CHARACTERS.charAt(keyIdx);
        return(true);
    }
    
    cursorIn()
    {
        return((this.core.cursor.x>=this.x) && (this.core.cursor.x<((this.x+this.width)+this.TEXT_INPUT_WIDTH)) && (this.core.cursor.y>this.y) && (this.core.cursor.y<(this.y+this.height)));
    }
    
    keyIndexIn()
    {
        let x,y;
               
        x=Math.trunc((this.core.cursor.x-this.x)/this.fontSize);
        y=Math.trunc((this.core.cursor.y-this.y)/this.fontSize);
        if ((x<0) || (x>=10) || (y<0) || (y>=7)) return(-1);
        
        return((y*10)+x);
    }
        
    draw(highlight)
    {
        let n;
        let keyIdx=this.keyIndexIn();
        
        this.core.shaderList.textShader.drawStart();
        
        this.keyText.x=this.x+Math.trunc(this.fontSize*0.5);
        this.keyText.y=this.y+this.fontSize;
        
        for (n=0;n!=this.CHARACTERS.length;n++) {
            
                // highlight
                
            if ((n===keyIdx) && (highlight)) {
                this.keyText.color=this.highlightOutlineColor;
            }
            else {
                this.keyText.color=this.widgetTopColor;
            }
            
                // the key
                
            this.keyText.str=this.CHARACTERS.charAt(n);
            this.keyText.draw();
            
                // next position
                
            if (((n+1)%10)===0) {
                this.keyText.x=this.x+Math.trunc(this.fontSize*0.5);
                this.keyText.y+=this.fontSize;
            }
            else {
                this.keyText.x+=this.fontSize;
            }
        }
        
        this.core.shaderList.textShader.drawEnd();
    }
}
