import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import LightClass from '../light/light.js';

class EffectChunkClass
{
    constructor(chunkType,bitmap,indexCount,drawMode,frames)
    {
        this.chunkType=chunkType;
        this.bitmap=bitmap;
        this.indexCount=indexCount;
        this.drawMode=drawMode;
        this.frames=frames;
        
            // sprite catalog/grid defaults
            
        this.grid=1;
        this.gridSquareRoot=1;
        this.gridPeriod=0;
        this.gridOffset=0;
        this.uSize=this.vSize=1.0;
        
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
        
            // particles
        
        this.particleCount=0;
        this.drawPoints=[];
        this.motionPoints=[];
        
            // triangles
            
        this.trigV0=null;
        this.trigV1=null;
        this.trigV2=null;
        
            // waves
            
        this.wave=false;
        this.wavePeriod=0;
        this.waveSize=0;
        this.wavePeriodicTickOffset=null;
        
        Object.seal(this);
    }
    
    setGrid(grid,gridPeriod,gridOffset)
    {
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
    }
    
    setWave(wave,waveRandomStart,wavePeriod,waveSize)
    {
        let n;
        
        this.wave=wave;
        this.wavePeriod=wavePeriod;
        this.waveSize=waveSize;
        this.wavePeriodicTickOffset=new Int32Array(12);
            
        if ((wave) && (waveRandomStart)) {
            for (n=0;n!==12;n++) {
                this.wavePeriodicTickOffset[n]=Math.random()*wavePeriod;
            }
        }
    }
    
    setTriangle(v0,v1,v2)
    {
        this.trigV0=v0;
        this.trigV1=v1;
        this.trigV2=v2;
    }
    
    setParticle(motionPoints)
    {
        let n;
        
        this.particleCount=motionPoints.length;
        this.motionPoints=motionPoints;
        
        for (n=0;n!==this.particleCount;n++) {
            this.drawPoints.push(new PointClass(0,0,0));
        }
    }
}

//
// effect class
//

