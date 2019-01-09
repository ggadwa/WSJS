export default class BitmapClass
{
    constructor(view,name,colorOnly)
    {
        this.view=view;
        this.name=name;
        this.colorOnly=colorOnly;
        
        this.LOAD_STATE_UNLOADED=0;
        this.LOAD_STATE_LOADED=1;
        this.LOAD_STATE_ERROR=2;
        
        this.colorImage=null;
        this.normalImage=null;
        this.specularImage=null;
        this.glowImage=null;
        
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;
        this.glowMap=null;

        this.alpha=1.0;
        this.shineFactor=5.0;
        this.glowFrequency=0;
        this.glowMax=1.0;
        
        this.loaded=false;
    }

        //
        // initialize and release bitmap
        //
    
    initialize()
    {
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;
        this.glowMap=null;

        this.loaded=false;
    }
    
    release()
    {
        let gl=this.view.gl;

        if (this.texture!==null) gl.deleteTexture(this.texture);
        if (this.normalMap!==null) gl.deleteTexture(this.normalMap);
        if (this.specularMap!==null) gl.deleteTexture(this.specularMap);
        if (this.glowMap!==null) gl.deleteTexture(this.glowMap);
        
        this.colorImage=null;
        this.normalImage=null;
        this.specularImage=null;
        this.glowImage=null;
        
        this.loaded=false;
    }
    
        //
        // load texture
        //
        
    loadImagePromise(url)
    {
        return(
                new Promise((resolve,reject) =>
                    {
                        let img=new Image();
                        img.onload=()=>resolve(img);
                        img.onerror=()=>reject(url);
                        img.src=url;
                    }
                )
           );
    }
    
    async load()
    {
        let gl=this.view.gl;
        
            // color bitmap
            
        await this.loadImagePromise('./data/textures/'+this.name+'.png')
            .then
                (
                        // resolved
                
                    value=>{
                        this.colorImage=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log('Unable to load '+value);
                    }
                );
        
        if (this.colorImage===null) return(false);

        this.texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.colorImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        if (this.colorOnly) {
            this.loaded=true;
            return(true);
        }

            // normal bitmap
            
        await this.loadImagePromise('./data/textures/'+this.name+'_n.png')
            .then
                (
                        // resolved
                
                    value=>{
                        this.normalImage=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log('Unable to load '+value);
                    }
                );
        
        if (this.normalImage===null) return(false);
        
        this.normalMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.normalImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // specular bitmap
            
        await this.loadImagePromise('./data/textures/'+this.name+'_s.png')
            .then
                (
                        // resolved
                
                    value=>{
                        this.specularImage=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log('Unable to load '+value);
                    }
                );
        
        if (this.specularImage===null) return(false);
        
        this.specularMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.specularImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // glow bitmap
            
        await this.loadImagePromise('./data/textures/'+this.name+'_g.png')
            .then
                (
                        // resolved
                
                    value=>{
                        this.glowImage=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log('Unable to load '+value);
                    }
                );
        
        if (this.glowImage===null) return(false);
        
        this.glowMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.glowImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        this.loaded=true;
        
        return(true);
    }
    
        //
        // attach bitmap to shader in different formats
        //
    
    attachAsTexture(shader)
    {
        let glowFactor;
        let gl=this.view.gl;

            // uniforms

        gl.uniform1f(shader.alphaUniform,this.alpha);
        gl.uniform1f(shader.shineFactorUniform,this.shineFactor);
        
        if (this.glowFrequency!==0) {
            glowFactor=Math.abs(Math.cos(this.view.timeStamp/this.glowFrequency)*this.glowMax);
            gl.uniform1f(shader.glowFactorUniform,glowFactor);
        }
        else {
            gl.uniform1f(shader.glowFactorUniform,0.0);
        }
        
            // the textures
            
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsLiquid(shader)
    {
        let gl=this.view.gl;

        gl.uniform1f(shader.alphaUniform,this.alpha);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsParticle()
    {
        let gl=this.view.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
    
    attachAsSky()
    {
        let gl=this.view.gl;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
    }
}
