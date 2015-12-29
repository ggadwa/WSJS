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
    
        //
        // initialize/release overlay object
        //

    this.initialize=function(view)
    {
        return(this.mapOverlayShader.initialize(view));
    };

    this.release=function(view)
    {
        this.mapOverlayShader.release(view);
    };
    
        //
        // add pieces and pre-calc sizing
        //
        
    this.addPiece=function(piece,xBound,zBound)
    {
        this.pieceList.push(piece.createDisplayShapeLines(xBound,zBound));
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
            
        this.offsetX=xBound.min;
        this.offsetZ=zBound.min;
        
            // get the drawing position
            
        var drawX=(view.wid-5)-Math.floor(xBound.getSize()*this.mapScale);
        var drawY=Math.floor((view.high-Math.floor(zBound.getSize()*this.mapScale))/2);
        
            // resize them
            
        for (n=0;n!==nPiece;n++) {
            lineVertexList=this.pieceList[n];
            
            for (k=0;k<lineVertexList.length;k+=2) {
                lineVertexList[k]=((lineVertexList[k]-this.mapOffsetX)*this.mapScale)+drawX;
                lineVertexList[k+1]=((lineVertexList[k+1]-this.mapOffsetZ)*this.mapScale)+drawY;
            }
        }
        
    };
    
        //
        // draw the map overlay
        //
        
    this.draw=function(view)
    {
        var n;
        var gl=view.gl;

        this.mapOverlayShader.drawStart(view,new wsColor(0.0,0.0,1.0));
        gl.disable(gl.DEPTH_TEST);
        
            // setup the buffers

        var vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexPosBuffer);

        gl.vertexAttribPointer(this.mapOverlayShader.vertexPositionAttribute,2,gl.FLOAT,false,0,0);

            // draw the lines
            
        var lineVertexList;
        var nPiece=this.pieceList.length;
        
        for (n=0;n!==nPiece;n++) {
            lineVertexList=this.pieceList[n];
            gl.bufferData(gl.ARRAY_BUFFER,lineVertexList,gl.STREAM_DRAW);
            gl.drawArrays(gl.LINE_LOOP,0,Math.floor(lineVertexList.length/2));
        }
        
            // remove the buffers

        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.deleteBuffer(vertexPosBuffer);

        gl.enable(gl.DEPTH_TEST);
        this.mapOverlayShader.drawEnd(view);
    };
    
}

