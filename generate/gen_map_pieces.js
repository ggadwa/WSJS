"use strict";

//
// generate map pieces array
//

var genMapPieces=[];

//
// piece object misc functions
//

function mapPieceGetConnectType(connectLineIdx)
{
    var connectLine=this.connectLines[connectLineIdx];
    var pt1=this.points[connectLine[0]];
    var pt2=this.points[connectLine[1]];
    
    if (pt1[0]===pt2[0]) {
        if (pt1[0]===0.0) return(this.CONNECT_TYPE_LEFT);
        return(this.CONNECT_TYPE_RIGHT);
    }
    
    if (pt1[1]===0.0) return(this.CONNECT_TYPE_TOP);
    return(this.CONNECT_TYPE_BOTTOM);
}

function mapPieceIsConnectTypeOpposite(connectLineIdx,connectType)
{
    var checkConnectType=this.getConnectType(connectLineIdx);
    
    switch (checkConnectType) {
        case this.CONNECT_TYPE_LEFT:
            return(connectType===this.CONNECT_TYPE_RIGHT);
        case this.CONNECT_TYPE_TOP:
            return(connectType===this.CONNECT_TYPE_BOTTOM);
        case this.CONNECT_TYPE_RIGHT:
            return(connectType===this.CONNECT_TYPE_LEFT);
        case this.CONNECT_TYPE_BOTTOM:
            return(connectType===this.CONNECT_TYPE_TOP);      
    }
    
    return(false);
}

function mapPieceGetConnectTypeOffset(connectLineIdx,xBound,zBound)
{
    var offset=[0.0,0.0];
    
    var connectLine=this.connectLines[connectLineIdx];
    var pt1=this.points[connectLine[0]];
    var pt2=this.points[connectLine[1]];
    
    var x=(pt1[0]<pt2[0])?pt1[0]:pt2[0];
    offset[0]=Math.floor((xBound.max-xBound.min)*x);
    
    var z=(pt1[1]<pt2[1])?pt1[1]:pt2[1];
    offset[1]=Math.floor((zBound.max-zBound.min)*z);
    
    return(offset);
}

function mapPieceGetConnectTypeLength(connectLineIdx,xBound,zBound)
{
    var connectLine=this.connectLines[connectLineIdx];
    var pt1=this.points[connectLine[0]];
    var pt2=this.points[connectLine[1]];
    
    var x1=Math.floor((xBound.max-xBound.min)*pt1[0]);
    var x2=Math.floor((xBound.max-xBound.min)*pt2[0]);
    
    var z1=Math.floor((zBound.max-zBound.min)*pt1[1]);
    var z2=Math.floor((zBound.max-zBound.min)*pt2[1]);
    
    return([Math.abs(x2-x1),Math.abs(z2-z1)]);
}

//
// piece object mesh creation
//

function mapPieceCreateMeshFloor(shaderIdx,bitmapIdx,xBound,yBound,zBound,flag)
{
    var vertices=new Float32Array(18);
     
    vertices[0]=xBound.min;
    vertices[1]=yBound.max;
    vertices[2]=zBound.min;
    vertices[3]=xBound.max;
    vertices[4]=yBound.max;
    vertices[5]=zBound.min;
    vertices[6]=xBound.max;
    vertices[7]=yBound.max;
    vertices[8]=zBound.max;

    vertices[9]=xBound.min;
    vertices[10]=yBound.max;
    vertices[11]=zBound.min;
    vertices[12]=xBound.max;
    vertices[13]=yBound.max;
    vertices[14]=zBound.max;    
    vertices[15]=xBound.min;
    vertices[16]=yBound.max;
    vertices[17]=zBound.max;

    var n;
    var indexes=new Uint16Array(6);
    
    for (n=0;n!==6;n++) {
        indexes[n]=n;
    }
    
        // calculate the normals, then use those to
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var normals=genMeshUtility.buildMeshNormals(vertices,indexes,true);
    var uvs=genMeshUtility.buildMeshUVs(bitmapIdx,vertices,normals);
    var tangents=genMeshUtility.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new meshObject(shaderIdx,bitmapIdx,vertices,normals,tangents,uvs,indexes,flag));
}

