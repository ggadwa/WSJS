export default class UploadClass
{
    constructor(core)
    {
        this.core=core;
    }

    async upload(uploadName,uploadIndex,data)
    {
        let path,url;
        let pathTokens,projectName;
        let resp;
        
        console.info('uploading='+uploadName+'('+uploadIndex+')>'+data.length);
        
            // get the upload path
            
        path=window.location.pathname;
        pathTokens=path.split('/');
        projectName=pathTokens[2];
        
        url=window.location.protocol+'//'+window.location.host+'/'+encodeURIComponent(projectName)+'/'+encodeURIComponent(this.core.game.map.name)+'/'+uploadName+'/'+uploadIndex;
        
            // upload
            
        try {
            resp=await fetch(url,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:data});
        }
        catch (e) {
            throw new Error('Unable to post to server '+uploadName+'; '+e.message);
        }
    }
}
