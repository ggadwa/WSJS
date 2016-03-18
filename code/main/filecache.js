"use strict";

// these functions are used so we can asyc load up the files
// we need without breaking the initialization process up

// the files to cache


class FileClass
{
    constructor(name,data)
    {
        this.name=name;
        this.data=data;
        
        Object.seal(this);
    }
}

class FileCacheClass
{
    constructor()
    {
        this.files=[];
        
            // all the files we need to load for this
            // engine, all fragment and vertex shaders
            
        this.fileNames=[
                'shaders/debug.frag',
                'shaders/debug.vert',
                'shaders/interface.frag',
                'shaders/interface.vert',
                'shaders/map.frag',
                'shaders/map.vert',
                'shaders/map_overlay.frag',
                'shaders/map_overlay.vert',
                'shaders/model.frag',
                'shaders/model.vert',
                'shaders/particle.frag',
                'shaders/particle.vert',
                'shaders/text.frag',
                'shaders/text.vert'
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
            // ajax the file

        var req=new XMLHttpRequest();

        req.open('GET',this.fileNames[idx],true);
        req.overrideMimeType('text/plain');

        var self=this;
        
        req.onreadystatechange=function() {
            if (req.readyState!==4) return;
            var res=req.responseText;
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

        this.files.push(new FileClass(this.fileNames[idx],data));

            // finished?

        idx++;
        if (idx===this.fileNames.length) {
            callback();
            return;
        }

            // next file

        setTimeout(this.loadFile.bind(this,idx,callback),PROCESS_TIMEOUT_MSEC);
    }

        //
        // get files from cache
        //
        
    getFile(name)
    {
        var n;
        var nFile=this.files.length;

        for (n=0;n!==nFile;n++) {
            if (this.files[n].name===name) return(this.files[n].data);
        }

        return(null);
    }
}
