import ColorClass from '../utility/color.js';

export default class GameJsonClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.json=null;
    }
    
    async loadJson()
    {
        let resp;
        let url='../json/game.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }

    async initialize()
    {
        this.json=null;
        
        await this.loadJson()
            .then
                (
                    value=>{
                        this.json=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );

        return(this.json!==null);
    }
    
    release()
    {
    }

    ready()
    {
        let element,text;
        let bitmap,positionMode,align;
        
            // developer mode adds these items
            
        if (this.json.developer) {
            this.core.interface.addText('fps','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":23},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('meshCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":46},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('trigCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":69},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('modelCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":92},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
            this.core.interface.addText('effectCount','',this.core.interface.POSITION_MODE_TOP_RIGHT,{"x":-5,"y":115},20,this.core.interface.TEXT_ALIGN_RIGHT,new ColorClass(1,1,0),1);
        }
        
            // custom project interface
        
        if (this.json.interface===undefined) return;
        
        if (this.json.interface.elements!==undefined) {
            for (element of this.json.interface.elements) {
                
                    // the element bitmap
                    
                bitmap=this.core.bitmapList.get(element.bitmap);
                if (bitmap===undefined) {
                    console.log('Missing bitmap to add to interface: '+element.bitmap);
                    return(false);
                }
                
                positionMode=this.core.interface.POSITION_MODE_LIST.indexOf(element.positionMode);

                this.core.interface.addElement(element.id,bitmap,element.width,element.height,positionMode,element.positionOffset,new ColorClass(element.color.r,element.color.g,element.color.b),element.alpha);
            }
        }
        
        if (this.json.interface.texts!==undefined) {
            for (text of this.json.interface.texts) {
                align=this.core.interface.TEXT_ALIGN_LIST.indexOf(text.textAlign);
                positionMode=this.core.interface.POSITION_MODE_LIST.indexOf(text.positionMode);
                this.core.interface.addText(text.id,text.text,positionMode,text.positionOffset,text.textSize,align,new ColorClass(text.color.r,text.color.g,text.color.b),text.alpha);
            }
        }
        
        return(true);
    }

    run()
    {
        let idx;
        let fpsStr=this.core.fps.toString();
        
        idx=fpsStr.indexOf('.');
        if (idx===-1) {
            fpsStr+='.0';
        }
        else {
            fpsStr=fpsStr.substring(0,(idx+3));
        }
        
        this.core.interface.updateText('fps',fpsStr);
        this.core.interface.updateText('meshCount',('mesh:'+this.core.drawMeshCount));
        this.core.interface.updateText('trigCount',('trig:'+this.core.drawTrigCount));
        this.core.interface.updateText('modelCount',('model:'+this.core.drawModelCount));
        this.core.interface.updateText('effectCount',('effect:'+this.core.drawEffectCount));
    }
}
