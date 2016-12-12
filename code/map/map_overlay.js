/* global view, entityList, EntityProjectileClass */

"use strict";

//
// map overlay class
//

class MapOverlayClass
{
    constructor()
    {
        this.mapOverlayShader=new MapOverlayShaderClass();

        this.roomLineList=[];
        this.extraLineList=[];

        this.mapOffsetX=0;
        this.mapOffsetZ=0;
        this.mapScale=1.0;

        this.drawX=0;
        this.drawY=0;

        this.drawWid=0;
        this.drawHigh=0;

        this.roomVertexPosBuffer=null;
        this.extraVertexPosBuffer=null;
        this.entityVertexPosBuffer=null;

        this.entityVertices=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release overlay object
        //

    initialize()
    {
        let gl=view.gl;
        
        if (!this.mapOverlayShader.initialize()) return(false);
        
        this.roomVertexPosBuffer=gl.createBuffer();
        this.extraVertexPosBuffer=gl.createBuffer();
        this.entityVertexPosBuffer=gl.createBuffer();
        
        this.entityVertices=new Float32Array(6);
        
        return(true);
    }

    release()
    {
        let gl=view.gl;
        
        gl.deleteBuffer(this.roomVertexPosBuffer);
        gl.deleteBuffer(this.extraVertexPosBuffer);
        gl.deleteBuffer(this.entityVertexPosBuffer);
        
        this.entityVertices=null;
        
        this.mapOverlayShader.release();
    }
        
        //
        // add lines to specific line lists
        //
        
    addLines(lineList,lines)
    {
        let n,k;
        let isDup;
        
            // add to line list, removing duplicates
            
        for (n=0;n!==lines.length;n++) {
            
                // check for dups
                
            isDup=false;
            
            for (k=0;k!==lineList.length;k++) {
                if (lineList[k].equals(lines[n])) {
                    isDup=true;
                    lineList.splice(k,1);
                    break;
                }
            }
            
                // add it
                
            if (!isDup) lineList.push(lines[n]);
        }
    }
    
        //
        // add pieces to overlay
        //
        
    addRoom(room)
    {
        this.addLines(this.roomLineList,room.createOverlayLineList());
    }
    
    addCloset(xBound,zBound)
    {
        let lines=[];
        
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.min),new ws2DIntPoint(xBound.max,zBound.min)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.min),new ws2DIntPoint(xBound.max,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.max),new ws2DIntPoint(xBound.min,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.max),new ws2DIntPoint(xBound.min,zBound.min)));
        
        this.addLines(this.roomLineList,lines);
    }
    
    addConnection(xBound,zBound)
    {
        let lines=[];
        
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.min),new ws2DIntPoint(xBound.max,zBound.min)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.min),new ws2DIntPoint(xBound.max,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.max),new ws2DIntPoint(xBound.min,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.max),new ws2DIntPoint(xBound.min,zBound.min)));
        
        this.addLines(this.roomLineList,lines);
    }
    
    addPlatform(xBound,zBound)
    {
        let lines=[];
        
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.min),new ws2DIntPoint(xBound.max,zBound.min)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.min),new ws2DIntPoint(xBound.max,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.max,zBound.max),new ws2DIntPoint(xBound.min,zBound.max)));
        lines.push(new ws2DLine(new ws2DIntPoint(xBound.min,zBound.max),new ws2DIntPoint(xBound.min,zBound.min)));
        
        this.addLines(this.extraLineList,lines);
    }
    
        //
        // precalc the drawing values
        //
    
    precalcDrawValues()
    {
        let n,idx,line,maxSize;
        let xBound,yBound;
        let roomVertexList,extraVertexList;
        let gl=view.gl;
        let nLine=this.roomLineList.length;
        
            // get the total size
            
        for (n=0;n!==nLine;n++) {
            line=this.roomLineList[n];
            
            if (n===0) {
                xBound=line.getXBound();
                yBound=line.getYBound();
            }
            
            xBound.adjust(line.p1.x);
            xBound.adjust(line.p2.x);
            yBound.adjust(line.p1.y);
            yBound.adjust(line.p2.y);
        }
        
            // the max size of the overlay
            // is based on the view
            
        maxSize=view.high-150;
        
            // get the scale
            // and remember offset to put entities in later
            
        if (xBound.getSize()>yBound.getSize()) {
            this.mapScale=maxSize/xBound.getSize();
        }
        else {
            this.mapScale=maxSize/yBound.getSize();
        }
            
        this.mapOffsetX=xBound.min;
        this.mapOffsetZ=yBound.min;
        
            // get the drawing position
        
        this.drawWid=Math.trunc(xBound.getSize()*this.mapScale);
        this.drawHigh=Math.trunc(yBound.getSize()*this.mapScale);
        
        this.drawX=(view.wid-5)-this.drawWid;
        this.drawY=Math.trunc((view.high-this.drawHigh)/2);
        
            // create the room vertex buffer
        
        idx=0;
        roomVertexList=new Float32Array(nLine*4);
        
        for (n=0;n!==nLine;n++) {
            line=this.roomLineList[n];
            
            roomVertexList[idx++]=((line.p1.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            roomVertexList[idx++]=(this.drawHigh-((line.p1.y-this.mapOffsetZ)*this.mapScale))+this.drawY;
            roomVertexList[idx++]=((line.p2.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            roomVertexList[idx++]=(this.drawHigh-((line.p2.y-this.mapOffsetZ)*this.mapScale))+this.drawY;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.roomVertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,roomVertexList,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // create the extra vertex buffer
        
        idx=0;
        nLine=this.extraLineList.length;
        
        extraVertexList=new Float32Array(nLine*4);
        
        for (n=0;n!==nLine;n++) {
            line=this.extraLineList[n];
            
            extraVertexList[idx++]=((line.p1.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            extraVertexList[idx++]=(this.drawHigh-((line.p1.y-this.mapOffsetZ)*this.mapScale))+this.drawY;
            extraVertexList[idx++]=((line.p2.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            extraVertexList[idx++]=(this.drawHigh-((line.p2.y-this.mapOffsetZ)*this.mapScale))+this.drawY;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.extraVertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,extraVertexList,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    
        //
        // draw the map overlay
        //
        
    draw()
    {
        let n,x,y;
        let p1,p2,p3;
        let entity,ang,pos,nEntity;
        let playerColor=new wsColor(0.5,1.0,0.5);
        let monsterColor=new wsColor(1.0,0.5,0.5);
        let gl=view.gl;

        this.mapOverlayShader.drawStart();
        gl.disable(gl.DEPTH_TEST);
        
            // extra lines
            
        this.mapOverlayShader.drawColor(new wsColor(0.5,0.5,1.0));
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.extraVertexPosBuffer);
        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        gl.drawArrays(gl.LINES,0,(this.extraLineList.length*2));
        
            // room lines
            
        this.mapOverlayShader.drawColor(new wsColor(0.0,0.0,1.0));
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.roomVertexPosBuffer);
        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
        gl.drawArrays(gl.LINES,0,(this.roomLineList.length*2));
        
            // entities
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.entityVertexPosBuffer);
        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
        p1=new ws2DIntPoint(0,0);
        p2=new ws2DIntPoint(0,0);
        p3=new ws2DIntPoint(0,0);

        nEntity=entityList.countEntity();
        
        for (n=0;n!==nEntity;n++) {
            entity=entityList.getEntity(n);
            if (entity instanceof EntityProjectileClass) continue;
            
            this.mapOverlayShader.drawColor(((n===0)?playerColor:monsterColor));       // index 0 is the player
            
            ang=360.0-entity.angle.y;
        
            p1.setFromValues(-5,5);
            p1.rotate(null,ang);
            p2.setFromValues(0,-5);
            p2.rotate(null,ang);
            p3.setFromValues(5,5);
            p3.rotate(null,ang);
            
            pos=entity.position;
            x=((pos.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            y=(this.drawHigh-((pos.z-this.mapOffsetZ)*this.mapScale))+this.drawY;

            this.entityVertices[0]=p1.x+x;
            this.entityVertices[1]=p1.y+y;
            this.entityVertices[2]=p2.x+x;
            this.entityVertices[3]=p2.y+y;
            this.entityVertices[4]=p3.x+x;
            this.entityVertices[5]=p3.y+y;

            gl.bufferData(gl.ARRAY_BUFFER,this.entityVertices,gl.STREAM_DRAW);
            gl.drawArrays(gl.LINE_LOOP,0,3);
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        gl.enable(gl.DEPTH_TEST);
        this.mapOverlayShader.drawEnd();
    }
    
}

