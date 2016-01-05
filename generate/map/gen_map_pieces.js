"use strict";

//
// map piece class
//

function MapPieceObject()
{
    this.points=[];
    this.connectLines=[];
    this.decorationLocations=[];
    
    this.floorGrid=null;
    
    this.CONNECT_TYPE_LEFT=0;
    this.CONNECT_TYPE_TOP=1;
    this.CONNECT_TYPE_RIGHT=2;
    this.CONNECT_TYPE_BOTTOM=3;
    
        //
        // piece object misc functions
        //

    this.getConnectType=function(connectLineIdx)
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
    };

    this.isConnectTypeOpposite=function(connectLineIdx,connectType)
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
    };

    this.getConnectTypeOffset=function(connectLineIdx,xBound,zBound)
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
    };

    this.getConnectTypeLength=function(connectLineIdx,xBound,zBound)
    {
        var connectLine=this.connectLines[connectLineIdx];
        var pt1=this.points[connectLine[0]];
        var pt2=this.points[connectLine[1]];
        
        var sx=xBound.getSize();

        var x1=Math.floor(sx*(pt1[0]*0.01));
        var x2=Math.floor(sx*(pt2[0]*0.01));

        var sz=zBound.getSize();
        
        var z1=Math.floor(sz*(pt1[1]*0.01));
        var z2=Math.floor(sz*(pt2[1]*0.01));

        return([Math.abs(x2-x1),Math.abs(z2-z1)]);
    };

        //
        // piece object mesh creation
        //

    this.createMeshFloorOrCeiling=function(bitmap,xBound,yBound,zBound,isFloor,flag)
    {
        var x,z,vxMin,vxMax,vzMin,vzMax;
        
            // get the vertex count
            
        var count=0;
        
        for (z=0;z!==5;z++) {
            for (x=0;x!==5;x++) {
                count+=this.floorGrid[z][x];
            }
        }
        
        if (count===0) return(null);
        
            // bounds
            
        var sx=xBound.getSize();
        var sz=zBound.getSize();
        
            // create mesh
            
        var v;
        var vertexList=meshUtility.createMapVertexList(count*6);
        var indexes=new Uint16Array(count*6);
        
        var vIdx=0;
        var iIdx=0;
        
        var y=isFloor?yBound.max:yBound.min;
        var ny=isFloor?-1.0:1.0;
        
        for (z=0;z!==5;z++) {
            for (x=0;x!==5;x++) {
                if (this.floorGrid[z][x]===0) continue;
        
                vxMin=xBound.min+Math.floor(sx*(x*0.2));
                vxMax=xBound.min+Math.floor(sx*((x+1)*0.2));
                vzMin=zBound.min+Math.floor(sz*(z*0.2));
                vzMax=zBound.min+Math.floor(sz*((z+1)*0.2));
                
                v=vertexList[vIdx];
                v.position.set(vxMin,y,vzMin);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+1];
                v.position.set(vxMax,y,vzMin);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+2];
                v.position.set(vxMax,y,vzMax);
                v.normal.set(0.0,ny,0.0);
                
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                
                v=vertexList[vIdx];
                v.position.set(vxMin,y,vzMin);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+1];
                v.position.set(vxMax,y,vzMax);
                v.normal.set(0.0,ny,0.0);
                
                v=vertexList[vIdx+2];
                v.position.set(vxMin,y,vzMax);
                v.normal.set(0.0,ny,0.0);

                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
                indexes[iIdx++]=vIdx++;
            }
        }
        
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        return(new MapMeshObject(bitmap,vertexList,indexes,flag));
    };

    this.createMeshWalls=function(bitmap,xBound,yBound,zBound,flag)
    {
        var n,k,nPoint,x1,x2,z1,z2;
        var pt;

            // build the vertices.  Each triangle gets it's
            // own vertices so normals and light map UVs work

        nPoint=this.points.length;

        var vertexList=meshUtility.createMapVertexList(nPoint*6);
        var indexes=new Uint16Array(nPoint*6);
        
        var sx=xBound.getSize();
        var sz=zBound.getSize();
        
        var vIdx=0;
        var iIdx=0;

        for (n=0;n!==nPoint;n++) {
            k=n+1;
            if (k===nPoint) k=0;

            pt=this.points[n];
            x1=xBound.min+Math.floor(sx*(pt[0]*0.01));
            z1=zBound.min+Math.floor(sz*(pt[1]*0.01));

            pt=this.points[k];
            x2=xBound.min+Math.floor(sx*(pt[0]*0.01));
            z2=zBound.min+Math.floor(sz*(pt[1]*0.01));

            vertexList[vIdx].position.set(x1,yBound.min,z1);
            vertexList[vIdx+1].position.set(x2,yBound.min,z2);
            vertexList[vIdx+2].position.set(x2,yBound.max,z2);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;

            vertexList[vIdx].position.set(x1,yBound.min,z1);
            vertexList[vIdx+1].position.set(x2,yBound.max,z2);
            vertexList[vIdx+2].position.set(x1,yBound.max,z1);

            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
            indexes[iIdx++]=vIdx++;
        }

            // calculate the normals, then use those to
            // calcualte the uvs, and finally the UVs to
            // calculate the tangents

        meshUtility.buildVertexListNormals(vertexList,indexes,null,true);
        meshUtility.buildVertexListUVs(bitmap,vertexList);
        meshUtility.buildVertexListTangents(vertexList,indexes);

            // finally create the mesh

        var mesh=new MapMeshObject(bitmap,vertexList,indexes,flag);

        return(mesh);
    };
    
    this.createOverlayLineList=function(xBound,zBound)
    {
        var n,k,nPoint,x,z,x2,z2;
        var pt1,pt2;

        nPoint=this.points.length;

        var lineList=[];
        
        var sx=xBound.getSize();
        var sz=zBound.getSize();
        
        for (n=0;n!==nPoint;n++) {
            pt1=this.points[n];
            
            k=n+1;
            if (k===nPoint) k=0;
            pt2=this.points[k];
            
            x=xBound.min+Math.floor(sx*(pt1[0]*0.01));
            z=zBound.min+Math.floor(sz*(pt1[1]*0.01));

            x2=xBound.min+Math.floor(sx*(pt2[0]*0.01));
            z2=zBound.min+Math.floor(sz*(pt2[1]*0.01));
            
            lineList.push(new ws2DLine(new ws2DPoint(x,z),new ws2DPoint(x2,z2)));
        }

        return(lineList);
    };
    
        //
        // build connection line list
        //
        // any line that is straight, 20 in length, and either X
        // or Z is at 0 or 1 can connect to another mesh
        //

    this.buildConnectLines=function()
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
    };

        //
        // clone, mirror, and rotate
        //

    this.clone=function()
    {
        var mapPiece2=new MapPieceObject();
        mapPiece2.points=JSON.parse(JSON.stringify(this.points));
        mapPiece2.connectLines=JSON.parse(JSON.stringify(this.connectLines));
        mapPiece2.decorationLocations=JSON.parse(JSON.stringify(this.decorationLocations));
        mapPiece2.floorGrid=JSON.parse(JSON.stringify(this.floorGrid));
        return(mapPiece2);
    };

    this.mirror=function()
    {
        var n,nPoint,pt;
        var x,y;

        nPoint=this.points.length;

        for (n=0;n!==nPoint;n++) {
            pt=this.points[n];
            pt[1]=100-pt[1];
        }
        
        nPoint=this.decorationLocations.length;

        for (n=0;n!==nPoint;n++) {
            pt=this.decorationLocations[n];
            pt[1]=100-pt[1];
        }
        
        var grid=[];

        for (y=0;y!==5;y++) {
            grid.push(this.floorGrid[4-y]);
        }

        this.floorGrid=grid;
    };

    this.rotate=function()
    {
        var n,k,nPoint,pt;
        var x,y;

        nPoint=this.points.length;

        for (n=0;n!==nPoint;n++) {
            pt=this.points[n];
            k=pt[0];
            pt[0]=pt[1];
            pt[1]=k;
        }
        
        nPoint=this.decorationLocations.length;

        for (n=0;n!==nPoint;n++) {
            pt=this.decorationLocations[n];
            k=pt[0];
            pt[0]=pt[1];
            pt[1]=k;
        }
        
        var grid=[
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0]
        ];

        for (y=0;y!==5;y++) {
            for (x=0;x!==5;x++) {
                grid[x][y]=this.floorGrid[y][x];
            }
        }

        this.floorGrid=grid;
    };
    
}

