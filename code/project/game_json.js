import ColorClass from '../utility/color.js';

export default class GameJsonClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.json=null;
        this.jsonCache=new Map();
    }
    
    async fetchJsonAsText(name)
    {
        let resp;
        let url='../json/'+name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.text());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
    parseJsonWithData(name,jsonText,data)
    {
        let json,v2;
        
            // run a reviver to swap any @data.xyz
         
        try {
            json=JSON.parse(jsonText,
                (key,value) =>
                    {
                        if ((typeof(value)==='string')) {
                            if (value.startsWith('@data.')) {
                                v2=data[value.substring(6)];
                                if (v2===undefined) throw('Missing data lookup in json key '+key+', value: '+value);
                                return(v2);
                            }
                        }
                        return(value);
                    }
                );
        }
        catch (e) {
            console.log('Error in json '+name+': '+e);
            return(false);
        }
        
        return(json);
    }
    
    getCachedJson(name,data)
    {
        let jsonText;
        
        jsonText=this.jsonCache.get(name);
        if (jsonText===undefined) {
            console.log('Unknown json: '+name);
            return(false);
        }
        
        return(this.parseJsonWithData(name,jsonText,data));
    }

    async initialize()
    {
        let jsonText;
        let jsonName;
        
        jsonText=null;
        
            // get the main game json
            // this is the only hard coded json file
        
        await this.fetchJsonAsText('game')
            .then
                (
                    value=>{
                        jsonText=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
        if (jsonText===null) return(false);
        
            // translate to json to catch @data.
            
        this.json=this.parseJsonWithData('game',jsonText,this.data);
        
            // now run through and cache all
            // the custom json that runs the project
            // we don't parse these as we can't handle
            // the @data into it's in use
            
        for (jsonName of this.json.jsons) {
            jsonText=null;
            
            await this.fetchJsonAsText(jsonName)
            .then
                (
                    value=>{
                        jsonText=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
            if (jsonText===null) return(false);
            
            this.jsonCache.set(jsonName,jsonText);
        }
            
        return(true);
    }
    
    release()
    {
    }

    ready()
    {
        let camera;
        let element,text;
        let bitmap,positionMode,align;
        
            // setup camera
            
        camera=this.core.camera;

        switch (camera.CAMERA_MODE_LIST.indexOf(this.json.camera.mode)) {
            case camera.CAMERA_MODE_FIRST_PERSON:
                camera.gotoFirstPerson();
                break;
            case camera.CAMERA_MODE_THIRD_PERSON_BEHIND:
                camera.gotoThirdPersonBehind(this.json.camera.thirdPersonDistance,this.json.camera.thirdPersonLookDegree);
                break;
        }

        camera.setViewDistance(this.json.camera.viewNearZ,this.json.camera.viewFarZ);
        
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
                this.core.interface.showElement(element.id,element.show);
            }
        }
        
        if (this.json.interface.texts!==undefined) {
            for (text of this.json.interface.texts) {
                align=this.core.interface.TEXT_ALIGN_LIST.indexOf(text.textAlign);
                positionMode=this.core.interface.POSITION_MODE_LIST.indexOf(text.positionMode);
                this.core.interface.addText(text.id,text.text,positionMode,text.positionOffset,text.textSize,align,new ColorClass(text.color.r,text.color.g,text.color.b),text.alpha);
                this.core.interface.showText(text.id,text.show);
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
