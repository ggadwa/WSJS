import Point2DIntClass from '../../code/utility/2D_int_point.js';
import Line2DClass from '../../code/utility/2D_line.js';
import RectClass from '../../code/utility/rect.js';
import ColorClass from '../../code/utility/color.js';
import MapOverlayShaderClass from '../../code/map/map_overlay_shader.js';

//
// map overlay class
//

export default class MapOverlayClass
{
    constructor(view,fileCache)
    {
        this.view=view;
        this.mapOverlayShader=new MapOverlayShaderClass(view,fileCache);

        this.roomQuadList=[];
        this.liquidQuadList=[];
        this.roomLineList=[];
        this.extraLineList=[];
        this.doorQuadList=[];

        this.mapOffsetX=0;
        this.mapOffsetZ=0;
        this.mapScale=1.0;

        this.drawX=0;
        this.drawY=0;

        this.drawWid=0;
        this.drawHigh=0;

        this.roomQuadVertexPosBuffer=null;
        this.liquidQuadVertexPosBuffer=null;
        this.roomVertexPosBuffer=null;
        this.extraVertexPosBuffer=null;
        this.doorQuadVertexPosBuffer=null;
        this.entityVertexPosBuffer=null;

        this.entityVertices=null;
        
        Object.seal(this);
    }
    
        //
        // initialize/release overlay object
        //

    initialize()
    {
        let gl=this.view.gl;
        
        if (!this.mapOverlayShader.initialize()) return(false);
        
        this.roomQuadVertexPosBuffer=gl.createBuffer();
        this.liquidQuadVertexPosBuffer=gl.createBuffer();
        this.roomVertexPosBuffer=gl.createBuffer();
        this.extraVertexPosBuffer=gl.createBuffer();
        this.doorQuadVertexPosBuffer=gl.createBuffer();
        this.entityVertexPosBuffer=gl.createBuffer();
        
        this.entityVertices=new Float32Array(6);
        
        return(true);
    }

    release()
    {
        let gl=this.view.gl;
        
        gl.deleteBuffer(this.roomQuadVertexPosBuffer);
        gl.deleteBuffer(this.liquidQuadVertexPosBuffer);
        gl.deleteBuffer(this.roomVertexPosBuffer);
        gl.deleteBuffer(this.extraVertexPosBuffer);
        gl.deleteBuffer(this.doorQuadVertexPosBuffer);
        gl.deleteBuffer(this.entityVertexPosBuffer);
        
        this.entityVertices=null;
        
        this.mapOverlayShader.release();
    }
        
        //
        // add lines to specific line lists
        //
    
    isLineADuplicate(lineList,line)
    {
        var n;
        
        for (n=0;n!==lineList.length;n++) {
            if (lineList[n].equals(line)) return(n);
        }
        
        return(-1);
    }
    
    addRoomLines(lines,pushDupToExtra)
    {
        let n,dupIdx;
        let line;
        
            // add to line list, removing duplicates
            
        for (n=0;n!==lines.length;n++) {
            line=lines[n];
            
            dupIdx=this.isLineADuplicate(this.roomLineList,line);
            if (dupIdx!==-1) {
                this.roomLineList.splice(dupIdx,1);
                
                if (pushDupToExtra) {
                    if (this.isLineADuplicate(this.extraLineList,line)===-1) this.extraLineList.push(line);
                }
                else {
                    dupIdx=this.isLineADuplicate(this.extraLineList,line);      // if we aren't pushing duplicates, clear any lines in duplicate list
                    if (dupIdx!==-1) this.extraLineList.splice(dupIdx,1);
                }
            }
            else {
                this.roomLineList.push(line);
            }
        }
    }
    
    addExtraLines(lines)
    {
        let n,dupIdx;
        let line;
        
            // add to line list, removing duplicates
            
        for (n=0;n!==lines.length;n++) {
            line=lines[n];
            
            dupIdx=this.isLineADuplicate(this.extraLineList,line);
            if (dupIdx!==-1) {
                this.extraLineList.splice(dupIdx,1);
            }
            else {
                this.extraLineList.push(lines[n]);
            }
        }
    }
    
