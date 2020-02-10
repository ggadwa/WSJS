import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import LightClass from '../light/light.js';
import ProjectEffectClass from '../project/project_effect.js';

class ProjectEffectChunkClass
{
    constructor(bitmap,glDrawType,indexCount,drawMode,motionPoints,grid,gridPeriod,gridOffset,wave,waveRandomStart,wavePeriod,waveSize)
    {
        let n;
        
        this.bitmap=bitmap;
        this.glDrawType=glDrawType;
        this.indexCount=indexCount;
        this.drawMode=drawMode;
        this.motionPoints=motionPoints;
        
            // sprite catalog/grid type setup
            
        this.grid=grid;
        this.gridSquareRoot=Math.trunc(Math.sqrt(this.grid));
        this.gridPeriod=gridPeriod;
        this.gridOffset=gridOffset;
        
        if (grid===1) {
            this.uSize=this.vSize=1.0;
        }
        else {
            this.uSize=this.vSize=1.0/this.gridSquareRoot;
        }
        
            // offsets into gl buffers
            
        this.vertexOffset=0;
        this.indexOffset=0;
        
            // frame based items
            
        this.spread=0.0;
        this.width=0;
        this.height=0;
        this.rotate=0;
        this.color=new ColorClass(1,1,1);
        this.alpha=1.0;
        
        this.drawPoints=[];
        
        if (this.motionPoints!==null) {
            for (n=0;n!==this.motionPoints.length;n++) {
                this.drawPoints.push(new PointClass(0,0,0));
            }
        }
        
            // waves
            
        this.wave=wave;
        this.wavePeriod=wavePeriod;
        this.waveSize=waveSize;
        this.wavePeriodicTickOffset=new Int32Array(12);
            
        if ((wave) && (waveRandomStart)) {
            for (n=0;n!==12;n++) {
                this.wavePeriodicTickOffset[n]=Math.random()*wavePeriod;
            }
        }
        
        Object.seal(this);
    }
}

//
// json entity class
//

export default class EffectJsonClass extends ProjectEffectClass
{
    constructor(core,position,data,show)
    {
        super(core,position,data,show);
        
        this.DRAW_MODE_OPAQUE=0;
        this.DRAW_MODE_TRANSPARENT=1;
        this.DRAW_MODE_ADDITIVE=2;
        
        this.startTimestamp=0;
        
        this.vertexes=null;
        this.uvs=null;
        this.indexes=null;
        
        this.vertexIdx=0;
        this.uvIdx=0;
        this.indexIdx=0;
        
        this.vertexPosBuffer=null;
        this.vertexUVBuffer=null;
        this.indexBuffer=null;
        
        this.chunks=[];
        
        this.xBound=new BoundClass(this.position.x,this.position.x);
        this.yBound=new BoundClass(this.position.y,this.position.y);
        this.zBound=new BoundClass(this.position.z,this.position.z);
        
        this.tempPoint=new PointClass(0,0,0);
        this.motionPoint=new PointClass(0,0,0);
        
        this.light=null;
    }
    
    getJson()
    {
        return(null);
    }
    
    initialize()
    {
        let n,billboard,triangle,particle;
        let drawMode,grid,bitmap;
        let dx,dy,dz,motionPoints;
        let vertexCount,indexCount;
        let gl=this.core.gl;
        let drawModeList=['opaque','transparent','additive'];
        
        super.initialize();
        
        try {
            this.json=this.getJson();   // eventually need to parse from file here
        }
        catch (e) {
            console.info('JSON is bad: '+e);
            return(false);
        }
        
        this.startTimestamp=this.core.timestamp;
        
            // lights
            
        if (this.json.light!==undefined) {
            this.light=new LightClass(this.position.copy(),new ColorClass(1.0,1.0,1.0),0,1.0,false);
        }
        
            // setup the chunk classes and
            // calculate the needed vertexes and indexes

        vertexCount=0;
        indexCount=0;
        
        this.chunks=[];
        
        if (this.json.billboards!==undefined) {
            
            for (billboard of this.json.billboards) {
                
                    // setup the chunk

                drawMode=drawModeList.indexOf(billboard.mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+billboard.mode);
                    return(false);
                }
                
                grid=(billboard.grid===undefined)?1:billboard.grid;
                
                bitmap=this.core.bitmapList.get(billboard.bitmap);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+billboard.bitmap);
                    return(false);
                }
                
