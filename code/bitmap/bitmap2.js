export default class Bitmap2Class
{
    constructor(view,name,colorOnly)
    {
        this.view=view;
        this.name=name;
        this.colorOnly=colorOnly;
        
        this.colorImage=new Image();
        this.normalImage=new Image();
        this.specularImage=new Image();
        this.glowImage=new Image();
        
        this.texture=null;
        this.normalMap=null;
        this.specularMap=null;
        this.glowMap=null;

        this.alpha=1.0;
        this.shineFactor=5.0;
    }

        //
        // initialize and release bitmap
        //
    
    loadTextureError(path)
    {
        console.log('Missing texture png: '+path);
    }
    
    initialize(callback)
    {
        let path='./data/textures/'+this.name+'.png';
        
        this.colorImage.onload=this.initializeLoadNormal.bind(this,callback);
        this.colorImage.onerror=this.loadTextureError.bind(this,path);
        this.colorImage.src=path;
    }
    
    initializeLoadNormal(callback)
    {
        let path='./data/textures/'+this.name+'_n.png';
        
        if (this.colorOnly) {
            this.initializeCreateGLTextures(callback);
            return;
        }
        
        this.normalImage.onload=this.initializeLoadSpecular.bind(this,callback);
        this.normalImage.onerror=this.loadTextureError.bind(this,path);
        this.normalImage.src=path;
    }
    
    initializeLoadSpecular(callback)
    {
        let path='./data/textures/'+this.name+'_s.png';
        
        this.specularImage.onload=this.initializeLoadGlow.bind(this,callback);
        this.specularImage.onerror=this.loadTextureError.bind(this,path);
        this.specularImage.src=path;
    }
    
    initializeLoadGlow(callback)
    {
        let path='./data/textures/'+this.name+'_g.png';
        
        this.glowImage.onload=this.initializeCreateGLTextures.bind(this,callback);
        this.glowImage.onerror=this.loadTextureError.bind(this,path);
        this.glowImage.src=path;
    }
    
    initializeCreateGLTextures(callback)
    {
            // setup the texture
            
        let gl=this.view.gl;
        
        this.texture=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.colorImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        if (this.colorOnly) {
            callback();
            return;
        }

            // setup the normal map

        this.normalMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.normalMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.normalImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);

            // setup the specular map

        this.specularMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.specularMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.specularImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
            // setup the glow map

        this.glowMap=gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,this.glowMap);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.glowImage);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D,null);
        
        callback();
    }
    
    release()
    {
        let gl=this.view.gl;

        if (this.texture!==null) gl.deleteTexture(this.texture);
        if (this.normalMap!==null) gl.deleteTexture(this.normalMap);
        if (this.specularMap!==null) gl.deleteTexture(this.specularMap);
        if (this.glowMap!==null) gl.deleteTexture(this.glowMap);
    }
    
        //
        // attach bitmap to shader in different formats
        //
    
    attachAsTexture(shader)
    {
        let gl=this.view.gl;

            // uniforms

        gl.uniform1f(shader.alphaUniform,this.alpha);
        gl.uniform1f(shader.shineFactorUniform,this.shineFactor);
        gl.uniform1f(shader.glowFactorUniform,this.view.glowFactor);

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
