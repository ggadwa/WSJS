/* global view */

"use strict";

//
// map mesh vertex
//

class MapMeshVertexClass
{
    constructor()
    {
        this.position=new wsPoint(0,0,0);
        this.normal=new wsPoint(0.0,0.0,0.0);
        this.tangent=new wsPoint(0.0,0.0,0.0);
        this.uv=new ws2DPoint(0.0,0.0);
        this.lightmapUV=new ws2DPoint(0.0,0.0);
        
        Object.seal(this);
    }
}

//
// special class used to pre-calc some
// light map calculations
//

class MapMeshLightMapTrigCacheClass
{
    constructor(v0,v10,v20)
    {
        this.v0=v0;        // point 0 on the triangle
        this.v10=v10;      // vector of point 1-point 0
        this.v20=v20;      // vector of point 2-point 0
        
        Object.seal(this);
    }
}

//
// special class used to pre-calc some
// shared triangle elimination calculations
//

class MapMeshSharedTrigCacheClass
{
    constructor()
    {
        this.isWall=false;
        this.xBound=null;
        this.yBound=null;
        this.zBound=null;
        
        Object.seal(this);
    }
}

//
// map mesh class
//

class MapMeshClass
{
    constructor(bitmap,vertexList,indexes,flag)
    {
        this.bitmap=bitmap;
        this.lightmap=null;
        this.vertexList=vertexList;
        this.indexes=indexes;
        this.flag=flag;

        this.tempLightmapIdx=0;         // used to track light maps when building them, not used otherwise

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);
        
            // center and bounds
            
        this.center=new wsPoint(0,0,0);
        this.xBound=new wsBound(0,0);
        this.yBound=new wsBound(0,0);
        this.zBound=new wsBound(0,0);

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
        this.vertexAndLightmapUVBuffer=null;
        this.indexBuffer=null;

            // special caches for light map building

        this.trigRayTraceCache=null;
        this.trigSharedTrigCache=null;
        
            // light intersection lists
            
        this.lightIntersectList=null;

            // collision lists

        this.simpleCollisionGeometry=false;
        
        this.collisionLines=[];
        this.collisionFloorRects=[];
        this.collisionCeilingRects=[];
        
            // marks if the vertices have changed
            // and a buffer update is required
            
        this.requiresBufferUpdate=false;
        
            // setup the bounds
        
        this.setupBounds();
        
