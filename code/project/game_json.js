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
        // json caches and utilities
        //
        
    getCachedJson(name)
    {
        let json;
        
        json=this.jsonCache.get(name);
        if (json===undefined) {
            console.log('Unknown json: '+name);
            return(null);
        }
        
        return(json);
    }
    
    lookupValue(value,data)
    {
        if (value===null) return(value);
        if (typeof(value)!=='string') return(value);
        if (value.length<2) return(value);
        if (value.charAt(0)!=='@') return(value);
        
        return(data[value.substring(1)]);
    }

        //
        // run the game
        //
        
    async initialize()
    {
        let data;
        let jsonName;
        
        data=null;
        
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
           
        this.json=data;
        
            // now run through and cache all
            // the custom json for the project
            
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
        
            // interface
            
        if (!this.core.interface.addFromJson(this.json.interface)) return(false);
        
        return(true);
    }

    run()
    {
    }
}
