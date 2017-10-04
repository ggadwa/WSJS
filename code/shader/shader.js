//
// shader base class
//

export default class ShaderClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.fileCache=fileCache;
        
        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
        
        // no seal, this class is extended
    }
    
        //
        // initialize/release shader
        //

    initialize(name)
    {
        let gl=this.view.gl;
        
            // get the shaders

        if (!this.loadVertexShader(name)) {
            this.release();
            return(false);
        }

        if (!this.loadFragmentShader(name)) {
            this.release();
            return(false);
        }

            // compile the program

        this.program=gl.createProgram();
        gl.attachShader(this.program,this.vertexShader);
        gl.attachShader(this.program,this.fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program,gl.LINK_STATUS)) {
            this.errorAlert(name,"program",gl.getProgramInfoLog(this.program));
            this.release();
            return(false);
        }

        return(true);
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
        // load shaders
        //
    
    loadVertexShader(name)
    {
        let source;
        let gl=this.view.gl;
        
        this.vertexShader=gl.createShader(gl.VERTEX_SHADER);

        source=this.fileCache.getFile('shaders/'+name+'.vert');
        gl.shaderSource(this.vertexShader,source);
        gl.compileShader(this.vertexShader);

        if (gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"vertex",gl.getShaderInfoLog(this.vertexShader));
        return(false);
    }

    loadFragmentShader(name)
    {
        let source;
        let gl=this.view.gl;
        
        this.fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);

        source=this.fileCache.getFile('shaders/'+name+'.frag');
        gl.shaderSource(this.fragmentShader,source);
        gl.compileShader(this.fragmentShader);

        if (gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"fragment",gl.getShaderInfoLog(this.fragmentShader));
        return(false);
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

