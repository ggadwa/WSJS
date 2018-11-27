//
// shader base class
//

export default class ShaderClass
{
    constructor(view)
    {
        this.view=view;
        
        this.vertexShaderURL=null;
        this.fragmentShaderURL=null;
        this.callback=null;
        
        this.vertexShaderSource=null;
        this.fragmentShaderSource=null;
        
        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
        
        // no seal, this class is extended
    }
    
        //
        // initialize/release shader
        //

    initialize(name,callback)
    {
        this.vertexShaderURL='shaders/'+name+'.vert';
        this.fragmentShaderURL='shaders/'+name+'.frag';
        this.callback=callback;
        
        this.loadVertexShader();
    }
    
    loadVertexShader()
    {
        fetch(this.vertexShaderURL)
            .then(
                (resp)=>{
                    if (resp.status!=200) return(Promise.reject(new Error('Missing file: '+this.vertexShaderURL)));
                    return(resp.text());
                }
            )
            .then((data)=>{
                    this.vertexShaderSource=data;
                    this.loadFragmentShader();
                }
            )
            .catch((error)=>alert(error));
    }
    
    loadFragmentShader()
    {
        fetch(this.fragmentShaderURL)
            .then(
                (resp)=>{
                    if (resp.status!=200) return(Promise.reject(new Error('Missing file: '+this.fragmentShaderURL)));
                    return(resp.text());
                }
            )
            .then((data)=>{
                    this.fragmentShaderSource=data;
                    this.compileShader();
                }
            )
            .catch((error)=>alert(error));
    }
    
    compileShader()
    {
        let gl=this.view.gl;
        
            // compile vertex shader
            
        this.vertexShader=gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader,this.vertexShaderSource);
        gl.compileShader(this.vertexShader);

        if (!gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) {
            this.errorAlert(this.vertexShaderURL,"vertex",gl.getShaderInfoLog(this.vertexShader));
            this.release();
            return;
        }
        
            // compile fragment shader
            
        this.fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader,this.fragmentShaderSource);
        gl.compileShader(this.fragmentShader);

        if (!gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) {
            this.errorAlert(this.fragmentShaderURL,"fragment",gl.getShaderInfoLog(this.fragmentShader));
            this.release();
            return;
        }
        
            // compile the program

        this.program=gl.createProgram();
        gl.attachShader(this.program,this.vertexShader);
        gl.attachShader(this.program,this.fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program,gl.LINK_STATUS)) {
            this.errorAlert(name,"program",gl.getProgramInfoLog(this.program));
            this.release();
            return;
        }

            // and the callback
            
        this.callback();
    }
    
    release()
    {
        let gl=this.view.gl;
        
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
        // shader errors
        //

    errorAlert(name,nameType,errStr)
    {
        let str='Shader Error: '+name+'('+nameType+')\n';
        str+='-----------------------------------------\n';
        str+=errStr;

        alert(str);
    }

}