function mapPieceCreateMeshCeiling(shaderIdx,bitmapIdx,xBound,yBound,zBound,flag)
{
    var vertices=new Float32Array(18);
     
    vertices[0]=xBound.min;
    vertices[1]=yBound.min;
    vertices[2]=zBound.min;
    vertices[3]=xBound.max;
    vertices[4]=yBound.min;
    vertices[5]=zBound.min;
    vertices[6]=xBound.max;
    vertices[7]=yBound.min;
    vertices[8]=zBound.max;

    vertices[9]=xBound.min;
    vertices[10]=yBound.min;
    vertices[11]=zBound.min;
    vertices[12]=xBound.max;
    vertices[13]=yBound.min;
    vertices[14]=zBound.max;    
    vertices[15]=xBound.min;
    vertices[16]=yBound.min;
    vertices[17]=zBound.max;

    var n;
    var indexes=new Uint16Array(6);
    
    for (n=0;n!==6;n++) {
        indexes[n]=n;
    }
    
        // calculate the normals, then use those to
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var normals=genMeshUtility.buildMeshNormals(vertices,indexes,true);
    var uvs=genMeshUtility.buildMeshUVs(bitmapIdx,vertices,normals);
    var tangents=genMeshUtility.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new meshObject(shaderIdx,bitmapIdx,vertices,normals,tangents,uvs,indexes,flag));
}

function mapPieceCreateMeshWalls(shaderIdx,bitmapIdx,xBound,yBound,zBound,flag)
{
    var n,k,nPoint,x1,x2,z1,z2,vIdx,vArrIdx,iArrIdx;
    var pt;
    
        // build the vertices.  Each triangle gets it's
        // own vertices so normals and light map UVs work
    
    vIdx=0;
    vArrIdx=0;
    iArrIdx=0;
    nPoint=this.points.length;
    
    var vertices=new Float32Array(nPoint*18);
    var indexes=new Uint16Array(nPoint*6);
    
    for (n=0;n!==nPoint;n++) {
        k=n+1;
        if (k===nPoint) k=0;
        
        pt=this.points[n];
        x1=xBound.min+Math.floor((xBound.max-xBound.min)*pt[0]);
        z1=zBound.min+Math.floor((zBound.max-zBound.min)*pt[1]);
        
        pt=this.points[k];
        x2=xBound.min+Math.floor((xBound.max-xBound.min)*pt[0]);
        z2=zBound.min+Math.floor((zBound.max-zBound.min)*pt[1]);
        
        vertices[vArrIdx++]=x1;
        vertices[vArrIdx++]=yBound.min;
        vertices[vArrIdx++]=z1;
        vertices[vArrIdx++]=x2;
        vertices[vArrIdx++]=yBound.min;
        vertices[vArrIdx++]=z2;
        vertices[vArrIdx++]=x2;
        vertices[vArrIdx++]=yBound.max;
        vertices[vArrIdx++]=z2;
        
        indexes[iArrIdx++]=vIdx++;
        indexes[iArrIdx++]=vIdx++;
        indexes[iArrIdx++]=vIdx++;
        
        vertices[vArrIdx++]=x1;
        vertices[vArrIdx++]=yBound.min;
        vertices[vArrIdx++]=z1;
        vertices[vArrIdx++]=x2;
        vertices[vArrIdx++]=yBound.max;
        vertices[vArrIdx++]=z2;
        vertices[vArrIdx++]=x1;
        vertices[vArrIdx++]=yBound.max;
        vertices[vArrIdx++]=z1;
        
        indexes[iArrIdx++]=vIdx++;
        indexes[iArrIdx++]=vIdx++;
        indexes[iArrIdx++]=vIdx++;
    }
    
        // calculate the normals, then use those to
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var normals=genMeshUtility.buildMeshNormals(vertices,indexes,true);
    var uvs=genMeshUtility.buildMeshUVs(bitmapIdx,vertices,normals);
    var tangents=genMeshUtility.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new meshObject(shaderIdx,bitmapIdx,vertices,normals,tangents,uvs,indexes,flag));
}

//
// main piece object
//

function mapPieceObject(isRoom)
{
    this.isRoom=isRoom;
    this.points=[];
    this.connectLines=[];
    
    this.CONNECT_TYPE_LEFT=0;
    this.CONNECT_TYPE_TOP=1;
    this.CONNECT_TYPE_RIGHT=2;
    this.CONNECT_TYPE_BOTTOM=3;
    
    this.getConnectType=mapPieceGetConnectType;
    this.isConnectTypeOpposite=mapPieceIsConnectTypeOpposite;
    this.getConnectTypeOffset=mapPieceGetConnectTypeOffset;
    this.getConnectTypeLength=mapPieceGetConnectTypeLength;
    
    this.createMeshFloor=mapPieceCreateMeshFloor;
    this.createMeshCeiling=mapPieceCreateMeshCeiling;
    this.createMeshWalls=mapPieceCreateMeshWalls;
}

