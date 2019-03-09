import * as constants from '../main/constants.js';
import BoundClass from '../utility/bound.js';

//
// map liquid class
// 
// represents a single liquid volume
//

export default class MapLiquidClass
{
    constructor(view,bitmap,waveSize,wavePeriod,waveHeight,waveUVStamp,uShift,vShift,tint,xBound,yBound,zBound)
    {
        this.view=view;
        this.bitmap=bitmap;
        this.waveSize=waveSize;
        this.wavePeriod=wavePeriod;
        this.waveHeight=waveHeight;
        this.waveUVStamp=waveUVStamp;
        this.uShift=uShift;
        this.vShift=vShift;
        this.tint=tint;
        
            // setup size
            
        this.xBound=xBound.copy();
        this.yBound=yBound.copy();
        this.zBound=zBound.copy();
            
        this.xBlockSize=Math.trunc(xBound.getSize()/waveSize);
        this.zBlockSize=Math.trunc(zBound.getSize()/waveSize);
        
            // null buffers

        this.vertexBuffer=null;
        this.uvBuffer=null;
        this.indexBuffer=null;
        
        this.vertices=null;
        this.uvs=null;
        
        this.indexCount=0;
        
        Object.seal(this);
    }
    
        //
        // close the liquid
        //
        
    close()
    {
        let gl=this.view.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexBuffer!==null) gl.deleteBuffer(this.vertexBuffer);
        if (this.uvBuffer!==null) gl.deleteBuffer(this.uvBuffer);
        
        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // liquid buffers
        //

    updateBuffers()
    {
        let x,z,vx,vz,gx,gz,gxStart;
        let vIdx,uvIdx;
        let offRow,offCol,offColStart;
        
            // get the y offsets for waves
        
        let offY=this.view.getPeriodicCos(this.wavePeriod,this.waveHeight);
        
            // create mesh
            
        vIdx=0;
        uvIdx=0;
        
        vz=this.zBound.min;
        gz=((Math.abs(vz)/this.waveSize)*this.waveUVStamp)+(this.view.timestamp*this.vShift);
        gz=gz-Math.trunc(gz);
        offRow=Math.trunc(vz/this.waveSize)&0x1;
        
        gxStart=((Math.abs(this.xBound.min)/this.waveSize)*this.waveUVStamp)+(this.view.timestamp*this.uShift);
        gxStart=gxStart-Math.trunc(gxStart);
        offColStart=Math.trunc(this.xBound.min/this.waveSize)&0x1;
        
        for (z=0;z!==(this.zBlockSize+1);z++) {
            
            vx=this.xBound.min;
            
            gx=gxStart;
            offCol=offColStart;
            
            for (x=0;x!==(this.xBlockSize+1);x++) {
                this.vertices[vIdx++]=vx;
                if (this.uShift>this.vShift) {
                    this.vertices[vIdx++]=((offCol&0x1)===0)?(this.yBound.max-offY):(this.yBound.max+offY);
                }
                else {
                    this.vertices[vIdx++]=((offRow&0x1)===0)?(this.yBound.max-offY):(this.yBound.max+offY);
                }
                this.vertices[vIdx++]=vz;
                
                this.uvs[uvIdx++]=gx;
                this.uvs[uvIdx++]=gz;
                
                vx+=this.waveSize;
                gx+=this.waveUVStamp;
                
                offCol++;
            }
            
            vz+=this.waveSize;
            gz+=this.waveUVStamp;
            
            offRow++;
        }
    }
    
    setupBuffers()
    {
        let x,z,iIdx,vIdx,vTopIdx,vBotIdx;
        let nVertex,nSegment,indexes;
        let gl=this.view.gl;
        
            // create the buffers
            
        this.vertexBuffer=gl.createBuffer();
        this.uvBuffer=gl.createBuffer();
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
    
    bindBuffers()
    {
        let gl=this.view.gl;

            // water vertices and UVs are always moving
            // so always update these buffers
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.view.shaderList.mapLiquidShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(this.view.shaderList.mapLiquidShader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

            // indexes are static
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    }
    
        //
        // liquid drawing
        //

    draw()
    {
        let gl=this.view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
        
        this.view.drawMeshCount++;
        this.view.drawTrigCount+=Math.trunc(this.indexCount/3);
    }
    
}
