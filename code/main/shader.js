"use strict";

//
// generic shader light class
//

function ShaderLightObject()
{
    this.positionUniform=null;
    this.colorUniform=null;
    this.intensityUniform=null;
    this.invertIntensityUniform=null;
    this.exponentUniform=null;
}

//
// generic shader class
//

function ShaderObject()
{
    this.vertexShader=null;
    this.fragmentShader=null;
    this.program=null;
    
        //
        // initialize/release shader
        //

    this.initialize=function(view,name)
    {
            // get the shaders from divs

        if (!this.loadVertexShader(view,name)) {
            this.release();
            return(false);
        }

        if (!this.loadFragmentShader(view,name)) {
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
    };

    this.release=function(view)
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
    };
    
        //
        // load shaders
        //
        
    this.ajaxShaderFile=function(name)
    {
            // yes, I know this is bad, will make
            // async later
        
        var req=new XMLHttpRequest();
        req.open('GET',('shaders/'+name),false);
        req.send(null);
        return(req.responseText);
    };

    this.loadVertexShader=function(view,name)
    {
        this.vertexShader=view.gl.createShader(view.gl.VERTEX_SHADER);

        var source=this.ajaxShaderFile(name+'.vert');
        if (source===null) return(false);
        
        view.gl.shaderSource(this.vertexShader,source);
        view.gl.compileShader(this.vertexShader);

        if (view.gl.getShaderParameter(this.vertexShader,view.gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"vertex",view.gl.getShaderInfoLog(this.vertexShader));
        return(false);
    };

    this.loadFragmentShader=function(view,name)
    {
        this.fragmentShader=view.gl.createShader(view.gl.FRAGMENT_SHADER);

        var source=this.ajaxShaderFile(name+'.frag');
        if (source===null) return(false);
        
        view.gl.shaderSource(this.fragmentShader,source);
        view.gl.compileShader(this.fragmentShader);

        if (view.gl.getShaderParameter(this.fragmentShader,view.gl.COMPILE_STATUS)) return(true);

        this.errorAlert(name,"fragment",view.gl.getShaderInfoLog(this.fragmentShader));
        return(false);
    };
   
        //
        // shader errors
        //

    this.errorAlert=function(name,nameType,errStr)
    {
        var str='Shader Error: '+name+'('+nameType+')\n';
        str+='-----------------------------------------\n';
        str+=errStr;

        alert(str);
    };

}
