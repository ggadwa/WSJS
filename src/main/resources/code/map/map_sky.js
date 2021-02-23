import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import Matrix4Class from '../utility/matrix4.js';
import GlobeClass from '../utility/globe.js';

//
// sky class
//

export default class MapSkyClass
{
    constructor(core)
    {
        this.core=core;
        
        this.on=false;

        this.offset=new PointClass(0,0,0);
        this.scale=new PointClass(1,1,1);
        this.rotate=new PointClass(0,0,0);
        this.color=new ColorClass(0,0,0);
        this.bitmap=null;

        this.vertexBuffer=null;
        this.uvBuffer=null;
        
        this.position=new PointClass(0,0,0);
        
        this.tempMatrix=new Matrix4Class();
        this.transformMatrix=new Matrix4Class();
        
            // this object has vertexes and UVs for a globe
            
        this.globe=new GlobeClass();

        this.trigCount=Math.trunc(this.globe.vertexes.length/3);
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let gl=this.core.gl;
        
            // build the globe vertex and uv buffers
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.globe.vertexes,gl.STATIC_DRAW);

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.globe.uvs,gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
    }
    
        //
        // draw
        //

    draw()
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.mapSkyShader;
        
        if (!this.on) return;
        
            // set the globe transforms
            
        this.position.setFromAddPoint(this.core.game.camera.position,this.offset);
            
        this.transformMatrix.setTranslationFromPoint(this.position);
        this.tempMatrix.setScaleFromPoint(this.scale);
        this.transformMatrix.multiply(this.tempMatrix);
        this.tempMatrix.setRotationFromYAngle(this.rotate.y);
        this.transformMatrix.multiply(this.tempMatrix);
        
            // setup shader

        shader.drawStart();
        
            // the sky texture
            
        this.bitmap.attach(shader);
        
        gl.disable(gl.DEPTH_TEST);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
            
        gl.drawArrays(gl.TRIANGLES,0,this.trigCount);

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // end shader
            
        shader.drawEnd();

        gl.enable(gl.DEPTH_TEST);
    }
    
}

