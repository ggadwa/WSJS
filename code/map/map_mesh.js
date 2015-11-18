"use strict";

//
// map mesh vertex
//

function MapMeshVertexObject()
{
    this.position=new wsPoint(0,0,0);
    this.normal=new wsPoint(0.0,0.0,0.0);
    this.tangent=new wsPoint(0.0,0.0,0.0);
    this.uv=new ws2DPoint(0.0,0.0);
    this.lightmapUV=new ws2DPoint(0.0,0.0);
}

//
// map mesh class
//

function MapMeshObject(bitmap,vertexList,vertices,normals,tangents,vertexUVs,indexes,flag)
{
    this.bitmap=bitmap;
    this.lightmap=null;
    this.vertexList=vertexList;
    this.indexes=indexes;
    this.flag=flag;
    
        
            // SUPERGUMBA __ TEMP!
            // rebuilding vertex list for routines that don't make it yet
            
    if (this.vertexList===null) {
        this.vertexList=[];
        
        var n;
        var nVertex=Math.floor(vertices.length/3);

            
        var vIdx=0;
        var uIdx=0;
        var nIdx=0;
        var tIdx=0;
        var v;
        
        for (n=0;n!==nVertex;n++) {
            v=new MapMeshVertexObject();
            
            v.position.x=vertices[vIdx++];
            v.position.y=vertices[vIdx++];
            v.position.z=vertices[vIdx++];
            
            v.uv.x=vertexUVs[uIdx++];
            v.uv.y=vertexUVs[uIdx++];
            
            v.normal.x=normals[nIdx++];
            v.normal.y=normals[nIdx++];
            v.normal.z=normals[nIdx++];
            
            v.tangent.x=tangents[tIdx++];
            v.tangent.y=tangents[tIdx++];
            v.tangent.z=tangents[tIdx++];
            
            this.vertexList.push(v);
        }
    }

    
    this.vertexCount=this.vertexList.length;
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // null buffers
        
    this.vertexPosBuffer=null;
    this.vertexNormalBuffer=null;
    this.vertexTangentBuffer=null;
    this.vertexAndLightmapUVAttribute=null;
    this.indexBuffer=null;
    
        // special caches for light map building
        
    this.trigRayTraceCache=null;
    
        // collision lists
        
    this.collisionLines=[];
    this.collisionRects=[];
    
        // supergumba -- NOTE!!!  When this is constructor, move in
        //  this.setupBounds(); to end of constructor, need this at the
        // bottom now so function is defined, won't be a problem with classes
    
        //
        // close mesh
        //

    this.close=function(view)
    {
        var gl=view.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexAndLightmapUVAttribute!==null) gl.deleteBuffer(this.vertexAndLightmapUVAttribute);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    };
    
        //
        // combine two meshes
        //

    this.combineMesh=function(mesh)
    {
        var n;
        
            // add the vertexes

        for (n=0;n!==mesh.vertexCount;n++) {
            this.vertexList.push(mesh.vertexList[n]);
        }

            // indexes need to be moved

        var indexes2=new Uint16Array(this.indexes.length+mesh.indexes.length);
        indexes2.set(this.indexes,0);

        var iAdd=this.indexes.length;

        for (n=0;n!==mesh.indexes.length;n++) {
            indexes2[n+iAdd]=mesh.indexes[n]+iAdd;
        }

        this.indexes=indexes2;

            // reset counts

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.floor(this.indexCount/3);

            // setup bounds

        this.setupBounds();
    };

        //
        // mesh box collision
        //

    this.boxBoundCollision=function(xBound,yBound,zBound)
    {
        if (xBound!==null) {
            if (this.xBound.min>=xBound.max) return(false);
            if (this.xBound.max<=xBound.min) return(false);
        }
        if (yBound!==null) {
            if (this.yBound.min>=yBound.max) return(false);
            if (this.yBound.max<=yBound.min) return(false);
        }
        if (zBound!==null) {
            if (this.zBound.min>=zBound.max) return(false);
            if (this.zBound.max<=zBound.min) return(false);
        }
        return(true);
    };

    this.boxMeshCollision=function(checkMesh)
    {
        if (this.xBound.min>=checkMesh.xBound.max) return(false);
        if (this.xBound.max<=checkMesh.xBound.min) return(false);
        if (this.yBound.min>=checkMesh.yBound.max) return(false);
        if (this.yBound.max<=checkMesh.yBound.min) return(false);
        if (this.zBound.min>=checkMesh.zBound.max) return(false);
        return(!(this.zBound.max<=checkMesh.zBound.min));
    };

        //
        // triangles
        //

    this.getTriangleVertex=function(trigIdx,vertexIdx)
    {
        var v=this.vertexList[this.indexes[(trigIdx*3)+vertexIdx]];
        return(new wsPoint(v.position.x,v.position.y,v.position.z));
    };

    this.getTriangleBounds=function(trigIdx)
    {
        var v=this.getTriangleVertex(trigIdx,0);

        var xBound=new wsBound(v.x,v.x);
        var yBound=new wsBound(v.y,v.y);
        var zBound=new wsBound(v.z,v.z);

        for (var n=1;n!==3;n++) {
            v=this.getTriangleVertex(trigIdx,n);
            xBound.adjust(v.x);
            yBound.adjust(v.y);
            zBound.adjust(v.z);
        }

        return([xBound,yBound,zBound]);
    };

    this.isTriangleStraightWall=function(trigIdx)
    {
        var v0=this.getTriangleVertex(trigIdx,0);
        var v1=this.getTriangleVertex(trigIdx,0);
        var v2=this.getTriangleVertex(trigIdx,0);

            // if all the Xs of Zs are equal,
            // consider it a straight wall

        if ((v0.x===v1.x) && (v0.x===v2.x)) return(true);
        if ((v0.z===v1.z) && (v0.z===v2.z)) return(true);

        return(false);
    };

    this.removeTriangle=function(trigIdx)
    {
        if (this.indexCount===0) return;
        if ((trigIdx<0) || (trigIdx>=this.trigCount)) return;

            // rebuild the array

        var newIndexes=new Uint16Array(this.indexCount-3);

        var n;
        var idx=0;
        var cutIdx=trigIdx*3;

        for (n=0;n<cutIdx;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        for (n=(cutIdx+3);n<this.indexCount;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        this.indexes=newIndexes;

            // fix a couple counts

        this.indexCount=this.indexes.length;
        this.trigCount=Math.floor(this.indexCount/3);
    };

        //
        // setup mesh boxes and bounds
        //

    this.setupBounds=function()
    {
        var v=this.vertexList[0];
        
        this.center=new wsPoint(v.position.x,v.position.y,v.position.z);
        this.xBound=new wsBound(v.position.x,v.position.x);
        this.yBound=new wsBound(v.position.y,v.position.y);
        this.zBound=new wsBound(v.position.z,v.position.z);

        var n;

        for (n=1;n<this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.center.addPoint(v.position);

            this.xBound.adjust(v.position.x);
            this.yBound.adjust(v.position.y);
            this.zBound.adjust(v.position.z);
        }

        this.center.x/=this.vertexCount;
        this.center.y/=this.vertexCount;
        this.center.z/=this.vertexCount;
    };

        //
        // special cache for ray tracing
        //

    this.buildTrigRayTraceCache=function()
    {
        var n,tIdx,cIdx;
        var v0,v1,v2;

            // this builds a specialized cache to
            // speed up ray tracing.  For each triangle
            // in the mesh it builds this packed array

            // X of point 0
            // Y of point 0
            // Z of point 0
            // vector X of point 1-point 0
            // vector Y of point 1-point 0
            // vector Z of point 1-point 0
            // vector X of point 2-point 0
            // vector Y of point 2-point 0
            // vector Z of point 2-point 0

        this.trigRayTraceCache=new Float32Array(this.trigCount*9);

        tIdx=0;
        cIdx=0;

        for (n=0;n!==this.trigCount;n++) {
            v0=this.vertexList[this.indexes[tIdx++]];
            v1=this.vertexList[this.indexes[tIdx++]];
            v2=this.vertexList[this.indexes[tIdx++]];

                // point 0 of the triangle

            this.trigRayTraceCache[cIdx++]=v0.position.x;
            this.trigRayTraceCache[cIdx++]=v0.position.y;
            this.trigRayTraceCache[cIdx++]=v0.position.z;

                // vector of point 1-point 0

            this.trigRayTraceCache[cIdx++]=v1.position.x-v0.position.x;    
            this.trigRayTraceCache[cIdx++]=v1.position.y-v0.position.y;    
            this.trigRayTraceCache[cIdx++]=v1.position.z-v0.position.z;

                // vector of point 2-point 0

            this.trigRayTraceCache[cIdx++]=v2.position.x-v0.position.x;
            this.trigRayTraceCache[cIdx++]=v2.position.y-v0.position.y;
            this.trigRayTraceCache[cIdx++]=v2.position.z-v0.position.z;
        }
    };

        //
        // collision geometry
        //

    this.buildCollisionGeometryLine=function(v0,v1,v2)
    {
        var n,nLine,line;
        
            // create the line

        if (v0.y===v1.y) {
            line=new wsLine(v0.position.copy(),v2.position.copy());
        }
        else {
            line=new wsLine(v0.position.copy(),v1.position.copy());
        }

            // is line already in list?
            // usually, two triangles make
            // a single line

        nLine=this.collisionLines.length;

        for (n=0;n!==nLine;n++) {
            if (this.collisionLines[n].equals(line)) return;
        }

        this.collisionLines.push(line);
    };
    
    this.buildCollisionGeometryFloor=function(v0,v1,v2)
    {
        var n,nRect;
        var lft,top,rgt,bot;
        
            // get 2D box
            
        lft=rgt=v0.position.x;
        top=bot=v0.position.z;
        
        if (v1.position.x<lft) lft=v1.position.x;
        if (v2.position.x<lft) lft=v2.position.x;
        if (v1.position.x>rgt) rgt=v1.position.x;
        if (v2.position.x>rgt) rgt=v2.position.x;
        
        if (v1.position.z<top) top=v1.position.z;
        if (v2.position.z<top) top=v2.position.z;
        if (v1.position.z>bot) bot=v1.position.z;
        if (v2.position.z>bot) bot=v2.position.z;
        
            // build the rect
        
        var cRect=new wsCollisionRect(lft,top,rgt,bot,v0.position.y);
        
            // is line already in list?
            // usually, two triangles make
            // a single rectangle

        nRect=this.collisionRects.length;

        for (n=0;n!==nRect;n++) {
            if (this.collisionRects[n].equals(cRect)) return;
        }

        this.collisionRects.push(cRect);
    };
    
    this.buildCollisionGeometry=function()
    {
        var n,ny;
        var tIdx;
        var v0,v1,v2;

            // run through the triangles
            // and find any that make a wall
            // and create a collision lines
            // and boxes
            
        tIdx=0;
            
        for (n=0;n!==this.trigCount;n++) {
            
                // get trig vertices

            v0=this.vertexList[this.indexes[tIdx++]];
            v1=this.vertexList[this.indexes[tIdx++]];
            v2=this.vertexList[this.indexes[tIdx++]];
            
            ny=v0.normal.y;
            
                // detect if triangle is a floor
                
            if (ny<=-0.7) {
                this.buildCollisionGeometryFloor(v0,v1,v2);
            }
            
                // detect if triangle is wall like
            
            else {
                if (Math.abs(ny)<=0.3) {
                    this.buildCollisionGeometryLine(v0,v1,v2);
                }
            }
        }
    };

        //
        // lightmap texture
        //

    this.setLightmap=function(lightmap,lightmapUVs)
    {
        var n,v;
        
        this.lightmap=lightmap;
        
        var idx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            v.lightmapUV.x=lightmapUVs[idx++];
            v.lightmapUV.y=lightmapUVs[idx++];
        }
    };

        //
        // mesh binding
        //

    this.setupBuffers=function(view)
    {
            // build the default data
            // from the vertex list
        
        var n;
        
        var vertices=new Float32Array(this.vertexCount*3);
        var normals=new Float32Array(this.vertexCount*3);
        var tangents=new Float32Array(this.vertexCount*3);
        var packedUVs=new Float32Array(this.vertexCount*4);
        
        var vIdx=0;
        var uIdx=0;
        var nIdx=0;
        var tIdx=0;
        var v;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            vertices[vIdx++]=v.position.x;
            vertices[vIdx++]=v.position.y;
            vertices[vIdx++]=v.position.z;
            
            packedUVs[uIdx++]=v.uv.x;           // texture UV and light map UV pakced into a 4 part vector
            packedUVs[uIdx++]=v.uv.y;
            packedUVs[uIdx++]=v.lightmapUV.x;
            packedUVs[uIdx++]=v.lightmapUV.y;
            
            normals[nIdx++]=v.normal.x;
            normals[nIdx++]=v.normal.y;
            normals[nIdx++]=v.normal.z;
            
            tangents[tIdx++]=v.tangent.x;
            tangents[tIdx++]=v.tangent.y;
            tangents[tIdx++]=v.tangent.z;
        }

            // create all the buffers
            // expects buffers to already be Float32Array
            // or Uint16Array

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,normals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,tangents,gl.STATIC_DRAW);

        this.vertexAndLightmapUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,packedUVs,gl.STATIC_DRAW);

            // indexes are static
            
        this.indexBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.indexes,gl.STATIC_DRAW);    
    };

    this.bindBuffers=function(view,mapShader)
    {
        var gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(mapShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.vertexAttribPointer(mapShader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.vertexAttribPointer(mapShader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
        gl.vertexAttribPointer(mapShader.vertexAndLightmapUVAttribute,4,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
    };
    
        //
        // mesh drawing
        //

    this.draw=function(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.indexCount,gl.UNSIGNED_SHORT,0);
    };
        
        // setup bounds
        // supergumba -- THIS IS A HACK, when these
        // are classes move this to constructor
        
    this.setupBounds();

}
