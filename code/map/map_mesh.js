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
// special object used to pre-calc some
// light map calculations
//

function MapMeshLightMapTrigCacheObject(v0,v10,v20)
{
    this.v0=v0;        // point 0 on the triangle
    this.v10=v10;      // vector of point 1-point 0
    this.v20=v20;      // vector of point 2-point 0
}

//
// map mesh class
//

function MapMeshObject(bitmap,vertexList,indexes,flag)
{
    this.bitmap=bitmap;
    this.lightmap=null;
    this.vertexList=vertexList;
    this.indexes=indexes;
    this.flag=flag;
    
    this.tempLightmapIdx=0;         // used to track light maps when building them, not used otherwise
    
    this.vertexCount=this.vertexList.length;
    this.indexCount=this.indexes.length;
    this.trigCount=Math.floor(this.indexCount/3);
    
        // non-culled index list
        
    this.nonCulledIndexCount=0;
    this.nonCulledIndexes=null;
    
        // drawing arrays
        
    this.drawVertices=null;
    this.drawNormals=null;
    this.drawTangents=null;
    this.drawPackedUVs=null;
    
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
    
    this.boxTouchOtherMesh=function(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.max) || (this.xBound.max===checkMesh.xBound.min)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.max) || (this.zBound.max===checkMesh.zBound.min)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
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
        var n,tIdx;
        var vp0,vp1,vp2,v10,v20;

            // this builds a specialized cache to
            // speed up ray tracing.  For each triangle
            // in the mesh it stores a vertex, and the
            // vectors to the other two vertexes

        this.trigRayTraceCache=[];
        
        tIdx=0;

        for (n=0;n!==this.trigCount;n++) {

            vp0=this.vertexList[this.indexes[tIdx++]].position;
            vp1=this.vertexList[this.indexes[tIdx++]].position;
            vp2=this.vertexList[this.indexes[tIdx++]].position;
            
            v10=new wsPoint((vp1.x-vp0.x),(vp1.y-vp0.y),(vp1.z-vp0.z));
            v20=new wsPoint((vp2.x-vp0.x),(vp2.y-vp0.y),(vp2.z-vp0.z));
            
            this.trigRayTraceCache.push(new MapMeshLightMapTrigCacheObject(vp0,v10,v20));
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
        
            // is rect already in list?
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
            // and find any that make a wall to
            // create collision lines and floors
            // to create collision boxes
            
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
        // mesh binding
        //

    this.setupBuffers=function(view)
    {
            // build the default data
            // from the vertex list
        
        var n;
        
        this.drawVertices=new Float32Array(this.vertexCount*3);
        this.drawNormals=new Float32Array(this.vertexCount*3);
        this.drawTangents=new Float32Array(this.vertexCount*3);
        this.drawPackedUVs=new Float32Array(this.vertexCount*4);
        
        var vIdx=0;
        var uIdx=0;
        var nIdx=0;
        var tIdx=0;
        var v;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.drawVertices[vIdx++]=v.position.x;
            this.drawVertices[vIdx++]=v.position.y;
            this.drawVertices[vIdx++]=v.position.z;
            
            this.drawNormals[nIdx++]=v.normal.x;
            this.drawNormals[nIdx++]=v.normal.y;
            this.drawNormals[nIdx++]=v.normal.z;
            
            this.drawTangents[tIdx++]=v.tangent.x;
            this.drawTangents[tIdx++]=v.tangent.y;
            this.drawTangents[tIdx++]=v.tangent.z;
            
            this.drawPackedUVs[uIdx++]=v.uv.x;           // texture UV and light map UV pakced into a 4 part vector
            this.drawPackedUVs[uIdx++]=v.uv.y;
            this.drawPackedUVs[uIdx++]=v.lightmapUV.x;
            this.drawPackedUVs[uIdx++]=v.lightmapUV.y;
        }

            // create all the buffers
            // expects buffers to already be Float32Array
            // or Uint16Array

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.STATIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawNormals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawTangents,gl.STATIC_DRAW);

        this.vertexAndLightmapUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawPackedUVs,gl.STATIC_DRAW);

            // indexes are dynamic
            
        this.indexBuffer=gl.createBuffer();
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

            // need to always rebuild the array from the culled list
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.nonCulledIndexes,gl.DYNAMIC_DRAW);
    };
    
        //
        // build an index list of triangles that aren't
        // culled
        //
        
    this.buildNonCulledTriangleIndexes=function(view)
    {
        var n,v,idx;
        var trigToEyeVector=new wsPoint(0,0,0);

            // if it's the first time, we'll need
            // to create the index array
            
        this.nonCulledIndexCount=0;
        if (this.nonCulledIndexes===null) this.nonCulledIndexes=new Uint16Array(this.indexCount);
        
            // build it out of triangles
            // that aren't normal culled, i.e.,
            // have normals facing away from the eye
            // which is the dot product between the normal
            // and the vector from trig to eye point
        
        idx=0;
        
        for (n=0;n!==this.trigCount;n++) {
            
                // vector from trig to eye point
                
            v=this.vertexList[this.indexes[idx]];
            trigToEyeVector.setFromSubPoint(v.position,view.camera.position);
            trigToEyeVector.normalize();
            
                // dot product
                
            if (trigToEyeVector.dot(v.normal)<=view.VIEW_NORMAL_CULL_LIMIT) {
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+1];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+2];
            }    
        
            idx+=3;
        }
    };
    
        //
        // mesh drawing
        //

    this.draw=function(view)
    {
        var gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.nonCulledIndexCount,gl.UNSIGNED_SHORT,0);
        
        view.drawMeshCount++;
        view.drawMeshTrigCount+=Math.floor(this.nonCulledIndexCount/3);
    };
        
        // setup bounds
        // supergumba -- THIS IS A HACK, when these
        // are classes move this to constructor
        
    this.setupBounds();

}
