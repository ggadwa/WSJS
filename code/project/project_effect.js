import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import LightClass from '../light/light.js';

class ProjectEffectChunkClass
{
    constructor(bitmap,glDrawType,indexOffset,indexCount,drawMode,color,alpha)
    {
        this.bitmap=bitmap;
        this.glDrawType=glDrawType;
        this.indexOffset=indexOffset;
        this.indexCount=indexCount;
        this.drawMode=drawMode;
        this.color=color;
        this.alpha=alpha;
        
        Object.seal(this);
    }
}

export default class ProjectEffectClass
{
    static DRAW_MODE_OPAQUE=0;
    static DRAW_MODE_TRANSPARENT=1;
    static DRAW_MODE_ADDITIVE=2;
    
    constructor(core,position,data,show)
    {
        this.core=core;
        
        this.position=position.copy();
        this.data=data;
        
        this.show=show;
        this.markDelete=false;
        
        this.setupOK=true;      // a flag to tell when drawSetup() returns FALSE as drawSetup and draw are done separately
        
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

        this.tempPoint=new PointClass(0,0,0);
        this.motionPoint=new PointClass(0,0,0);
        
        this.light=new LightClass(new PointClass(0,0,0),new ColorClass(1.0,1.0,1.0),0,1.0);
        this.light.position.setFromPoint(position);
    }
    
    initialize()
    {
        return(true);
    }
    
    release()
    {
    }
    
        //
        // meshes and liquids
        //
        
    getMeshList()
    {
        return(this.core.map.meshList);
    }
    
    getLiquidList()
    {
        return(this.core.map.liquidList);
    }
    
        //
        // light utilities
        //
        
    setLightColor(color,exponent)
    {
        this.light.color.setFromColor(color);
    }
    
    setLightPosition(position)
    {
        this.light.position.setFromPoint(position);
    }
    
    setLightIntensity(intensity)
    {
        this.light.setIntensity(intensity);
    }
    
    setLightExponent(exponent)
    {
        this.light.exponent=exponent;
    }
    
        //
        // sounds
        //
        
    playSound(name,rate,loop)
    {
        return(this.core.soundList.play(this,null,name,rate,loop));
    }
    
    playSoundAtEntity(entity,name,rate,loop)
    {
        return(this.core.soundList.play(entity,null,name,rate,loop));
    }
    
    playGlobal(name,rate,loop)
    {
        return(this.core.soundList.play(null,null,name,rate,loop));
    }
    
    stopSound(playIdx)
    {
        this.core.soundList.stop(playIdx);
    }
    
    changeSoundRate(playIdx,rate)
    {
        this.core.soundList.changeRate(playIdx,rate);
    }
    
        //
        // random move utilities
        //
        
    createRandomMotionArray(count,x,y,z)
    {
        let n;
        let dx=x*2;
        let dy=y*2;
        let dz=z*2;
        let motions=[];
        
        for (n=0;n!==count;n++) {
            motions.push(new PointClass(((dx*Math.random())-x),((dy*Math.random())-y),((dz*Math.random())-z)));
        }
        
        return(motions);
    }
    
        //
        // times and periodics
        //
        
    getTimestamp()
    {
        return(this.core.timestamp);
    }
    
