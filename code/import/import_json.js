export default class ImportJSONClass
{
    constructor(view,importSettings)
    {
        this.view=view;
        this.importSettings=importSettings;
        
            // fix any missing import settings
            
        if (this.importSettings.name===undefined) throw('importSettings.name is required');
    }
    
        //
        // async JSON loader
        //
        
    async import()
    {
        let resp;
        let url='./data/json/'+this.importSettings.name+'.json';
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.json());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
    
}
