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
        if (pt1[0]===0) return(this.CONNECT_TYPE_LEFT);
        return(this.CONNECT_TYPE_RIGHT);
    }
    
    if (pt1[1]===0) return(this.CONNECT_TYPE_TOP);
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
    offset[0]=Math.floor((xBound.max-xBound.min)*(x*0.01));
    
    var z=(pt1[1]<pt2[1])?pt1[1]:pt2[1];
    offset[1]=Math.floor((zBound.max-zBound.min)*(z*0.01));
    
    return(offset);
}

function mapPieceGetConnectTypeLength(connectLineIdx,xBound,zBound)
{
    var connectLine=this.connectLines[connectLineIdx];
    var pt1=this.points[connectLine[0]];
    var pt2=this.points[connectLine[1]];
    
    var x1=Math.floor((xBound.max-xBound.min)*(pt1[0]*0.01));
    var x2=Math.floor((xBound.max-xBound.min)*(pt2[0]*0.01));
    
    var z1=Math.floor((zBound.max-zBound.min)*(pt1[1]*0.01));
    var z2=Math.floor((zBound.max-zBound.min)*(pt2[1]*0.01));
    
    return([Math.abs(x2-x1),Math.abs(z2-z1)]);
}

//
// piece object mesh creation
//

function mapPieceCreateMeshFloor(bitmap,xBound,yBound,zBound,flag)
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
    
        // always force normals up
        
    var nIdx=0;
    var normals=new Float32Array(18);
    
    for (n=0;n!==6;n++) {
        normals[nIdx++]=0.0;
        normals[nIdx++]=-1.0;
        normals[nIdx++]=0.0;
    }
    
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
    var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new mapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flag));
}

function mapPieceCreateMeshCeiling(bitmap,xBound,yBound,zBound,flag)
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
    
        // always force normals down
        
    var nIdx=0;
    var normals=new Float32Array(18);
    
    for (n=0;n!==6;n++) {
        normals[nIdx++]=0.0;
        normals[nIdx++]=1.0;
        normals[nIdx++]=0.0;
    }
    
        // calcualte the uvs, and finally the UVs to
        // calculate the tangents
        
    var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
    var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    return(new mapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flag));
}

function mapPieceCreateMeshWalls(bitmap,xBound,yBound,zBound,flag)
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
        x1=xBound.min+Math.floor((xBound.max-xBound.min)*(pt[0]*0.01));
        z1=zBound.min+Math.floor((zBound.max-zBound.min)*(pt[1]*0.01));
        
        pt=this.points[k];
        x2=xBound.min+Math.floor((xBound.max-xBound.min)*(pt[0]*0.01));
        z2=zBound.min+Math.floor((zBound.max-zBound.min)*(pt[1]*0.01));
        
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
        
    var normals=meshUVTangents.buildMeshNormals(vertices,indexes,true);
    var uvs=meshUVTangents.buildMeshUVs(bitmap,vertices,normals);
    var tangents=meshUVTangents.buildMeshTangents(vertices,uvs,indexes);
    
        // finally create the mesh
        
    var mesh=new mapMeshObject(bitmap,vertices,normals,tangents,uvs,indexes,flag);
    
        // add these same lines as
        // collision lines to be used
        // by the physics
    
    for (n=0;n!==nPoint;n++) {
        k=n+1;
        if (k===nPoint) k=0;
        
        pt=this.points[n];
        x1=xBound.min+Math.floor((xBound.max-xBound.min)*(pt[0]*0.01));
        z1=zBound.min+Math.floor((zBound.max-zBound.min)*(pt[1]*0.01));
        
        pt=this.points[k];
        x2=xBound.min+Math.floor((xBound.max-xBound.min)*(pt[0]*0.01));
        z2=zBound.min+Math.floor((zBound.max-zBound.min)*(pt[1]*0.01));
        
        mesh.addCollisionLine(new wsLine(new ws2DPoint(x1,z1),new ws2DPoint(x2,z2)));
    }
    
    return(mesh);
}

