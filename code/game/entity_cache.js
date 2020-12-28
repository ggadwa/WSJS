export default class EntityCacheClass
{
    constructor(core)
    {
        this.core=core;
        
        this.jsons=new Map();
    }
    
        //
        // initialize and release
        //
        
    async initialize()
    {
        let name,json;
        let resp,url;
        
            // cache all items used for entities
            
        for (name of this.core.json.entities) {
            
                // load the json

            url='../entities/'+name+'.json';
        
            try {
                resp=await fetch(url);
                if (!resp.ok) {
                    console.log(`Unable to load ${url}: ${resp.statusText}`);
                    return(false);
                }
                json=await resp.json();
            }
            catch (e) {
                console.log(`Unable to load ${url}: ${e.message}`);
            }
            
                // add to cache
                
            this.jsons.set(name,json);
        }
        
        return(true);
    }
    
    release()
    {
        this.jsons.clear();
    }
    
        //
        // get from caches
        //
        
    getJson(name)
    {
        return(this.jsons.get(name));
    }
    
}
