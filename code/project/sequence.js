import PointClass from '../utility/point.js';
import ColorClass from '../utility/color.js';
import BoundClass from '../utility/bound.js';

class SequenceBitmapClass
{
    constructor(core,sequence,bitmap,positionMode,drawMode,frames)
    {
        this.core=core;
        this.sequence=sequence;
        this.bitmap=bitmap;
        this.positionMode=positionMode;
        this.drawMode=drawMode;
        this.frames=frames;
        
            // the vertexe buffers
            
        this.vertexes=null;
            
        this.vertexPosBuffer=null;
        this.vertexUVBuffer=null;
        
            // temps
            
        this.topLeftPoint=new PointClass(0,0,0);
        this.topRightPoint=new PointClass(0,0,0);
        this.bottomLeftPoint=new PointClass(0,0,0);
        this.bottomRightPoint=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        let uvs;
        let gl=this.core.gl;
        
            // vertexes are dynamic
            
        this.vertexes=new Float32Array(6*2);

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexes,gl.DYNAMIC_DRAW);

            // uvs are static

        uvs=new Float32Array(6*2);

        uvs[0]=0;
        uvs[1]=0;
        uvs[2]=1;
        uvs[3]=0;
        uvs[4]=0;
        uvs[5]=1;

        uvs[6]=1;
        uvs[7]=0;
        uvs[8]=1;
        uvs[9]=1;
        uvs[10]=0;
        uvs[11]=1;

        this.vertexUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,uvs,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
    release()
    {
        let gl=this.core.gl;
        
        gl.deleteBuffer(this.vertexPosBuffer);
        gl.deleteBuffer(this.vertexUVBuffer);
    }
    
    draw(shader,startTimestamp)
    {
        let n,x,y,width,height,rotate,alpha,r,g,b;
        let f,tick;
        let startIdx,endIdx;
        let startFrame,endFrame,frameCount;
        let gl=this.core.gl;
        
            // if outside frames, no drawing
            
        frameCount=this.frames.length;
        if (frameCount===1) return;
        
        tick=this.core.timestamp-startTimestamp;
        if ((tick<this.frames[0].tick) || (tick>=this.frames[frameCount-1].tick)) return;
        
            // find the tween points
            
        startIdx=0;
        endIdx=frameCount-1;
        
        for (n=0;n!==frameCount;n++) {
            if (tick<=this.frames[n].tick) {
                endIdx=n;
                break;
            }
            startIdx=n;
        }
        
            // tween factor
            
        startFrame=this.frames[startIdx];
        endFrame=this.frames[endIdx];
         
        if (startIdx===endIdx) {
            f=1;
        }
        else {
            f=(tick-startFrame.tick)/(endFrame.tick-startFrame.tick);
        }
        
            // tween
          
        x=startFrame.positionOffset.x+Math.trunc((endFrame.positionOffset.x-startFrame.positionOffset.x)*f);
        y=startFrame.positionOffset.y+Math.trunc((endFrame.positionOffset.y-startFrame.positionOffset.y)*f);
        width=startFrame.width+Math.trunc((endFrame.width-startFrame.width)*f);
        height=startFrame.height+Math.trunc((endFrame.height-startFrame.height)*f);
        rotate=startFrame.rotate+((endFrame.rotate-startFrame.rotate)*f);
        
        alpha=startFrame.alpha+((endFrame.alpha-startFrame.alpha)*f);
        r=startFrame.color.r+((endFrame.color.r-startFrame.color.r)*f);
        g=startFrame.color.g+((endFrame.color.g-startFrame.color.g)*f);
        b=startFrame.color.b+((endFrame.color.b-startFrame.color.b)*f);

            // position offset
            
        switch (this.positionMode) {
            case this.sequence.POSITION_MODE_TOP_RIGHT:
                x+=this.core.canvas.width;
                break;
            case this.sequence.POSITION_MODE_BOTTOM_LEFT:
                y+=this.core.canvas.height;
                break;
            case this.sequence.POSITION_MODE_BOTTOM_RIGHT:
                x+=this.core.canvas.width;
                y+=this.core.canvas.height;
                break;
            case this.sequence.POSITION_MODE_MIDDLE:
                x+=Math.trunc(this.core.canvas.width*0.5);
                y+=Math.trunc(this.core.canvas.height*0.5);
                break;
        }
        
            // the points
            
        this.topLeftPoint.x=0;
        this.topLeftPoint.y=0;
        this.topLeftPoint.z=0;
        if (rotate!==0) this.topLeftPoint.rotateZ(null,rotate);
        
        this.topRightPoint.x=width;
        this.topRightPoint.y=0;
        this.topRightPoint.z=0;
        if (rotate!==0) this.topRightPoint.rotateZ(null,rotate);
        
        this.bottomLeftPoint.x=0;
        this.bottomLeftPoint.y=height;
        this.bottomLeftPoint.z=0;
        if (rotate!==0) this.bottomLeftPoint.rotateZ(null,rotate);
        
        this.bottomRightPoint.x=width;
        this.bottomRightPoint.y=height;
        this.bottomRightPoint.z=0;
        if (rotate!==0) this.bottomRightPoint.rotateZ(null,rotate);

            // the vertexes
            
        this.vertexes[0]=x+this.topLeftPoint.x;
        this.vertexes[1]=y+this.topLeftPoint.y;
        this.vertexes[2]=x+this.topRightPoint.x;
        this.vertexes[3]=y+this.topRightPoint.y;
        this.vertexes[4]=x+this.bottomLeftPoint.x;
        this.vertexes[5]=y+this.bottomLeftPoint.y;

        this.vertexes[6]=x+this.topRightPoint.x;
        this.vertexes[7]=y+this.topRightPoint.y;
        this.vertexes[8]=x+this.bottomRightPoint.x;
        this.vertexes[9]=y+this.bottomRightPoint.y;
        this.vertexes[10]=x+this.bottomLeftPoint.x;
        this.vertexes[11]=y+this.bottomLeftPoint.y;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,this.vertexes);
        gl.vertexAttribPointer(shader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexUVBuffer);
        gl.vertexAttribPointer(shader.vertexUVAttribute,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        
            // draw
            
        switch (this.drawMode)
        {
            case this.sequence.DRAW_MODE_TRANSPARENT:
                gl.blendFunc(this.core.gl.SRC_ALPHA,this.core.gl.ONE_MINUS_SRC_ALPHA);
                break;
            case this.sequence.DRAW_MODE_ADDITIVE:
                gl.blendFunc(this.core.gl.SRC_ALPHA,this.core.gl.ONE);
                break;
            default:
                gl.blendFunc(this.core.gl.ONE,this.core.gl.ZERO);
                break;
        }
            
        this.bitmap.attach(shader);
        
        gl.uniform4f(shader.colorUniform,r,g,b,alpha);
        gl.drawArrays(gl.TRIANGLES,0,6);
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }
}