    getPeriodicCos(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicCos(millisecondPeriod,amplitude));
    }
    
    getPeriodicSin(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicSin(millisecondPeriod,amplitude));
    }
    
    getPeriodicLinear(millisecondPeriod,amplitude)
    {
        return(this.core.getPeriodicLinear(millisecondPeriod,amplitude));
    }
    
        //
        // frustum checks
        //
    
    boundBoxInFrustum(xBound,yBound,zBound)
    {
        return(this.core.boundBoxInFrustum(xBound,yBound,zBound));
    }
    
        //
        // drawing routines
        //
        
    drawInitialize(vertexCount,indexCount)
    {
        let gl=this.core.gl;
        
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
    
    drawRelease()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexPosBuffer);
        gl.deleteBuffer(this.vertexUVBuffer);
        gl.deleteBuffer(this.indexBuffer);
    }
    
    drawStart()
    {
        this.vertexIdx=0;
        this.uvIdx=0;
        this.indexIdx=0;
        
        this.chunks.length=0;
    }
   
    drawAddBillboardQuadInternal(bitmap,centerPnt,u,v,uSize,vSize,halfWid,halfHigh,rot,drawMode,color,alpha)
    {
        let elementIdx=Math.trunc(this.vertexIdx/3);
        
            // add in this chunk for drawing
            
        this.chunks.push(new ProjectEffectChunkClass(bitmap,this.core.gl.TRIANGLES,this.indexIdx,6,drawMode,color,alpha));
        
            // top left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u;
        this.uvs[this.uvIdx++]=v;

            // top right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=-halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+uSize;
        this.uvs[this.uvIdx++]=v;

            // bottom right
            
        this.tempPoint.x=halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
        this.tempPoint.matrixMultiplyIgnoreTransform(this.core.billboardMatrix);

        this.vertexes[this.vertexIdx++]=this.tempPoint.x+centerPnt.x;
        this.vertexes[this.vertexIdx++]=this.tempPoint.y+centerPnt.y;
        this.vertexes[this.vertexIdx++]=this.tempPoint.z+centerPnt.z;

        this.uvs[this.uvIdx++]=u+uSize;
        this.uvs[this.uvIdx++]=v+vSize;

            // bottom left
            
        this.tempPoint.x=-halfWid;
        this.tempPoint.y=halfHigh;
        this.tempPoint.z=0.0;
        if (rot!==0.0) this.tempPoint.rotateZ(null,rot);
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
    
    drawAddBillboardQuad(colorURL,centerPnt,u,v,uSize,vSize,halfWid,halfHigh,rot,drawMode,color,alpha)
    {
        let bitmap=this.core.bitmapList.get(colorURL);
        if (bitmap!==undefined) this.drawAddBillboardQuadInternal(bitmap,centerPnt,u,v,uSize,vSize,halfWid,halfHigh,rot,drawMode,color,alpha);
    }
    
    drawAddBillboardQuadFromMotion(colorURL,motions,factor,centerPnt,u,v,uSize,vSize,halfWid,halfHigh,rot,drawMode,color,alpha)
    {
        let bitmap,motion;
        
            // lookup bitmap
            
        bitmap=this.core.bitmapList.get(colorURL);
        if (bitmap===undefined) return;
        
            // draw the particles
            
        for (motion of motions) {
            this.motionPoint.setFromPoint(centerPnt);
            this.motionPoint.x+=(motion.x*factor);
            this.motionPoint.y+=(motion.y*factor);
            this.motionPoint.z+=(motion.z*factor);
            this.drawAddBillboardQuadInternal(bitmap,this.motionPoint,u,v,uSize,vSize,halfWid,halfHigh,rot,drawMode,color,alpha);
        }
    }
    
    drawAddTriangle(colorURL,pnt0,u0,v0,pnt1,u1,v1,pnt2,u2,v2,drawMode,color,alpha)
    {
        let bitmap;
        let elementIdx=Math.trunc(this.vertexIdx/3);
        
            // lookup bitmap
            
        bitmap=this.core.bitmapList.get(colorURL);
        if (bitmap===undefined) return;
        
            // add in this chunk for drawing
            
        this.chunks.push(new ProjectEffectChunkClass(bitmap,this.core.gl.TRIANGLES,this.indexIdx,3,drawMode,color,alpha));
        
            // build the triangle
            
        this.vertexes[this.vertexIdx++]=pnt0.x;
        this.vertexes[this.vertexIdx++]=pnt0.y;
        this.vertexes[this.vertexIdx++]=pnt0.z;

        this.uvs[this.uvIdx++]=u0;
        this.uvs[this.uvIdx++]=v0;

        this.vertexes[this.vertexIdx++]=pnt1.x;
        this.vertexes[this.vertexIdx++]=pnt1.y;
        this.vertexes[this.vertexIdx++]=pnt1.z;

        this.uvs[this.uvIdx++]=u1;
        this.uvs[this.uvIdx++]=v1;
        
        this.vertexes[this.vertexIdx++]=pnt2.x;
        this.vertexes[this.vertexIdx++]=pnt2.y;
        this.vertexes[this.vertexIdx++]=pnt2.z;

        this.uvs[this.uvIdx++]=u2;
        this.uvs[this.uvIdx++]=v2;

        this.indexes[this.indexIdx++]=elementIdx;
        this.indexes[this.indexIdx++]=elementIdx+1;
        this.indexes[this.indexIdx++]=elementIdx+2;
    }
    
    drawEnd()
    {
        let chunk,currentDrawMode;
        let currentBitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.effectShader;
        
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
                    case ProjectEffectClass.DRAW_MODE_TRANSPARENT:
                        gl.blendFunc(this.core.gl.SRC_ALPHA,this.core.gl.ONE_MINUS_SRC_ALPHA);
                        break;
                    case ProjectEffectClass.DRAW_MODE_ADDITIVE:
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
    
        //
        // override this for any draw setup, and return TRUE
        // if the effect is within the view, you should always
        // override this to improve performance
        // 
        
    drawSetup()
    {
        return(true);
    }
    
        //
        // override this to draw the effect into
        // the frame
        //
        
    draw()
    {
    }
}
