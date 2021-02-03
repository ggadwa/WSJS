//
// shader base class
//

export default class ShaderClass
{
    constructor(core)
    {
        this.SHADER_BASE_PATH='../../../shaders/';
        
        this.core=core;
        
        this.shaderName=null;
        
        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
        
        // no seal, this class is extended
    }
    
        //
        // initialize/release shader
        //

    initialize()
    {
    }
    
    release()
    {
        let gl=this.core.gl;
        
        if (this.program===null) return;

        if (this.vertexShader!==null) {
            gl.detachShader(this.program,this.vertexShader);
            gl.deleteShader(this.vertexShader);
        }

        if (this.fragmentShader!==null) {
            gl.detachShader(this.program,this.fragmentShader);
            gl.deleteShader(this.fragmentShader);
        }

        gl.deleteProgram(this.program);

        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
    }
    
        //
        // load shader
        //
        
    async loadShader(url)
    {
        let resp;
        
        try {
            resp=await fetch(url);
            if (!resp.ok) return(Promise.reject('Unable to load '+url+'; '+resp.statusText));
            return(await resp.text());
        }
        catch (e) {
            return(Promise.reject('Unable to load '+url+'; '+e.message));
        }
    }
     
    async load()
    {
        let vertexShaderSource,fragmentShaderSource;
        let gl=this.core.gl;
        
            // load vertex shader
        
        vertexShaderSource=null;
        
        await this.loadShader(this.SHADER_BASE_PATH+this.shaderName+'.vert')
            .then
                (
                        // resolved
                
                    value=>{
                        vertexShaderSource=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log(value);
                    }
                );
        
        if (vertexShaderSource===null) return(false);
        
            // load fragment shader
        
        fragmentShaderSource=null;
        
        await this.loadShader(this.SHADER_BASE_PATH+this.shaderName+'.frag')
            .then
                (
                        // resolved
                
                    value=>{
                        fragmentShaderSource=value;
                    },
                    
                        // rejected
                        
                    value=>{
                        console.log(value);
                    }
                );
        
        if (fragmentShaderSource===null) return(false);
        
            // compile vertex shader
            
        this.vertexShader=gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader,vertexShaderSource);
        gl.compileShader(this.vertexShader);

        if (!gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) {
            this.writeError(this.shaderName,"vertex",gl.getShaderInfoLog(this.vertexShader));
            this.release();
            return(false);
        }
        
            // compile fragment shader
            
        this.fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader,fragmentShaderSource);
        gl.compileShader(this.fragmentShader);

        if (!gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) {
            this.writeError(this.shaderName,"fragment",gl.getShaderInfoLog(this.fragmentShader));
            this.release();
            return(false);
        }
        
            // compile the program

        this.program=gl.createProgram();
        gl.attachShader(this.program,this.vertexShader);
        gl.attachShader(this.program,this.fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program,gl.LINK_STATUS)) {
            this.writeError(name,"program",gl.getProgramInfoLog(this.program));
            this.release();
            return(false);
        }
        
            // do the variables and final setup
            
        this.loadFinish();
        
        return(true);
    }
    
    loadFinish()
    {
    }

        //
        // shader errors
        //

    writeError(name,nameType,errStr)
    {
        console.log('Shader Error: '+name+'('+nameType+')');
        console.log('-----------------------------------------');
        console.log(errStr);
    }

}