        Object.seal(this);
    }
    
        //
        // close mesh
        //

    close()
    {
        let gl=view.gl;
        
        gl.bindBuffer(gl.ARRAY_BUFFER,null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);

        if (this.vertexPosBuffer!==null) gl.deleteBuffer(this.vertexPosBuffer);
        if (this.vertexNormalBuffer!==null) gl.deleteBuffer(this.vertexNormalBuffer);
        if (this.vertexTangentBuffer!==null) gl.deleteBuffer(this.vertexTangentBuffer);
        if (this.vertexAndLightmapUVBuffer!==null) gl.deleteBuffer(this.vertexAndLightmapUVBuffer);

        if (this.indexBuffer!==null) gl.deleteBuffer(this.indexBuffer);
    }
    
        //
        // combine two meshes
        //

    combineMesh(mesh)
    {
        let n;
        let iAdd,indexes2;
        
            // add the vertexes

        for (n=0;n!==mesh.vertexCount;n++) {
            this.vertexList.push(mesh.vertexList[n]);
        }

            // indexes need to be moved

        indexes2=new Uint16Array(this.indexes.length+mesh.indexes.length);
        indexes2.set(this.indexes,0);

        iAdd=this.indexes.length;

        for (n=0;n!==mesh.indexes.length;n++) {
            indexes2[n+iAdd]=mesh.indexes[n]+iAdd;
        }

        this.indexes=indexes2;

            // reset counts

        this.vertexCount=this.vertexList.length;
        this.indexCount=this.indexes.length;
        this.trigCount=Math.trunc(this.indexCount/3);

            // setup bounds

        this.setupBounds();
    }

        //
        // mesh box collision
        //

    boxBoundCollision(xBound,yBound,zBound)
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
    }

    boxMeshCollision(checkMesh)
    {
        if (this.xBound.min>=checkMesh.xBound.max) return(false);
        if (this.xBound.max<=checkMesh.xBound.min) return(false);
        if (this.yBound.min>=checkMesh.yBound.max) return(false);
        if (this.yBound.max<=checkMesh.yBound.min) return(false);
        if (this.zBound.min>=checkMesh.zBound.max) return(false);
        return(!(this.zBound.max<=checkMesh.zBound.min));
    }
    
    boxTouchOtherMeshInside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.min) || (this.xBound.max===checkMesh.xBound.max)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.min) || (this.zBound.max===checkMesh.zBound.max)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }
    
    boxTouchOtherMeshOutside(checkMesh)
    {
        if ((this.xBound.min===checkMesh.xBound.max) || (this.xBound.max===checkMesh.xBound.min)) {
            return(!((this.zBound.min>checkMesh.zBound.max) || (this.zBound.max<checkMesh.zBound.min)));
        }
        if ((this.zBound.min===checkMesh.zBound.max) || (this.zBound.max===checkMesh.zBound.min)) {
            return(!((this.xBound.min>checkMesh.xBound.max) || (this.xBound.max<checkMesh.xBound.min)));
        }
        return(false);
    }

        //
        // triangles
        //

    buildSharedTriangleCache()
    {
        let n,v0,v1,v2;
        let cacheItem;
        
        this.trigSharedTrigCache=[];
        
        for (n=0;n!==this.trigCount;n++) {
            
            cacheItem=new MapMeshSharedTrigCacheClass();
            
            v0=this.vertexList[this.indexes[(n*3)]];
            v1=this.vertexList[this.indexes[(n*3)+1]];
            v2=this.vertexList[this.indexes[(n*3)+2]];

                // if all the Xs of Zs are equal,
                // consider it a straight wall

            cacheItem.isWall=((v0.position.x===v1.position.x) && (v0.position.x===v2.position.x)) || ((v0.position.z===v1.position.z) && (v0.position.z===v2.position.z));
            
                // the bounds
            
            cacheItem.xBound=new wsBound(v0.position.x,v0.position.x);
            cacheItem.xBound.adjust(v1.position.x);
            cacheItem.xBound.adjust(v2.position.x);
            
            cacheItem.yBound=new wsBound(v0.position.y,v0.position.y);
            cacheItem.yBound.adjust(v1.position.y);
            cacheItem.yBound.adjust(v2.position.y);
            
            cacheItem.zBound=new wsBound(v0.position.z,v0.position.z);
            cacheItem.zBound.adjust(v1.position.z);
            cacheItem.zBound.adjust(v2.position.z);
            
                // store in cache
                
            this.trigSharedTrigCache.push(cacheItem);
        }
    }
    
    getSharedTriangleCacheItem(trigIdx)
    {
        return(this.trigSharedTrigCache[trigIdx]);
    }
    
    clearSharedTriangleCache()
    {
        this.trigSharedTrigCache=null;
    }

    removeTriangle(trigIdx)
    {
        let n,idx,cutIdx;
        let newIndexes;
        
        if (this.indexCount===0) return;
        if ((trigIdx<0) || (trigIdx>=this.trigCount)) return;

            // rebuild the array

        newIndexes=new Uint16Array(this.indexCount-3);

        idx=0;
        cutIdx=trigIdx*3;

        for (n=0;n<cutIdx;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        for (n=(cutIdx+3);n<this.indexCount;n++) {
            newIndexes[idx++]=this.indexes[n];
        }

        this.indexes=newIndexes;

            // fix a couple counts

        this.indexCount-=3;
        this.trigCount--;
    }

        //
        // setup mesh boxes and bounds
        //

    setupBounds()
    {
        let n;
        let v=this.vertexList[0];
        
        this.center.setFromValues(v.position.x,v.position.y,v.position.z);
        this.xBound.setFromValues(v.position.x,v.position.x);
        this.yBound.setFromValues(v.position.y,v.position.y);
        this.zBound.setFromValues(v.position.z,v.position.z);

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
    }

        //
        // special cache for ray tracing
        //

    buildTrigRayTraceCache()
    {
        let n,tIdx;
        let vp0,vp1,vp2,v10,v20;

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
            
            this.trigRayTraceCache.push(new MapMeshLightMapTrigCacheClass(vp0,v10,v20));
        }
    }
    
    clearTrigRayTraceCache()
    {
        this.trigRayTraceCache=null;
    }

        //
        // collision geometry
        //

    buildCollisionGeometryLine(v0,v1,v2)
    {
        let n,nLine,line;
        
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
    }
    
    buildCollisionGeometryRect(v0,v1,v2,rectList)
    {
        let n,nRect,cRect;
        let lft,top,rgt,bot;
        
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
        
        cRect=new wsCollisionRect(lft,top,rgt,bot,v0.position.y);
        
            // is rect already in list?
            // usually, two triangles make
            // a single rectangle

        nRect=rectList.length;

        for (n=0;n!==nRect;n++) {
            if (rectList[n].equals(cRect)) return;
        }

        rectList.push(cRect);
    }
    
    buildCollisionGeometry()
    {
        let n,ny;
        let tIdx;
        let v0,v1,v2;
        
            // some meshes have simple collision
            // geometery -- these are assumed to be
            // hitting against the bound box
            
        if (this.simpleCollisionGeometry) {
            this.collisionLines.push(new wsLine(new wsPoint(this.xBound.min,this.yBound.min,this.zBound.min),new wsPoint(this.xBound.max,this.yBound.max,this.zBound.min)));
            this.collisionLines.push(new wsLine(new wsPoint(this.xBound.min,this.yBound.min,this.zBound.max),new wsPoint(this.xBound.max,this.yBound.max,this.zBound.max)));
            this.collisionLines.push(new wsLine(new wsPoint(this.xBound.min,this.yBound.min,this.zBound.min),new wsPoint(this.xBound.min,this.yBound.max,this.zBound.max)));
            this.collisionLines.push(new wsLine(new wsPoint(this.xBound.max,this.yBound.min,this.zBound.min),new wsPoint(this.xBound.max,this.yBound.max,this.zBound.max)));
            
            this.collisionFloorRects.push(new wsCollisionRect(this.xBound.min,this.zBound.min,this.xBound.max,this.zBound.max,this.yBound.min));
            this.collisionCeilingRects.push(new wsCollisionRect(this.xBound.min,this.zBound.min,this.xBound.max,this.zBound.max,this.yBound.max));
            return;
        }

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
                this.buildCollisionGeometryRect(v0,v1,v2,this.collisionFloorRects);
            }
            
                // detect if triangle is a ceiling
                
            else {
                if (ny>=0.7) {
                    this.buildCollisionGeometryRect(v0,v1,v2,this.collisionCeilingRects);
                }

                    // detect if triangle is wall like

                else {
                    if (Math.abs(ny)<=0.3) {
                        this.buildCollisionGeometryLine(v0,v1,v2);
                    }
                }
            }
        }
    }
    
        //
        // move mesh
        //
        
    move(movePnt)
    {
        let n;
        let nCollide;
        
            // move the vertexes
            
        for (n=0;n!==this.vertexCount;n++) {
            this.vertexList[n].position.addPoint(movePnt);
        }
        
            // update the collision boxes
            
        nCollide=this.collisionLines.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionLines[n].addPoint(movePnt);
        }
        
        nCollide=this.collisionFloorRects.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionFloorRects[n].addPoint(movePnt);
        }
        
        nCollide=this.collisionCeilingRects.length;
        
        for (n=0;n!==nCollide;n++) {
            this.collisionCeilingRects[n].addPoint(movePnt);
        }
            
            // and finally the bounds
            
        this.center.addPoint(movePnt);
        this.xBound.add(movePnt.x);
        this.yBound.add(movePnt.y);
        this.zBound.add(movePnt.z);
        
            // and mark as requiring a
            // gl buffer update when drawing
            
        this.requiresBufferUpdate=true;
    }

        //
        // mesh binding
        //

    setupBuffers()
    {
        let n,v;
        let vIdx,uIdx,nIdx,tIdx;
        let gl=view.gl;
        
            // build the default data
            // from the vertex list
        
        this.drawVertices=new Float32Array(this.vertexCount*3);
        this.drawNormals=new Float32Array(this.vertexCount*3);
        this.drawTangents=new Float32Array(this.vertexCount*3);
        this.drawPackedUVs=new Float32Array(this.vertexCount*4);
        
        vIdx=0;
        uIdx=0;
        nIdx=0;
        tIdx=0;
        
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
    }

    bindBuffers(mapMeshShader)
    {
        let gl=view.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.vertexAttribPointer(mapMeshShader.vertexPositionAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.vertexAttribPointer(mapMeshShader.vertexNormalAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.vertexAttribPointer(mapMeshShader.vertexTangentAttribute,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
        gl.vertexAttribPointer(mapMeshShader.vertexAndLightmapUVAttribute,4,gl.FLOAT,false,0,0);

            // need to always rebuild the array from the culled list
            
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.nonCulledIndexes,gl.DYNAMIC_DRAW);
    }
    
        //
        // update buffers
        // this happens when a mesh is moved, and flagged to get
        // updated.  We only do this when the mesh is drawn so we don't
        // update uncessarly
        //
        
    updateBuffers()
    {
        let n,v,vIdx;
        let gl=view.gl;
        
        if (!this.requiresBufferUpdate) return;
        
            // update buffer
        
        vIdx=0;
        
        for (n=0;n!==this.vertexCount;n++) {
            v=this.vertexList[n];
            
            this.drawVertices[vIdx++]=v.position.x;
            this.drawVertices[vIdx++]=v.position.y;
            this.drawVertices[vIdx++]=v.position.z;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.drawVertices,gl.DYNAMIC_DRAW);       // supergumba -- seems right, will require testing

            // mark as updated

        this.requiresBufferUpdate=false;
    }
    
        //
        // build an index list of triangles that aren't
        // culled
        //
        
    buildNonCulledTriangleIndexes()
    {
        let n,v,x,y,z,f,idx;

            // if it's the first time, we'll need
            // to create the index array
            
        this.nonCulledIndexCount=0;
        if (this.nonCulledIndexes===null) this.nonCulledIndexes=new Uint16Array(this.indexCount);
        
            // build it out of triangles
            // that aren't normal culled, i.e.,
            // have normals facing away from the eye
            // which is the dot product between the normal
            // and the vector from trig to eye point
            
            // all this is unwrapped (instead of using classes)
            // for speed reasons
        
        idx=0;
        
        for (n=0;n!==this.trigCount;n++) {
            
                // vector from trig to eye point
                
            v=this.vertexList[this.indexes[idx]];
            
            x=v.position.x-view.camera.position.x;      // cullTrigToEyeVector.setFromSubPoint(v.position,view.camera.position)
            y=v.position.y-view.camera.position.y;
            z=v.position.z-view.camera.position.z;
            
            f=Math.sqrt((x*x)+(y*y)+(z*z));   // cullTrigToEyeVector.normalize();
            if (f!==0.0) f=1.0/f;
        
            x=x*f;
            y=y*f;
            z=z*f;
            
                // dot product
                
            if (((x*v.normal.x)+(y*v.normal.y)+(z*v.normal.z))<=view.VIEW_NORMAL_CULL_LIMIT) {      // this.cullTrigToEyeVector.dot(v.normal)
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+1];
                this.nonCulledIndexes[this.nonCulledIndexCount++]=this.indexes[idx+2];
            }    
        
            idx=idx+3;      // supergumba -- chrome complains about idx+=3, so we do this for now
        }
    }
    
        //
        // mesh drawing
        //

    draw()
    {
        let gl=view.gl;

        gl.drawElements(gl.TRIANGLES,this.nonCulledIndexCount,gl.UNSIGNED_SHORT,0);
        
        view.drawMeshCount++;
        view.drawMeshTrigCount+=Math.trunc(this.nonCulledIndexCount/3);
    }
}