//
// build connection line list
//
// any line that is straight, 20 in length, and either X
// or Z is at 0 or 1 can connect to another mesh
//

function mapPieceBuildConnectLines()
{
    var n,k,pt1,pt2;
    var nPoint=this.points.length;
    
    for (n=0;n!==nPoint;n++) {
        k=n+1;
        if (k===nPoint) k=0;
        
        pt1=this.points[n];
        pt2=this.points[k];
        
        if (((pt1[0]===0) && (pt2[0]===0)) || ((pt1[0]===100) && (pt2[0]===100))) {
            if (Math.abs(pt1[1]-pt2[1])===20) this.connectLines.push([n,k]);
        }
        if (((pt1[1]===0) && (pt2[1]===0)) || ((pt1[1]===100) && (pt2[1]===100))) {
            if (Math.abs(pt1[0]-pt2[0])===20) this.connectLines.push([n,k]);
        }
   }
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
    
    this.buildConnectLines=mapPieceBuildConnectLines;
    
    this.getConnectType=mapPieceGetConnectType;
    this.isConnectTypeOpposite=mapPieceIsConnectTypeOpposite;
    this.getConnectTypeOffset=mapPieceGetConnectTypeOffset;
    this.getConnectTypeLength=mapPieceGetConnectTypeLength;
    
    this.createMeshFloor=mapPieceCreateMeshFloor;
    this.createMeshCeiling=mapPieceCreateMeshCeiling;
    this.createMeshWalls=mapPieceCreateMeshWalls;
}

//
// add to pieces array
//

function mapPieceClone(mapPiece)
{
    var mapPiece2=new mapPieceObject(mapPiece.isRoom);
    mapPiece2.points=JSON.parse(JSON.stringify(mapPiece.points));
    mapPiece2.connectLines=JSON.parse(JSON.stringify(mapPiece.connectLines));
    return(mapPiece2);
}

function mapPieceMirror(mapPiece)
{
    var n,nPoint,pt;
    
    nPoint=mapPiece.points.length;
    
    for (n=0;n!==nPoint;n++) {
        pt=mapPiece.points[n];
        pt[1]=100-pt[1];
    }
}

function mapPieceRotate(mapPiece)
{
    var n,k,nPoint,pt;
    
    nPoint=mapPiece.points.length;
    
    for (n=0;n!==nPoint;n++) {
        pt=mapPiece.points[n];
        k=pt[0];
        pt[0]=pt[1];
        pt[1]=k;
    }
}

function mapPieceAdd(mapPiece)
{
        // build the connection
        // line cache
        
    mapPiece.buildConnectLines();
    
        // push a regular version
        // into the arrays
        
    genMapPieces.push(mapPiece);
    
        // now a mirrored version
        
    var mapPiece2=mapPieceClone(mapPiece);
    mapPieceMirror(mapPiece2);    
    genMapPieces.push(mapPiece2);
    
        // rotated version
        
    mapPiece2=mapPieceClone(mapPiece);
    mapPieceRotate(mapPiece2);    
    genMapPieces.push(mapPiece2);
        
        // rotated and mirrored version
        
    mapPiece2=mapPieceClone(mapPiece);
    mapPieceMirror(mapPiece2);    
    mapPieceRotate(mapPiece2);
    genMapPieces.push(mapPiece2);
}

//
// setup map pieces
//

