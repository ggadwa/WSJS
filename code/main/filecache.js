"use strict";

// these functions are used so we can asyc load up the files
// we need without breaking the initialization process up

// the files to cache

var fileNames=[
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

// the cache and cache object

var fileCache=[];

function FileCacheObject(name,data)
{
    this.name=name;
    this.data=data;
}

// the file loading functions

function fileCacheStart(callback)
{
    fileCacheLoadFile(0,callback);
}

function fileCacheLoadFile(idx,callback)
{
        // ajax the file
        
    var req=new XMLHttpRequest();

    req.open('GET',fileNames[idx],true);
    req.overrideMimeType('text/plain');

    req.onreadystatechange=function() {
        if (req.readyState!==4) return;
        var res=req.responseText;
        if (res!==null) {
            if (res.length===0) res=null;
        }
        if (res===null) {
            alert('Missing File: '+fileNames[idx]);
            return;
        }
        
        fileCacheFinishLoad(idx,callback,res);
    };

    req.send(null);
}
    
function fileCacheFinishLoad(idx,callback,data)
{
        // put file in cache
    
    fileCache.push(new FileCacheObject(fileNames[idx],data));
    
        // finished?
        
    idx++;
    if (idx===fileNames.length) {
        callback();
        return;
    }
    
        // next file
        
    setTimeout(function() { fileCacheLoadFile(idx,callback); },PROCESS_TIMEOUT_MSEC);
}

// get files from cache

function fileCacheGet(name)
{
    var n;
    var nFile=fileCache.length;
    
    for (n=0;n!==nFile;n++) {
        if (fileCache[n].name===name) return(fileCache[n].data);
    }
    
    return(null);
}