        //
        // add pieces to overlay
        //
        
    addRoom(room)
    {
        this.roomQuadList.push(new RectClass(room.xBound.min,room.zBound.min,room.xBound.max,room.zBound.max));
        this.addRoomLines(room.createOverlayLineList(),true);
        
        if (room.liquid) this.liquidQuadList.push(new RectClass(room.xBound.min,room.zBound.min,room.xBound.max,room.zBound.max));
    }
    
    addCloset(xBound,zBound)
    {
        let lines=[];
        
        this.roomQuadList.push(new RectClass(xBound.min,zBound.min,xBound.max,zBound.max));
        
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.min),new Point2DIntClass(xBound.max,zBound.min)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.min),new Point2DIntClass(xBound.max,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.max),new Point2DIntClass(xBound.min,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.max),new Point2DIntClass(xBound.min,zBound.min)));
        
        this.addRoomLines(lines,false);
    }
    
    addConnection(xBound,zBound)
    {
        let lines=[];
        
        this.roomQuadList.push(new RectClass(xBound.min,zBound.min,xBound.max,zBound.max));
        
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.min),new Point2DIntClass(xBound.max,zBound.min)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.min),new Point2DIntClass(xBound.max,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.max),new Point2DIntClass(xBound.min,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.max),new Point2DIntClass(xBound.min,zBound.min)));
        
        this.addRoomLines(lines,false);
    }
    
    addDecorationWall(x,z,x2,z2)
    {
        this.addRoomLines([new Line2DClass(new Point2DIntClass(x,z),new Point2DIntClass(x2,z2))]);
    }
    
    addPlatform(xBound,zBound)
    {
        let lines=[];
        
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.min),new Point2DIntClass(xBound.max,zBound.min)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.min),new Point2DIntClass(xBound.max,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.max,zBound.max),new Point2DIntClass(xBound.min,zBound.max)));
        lines.push(new Line2DClass(new Point2DIntClass(xBound.min,zBound.max),new Point2DIntClass(xBound.min,zBound.min)));
        
        this.addExtraLines(lines);
    }
    
    addLift(xBound,zBound)
    {
        this.addPlatform(xBound,zBound);
    }
    
    addStair(xBound,zBound)
    {
        this.addPlatform(xBound,zBound);
    }
    
    addDoor(xBound,zBound)
    {
        this.doorQuadList.push(new RectClass(xBound.min,zBound.min,xBound.max,zBound.max));
    }
    
        //
        // precalc the drawing values
        //
    
    precalcDrawValues()
    {
        let n,idx,line,rect,maxSize,nQuad,nLine;
        let lft,top,rgt,bot;
        let xBound,yBound;
        let quadVertexList,roomVertexList,extraVertexList;
        let gl=this.view.gl;
        
            // get the total size
            
        nLine=this.roomLineList.length;
            
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
            
        maxSize=this.view.high-150;
        
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
        
        this.drawX=(this.view.wid-5)-this.drawWid;
        this.drawY=Math.trunc((this.view.high-this.drawHigh)/2);
        
            // create the room quad vertex buffer
            
        idx=0;
        
        nQuad=this.roomQuadList.length;
        quadVertexList=new Float32Array(nQuad*12);
        
        for (n=0;n!==nQuad;n++) {
            rect=this.roomQuadList[n];
            
            lft=((rect.lft-this.mapOffsetX)*this.mapScale)+this.drawX;
            top=(this.drawHigh-((rect.top-this.mapOffsetZ)*this.mapScale))+this.drawY;
            rgt=((rect.rgt-this.mapOffsetX)*this.mapScale)+this.drawX;
            bot=(this.drawHigh-((rect.bot-this.mapOffsetZ)*this.mapScale))+this.drawY;
            
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
            
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=bot;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.roomQuadVertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,quadVertexList,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // create the liquid quad vertex buffer
            
        idx=0;
        
        nQuad=this.liquidQuadList.length;
        quadVertexList=new Float32Array(nQuad*12);
        
        for (n=0;n!==nQuad;n++) {
            rect=this.liquidQuadList[n];
            
            lft=((rect.lft-this.mapOffsetX)*this.mapScale)+this.drawX;
            top=(this.drawHigh-((rect.top-this.mapOffsetZ)*this.mapScale))+this.drawY;
            rgt=((rect.rgt-this.mapOffsetX)*this.mapScale)+this.drawX;
            bot=(this.drawHigh-((rect.bot-this.mapOffsetZ)*this.mapScale))+this.drawY;
            
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
            
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=bot;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.liquidQuadVertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,quadVertexList,gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        
            // create the room line vertex buffer
        
        idx=0;
        
        nLine=this.roomLineList.length;
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
        
            // create the door quad vertex buffer
            
        idx=0;
        
        nQuad=this.doorQuadList.length;
        quadVertexList=new Float32Array(nQuad*12);
        
        for (n=0;n!==nQuad;n++) {
            rect=this.doorQuadList[n];
            
            lft=((rect.lft-this.mapOffsetX)*this.mapScale)+this.drawX;
            top=(this.drawHigh-((rect.top-this.mapOffsetZ)*this.mapScale))+this.drawY;
            rgt=((rect.rgt-this.mapOffsetX)*this.mapScale)+this.drawX;
            bot=(this.drawHigh-((rect.bot-this.mapOffsetZ)*this.mapScale))+this.drawY;
            
            if (Math.abs(rgt-lft)<2) rgt=lft+2;
            if (Math.abs(bot-top)<2) bot=top+2;
            
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
            
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=top;
            quadVertexList[idx++]=rgt;
            quadVertexList[idx++]=bot;
            quadVertexList[idx++]=lft;
            quadVertexList[idx++]=bot;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER,this.doorQuadVertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,quadVertexList,gl.STATIC_DRAW);
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
        let playerColor=new ColorClass(0.5,1.0,0.5);
        let monsterColor=new ColorClass(1.0,0.5,0.5);
        let gl=this.view.gl;

        this.mapOverlayShader.drawStart();
        gl.disable(gl.DEPTH_TEST);
        
            // room quads
        
        if (this.roomQuadList.length!==0) {
            this.mapOverlayShader.drawColor(new ColorClass(0.0,0.0,0.0));

            gl.bindBuffer(gl.ARRAY_BUFFER,this.roomQuadVertexPosBuffer);
            gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            gl.drawArrays(gl.TRIANGLES,0,(this.roomQuadList.length*6));
        }
        
            // liquid quads
        
        if (this.liquidQuadList.length!==0) {
            this.mapOverlayShader.drawColor(new ColorClass(0.5,0.0,0.4));

            gl.bindBuffer(gl.ARRAY_BUFFER,this.liquidQuadVertexPosBuffer);
            gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            gl.drawArrays(gl.TRIANGLES,0,(this.liquidQuadList.length*6));
        }
        
            // extra lines
  
        if (this.extraLineList.length!==0) {
            this.mapOverlayShader.drawColor(new ColorClass(0.5,0.5,1.0));

            gl.bindBuffer(gl.ARRAY_BUFFER,this.extraVertexPosBuffer);
            gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            gl.drawArrays(gl.LINES,0,(this.extraLineList.length*2));
        }
        
            // room lines
        
        if (this.roomLineList.length!==0) {
            this.mapOverlayShader.drawColor(new ColorClass(0.0,0.0,1.0));

            gl.bindBuffer(gl.ARRAY_BUFFER,this.roomVertexPosBuffer);
            gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            gl.drawArrays(gl.LINES,0,(this.roomLineList.length*2));
        }
        
            // door quads
        
        if (this.doorQuadList.length!==0) {
            this.mapOverlayShader.drawColor(new ColorClass(1.0,0.2,0.2));

            gl.bindBuffer(gl.ARRAY_BUFFER,this.doorQuadVertexPosBuffer);
            gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            gl.drawArrays(gl.TRIANGLES,0,(this.doorQuadList.length*6));
        }
        
            // entities
            
        gl.bindBuffer(gl.ARRAY_BUFFER,this.entityVertexPosBuffer);
        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);
            
        p1=new Point2DIntClass(0,0);
        p2=new Point2DIntClass(0,0);
        p3=new Point2DIntClass(0,0);

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