function mapPieceSetup()
{
    var mapPiece;
    
        // clear pieces
        
    genMapPieces=[];
    
        // box

    mapPiece=new mapPieceObject(true);

    mapPiece.points.push([0,0]);
    mapPiece.points.push([20,0]);
    mapPiece.points.push([40,0]);
    mapPiece.points.push([60,0]);
    mapPiece.points.push([80,0]);
    mapPiece.points.push([100,0]);
    mapPiece.points.push([100,20]);
    mapPiece.points.push([100,40]);
    mapPiece.points.push([100,60]);
    mapPiece.points.push([100,80]);
    mapPiece.points.push([100,100]);
    mapPiece.points.push([80,100]);
    mapPiece.points.push([60,100]);
    mapPiece.points.push([40,100]);
    mapPiece.points.push([20,100]);
    mapPiece.points.push([0,100]);
    mapPiece.points.push([0,80]);
    mapPiece.points.push([0,60]);
    mapPiece.points.push([0,40]);
    mapPiece.points.push([0,20]);

    mapPieceAdd(mapPiece);

        // half circle

    mapPiece=new mapPieceObject(true);

    mapPiece.points.push([0,40]);
    mapPiece.points.push([10,20]);
    mapPiece.points.push([20,10]);
    mapPiece.points.push([40,0]);
    mapPiece.points.push([60,0]);
    mapPiece.points.push([80,10]);
    mapPiece.points.push([90,20]);
    mapPiece.points.push([100,40]);
    mapPiece.points.push([100,60]);
    mapPiece.points.push([100,80]);
    mapPiece.points.push([100,100]);
    mapPiece.points.push([80,100]);
    mapPiece.points.push([60,100]);
    mapPiece.points.push([40,100]);
    mapPiece.points.push([20,100]);
    mapPiece.points.push([0,100]);
    mapPiece.points.push([0,80]);
    mapPiece.points.push([0,60]);

    mapPieceAdd(mapPiece);

        // plus

    mapPiece=new mapPieceObject(false);

    mapPiece.points.push([4,0]);
    mapPiece.points.push([6,0]);
    mapPiece.points.push([6,4]);
    mapPiece.points.push([100,4]);
    mapPiece.points.push([100,6]);
    mapPiece.points.push([6,6]);
    mapPiece.points.push([6,100]);
    mapPiece.points.push([4,100]);
    mapPiece.points.push([4,6]);
    mapPiece.points.push([0,6]);
    mapPiece.points.push([0,4]);
    mapPiece.points.push([4,4]);

    mapPieceAdd(mapPiece);

        // Half X

    mapPiece=new mapPieceObject(false);

    mapPiece.points.push([0,0]);
    mapPiece.points.push([20,0]);
    mapPiece.points.push([40,20]);
    mapPiece.points.push([60,20]);
    mapPiece.points.push([80,0]);
    mapPiece.points.push([100,0]);
    mapPiece.points.push([100,20]);
    mapPiece.points.push([80,40]);
    mapPiece.points.push([80,60]);
    mapPiece.points.push([80,80]);
    mapPiece.points.push([80,100]);
    mapPiece.points.push([60,100]);
    mapPiece.points.push([40,100]);
    mapPiece.points.push([20,100]);
    mapPiece.points.push([20,80]); 
    mapPiece.points.push([20,60]);
    mapPiece.points.push([20,40]);
    mapPiece.points.push([0,20]);
    
    mapPieceAdd(mapPiece);

        // U

    mapPiece=new mapPieceObject(false);

    mapPiece.points.push([0,0]);
    mapPiece.points.push([20,0]);
    mapPiece.points.push([40,0]);
    mapPiece.points.push([40,40]);
    mapPiece.points.push([60,40]);
    mapPiece.points.push([60,0]);
    mapPiece.points.push([80,0]);
    mapPiece.points.push([100,0]);
    mapPiece.points.push([100,20]);
    mapPiece.points.push([100,40]);
    mapPiece.points.push([100,60]);
    mapPiece.points.push([100,80]);
    mapPiece.points.push([80,100]);
    mapPiece.points.push([60,100]);
    mapPiece.points.push([40,100]);
    mapPiece.points.push([20,100]);
    mapPiece.points.push([0,80]);
    mapPiece.points.push([0,60]);
    mapPiece.points.push([0,40]);
    mapPiece.points.push([0,20]);

    mapPieceAdd(mapPiece);
}
    