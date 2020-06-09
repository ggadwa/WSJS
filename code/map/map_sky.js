//
// sky class
//

export default class MapSkyClass
{
    constructor(core)
    {
        this.core=core;
        
        this.on=false;
        this.size=0;
        this.bitmap=null;

        this.vertexes=null;
        this.uvs=null;
        this.normals=null;
        this.tangents=null;
        
        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.normalBuffer=null;
        this.tangentBuffer=null;
        this.indexBuffer=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release interface
        //

    initialize()
    {
        let indexes;
        let gl=this.core.gl;
        
            // room enough for the 8 points of the cube
            
        this.vertexes=new Float32Array(24);
        this.uvs=new Float32Array(16);
        this.normals=new Float32Array(24);
        this.tangents=new Float32Array(24);
        
            // prebuild these so we can use subdata later
            
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);

        this.uvBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        this.normalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.normals,gl.DYNAMIC_DRAW);
        
        this.tangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.tangents,gl.DYNAMIC_DRAW);
            
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
        gl.deleteBuffer(this.normalBuffer);
        gl.deleteBuffer(this.tangentBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // draw
        //

    drawPlane(cameraPos,vx0,vy0,vz0,vx1,vy1,vz1,vx2,vy2,vz2,vx3,vy3,vz3,u,v,u2,v2,nx,ny,nz,tx,ty,tz)
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.mapMeshShader;
        
        this.vertexes[0]=cameraPos.x+vx0;
        this.vertexes[1]=cameraPos.y+vy0;
        this.vertexes[2]=cameraPos.z+vz0;
        
        this.vertexes[3]=cameraPos.x+vx1;
        this.vertexes[4]=cameraPos.y+vy1;
        this.vertexes[5]=cameraPos.z+vz1;
        
        this.vertexes[6]=cameraPos.x+vx2;
        this.vertexes[7]=cameraPos.y+vy2;
        this.vertexes[8]=cameraPos.z+vz2;
        
        this.vertexes[9]=cameraPos.x+vx3;
        this.vertexes[10]=cameraPos.y+vy3;
        this.vertexes[11]=cameraPos.z+vz3;
        
        this.uvs[0]=u;
        this.uvs[1]=v;
        
        this.uvs[2]=u2;
        this.uvs[3]=v;
        
        this.uvs[4]=u2;
        this.uvs[5]=v2;
        
        this.uvs[6]=u;
        this.uvs[7]=v2;
        
        this.normals[0]=nx;
        this.normals[1]=ny;
        this.normals[2]=nz;
        
        this.normals[3]=nx;
        this.normals[4]=ny;
        this.normals[5]=nz;
        
        this.normals[6]=nx;
        this.normals[7]=ny;
        this.normals[8]=nz;
        
        this.normals[9]=nx;
        this.normals[10]=ny;
        this.normals[11]=nz;
        
        this.tangents[0]=tx;
        this.tangents[1]=ty;
        this.tangents[2]=tz;
        
        this.tangents[3]=tx;
        this.tangents[4]=ty;
        this.tangents[5]=tz;
        
        this.tangents[6]=tx;
        this.tangents[7]=ty;
        this.tangents[8]=tz;
        
        this.tangents[9]=tx;
        this.tangents[10]=ty;
        this.tangents[11]=tz;
        
            // attach buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexes);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvs);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.normals);
        gl.vertexAttribPointer(shader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tangentBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.tangents);
        gl.vertexAttribPointer(shader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);

            // draw the plane
            
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);
    }
        
    draw()
    {
        let gl=this.core.gl;
        let cameraPos,skyRadius;
        let shader=this.core.shaderList.mapMeshShader;
        
        if (!this.on) return;
        
        cameraPos=this.core.camera.position;
        skyRadius=Math.trunc(this.size*0.5);
        
            // setup shader

        shader.drawStart();
        
            // force a highlight
         
        gl.uniform3f(shader.lightMinUniform,1,1,1);
        gl.uniform3f(shader.lightMaxUniform,1,1,1);
        
            // the sky texture
            
        this.bitmap.attach(shader);
        
        gl.disable(gl.DEPTH_TEST);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        
            // the planes
            // -x, +x, -y, +y, -z, +z

        this.drawPlane(cameraPos,-skyRadius,-skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,0.5,0.664,0.75,0.335,1,0,0,0,0,1);
        this.drawPlane(cameraPos,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,0.25,0.664,0,0.335,-1,0,0,0,0,-1);
        this.drawPlane(cameraPos,skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,0.252,0.999,0.498,0.664,0,1,0,1,0,0);
        this.drawPlane(cameraPos,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,0.252,0,0.498,0.333,0,-1,0,-1,0,0);
        this.drawPlane(cameraPos,-skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,-skyRadius,skyRadius,-skyRadius,0.498,0.664,0.252,0.335,0,0,1,1,0,0);
        this.drawPlane(cameraPos,-skyRadius,-skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,skyRadius,skyRadius,-skyRadius,skyRadius,skyRadius,0.752,0.664,0.999,0.335,0,0,-1,-1,0,0);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // end shader
            
        shader.drawEnd();

        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
        gl.enable(gl.DEPTH_TEST);
    }
    
}

