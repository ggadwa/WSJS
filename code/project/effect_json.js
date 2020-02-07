import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';
import LightClass from '../light/light.js';
import ProjectEffectClass from '../project/project_effect.js';

class ProjectEffectChunkClass2
{
    constructor(bitmap,glDrawType,indexCount,drawMode)
    {
        this.bitmap=bitmap;
        this.glDrawType=glDrawType;
        this.indexCount=indexCount;
        this.drawMode=drawMode;
        
        this.vertexOffset=0;
        this.indexOffset=0;
        
        this.width=0;
        this.height=0;
        this.rotate=0;
        this.color=new ColorClass(1,1,1);
        this.alpha=1.0;
        
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
        
        this.light=new LightClass(new PointClass(0,0,0),new ColorClass(1.0,1.0,1.0),0,1.0,false);
        this.light.position.setFromPoint(position);
    }
    
    getJson()
    {
        return(null);
    }
    
    initialize()
    {
        let billboard,triangle;
        let drawMode,bitmap;
        let vertexCount,indexCount;
        let gl=this.core.gl;
        let drawModeList=['opaque','transparent','additive'];
        
        super.initialize();
        
        this.json=this.getJson();
        
            // lights
            
        this.light.color.setFromValues(this.json.light.color.r,this.json.light.color.g,this.json.light.color.b);
        this.light.exponent=this.json.light.exponent;
        this.light.setIntensity(this.json.light.intensity);
        
        if (this.json.light.glow) {
            this.lightIntensityGlowDrop=Math.trunc(this.json.light.intensity*this.json.light.glowPercentage);
            this.lightPeriodicTick=this.json.light.glowPeriod;
            this.lightPeriodicTickOffset=(this.json.light.glowRandomStart)?Math.trunc(Math.random()*this.lightPeriodicTick):0;
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
                
                bitmap=this.core.bitmapList.get(billboard.bitmap);
                if (bitmap===undefined) {
                    console.log('Unknown effect bitmap: '+billboard.bitmap);
                    return(false);
                }
                
                this.chunks.push(new ProjectEffectChunkClass2(bitmap,gl.TRIANGLES,6,drawMode));
                
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
                
                this.chunks.push(new ProjectEffectChunkClass2(bitmap,gl.TRIANGLES,3,drawMode));
                
                    // drawing one quad
                    
                vertexCount+=3;
                indexCount+=3;
            }
        }


               
               
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
        
    addQuadToVertexList(chunk,centerPnt,u,v,uSize,vSize)
    {
        let elementIdx=Math.trunc(this.vertexIdx/3);
         
            // remember offsets
            
        chunk.vertexOffset=this.vertexIdx;
        chunk.indexOffset=this.indexIdx;
       
            // top left
            
        this.tempPoint.x=-chunk.width;
        this.tempPoint.y=-chunk.height;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v;

            // top right
            
        this.tempPoint.x=chunk.width;
        this.tempPoint.y=-chunk.height;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+uSize;
        this.uvs[this.uvIdx++]=v;

            // bottom right
            
        this.tempPoint.x=chunk.width;
        this.tempPoint.y=chunk.height;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+uSize;
        this.uvs[this.uvIdx++]=v+vSize;

            // bottom left
            
        this.tempPoint.x=-chunk.width;
        this.tempPoint.y=chunk.height;
        this.tempPoint.z=0.0;
        if (chunk.rotate!==0.0) this.tempPoint.rotateZ(null,chunk.rotate);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v+vSize;

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
        
            // remember offsets
            
        chunk.vertexOffset=this.vertexIdx;
        chunk.indexOffset=this.indexIdx;
        
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
        // frame tweening
        //
        
    tweenFrames(frames,chunk)
    {
        let n,f,tick,lastTick;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        
            // if there is only one frame, no tweening
            
        frameCount=frames.length;
        if (frameCount===1) {
            startFrame=frames[0];
            chunk.width=startFrame.width;
            chunk.height=startFrame.height;
            chunk.rotate=startFrame.rotate;
            chunk.alpha=startFrame.alpha;
            chunk.color.r=startFrame.color.r;
            chunk.color.g=startFrame.color.g;
            chunk.color.b=startFrame.color.b;
            return;
        }
        
            // get the last frame and within cycle tick
            
        lastTick=frames[frameCount-1].tick;
        
        tick=(this.core.timestamp%lastTick);
        
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
            
        chunk.width=startFrame.width+Math.trunc((endFrame.width-startFrame.width)*f);
        chunk.height=startFrame.height+Math.trunc((endFrame.height-startFrame.height)*f);
        chunk.rotate=startFrame.rotate+((endFrame.rotate-startFrame.rotate)*f);
        
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
        let billboard,triangle;
        let chunk,chunkIdx;
        let glowFreq;
        
            // any light glow effect
            
        if (this.json.light.glow) {
            glowFreq=(((this.core.timestamp+this.lightPeriodicTickOffset)%this.lightPeriodicTick)/this.lightPeriodicTick)*(Math.PI*2);
            this.light.setIntensity(this.json.light.intensity-(Math.trunc(Math.sin(glowFreq)*this.lightIntensityGlowDrop)));
        }
        
            // track the bounds as we look over the chunks
            
        this.xBound=new BoundClass(this.position.x,this.position.x);
        this.yBound=new BoundClass(this.position.y,this.position.y);
        this.zBound=new BoundClass(this.position.z,this.position.z);
        
            // setup any frames
            
        chunkIdx=0;
        
        if (this.json.billboards!==undefined) {
            
            for (billboard of this.json.billboards) {
                
                chunk=this.chunks[chunkIdx];
                this.tweenFrames(billboard.frames,chunk);
                
                this.xBound.adjust(this.position.x-chunk.width);
                this.xBound.adjust(this.position.x+chunk.width);
                this.yBound.adjust(this.position.y-chunk.height);
                this.yBound.adjust(this.position.y+chunk.height);
                this.zBound.adjust(this.position.z-chunk.width);
                this.zBound.adjust(this.position.z+chunk.width);
                
                chunkIdx++;
            }
        }
        
        if (this.json.triangles!==triangle) {
            
            for (triangle of this.json.triangles) {
                
                chunk=this.chunks[chunkIdx];
                this.tweenFrames(triangle.frames,chunk);
                
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

            // now determine if we can draw this
            
        return(this.boundBoxInFrustum(this.xBound,this.yBound,this.zBound,null));
    }
    
    draw()
    {
        let billboard,triangle;
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
                this.addQuadToVertexList(chunk,this.position,0.0,0.0,1.0,1.0);
                chunkIdx++;
            }
        }
        
        if (this.json.triangles!==triangle) {
            
            for (triangle of this.json.triangles) {
                chunk=this.chunks[chunkIdx];
                this.addTriangleToVertexList(chunk,triangle);
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