//
// pieces
//

// box

var mapPiece=new mapPieceObject(true);

mapPiece.points.push([0.0,0.0]);
mapPiece.points.push([0.20,0.0]);
mapPiece.points.push([0.40,0.0]);
mapPiece.points.push([0.60,0.0]);
mapPiece.points.push([0.80,0.0]);
mapPiece.points.push([1.0,0.0]);
mapPiece.points.push([1.0,0.20]);
mapPiece.points.push([1.0,0.40]);
mapPiece.points.push([1.0,0.60]);
mapPiece.points.push([1.0,0.80]);
mapPiece.points.push([1.0,1.0]);
mapPiece.points.push([0.80,1.0]);
mapPiece.points.push([0.60,1.0]);
mapPiece.points.push([0.40,1.0]);
mapPiece.points.push([0.20,1.0]);
mapPiece.points.push([0.0,1.0]);
mapPiece.points.push([0.0,0.80]);
mapPiece.points.push([0.0,0.60]);
mapPiece.points.push([0.0,0.40]);
mapPiece.points.push([0.0,0.20]);

mapPiece.connectLines.push([0,1]);
mapPiece.connectLines.push([1,2]);
mapPiece.connectLines.push([2,3]);
mapPiece.connectLines.push([3,4]);
mapPiece.connectLines.push([4,5]);
mapPiece.connectLines.push([5,6]);
mapPiece.connectLines.push([6,7]);
mapPiece.connectLines.push([7,8]);
mapPiece.connectLines.push([8,9]);
mapPiece.connectLines.push([9,10]);
mapPiece.connectLines.push([10,11]);
mapPiece.connectLines.push([11,12]);
mapPiece.connectLines.push([12,13]);
mapPiece.connectLines.push([13,14]);
mapPiece.connectLines.push([14,15]);
mapPiece.connectLines.push([15,16]);
mapPiece.connectLines.push([16,17]);
mapPiece.connectLines.push([17,18]);
mapPiece.connectLines.push([18,19]);
mapPiece.connectLines.push([19,0]);

genMapPieces.push(mapPiece);

// plus

var mapPiece=new mapPieceObject(false);

mapPiece.points.push([0.4,0.0]);
mapPiece.points.push([0.6,0.0]);
mapPiece.points.push([0.6,0.4]);
mapPiece.points.push([1.0,0.4]);
mapPiece.points.push([1.0,0.6]);
mapPiece.points.push([0.6,0.6]);
mapPiece.points.push([0.6,1.0]);
mapPiece.points.push([0.4,1.0]);
mapPiece.points.push([0.4,0.6]);
mapPiece.points.push([0.0,0.6]);
mapPiece.points.push([0.0,0.4]);
mapPiece.points.push([0.4,0.4]);

mapPiece.connectLines.push([0,1]);
mapPiece.connectLines.push([3,4]);
mapPiece.connectLines.push([6,7]);
mapPiece.connectLines.push([9,10]);

genMapPieces.push(mapPiece);

// X

var mapPiece=new mapPieceObject(false);

mapPiece.points.push([0.0,0.0]);
mapPiece.points.push([0.20,0.0]);
mapPiece.points.push([0.40,0.20]);
mapPiece.points.push([0.60,0.20]);
mapPiece.points.push([0.80,0.0]);
mapPiece.points.push([1.0,0.0]);
mapPiece.points.push([1.0,0.20]);
mapPiece.points.push([0.80,0.40]);
mapPiece.points.push([0.80,0.60]);
mapPiece.points.push([1.0,0.80]);
mapPiece.points.push([1.0,1.0]);
mapPiece.points.push([0.80,1.0]);
mapPiece.points.push([0.60,0.80]);
mapPiece.points.push([0.40,0.80]);
mapPiece.points.push([0.20,1.0]);
mapPiece.points.push([0.0,1.0]);
mapPiece.points.push([0.0,0.80]);
mapPiece.points.push([0.20,0.60]);
mapPiece.points.push([0.20,0.40]);
mapPiece.points.push([0.0,0.20]);

mapPiece.connectLines.push([0,1]);
mapPiece.connectLines.push([4,5]);
mapPiece.connectLines.push([5,6]);
mapPiece.connectLines.push([9,10]);
mapPiece.connectLines.push([10,11]);
mapPiece.connectLines.push([14,15]);
mapPiece.connectLines.push([15,16]);
mapPiece.connectLines.push([19,0]);

genMapPieces.push(mapPiece);
