"use strict";

//
// map overlay class
//

function MapOverlayObject()
{
    this.mapOverlayShader=new MapOverlayShaderObject();
    
    this.pieceList=[];
    
    this.mapOffsetX=0;
    this.mapOffsetZ=0;
    this.mapScale=1.0;
    
    this.drawX=0;
    this.drawY=0;
    
    this.vertexPosBuffer=null;
    
        //
        // initialize/release overlay object
        //

    this.initialize=function(view)
    {
        if (!this.mapOverlayShader.initialize(view)) return(false);
        this.vertexPosBuffer=view.gl.createBuffer();
        
        return(true);
    };

    this.release=function(view)
    {
        view.gl.deleteBuffer(this.vertexPosBuffer);
        this.mapOverlayShader.release(view);
    };
    
        //
        // add pieces and pre-calc sizing
        //
        
    this.addPiece=function(piece,xBound,zBound)
    {
        this.pieceList.push(piece.createDisplayShapeLines(xBound,zBound));
    };
    
    this.addBoundPiece=function(xBound,zBound)
    {
        var shapeLines=new Float32Array(8);
        
        shapeLines[0]=shapeLines[6]=xBound.min;
        shapeLines[2]=shapeLines[4]=xBound.max;
        shapeLines[1]=shapeLines[3]=zBound.min;
        shapeLines[5]=shapeLines[7]=zBound.max;
        
        this.pieceList.push(shapeLines);
    };
    
    this.precalcDrawValues=function(view)
    {
        var n,k;
        var xBound,zBound;
        var lineVertexList;
        
        var nPiece=this.pieceList.length;
        
            // get the total size
            
        for (n=0;n!==nPiece;n++) {
            lineVertexList=this.pieceList[n];
            
            if (n===0) {
                xBound=new wsBound(lineVertexList[0],lineVertexList[0]);
                zBound=new wsBound(lineVertexList[1],lineVertexList[1]);
            }
            
            for (k=0;k<lineVertexList.length;k+=2) {
                xBound.adjust(lineVertexList[k]);
                zBound.adjust(lineVertexList[k+1]);
            }
        }
        
            // the max size of the overlay
            // is based on the view
            
        var maxSize=view.high-150;
        
            // get the scale
            // and remember offset to put entities in later
            
        if (xBound.getSize()>zBound.getSize()) {
            this.mapScale=maxSize/xBound.getSize();
        }
        else {
            this.mapScale=maxSize/zBound.getSize();
        }
            
        this.mapOffsetX=xBound.min;
        this.mapOffsetZ=zBound.min;
        
            // get the drawing position
        
        var drawWid=Math.floor(xBound.getSize()*this.mapScale);
        var drawHigh=Math.floor(zBound.getSize()*this.mapScale);
        
        this.drawX=(view.wid-5)-drawWid;
        this.drawY=Math.floor((view.high-drawHigh)/2);
        
            // resize them
            
        for (n=0;n!==nPiece;n++) {
            lineVertexList=this.pieceList[n];
            
            for (k=0;k<lineVertexList.length;k+=2) {
                lineVertexList[k]=((lineVertexList[k]-this.mapOffsetX)*this.mapScale)+this.drawX;
                lineVertexList[k+1]=((lineVertexList[k+1]-this.mapOffsetZ)*this.mapScale)+this.drawY;
            }
        }
    };
    
        //
        // draw the map overlay
        //
        
    this.draw=function(view,entityList)
    {
        var n;
        var gl=view.gl;

        this.mapOverlayShader.drawStart(view);
        gl.disable(gl.DEPTH_TEST);
        
            // setup the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

            // map lines
            
        this.mapOverlayShader.drawColor(view,new wsColor(0.0,0.0,1.0));
            
        var lineVertexList;
        var nPiece=this.pieceList.length;
        
        for (n=0;n!==nPiece;n++) {
            lineVertexList=this.pieceList[n];
            gl.bufferData(gl.ARRAY_BUFFER,lineVertexList,gl.STREAM_DRAW);
            gl.drawArrays(gl.LINE_LOOP,0,Math.floor(lineVertexList.length/2));
        }
        
            // entities
            
        var x,y;
        
        var p1=new ws2DPoint(0,0);
        var p2=new ws2DPoint(0,0);
        var p3=new ws2DPoint(0,0);
        
        var vList=new Float32Array(6);
        
        var entity;
        var nEntity=entityList.count();
        
        var playerColor=new wsColor(0.5,1.0,0.5);
        var monsterColor=new wsColor(1.0,0.5,0.5);

        for (n=0;n!==nEntity;n++) {
            entity=entityList.get(n);
            this.mapOverlayShader.drawColor(view,(entity.isPlayer?playerColor:monsterColor));
        
            p1.set(-5,-5);
            p1.rotate(null,entity.angle.y);
            p2.set(0,5);
            p2.rotate(null,entity.angle.y);
            p3.set(5,-5);
            p3.rotate(null,entity.angle.y);
            
            x=((entity.position.x-this.mapOffsetX)*this.mapScale)+this.drawX;
            y=((entity.position.z-this.mapOffsetZ)*this.mapScale)+this.drawY;

            vList[0]=p1.x+x;
            vList[1]=p1.y+y;
            vList[2]=p2.x+x;
            vList[3]=p2.y+y;
            vList[4]=p3.x+x;
            vList[5]=p3.y+y;

            gl.bufferData(gl.ARRAY_BUFFER,vList,gl.STREAM_DRAW);
            gl.drawArrays(gl.LINE_LOOP,0,3);
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);

        gl.enable(gl.DEPTH_TEST);
        this.mapOverlayShader.drawEnd(view);
    };
    
}