                this.chunks.push(new ProjectEffectChunkClass(bitmap,gl.TRIANGLES,6,drawMode,null,grid,billboard.gridPeriod,billboard.gridOffset,billboard.wave,billboard.waveRandomStart,billboard.wavePeriod,billboard.waveSize));
                
                    // drawing one quad
                    
                vertexCount+=4;
                indexCount+=6;
            }
        }
            
        if (this.json.triangles!==undefined) {
            
            for (triangle of this.json.triangles) {
                
                    // setup the chunk

                drawMode=drawModeList.indexOf(triangle.mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+triangle.mode);
                    return(false);
                }
                
                bitmap=this.core.bitmapList.get(triangle.bitmap);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+triangle.bitmap);
                    return(false);
                }
                
                this.chunks.push(new ProjectEffectChunkClass(bitmap,gl.TRIANGLES,3,drawMode,null,1,0,0,triangle.wave,triangle.waveRandomStart,triangle.wavePeriod,triangle.waveSize));
                
                    // drawing one quad
                    
                vertexCount+=3;
                indexCount+=3;
            }
        }
        
        if (this.json.particles!==undefined) {
            
            for (particle of this.json.particles) {
                
                    // setup the chunk

                drawMode=drawModeList.indexOf(particle.mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+particle.mode);
                    return(false);
                }
                
                grid=(particle.grid===undefined)?1:particle.grid;
                
                bitmap=this.core.bitmapList.get(particle.bitmap);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+particle.bitmap);
                    return(false);
                }
                
                    // need motion points
                    
                motionPoints=[];
                
                dx=particle.motion.x*2;
                dy=particle.motion.y*2;
                dz=particle.motion.z*2;

                for (n=0;n!==particle.count;n++) {
                    motionPoints.push(new PointClass((((dx*Math.random())-particle.motion.x)*0.5),(((dy*Math.random())-particle.motion.y)*0.5),(((dz*Math.random())-particle.motion.z))*0.5));  // multiply by 0.5 as these are "radius" but listed as "diameter"
                }
                
                this.chunks.push(new ProjectEffectChunkClass(bitmap,gl.TRIANGLES,(particle.count*6),drawMode,motionPoints,grid,particle.gridPeriod,particle.gridOffset,false,false,0,0));
                    
                    // count quads
                    
                vertexCount+=(particle.count*4);
                indexCount+=(particle.count*6);
            }
        }

            // webgl buffers
            
        if (indexCount!==0) {
        
                // internal vertexes, uvs and indexes

            this.vertexes=new Float32Array(vertexCount*3);
            this.uvs=new Float32Array(vertexCount*2);
            this.indexes=new Uint16Array(indexCount);

                // add data to buffer so we can use
                // subdata later

            this.vertexPosBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);

            this.vertexUVBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER,null);

            this.indexBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        }
        
            // finally any sound
            
        if (this.json.sound!==undefined) this.core.soundList.play(this,null,this.json.sound.name,this.json.sound.rate,this.json.sound.loop);
       
        return(true);
    }
    
    release()
    {
        let gl=this.core.gl;
     
        if (this.vertexPosBuffer!==null) {
            gl.deleteBuffer(this.vertexPosBuffer);
            gl.deleteBuffer(this.vertexUVBuffer);
            gl.deleteBuffer(this.indexBuffer);
        }
    }
    
        //
        // vertex list adds
        //
        
    addQuadToVertexList(chunk,centerPnt)
    {
        let gridIdx,u,v;
        let halfWid,halfHigh;
        let elementIdx=Math.trunc(this.vertexIdx/3);
        
            // the grid
            
        if (chunk.grid!==1) {
            gridIdx=Math.trunc(((this.core.timestamp%chunk.gridPeriod)/chunk.gridPeriod)*chunk.grid);
            gridIdx=(gridIdx+chunk.gridOffset)%chunk.grid;
            
            u=(gridIdx%chunk.gridSquareRoot)*chunk.vSize;
            v=(Math.trunc(gridIdx/chunk.gridSquareRoot))*chunk.uSize;
        }
        else {
            u=v=0.0;
        }
        
            // need half width/height
            
        halfWid=Math.trunc(chunk.width*0.5);
        halfHigh=Math.trunc(chunk.height*0.5);
       
            // top left
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v;

            // top right
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+chunk.uSize;
        this.uvs[this.uvIdx++]=v;

            // bottom right
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+chunk.uSize;
        this.uvs[this.uvIdx++]=v+chunk.vSize;

            // bottom left
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v+chunk.vSize;

            // build the triangles

        this.indexes[this.indexIdx++]=elementIdx;     // triangle 1
        this.indexes[this.indexIdx++]=elementIdx+1;
        this.indexes[this.indexIdx++]=elementIdx+2;

        this.indexes[this.indexIdx++]=elementIdx;     // triangle 2
        this.indexes[this.indexIdx++]=elementIdx+2;
        this.indexes[this.indexIdx++]=elementIdx+3;
    }
    
    addTriangleToVertexList(chunk,triangle)
    {
        let elementIdx=Math.trunc(this.vertexIdx/3);
        
            // build the triangle
            
        this.vertexes[this.vertexIdx++]=triangle.v0.x;
        this.vertexes[this.vertexIdx++]=triangle.v0.y;
        this.vertexes[this.vertexIdx++]=triangle.v0.z;

        this.uvs[this.uvIdx++]=triangle.v0.u;
        this.uvs[this.uvIdx++]=triangle.v0.v;

        this.vertexes[this.vertexIdx++]=triangle.v1.x;
        this.vertexes[this.vertexIdx++]=triangle.v1.y;
        this.vertexes[this.vertexIdx++]=triangle.v1.z;

        this.uvs[this.uvIdx++]=triangle.v1.u;
        this.uvs[this.uvIdx++]=triangle.v1.v;
        
        this.vertexes[this.vertexIdx++]=triangle.v2.x;
        this.vertexes[this.vertexIdx++]=triangle.v2.y;
        this.vertexes[this.vertexIdx++]=triangle.v2.z;

        this.uvs[this.uvIdx++]=triangle.v2.u;
        this.uvs[this.uvIdx++]=triangle.v2.v;

        this.indexes[this.indexIdx++]=elementIdx;
        this.indexes[this.indexIdx++]=elementIdx+1;
        this.indexes[this.indexIdx++]=elementIdx+2;
    }
    
        //
        // waves
        //
        
    addWave(chunk)
    {
        let n,freq;
        let vertexCount=chunk.indexCount*3;
        
        if (!chunk.wave) return;
        
        for (n=0;n!==vertexCount;n++) {
            freq=(((this.core.timestamp+chunk.wavePeriodicTickOffset[n])%chunk.wavePeriod)/chunk.wavePeriod)*(Math.PI*2);
            this.vertexes[chunk.vertexOffset+n]+=Math.trunc(Math.sin(freq)*chunk.waveSize);
        }
    }

        //
        // frame tweening
        //
        
    tweenLightFrames()
    {
        let n,f,tick,lastTick,frames;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        let r,g,b;
        
        if (this.light===null) return;
        
        frames=this.json.light.frames;
        
            // if there is only one frame, no tweening
            
        frameCount=frames.length;
        if (frameCount===1) {
            startFrame=frames[0];
            this.light.color.setFromValues(startFrame.color.r,startFrame.color.g,startFrame.color.b);
            this.light.exponent=startFrame.exponent;
            this.light.setIntensity(startFrame.intensity);
            return;
        }
        
            // get the last frame and within cycle tick
            
        lastTick=frames[frameCount-1].tick;
        
        tick=((this.core.timestamp-this.startTimestamp)%lastTick);
        
            // find the tween points
            
        startIdx=0;
        endIdx=frameCount-1;
        
        for (n=0;n!==frameCount;n++) {
            if (tick<=frames[n].tick) {
                endIdx=n;
                break;
            }
            startIdx=n;
        }
        
            // tween factor
            
        startFrame=frames[startIdx];
        endFrame=frames[endIdx];
         
        if (startIdx===endIdx) {
            f=1;
        }
        else {
            f=(tick-startFrame.tick)/(endFrame.tick-startFrame.tick);
        }
        
            // tween
            
        r=startFrame.color.r+((endFrame.color.r-startFrame.color.r)*f);
        g=startFrame.color.g+((endFrame.color.g-startFrame.color.g)*f);
        b=startFrame.color.b+((endFrame.color.b-startFrame.color.b)*f);
        
        this.light.color.setFromValues(r,g,b);
        
        this.light.exponent=startFrame.exponent+((endFrame.exponent-startFrame.exponent)*f);
        this.light.setIntensity(startFrame.intensity+((endFrame.intensity-startFrame.intensity)*f));
    }
        
    tweenChunkFrames(frames,chunk)
    {
        let n,f,tick,lastTick;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        
            // if there is only one frame, no tweening
            
        frameCount=frames.length;
        if (frameCount===1) {
            startFrame=frames[0];
            if (startFrame.spread!==undefined) chunk.spread=startFrame.spread;
            if (startFrame.width!==undefined) chunk.width=startFrame.width;
            if (startFrame.height!==undefined) chunk.height=startFrame.height;
            if (startFrame.rotate!==undefined) chunk.rotate=startFrame.rotate;
            
            chunk.alpha=startFrame.alpha;
            chunk.color.r=startFrame.color.r;
            chunk.color.g=startFrame.color.g;
            chunk.color.b=startFrame.color.b;
            return;
        }
        
            // get the last frame and within cycle tick
            
        lastTick=frames[frameCount-1].tick;
        
        tick=((this.core.timestamp-this.startTimestamp)%lastTick);
        
            // find the tween points
            
        startIdx=0;
        endIdx=frameCount-1;
        
        for (n=0;n!==frameCount;n++) {
            if (tick<=frames[n].tick) {
                endIdx=n;
                break;
            }
            startIdx=n;
        }
        
            // tween factor
            
        startFrame=frames[startIdx];
        endFrame=frames[endIdx];
         
        if (startIdx===endIdx) {
            f=1;
        }
        else {
            f=(tick-startFrame.tick)/(endFrame.tick-startFrame.tick);
        }
        
            // tween
            
        if (startFrame.spread!==undefined) chunk.spread=startFrame.spread+((endFrame.spread-startFrame.spread)*f);
        if (startFrame.width!==undefined) chunk.width=startFrame.width+Math.trunc((endFrame.width-startFrame.width)*f);
        if (startFrame.height!==undefined) chunk.height=startFrame.height+Math.trunc((endFrame.height-startFrame.height)*f);
        if (startFrame.rotate!==undefined) chunk.rotate=startFrame.rotate+((endFrame.rotate-startFrame.rotate)*f);
        
        chunk.alpha=startFrame.alpha+((endFrame.alpha-startFrame.alpha)*f);
        chunk.color.r=startFrame.color.r+((endFrame.color.r-startFrame.color.r)*f);
        chunk.color.g=startFrame.color.g+((endFrame.color.g-startFrame.color.g)*f);
        chunk.color.b=startFrame.color.b+((endFrame.color.b-startFrame.color.b)*f);
    }
    
        //
        // mainline draw
        //
        
    drawSetup()
    {
        let n,billboard,triangle,particle;
        let chunk,chunkIdx;
        let halfWid,halfHigh;
        
            // effects with life tick
          
        if (this.json.lifeTick!==undefined) {
            if ((this.core.timestamp-this.startTimestamp)>this.json.lifeTick) {
                this.markDelete=true;
                return(false);
            }
        }
        
            // light frames
            
        this.tweenLightFrames();
        
            // no chunks, no draw
            
        if (this.chunks.length===0) return(false);
        
            // track the bounds as we look over the chunks
            
        this.xBound=new BoundClass(this.position.x,this.position.x);
        this.yBound=new BoundClass(this.position.y,this.position.y);
        this.zBound=new BoundClass(this.position.z,this.position.z);
        
            // setup any frames
            
        chunkIdx=0;
        
        if (this.json.billboards!==undefined) {
            
            for (billboard of this.json.billboards) {
                
                chunk=this.chunks[chunkIdx];
                this.tweenChunkFrames(billboard.frames,chunk);
                
                halfWid=Math.trunc(chunk.width*0.5);
                halfHigh=Math.trunc(chunk.height*0.5);
                
                this.xBound.adjust(this.position.x-halfWid);
                this.xBound.adjust(this.position.x+halfWid);
                this.yBound.adjust(this.position.y-halfHigh);
                this.yBound.adjust(this.position.y+halfHigh);
                this.zBound.adjust(this.position.z-halfWid);
                this.zBound.adjust(this.position.z+halfWid);
                
                chunkIdx++;
            }
        }
        
        if (this.json.triangles!==undefined) {
            
            for (triangle of this.json.triangles) {
                
                chunk=this.chunks[chunkIdx];
                this.tweenChunkFrames(triangle.frames,chunk);
                
                this.xBound.adjust(triangle.v0.x);
                this.xBound.adjust(triangle.v1.x);
                this.xBound.adjust(triangle.v2.x);
                this.yBound.adjust(triangle.v0.y);
                this.yBound.adjust(triangle.v1.y);
                this.yBound.adjust(triangle.v2.y);
                this.zBound.adjust(triangle.v0.z);
                this.zBound.adjust(triangle.v1.z);
                this.zBound.adjust(triangle.v2.z);
                
                chunkIdx++;
            }
        }    
            
        if (this.json.particles!==undefined) {
            
            for (particle of this.json.particles) {
                
                chunk=this.chunks[chunkIdx];
                this.tweenChunkFrames(particle.frames,chunk);
                
                halfWid=Math.trunc(chunk.width*0.5);
                halfHigh=Math.trunc(chunk.height*0.5);
                
                for (n=0;n!==particle.count;n++) {
                    chunk.drawPoints[n].x=this.position.x+(chunk.motionPoints[n].x*chunk.spread);
                    chunk.drawPoints[n].y=this.position.y+(chunk.motionPoints[n].y*chunk.spread);
                    chunk.drawPoints[n].z=this.position.z+(chunk.motionPoints[n].z*chunk.spread);
                    
                    this.xBound.adjust(chunk.drawPoints[n].x-halfWid);
                    this.xBound.adjust(chunk.drawPoints[n].x+halfWid);
                    this.yBound.adjust(chunk.drawPoints[n].y-halfHigh);
                    this.yBound.adjust(chunk.drawPoints[n].y+halfHigh);
                    this.zBound.adjust(chunk.drawPoints[n].z-halfWid);
                    this.zBound.adjust(chunk.drawPoints[n].z+halfWid);
                }
                
                chunkIdx++;
            }
        }

            // now determine if we can draw this
            
        return(this.boundBoxInFrustum(this.xBound,this.yBound,this.zBound,null));
    }
    
    draw()
    {
        let n,billboard,triangle,particle;
        let chunk,chunkIdx,currentDrawMode;
        let currentBitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.effectShader;
        
            // build the vertex list with the
            // parallel chunk list
            
        this.vertexIdx=0;
        this.uvIdx=0;
        this.indexIdx=0;
        
        chunkIdx=0;
        
        if (this.json.billboards!==undefined) {
            
            for (billboard of this.json.billboards) {
                chunk=this.chunks[chunkIdx];
                chunk.vertexOffset=this.vertexIdx;
                chunk.indexOffset=this.indexIdx;

                this.addQuadToVertexList(chunk,this.position);
                this.addWave(chunk);
                
                chunkIdx++;
            }
        }
        
        if (this.json.triangles!==undefined) {
            
            for (triangle of this.json.triangles) {
                chunk=this.chunks[chunkIdx];
                chunk.vertexOffset=this.vertexIdx;
                chunk.indexOffset=this.indexIdx;
                
                this.addTriangleToVertexList(chunk,triangle);
                this.addWave(chunk);
                
                chunkIdx++;
            }
        }    
        
        if (this.json.particles!==undefined) {
            
            for (particle of this.json.particles) {
                chunk=this.chunks[chunkIdx];
                chunk.vertexOffset=this.vertexIdx;
                chunk.indexOffset=this.indexIdx;
                
                for (n=0;n!==particle.count;n++) {
                    this.addQuadToVertexList(chunk,chunk.drawPoints[n]);
                }
                
                chunkIdx++;
            }
        }    
        
            // start the shader
            
        shader.drawStart();
        
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexes);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.uvs);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,this.indexes);
        
            // run through the chunks
            
        currentDrawMode=-1;
        currentBitmap=null;
            
        for (chunk of this.chunks) {
            
                // the draw mode
            
            if (chunk.drawMode!==currentDrawMode) {
                currentDrawMode=chunk.drawMode;
    
                switch (currentDrawMode)
                {
                    case this.DRAW_MODE_TRANSPARENT:
                        gl.blendFunc(this.core.gl.SRC_ALPHA,this.core.gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case this.DRAW_MODE_ADDITIVE:
                        gl.blendFunc(this.core.gl.SRC_ALPHA,this.core.gl.ONE);
                        break;
                    default:
                        gl.blendFunc(this.core.gl.ONE,this.core.gl.ZERO);
                        break;
                }
            }
            
                // bitmap switch

            if (chunk.bitmap!==currentBitmap) {
                currentBitmap=chunk.bitmap;
                chunk.bitmap.attachAsParticle();
            }
            
                // draw the chunk
                
            gl.uniform4f(shader.colorAlphaUniform,chunk.color.r,chunk.color.g,chunk.color.b,chunk.alpha);
            gl.drawElements(chunk.glDrawType,chunk.indexCount,gl.UNSIGNED_SHORT,(chunk.indexOffset*2));
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        
            // reset gl back to normal
        
        gl.disable(gl.BLEND);
        gl.depthMask(true);
        
        shader.drawEnd();
    }

}