//
// sequence class
//

export default class SequenceClass
{
    constructor(core,jsonName)
    {
        this.POSITION_MODE_TOP_LEFT=0;
        this.POSITION_MODE_TOP_RIGHT=1;
        this.POSITION_MODE_BOTTOM_LEFT=2;
        this.POSITION_MODE_BOTTOM_RIGHT=3;
        this.POSITION_MODE_MIDDLE=4;
        
        this.POSITION_MODE_LIST=['topLeft','topRight','bottomLeft','bottomRight','middle'];

        this.DRAW_MODE_OPAQUE=0;
        this.DRAW_MODE_TRANSPARENT=1;
        this.DRAW_MODE_ADDITIVE=2;
        
        this.DRAW_MODE_LIST=['opaque','transparent','additive'];
        
        this.core=core;
        
        this.jsonName=jsonName;
        this.json=null;
        
        this.startTimestamp=0;
        this.lastSoundPlayIdx=0;
        
        this.bitmaps=[];
    }
    
    isFinished()
    {
        return(this.core.timestamp>(this.startTimestamp+this.json.lifeTick));
    }
    
    lookupValue(value)
    {
        return(this.core.game.lookupValue(value,this.data));
    }
    
    initialize()
    {
        let bitmapDef,sequenceBitmap,bitmap;
        let name,mode,drawMode,positionMode;
        
        this.startTimestamp=this.core.timestamp;
        
            // get the named json
            
        this.json=this.core.game.jsonSequenceCache.get(this.jsonName);
        if (this.json===null) return(false);
        
            // setup the bitmaps
            
        this.bitmaps=[];
        
        if (this.json.bitmaps!==undefined) {
            
            for (bitmapDef of this.json.bitmaps) {
                
                    // setup the bitmap

                mode=this.lookupValue(bitmapDef.drawMode);
                drawMode=this.DRAW_MODE_LIST.indexOf(mode);
                if (drawMode===-1) {
                    console.log('Unknown sequence bitmap draw mode: '+mode);
                    return(false);
                }
                
                mode=this.lookupValue(bitmapDef.positionMode);
                positionMode=this.POSITION_MODE_LIST.indexOf(mode);
                if (positionMode===-1) {
                    console.log('Unknown sequence bitmap position mode: '+mode);
                    return(false);
                }
                
                name=this.lookupValue(bitmapDef.bitmap);
                bitmap=this.core.bitmapList.get(name);
                if (bitmap===undefined) {
                    console.log('Unknown sequence bitmap: '+name);
                    return(false);
                }
                
                sequenceBitmap=new SequenceBitmapClass(this.core,this,bitmap,positionMode,drawMode,bitmapDef.frames);
                sequenceBitmap.initialize();
                
                this.bitmaps.push(sequenceBitmap);
            }
        }
        
            // no sounds played yet
            
        this.lastSoundPlayIdx=0;
        
        return(true);
    }

    release()
    {
        let sequenceBitmap;

        console.log('DONE');
        
        for (sequenceBitmap of this.bitmaps) {
            sequenceBitmap.release();
        }
    }
    
        //
        // mainline run
        //
        
    run()
    {
        let n,tick;
        
        tick=this.core.timestamp-this.startTimestamp;
        
        for (n=this.lastSoundPlayIdx;n<this.json.sounds.length;n++) {
            if (tick>=this.json.sounds[n].tick) {
                this.lastSoundPlayIdx=n+1;
                this.core.soundList.playJson(this.core.map.entityList.getPlayer().position,this.json.sounds[n]);
            }
        }
    }
    
        //
        // mainline draw
        //
        
    draw()
    {
        let sequenceBitmap;
        let gl=this.core.gl;
        let shader=this.core.shaderList.interfaceShader;
        
            // bitmaps have an interface draw
        
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);

        shader.drawStart();
        
            // run through the bitmaps
            
        for (sequenceBitmap of this.bitmaps) {
            sequenceBitmap.draw(shader,this.startTimestamp);
        }
        
        shader.drawEnd();
        
        gl.disable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

}