//
// map piece list class
//

function MapPieceListObject()
{
    var mapPiece;
    
        // map piece array
        
    this.mapPieces=[];
    
        //
        // fill with default pieces
        //
        
    this.fill=function()
    {
    
            // box

        mapPiece=new MapPieceObject();

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
        
        mapPiece.floorGrid=[
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1]
        ];

        this.add(mapPiece);

            // half circle

        mapPiece=new MapPieceObject();

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
        
        mapPiece.floorGrid=[
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1]
        ];

        this.add(mapPiece);
        
            // slant

        mapPiece=new MapPieceObject();

        mapPiece.points.push([40,0]);
        mapPiece.points.push([60,0]);
        mapPiece.points.push([80,0]);
        mapPiece.points.push([100,0]);
        mapPiece.points.push([100,20]);
        mapPiece.points.push([60,100]);
        mapPiece.points.push([40,100]);
        mapPiece.points.push([20,100]);
        mapPiece.points.push([0,100]);
        mapPiece.points.push([0,80]);
        mapPiece.points.push([0,60]);
        
        mapPiece.floorGrid=[
          [0,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,1],
          [1,1,1,1,0]
        ];

        this.add(mapPiece);
    };
    
        //
        // map piece list items
        //

    this.add=function(mapPiece)
    {
            // build the connection
            // line cache

        mapPiece.buildConnectLines();

            // push a regular version
            // into the arrays

        this.mapPieces.push(mapPiece);

            // now a mirrored version

        var mapPiece2=mapPiece.clone();
        mapPiece2.mirror();    
        this.mapPieces.push(mapPiece2);

            // rotated version

        mapPiece2=mapPiece.clone();
        mapPiece2.rotate();    
        this.mapPieces.push(mapPiece2);

            // rotated and mirrored version

        mapPiece2=mapPiece.clone();
        mapPiece2.mirror();    
        mapPiece2.rotate();
        this.mapPieces.push(mapPiece2);
    };

    this.count=function()
    {
        return(this.mapPieces.length);
    };

    this.get=function(pieceIdx)
    {
        return(this.mapPieces[pieceIdx]);
    };

}
