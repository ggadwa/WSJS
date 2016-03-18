"use strict";

//
// generic shader light class
//

class ShaderLightClass
{
    constructor()
    {
        this.positionIntensityUniform=null;
        this.colorExponentUniform=null;
        
        Object.seal(this);
    }
}

//
// generic shader class
//

class ShaderClass
{
    constructor()
    {
        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
        
        // no seal, this class is extended
    }
    
        //
        // initialize/release shader
        //

    initialize(view,fileCache,name)
    {
            // get the shaders from divs

        if (!this.loadVertexShader(view,fileCache,name)) {
            this.release();
            return(false);
        }

        if (!this.loadFragmentShader(view,fileCache,name)) {
            this.release();
            return(false);
        }

            // compile the program

        this.program=view.gl.createProgram();
        view.gl.attachShader(this.program,this.vertexShader);
        view.gl.attachShader(this.program,this.fragmentShader);
        view.gl.linkProgram(this.program);

        if (!view.gl.getProgramParameter(this.program,view.gl.LINK_STATUS)) {
            this.errorAlert(name,"program",view.gl.getProgramInfoLog(this.program));
            this.release();
            return(false);
        }

        return(true);
    }

    release(view)
    {
        if (this.program===null) return;

        if (this.vertexShader!==null) {
            view.gl.detachShader(this.program,this.vertexShader);
            view.gl.deleteShader(this.vertexShader);
        }

        if (this.fragmentShader!==null) {
            view.gl.detachShader(this.program,this.fragmentShader);
            view.gl.deleteShader(this.fragmentShader);
        }

        view.gl.deleteProgram(this.program);

        this.vertexShader=null;
        this.fragmentShader=null;
        this.program=null;
    }
    
        //
        // load shaders
        //
    
    loadVertexShader(view,fileCache,name)
    {
        this.vertexShader=view.gl.createShader(view.gl.VERTEX_SHADER);

        var source=fileCache.getFile('shaders/'+name+'.vert');
        view.gl.shaderSource(this.vertexShader,source);
        view.gl.compileShader(this.vertexShader);

        if (view.gl.getShaderParameter(this.vertexShader,view.gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"vertex",view.gl.getShaderInfoLog(this.vertexShader));
        return(false);
    }

    loadFragmentShader(view,fileCache,name)
    {
        this.fragmentShader=view.gl.createShader(view.gl.FRAGMENT_SHADER);

        var source=fileCache.getFile('shaders/'+name+'.frag');
        view.gl.shaderSource(this.fragmentShader,source);
        view.gl.compileShader(this.fragmentShader);

        if (view.gl.getShaderParameter(this.fragmentShader,view.gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"fragment",view.gl.getShaderInfoLog(this.fragmentShader));
        return(false);
    }
   
        //
        // shader errors
        //

    errorAlert(name,nameType,errStr)
    {
        var str='Shader Error: '+name+'('+nameType+')\n';
        str+='-----------------------------------------\n';
        str+=errStr;

        alert(str);
    }

}
