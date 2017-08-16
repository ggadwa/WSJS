import BoundClass from '../../code/utility/bound.js';

//
// map liquid class
// 
// represents a single liquid volume, liquid volumes have infinite
// Y past the single top Y
//

export default class MapLiquidClass
{
    constructor(bitmap,room)
    {
        this.bitmap=bitmap;
        
            // pick up some variables from the room
            
        this.xBlockSize=room.xBlockSize;
        this.zBlockSize=room.zBlockSize;
        
        this.xBound=room.xBound;
        this.zBound=room.zBound;
        
            // liquids are flat plans, so we
            // need a single Y, and then create a yBound
            // so the frustum calcs can use it
            
        this.y=room.getLiquidY();
        this.yBound=new BoundClass(this.y,this.y);
        
            // null buffers

        this.vertexPosBuffer=null;
        this.vertexUVBuffer=null;
        this.indexBuffer=null;
        
        this.vertices=null;
        this.uvs=null;
        
        this.indexCount=0;
        
            // constants
            
        this.LIQUID_WAVE_FREQUENCY=4000;           // frequency in milliseconds of waves
        this.LIQUID_WAVE_HEIGHT=400;               // pixel height of waves

        Object.seal(this);
    }
    
        //
        // close the liquid
        //
        
    close()
    {
        let gl=view.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexUVBuffer!==null) gl.deleteBuffer(this.vertexUVBuffer);
        
        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // liquid buffers
        //

    updateBuffers()
    {
        let x,z,vx,vz,gx,gz;
        let vIdx,uvIdx;
        let offRow,offCol;
        
            // get the y offsets for waves
        
        let freq=((view.timeStamp%this.LIQUID_WAVE_FREQUENCY)/this.LIQUID_WAVE_FREQUENCY)*(Math.PI*2);
        let cs=Math.cos(freq);
        let offY=Math.trunc(cs*this.LIQUID_WAVE_HEIGHT);
        
            // create mesh
            
        vIdx=0;
        uvIdx=0;
        
        vz=this.zBound.min;
        gz=0.0;
        
        offRow=Math.trunc(vz/constants.ROOM_BLOCK_WIDTH);
        
        for (z=0;z!==(this.zBlockSize+1);z++) {
            
            vx=this.xBound.min;
            gx=0.0;
            
            offCol=Math.trunc(vx/constants.ROOM_BLOCK_WIDTH);
            
            for (x=0;x!==(this.xBlockSize+1);x++) {
                this.vertices[vIdx++]=vx;
                this.vertices[vIdx++]=(((offRow+offCol)%2)===0)?(this.y-offY):(this.y+offY);
                this.vertices[vIdx++]=vz;
                
                this.uvs[uvIdx++]=gx;
                this.uvs[uvIdx++]=gz;
                
                vx+=constants.ROOM_BLOCK_WIDTH;
                gx+=1.0;
                
                offCol++;
            }
            
            vz+=constants.ROOM_BLOCK_WIDTH;
            gz+=1.0;
            
            offRow++;
        }
    }
    
    setupBuffers()
    {
        let x,z,iIdx,vIdx,vTopIdx,vBotIdx;
        let nVertex,nSegment,indexes;
        let gl=view.gl;
        
            // create the buffers
            
        this.vertexPosBuffer=gl.createBuffer();
        this.vertexUVBuffer=gl.createBuffer();
        this.indexBuffer=gl.createBuffer();
        
            // get liquid vertex size
            
        nVertex=(this.xBlockSize+1)*(this.zBlockSize+1);
        
        this.vertices=new Float32Array(nVertex*3);
        this.uvs=new Float32Array(nVertex*2);
        
            // use the buffer updater to setup
            // the vertices
            
        this.updateBuffers();
        
            // the indexes always stay the same
            
        nSegment=this.xBlockSize*this.zBlockSize;
        indexes=new Uint16Array(nSegment*6);
        
        iIdx=0;
        vIdx=0;
        
        for (z=0;z!==this.zBlockSize;z++) {
            vTopIdx=(z*(this.xBlockSize+1));
            vBotIdx=vTopIdx+(this.xBlockSize+1);

            for (x=0;x!==this.xBlockSize;x++) {
                indexes[iIdx++]=vBotIdx;
                indexes[iIdx++]=vTopIdx;
                indexes[iIdx++]=vTopIdx+1;
                indexes[iIdx++]=vBotIdx;
                indexes[iIdx++]=vTopIdx+1;
                indexes[iIdx++]=vBotIdx+1;
                
                vTopIdx++;
                vBotIdx++;
            }
        }
        
        this.indexCount=iIdx;
        
            // set the index buffer

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STATIC_DRAW);
    }
    
    bindBuffers(mapLiquidShader)
    {
        let gl=view.gl;

            // water vertices and UVs are always moving
            // so always update these buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(mapLiquidShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(mapLiquidShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

            // indexes are static
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    }
    
        //
        // liquid drawing
        //

    draw()
    {
        let gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
        
        view.drawMeshCount++;
        view.drawMeshTrigCount+=Math.trunc(this.indexCount/3);
    }
    
}
