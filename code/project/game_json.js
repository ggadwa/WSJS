import ColorClass from '../utility/color.js';
import CalcClass from '../project/calc.js';

export default class GameJsonClass
{
    constructor(core,data)
    {
        this.core=core;
        this.data=data;
        
        this.json=null;
        this.jsonCache=new Map();
    }
    
        //
        // load json from network
        //
        
    async fetchJson(name)
    {
        let resp;
        let url='../json/'+name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
        //
        // compile calcs
        //
    
    compile(jsonName,obj)
    {
        let prop,value,calc;
        
        if (obj===undefined) return(true);
        
        for (prop in obj) {
            value=obj[prop];
            
                // if object (which includes arrays) then go deeper
                
            if (typeof(value)==='object') {
                this.compile(jsonName,value);
                continue;
            }
            
                // otherwise look for a string prop that starts with calc(
                
            if (typeof(value)!=='string') continue;
            
            value=value.trim();
            if (!value.startsWith('calc(')) continue;
            if (!value.endsWith(')')) {
                console.log('Syntax error in calc, mismatched () in: '+jsonName);
                return(false);
            }
            
            calc=new CalcClass(this.core,jsonName,value.substring(5,(value.length-1)));
            if (!calc.compile()) return(false);
            
            obj[prop]=calc;
        }
        
        return(true);
    }
 
        //
        // json caches and utilities
        //
        
    getCachedJson(name,data)
    {
        let json;
        
        json=this.jsonCache.get(name);
        if (json===undefined) {
            console.log('Unknown json: '+name);
            return(null);
        }
        
        return(json);
    }
    
    calculateValue(value,variables,data,currentMessageContent)
    {
        if (typeof(value)!=='object') return(value);            // if not an object of CalcClass, then it's a regular constant
        if (value.constructor.name!=='CalcClass') return(value);
        return(value.run(variables,data,currentMessageContent));          // otherwise run the calc
    }

        //
        // run the game
        //
        
    async initialize()
    {
        let data;
        let jsonName;
        
        data=null;
        
        /* testing
        let calc=new CalcClass(this.core,jsonName,"1.0+(@rnd*0.4)");
        calc.compile();
        calc.displayTree();
         */
        
            // get the main game json
            // this is the only hard coded json file
        
        await this.fetchJson('game')
            .then
                (
                    value=>{
                        data=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
        if (data===null) return(false);
        
            // compile
           
        this.json=data;
        
        if (!this.compile('game',this.json)) return(false);
        
            // now run through and cache all
            // the custom json that runs the project
            // we don't parse these as we can't handle
            // the @data into it's in use
            
        for (jsonName of this.json.jsons) {
            data=null;
            
            await this.fetchJson(jsonName)
            .then
                (
                    value=>{
                        data=value;
                    },
                    value=>{
                        console.log(value);
                    }
                );
        
            if (data===null) return(false);
            
            if (!this.compile(jsonName,data)) return(false);
            
            this.jsonCache.set(jsonName,data);
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
