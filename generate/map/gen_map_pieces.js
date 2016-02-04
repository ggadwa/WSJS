"use strict";

//
// map piece class
//

function MapPieceObject()
{
    this.points=[];
    
    


        //
        // piece object mesh creation
        //

    this.createMeshFloorOrCeiling=function(bitmap,xBound,yBound,zBound,isFloor,flag)
    {
        var x,z,vxMin,vxMax,vzMin,vzMax;
        
            // get the vertex count
            
        var count=0;
        
        for (z=0;z!==10;z++) {
            for (x=0;x!==10;x++) {
                count++;            // supergumba -- all this gets replaced
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
        
        for (z=0;z!==10;z++) {
            for (x=0;x!==10;x++) {
                vxMin=xBound.min+Math.floor(sx*(x*0.1));
                vxMax=xBound.min+Math.floor(sx*((x+1)*0.1));
                vzMin=zBound.min+Math.floor(sz*(z*0.1));
                vzMax=zBound.min+Math.floor(sz*((z+1)*0.1));
                
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
            
            lineList.push(new ws2DLine(new ws2DIntPoint(x,z),new ws2DIntPoint(x2,z2)));
        }

        return(lineList);
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
        mapPiece.points.push([10,0]);
        mapPiece.points.push([20,0]);
        mapPiece.points.push([30,0]);
        mapPiece.points.push([40,0]);
        mapPiece.points.push([50,0]);
        mapPiece.points.push([60,0]);
        mapPiece.points.push([70,0]);
        mapPiece.points.push([80,0]);
        mapPiece.points.push([90,0]);
        mapPiece.points.push([100,0]);
        mapPiece.points.push([100,10]);
        mapPiece.points.push([100,20]);
        mapPiece.points.push([100,30]);
        mapPiece.points.push([100,40]);
        mapPiece.points.push([100,50]);
        mapPiece.points.push([100,60]);
        mapPiece.points.push([100,70]);
        mapPiece.points.push([100,80]);
        mapPiece.points.push([100,90]);
        mapPiece.points.push([100,100]);
        mapPiece.points.push([90,100]);
        mapPiece.points.push([80,100]);
        mapPiece.points.push([70,100]);
        mapPiece.points.push([60,100]);
        mapPiece.points.push([50,100]);
        mapPiece.points.push([40,100]);
        mapPiece.points.push([30,100]);
        mapPiece.points.push([20,100]);
        mapPiece.points.push([10,100]);
        mapPiece.points.push([0,100]);
        mapPiece.points.push([0,90]);
        mapPiece.points.push([0,80]);
        mapPiece.points.push([0,70]);
        mapPiece.points.push([0,60]);
        mapPiece.points.push([0,50]);
        mapPiece.points.push([0,40]);
        mapPiece.points.push([0,30]);
        mapPiece.points.push([0,20]);
        mapPiece.points.push([0,10]);

        this.add(mapPiece);
    };
    
        //
        // map piece list items
        //

    this.add=function(mapPiece)
    {

            // push a regular version
            // into the arrays

        this.mapPieces.push(mapPiece);
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
