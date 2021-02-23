//
// background class
//

export default class MapBackgroundClass
{
    constructor(core)
    {
        this.core=core;
        
        this.on=false;
        this.shift=[];
        this.bitmap=null;

        this.uvs=null;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let vertexes,indexes;
        let gl=this.core.gl;
        
            // vertexes are calced before hand
            // (always the entire window)
            
        vertexes=new Float32Array(8);
        
        vertexes[0]=0;
        vertexes[1]=0;
        vertexes[2]=this.core.canvas.width;
        vertexes[3]=0;
        vertexes[4]=this.core.canvas.width;
        vertexes[5]=this.core.canvas.height;
        vertexes[6]=0;
        vertexes[7]=this.core.canvas.height;
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertexes,gl.STATIC_DRAW);
        
            // uvs are calced for scrolling
            
        this.uvs=new Float32Array(8);

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
            
            // index buffer is always the same
            
        indexes=new Uint16Array(6);
        
        indexes[0]=0;
        indexes[1]=1;
        indexes[2]=3;
        indexes[3]=1;
        indexes[4]=2;
        indexes[5]=3;
            
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // draw
        //

    drawPlane(u,v,u2,v2,uShift)
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.interfaceShader;
        
            // new UVs
            
        this.uvs[0]=u+uShift;
        this.uvs[1]=v;
        
        this.uvs[2]=u2+uShift;
        this.uvs[3]=v;
        
        this.uvs[4]=u2+uShift;
        this.uvs[5]=v2;
        
        this.uvs[6]=u+uShift;
        this.uvs[7]=v2;
        
            // attach buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvs);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);

            // draw the plane
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    }
    
    getUShift(player,shiftFactor)
    {
            // we use the 10000 figure so the shift
            // numbers don't have to be so small, this is
            // important because small numbers will get clipped
            // in the glTF translation
            
        let f=(player.position.x/10000.0)*shiftFactor;
        return(f-Math.floor(f));
    }
        
    draw()
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.interfaceShader;
        let player=this.core.game.map.entityList.getPlayer();
        
        if (!this.on) return;
        
            // setup shader
            
        gl.disable(gl.DEPTH_TEST);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

        shader.drawStart();
        
            // the background texture
            
        gl.uniform4f(shader.colorUniform,1,1,1,1);
        this.bitmap.attach(shader);
        
            // the planes
            
        this.drawPlane(0.0,0.0,0.999,0.249,this.getUShift(player,this.shift[0]));
        this.drawPlane(0.0,0.25,0.999,0.499,this.getUShift(player,this.shift[1]));
        this.drawPlane(0.0,0.5,0.999,0.749,this.getUShift(player,this.shift[2]));
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // end shader
            
        shader.drawEnd();

        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }
    
}