export default class EffectClass
{
    constructor(core,spawnedBy,jsonName,position,data,mapSpawn,show)
    {
        this.CHUNK_BILLBOARD=0;
        this.CHUNK_TRIANGLE=1;
        this.CHUNK_PARTICLE=2;
        
        this.core=core;
        this.spawnedBy=spawnedBy;
        this.position=position.copy();
        this.data=data;
        this.mapSpawn=mapSpawn;
        this.show=show;
        
        this.jsonName=jsonName;
        this.json=null;
        
        this.DRAW_MODE_OPAQUE=0;
        this.DRAW_MODE_TRANSPARENT=1;
        this.DRAW_MODE_ADDITIVE=2;
        
        this.DRAW_MODE_LIST=['opaque','transparent','additive'];
        
        this.startTimestamp=0;
        
        this.vertexes=null;
        this.uvs=null;
        
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
    
    lookupValue(value)
    {
        return(this.core.game.lookupValue(value,this.data));
    }
    
    initialize()
    {
        let n,indexes,chunk,billboard,triangle,particle,bitmap;
        let name,mode,drawMode,grid,gridPeriod,gridOffset;
        let wave,waveRandomStart,wavePeriod,waveSize;
        let pmx,pmy,pmz,dx,dy,dz,motionPoints,dist;
        let vertexCount,indexCount;
        let elementIdx,iIdx;
        let gl=this.core.gl;
        
        this.startTimestamp=this.core.game.timestamp;
        
            // get the named json
            
        this.json=this.core.game.jsonEffectCache.get(this.jsonName);
        if (this.json===null) return(false);
        
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

                mode=this.lookupValue(billboard.mode);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+mode);
                    return(false);
                }
                
                
                name=this.lookupValue(billboard.bitmap);
                bitmap=this.core.bitmapList.get(name);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+name);
                    return(false);
                }
                
                chunk=new EffectChunkClass(this.CHUNK_BILLBOARD,bitmap,6,drawMode,billboard.frames);
                
                grid=(billboard.grid===undefined)?1:this.lookupValue(billboard.grid);
                gridPeriod=this.lookupValue(billboard.gridPeriod);
                gridOffset=this.lookupValue(billboard.gridOffset);
                chunk.setGrid(grid,gridPeriod,gridOffset);
                
                wave=this.lookupValue(billboard.wave);
                waveRandomStart=this.lookupValue(billboard.waveRandomStart);
                wavePeriod=this.lookupValue(billboard.wavePeriod);
                waveSize=this.lookupValue(billboard.waveSize);
                chunk.setWave(wave,waveRandomStart,wavePeriod,waveSize);
                
                this.chunks.push(chunk);
                
                    // drawing one quad
                    
                vertexCount+=4;
                indexCount+=6;
            }
        }
            
        if (this.json.triangles!==undefined) {
            
            for (triangle of this.json.triangles) {
                
                    // setup the chunk

                mode=this.lookupValue(triangle.mode);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+mode);
                    return(false);
                }
                
                name=this.lookupValue(triangle.bitmap);
                bitmap=this.core.bitmapList.get(name);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+name);
                    return(false);
                }
                
                chunk=new EffectChunkClass(this.CHUNK_TRIANGLE,bitmap,3,drawMode,triangle.frames);
                
                wave=this.lookupValue(triangle.wave);
                waveRandomStart=this.lookupValue(triangle.waveRandomStart);
                wavePeriod=this.lookupValue(triangle.wavePeriod);
                waveSize=this.lookupValue(triangle.waveSize);
                chunk.setWave(wave,waveRandomStart,wavePeriod,waveSize);
                
                chunk.setTriangle(this.lookupValue(triangle.v0),this.lookupValue(triangle.v1),this.lookupValue(triangle.v2));
                
                this.chunks.push(chunk);
                
                    // drawing one quad
                    
                vertexCount+=3;
                indexCount+=3;
            }
        }
        
        if (this.json.particles!==undefined) {
            
            for (particle of this.json.particles) {
                
                    // setup the chunk

                mode=this.lookupValue(particle.mode);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown effect draw mode: '+mode);
                    return(false);
                }
                
                
                name=this.lookupValue(particle.bitmap);
                bitmap=this.core.bitmapList.get(name);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+name);
                    return(false);
                }
                
                chunk=new EffectChunkClass(this.CHUNK_PARTICLE,bitmap,(particle.count*6),drawMode,particle.frames);
                
                grid=(particle.grid===undefined)?1:this.lookupValue(particle.grid);
                gridPeriod=this.lookupValue(particle.gridPeriod);
                gridOffset=this.lookupValue(particle.gridOffset);
                chunk.setGrid(grid,gridPeriod,gridOffset);
                
                    // need motion points
                    
                motionPoints=[];
                
                pmx=this.lookupValue(particle.motion.x);
                pmy=this.lookupValue(particle.motion.y);
                pmz=this.lookupValue(particle.motion.z);
                
                dx=pmx*2;
                dy=pmy*2;
                dz=pmz*2;

                for (n=0;n!==particle.count;n++) {
                    motionPoints.push(new PointClass((((dx*Math.random())-pmx)*0.5),(((dy*Math.random())-pmy)*0.5),(((dz*Math.random())-pmz))*0.5));  // multiply by 0.5 as these are "radius" but listed as "diameter"
                }
                
                chunk.setParticle(motionPoints);
                
                this.chunks.push(chunk);
                    
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
            indexes=new Uint16Array(indexCount);    // static

                // add data to buffer so we can use
                // subdata later, vertexes and uv are dynamic

            this.vertexPosBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);

            this.vertexUVBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
            gl.bufferData(gl.ARRAY_BUFFER,this.uvs,gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER,null);
            
                // indexes are static
                
            elementIdx=0;
            iIdx=0;
            
            for (chunk of this.chunks) {
                
                chunk.vertexOffset=elementIdx*3;
                chunk.indexOffset=iIdx;
                
                switch (chunk.chunkType) {
                    

                    case this.CHUNK_BILLBOARD:
                        indexes[iIdx++]=elementIdx;     // triangle 1
                        indexes[iIdx++]=elementIdx+1;
                        indexes[iIdx++]=elementIdx+2;
                        indexes[iIdx++]=elementIdx;     // triangle 2
                        indexes[iIdx++]=elementIdx+2;
                        indexes[iIdx++]=elementIdx+3;
                        elementIdx+=4;
                        break;

                    case this.CHUNK_TRIANGLE:
                        indexes[iIdx++]=elementIdx;     // triangle 1
                        indexes[iIdx++]=elementIdx+1;
                        indexes[iIdx++]=elementIdx+2;
                        elementIdx+=3;
                        break;

                    case this.CHUNK_PARTICLE:
                        for (n=0;n!==chunk.particleCount;n++) {
                            indexes[iIdx++]=elementIdx;     // triangle 1
                            indexes[iIdx++]=elementIdx+1;
                            indexes[iIdx++]=elementIdx+2;
                            indexes[iIdx++]=elementIdx;     // triangle 2
                            indexes[iIdx++]=elementIdx+2;
                            indexes[iIdx++]=elementIdx+3;
                            elementIdx+=4;
                        }
                        break;
                }
                
            }
            
            this.indexBuffer=gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexes,gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
        }
        
            // finally any start sound, shaking or damage
            
        if (this.json.sounds!==undefined) this.core.soundList.playJson(this.position,this.json.sounds.start);
        
        if (this.json.shake!==undefined) {
            dist=this.position.distance(this.core.game.map.entityList.getPlayer().position);
            if (dist<this.json.shake.distance) this.core.game.startCameraShake(this.json.shake.lifeTick,Math.trunc((this.json.shake.maxShift*dist)/this.json.shake.distance));
        }
        
        if (this.json.damage!==undefined) this.core.game.map.entityList.damageForRadius(this.spawnedBy,this.position,this.json.damage.distance,this.json.damage.damage);
       
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
        
            // the grid
            
        if (chunk.grid!==1) {
            gridIdx=Math.trunc(((this.core.game.timestamp%chunk.gridPeriod)/chunk.gridPeriod)*chunk.grid);
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
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

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
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

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
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

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
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.game.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v+chunk.vSize;
    }
    
    addTriangleToVertexList(chunk)
    {
            // build the triangle
            
        this.vertexes[this.vertexIdx++]=chunk.trigV0.x;
        this.vertexes[this.vertexIdx++]=chunk.trigV0.y;
        this.vertexes[this.vertexIdx++]=chunk.trigV0.z;

        this.uvs[this.uvIdx++]=chunk.trigV0.u;
        this.uvs[this.uvIdx++]=chunk.trigV0.v;

        this.vertexes[this.vertexIdx++]=chunk.trigV1.x;
        this.vertexes[this.vertexIdx++]=chunk.trigV1.y;
        this.vertexes[this.vertexIdx++]=chunk.trigV1.z;

        this.uvs[this.uvIdx++]=chunk.trigV1.u;
        this.uvs[this.uvIdx++]=chunk.trigV1.v;
        
        this.vertexes[this.vertexIdx++]=chunk.trigV2.x;
        this.vertexes[this.vertexIdx++]=chunk.trigV2.y;
        this.vertexes[this.vertexIdx++]=chunk.trigV2.z;

        this.uvs[this.uvIdx++]=chunk.trigV2.u;
        this.uvs[this.uvIdx++]=chunk.trigV2.v;
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
            freq=(((this.core.game.timestamp+chunk.wavePeriodicTickOffset[n])%chunk.wavePeriod)/chunk.wavePeriod)*(Math.PI*2);
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
            this.light.setIntensity(this.lookupValue(startFrame.intensity));
            return;
        }
        
            // get the last frame and within cycle tick
            
        lastTick=frames[frameCount-1].tick;
        
        tick=((this.core.game.timestamp-this.startTimestamp)%lastTick);
        
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
        this.light.setIntensity(this.lookupValue(startFrame.intensity)+((this.lookupValue(endFrame.intensity)-this.lookupValue(startFrame.intensity))*f));
    }
        
    tweenChunkFrames(chunk)
    {
        let n,f,tick,lastTick;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        
            // if there is only one frame, no tweening
            
        frameCount=chunk.frames.length;
        if (frameCount===1) {
            startFrame=chunk.frames[0];
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
            
        lastTick=chunk.frames[frameCount-1].tick;
        tick=((this.core.game.timestamp-this.startTimestamp)%lastTick);
        
            // if there is a life tick and we are equal
            // or over, just pick the last frame
            
        if (this.json.lifeTick!==undefined) {
            if ((this.core.game.timestamp-this.startTimestamp)>=this.json.lifeTick) {
                startFrame=chunk.frames[frameCount-1];
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
        }
        
            // find the tween points
            
        startIdx=0;
        endIdx=frameCount-1;
        
        for (n=0;n!==frameCount;n++) {
            if (tick<=chunk.frames[n].tick) {
                endIdx=n;
                break;
            }
            startIdx=n;
        }
        
            // tween factor
            
        startFrame=chunk.frames[startIdx];
        endFrame=chunk.frames[endIdx];
         
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
        let n;
        let chunk;
        let halfWid,halfHigh;
        
            // effects with life tick
          
        if (this.json.lifeTick!==undefined) {
            if ((this.core.game.timestamp-this.startTimestamp)>this.json.lifeTick) {
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
            
        for (chunk of this.chunks) {
            
            this.tweenChunkFrames(chunk);
            
            switch (chunk.chunkType) {
                
                case this.CHUNK_BILLBOARD:
                    halfWid=Math.trunc(chunk.width*0.5);
                    halfHigh=Math.trunc(chunk.height*0.5);

                    this.xBound.adjust(this.position.x-halfWid);
                    this.xBound.adjust(this.position.x+halfWid);
                    this.yBound.adjust(this.position.y-halfHigh);
                    this.yBound.adjust(this.position.y+halfHigh);
                    this.zBound.adjust(this.position.z-halfWid);
                    this.zBound.adjust(this.position.z+halfWid);
                    break;
                    
                case this.CHUNK_TRIANGLE:
                    this.xBound.adjust(chunk.trigV0.x);
                    this.xBound.adjust(chunk.trigV1.x);
                    this.xBound.adjust(chunk.trigV2.x);
                    this.yBound.adjust(chunk.trigV0.y);
                    this.yBound.adjust(chunk.trigV1.y);
                    this.yBound.adjust(chunk.trigV2.y);
                    this.zBound.adjust(chunk.trigV0.z);
                    this.zBound.adjust(chunk.trigV1.z);
                    this.zBound.adjust(chunk.trigV2.z);
                    break;
                    
                case this.CHUNK_PARTICLE:
                    halfWid=Math.trunc(chunk.width*0.5);
                    halfHigh=Math.trunc(chunk.height*0.5);

                    for (n=0;n!==chunk.particleCount;n++) {
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
                    break;
            }
        }

            // now determine if we can draw this
            
        return(this.core.game.boundBoxInFrustum(this.xBound,this.yBound,this.zBound,null));
    }
    
    draw()
    {
        let n;
        let chunk,currentDrawMode;
        let currentBitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.effectShader;
        
            // build the vertex list with the
            // parallel chunk list
            
        this.vertexIdx=0;
        this.uvIdx=0;
        this.indexIdx=0;
        
        for (chunk of this.chunks) {
            
            switch (chunk.chunkType) {
                
                case this.CHUNK_BILLBOARD:
                    this.addQuadToVertexList(chunk,this.position);
                    this.addWave(chunk);
                    break;
                    
                case this.CHUNK_TRIANGLE:
                    this.addTriangleToVertexList(chunk);
                    this.addWave(chunk);
                    break;
                    
                case this.CHUNK_PARTICLE:
                    for (n=0;n!==chunk.particleCount;n++) {
                        this.addQuadToVertexList(chunk,chunk.drawPoints[n]);
                    }
                    break;
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
                chunk.bitmap.attach();
            }
            
                // draw the chunk
                
            gl.uniform4f(shader.colorAlphaUniform,chunk.color.r,chunk.color.g,chunk.color.b,chunk.alpha);
            gl.drawElements(gl.TRIANGLES,chunk.indexCount,gl.UNSIGNED_SHORT,(chunk.indexOffset*2));
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
