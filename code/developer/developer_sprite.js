import PointClass from '../utility/point.js';

export default class DeveloperSpriteClass
{
    constructor(core)
    {
        this.core=core;
        
        this.RADIUS=500;
        
        this.vertexes=null;
        
        this.vertexBuffer=null;
        this.vertexUVBuffer=null;
        
            // pre-allocates
            
        this.tempPoint=new PointClass(0,0,0);
        
            // some developer bitmaps
            
        this.core.bitmapList.addEffect('../developer/sprites/effect.png');
        this.core.bitmapList.addEffect('../developer/sprites/light.png');
    }

    initialize()
    {
        let uvs;
        let gl=this.core.gl;
            
            // gl buffers
        
        this.vertexes=new Float32Array(6*3);
        
        this.vertexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);
        
        uvs=new Float32Array(6*2);
        uvs[0]=0.0;
        uvs[1]=0.0;
        uvs[2]=1.0;
        uvs[3]=0.0;
        uvs[4]=0.0;
        uvs[5]=1.0;
        uvs[6]=1.0;
        uvs[7]=0.0;
        uvs[8]=1.0;
        uvs[9]=1.0;
        uvs[10]=0.0;
        uvs[11]=1.0;
        
        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
        return(true);
    }

    release()
    {
        let gl=this.core.gl;

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.vertexUVBuffer);
    }
    
    drawBillboardSprite(bitmap,position,selected)
    {
        let gl=this.core.gl;
        let shader=this.core.shaderList.effectShader;
        
            // sprite billboard location
            
            // top left
            
        this.tempPoint.x=this.RADIUS;
        this.tempPoint.y=this.RADIUS;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[0]=this.tempPoint.x+position.x;
        this.vertexes[1]=this.tempPoint.y+position.y;
        this.vertexes[2]=this.tempPoint.z+position.z;

            // top right
            
        this.tempPoint.x=-this.RADIUS;
        this.tempPoint.y=this.RADIUS;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[3]=this.vertexes[9]=this.tempPoint.x+position.x;
        this.vertexes[4]=this.vertexes[10]=this.tempPoint.y+position.y;
        this.vertexes[5]=this.vertexes[11]=this.tempPoint.z+position.z;

            // bottom left
            
        this.tempPoint.x=this.RADIUS;
        this.tempPoint.y=-this.RADIUS;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[6]=this.vertexes[15]=this.tempPoint.x+position.x;
        this.vertexes[7]=this.vertexes[16]=this.tempPoint.y+position.y;
        this.vertexes[8]=this.vertexes[17]=this.tempPoint.z+position.z;

            // bottom right
            
        this.tempPoint.x=-this.RADIUS;
        this.tempPoint.y=-this.RADIUS;
        this.tempPoint.z=0.0;
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[12]=this.tempPoint.x+position.x;
        this.vertexes[13]=this.tempPoint.y+position.y;
        this.vertexes[14]=this.tempPoint.z+position.z;

            // draw it
        
        shader.drawStart();
        
        gl.uniform4f(shader.colorAlphaUniform,1,1,(selected?0:1),1);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);
        
        bitmap.attach(shader);
        
        gl.drawArrays(gl.TRIANGLES,0,6);
        
        shader.drawEnd();
    }
}
