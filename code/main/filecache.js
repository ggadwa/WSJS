// these functions are used so we can asyc load up the files
// we need without breaking the initialization process up

export default class FileCacheClass
{
    constructor()
    {
        this.files=new Map();
        
            // all the files we need to load for this
            // engine, all fragment and vertex shaders
            
        this.fileNames=[
                'shaders/debug.frag',
                'shaders/debug.vert',
                'shaders/interface.frag',
                'shaders/interface.vert',
                'shaders/map_mesh.frag',
                'shaders/map_mesh.vert',
                'shaders/map_liquid.frag',
                'shaders/map_liquid.vert',
                'shaders/map_overlay.frag',
                'shaders/map_overlay.vert',
                'shaders/model_mesh.frag',
                'shaders/model_mesh.vert',
                'shaders/particle.frag',
                'shaders/particle.vert',
                'shaders/text.frag',
                'shaders/text.vert',
                'shaders/sky.frag',
                'shaders/sky.vert'
        ];
        
        Object.seal(this);
    }

        //
        // load the files
        //
        
    fillCache(callback)
    {
        this.loadFile(0,callback);
    }
    
    loadFile(idx,callback)
    {
        let req,res,self;
        
            // ajax the file

        req=new XMLHttpRequest();

        req.open('GET',this.fileNames[idx],true);
        req.overrideMimeType('text/plain');

        self=this;
        
        req.onreadystatechange=function() {
            if (req.readyState!==4) return;
            res=req.responseText;
            if (res!==null) {
                if (res.length===0) res=null;
            }
            if (res===null) {
                alert('Missing File: '+self.fileNames[idx]);
                return;
            }

            self.finishLoad(idx,callback,res);
        };

        req.send(null);
    }
    
    finishLoad(idx,callback,data)
    {
            // put file in cache

        this.files.set(this.fileNames[idx],data);

            // finished?

        idx++;
        if (idx===this.fileNames.length) {
            callback();
            return;
        }

            // next file

        setTimeout(this.loadFile.bind(this,idx,callback),1);
    }

        //
        // get files from cache
        //
        
    getFile(name)
    {
        return(this.files.get(name));
    }
}
