"use strict";

//
// map mesh class
//

function MapMeshObject(bitmap,vertices,normals,tangents,vertexUVs,indexes,flag)
{
    this.bitmap=bitmap;
    this.lightmap=null;
    this.vertices=vertices;
    this.normals=normals;
    this.tangents=tangents;
    this.vertexUVs=vertexUVs;
    this.lightmapUVs=null;
    this.vertexAndLightmapUVs=null;
    this.indexes=indexes;
    this.flag=flag;
    
    this.vertexCount=Math.floor(this.vertices.length/3);
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
            // change the data

        var vertices2=new Float32Array(this.vertices.length+mesh.vertices.length);
        vertices2.set(this.vertices,0);
        vertices2.set(mesh.vertices,this.vertices.length);
        this.vertices=vertices2;

        var normals2=new Float32Array(this.normals.length+mesh.normals.length);
        normals2.set(this.normals,0);
        normals2.set(mesh.normals,this.normals.length);
        this.normals=normals2;

        var tangents2=new Float32Array(this.tangents.length+mesh.tangents.length);
        tangents2.set(this.tangents,0);
        tangents2.set(mesh.tangents,this.tangents.length);
        this.tangents=tangents2;

        var vertexUVs2=new Float32Array(this.vertexUVs.length+mesh.vertexUVs.length);
        vertexUVs2.set(this.vertexUVs,0);
        vertexUVs2.set(mesh.vertexUVs,this.vertexUVs.length);
        this.vertexUVs=vertexUVs2;

        if ((this.lightmapUVs!==null) && (mesh.lightmapUVs!==null)) {
            var lightmapUVs2=new Float32Array(this.lightmapUVs.length+mesh.lightmapUVs.length);
            lightmapUVs2.set(this.lightmapUVs,0);
            lightmapUVs2.set(mesh.lightmapUVs,this.lightmapUVs.length);
            this.lightmapUVs=lightmapUVs2;
        }
        else {
            this.lightmapUVs=null;
        }

            // indexes need to be moved

        var indexes2=new Uint16Array(this.indexes.length+mesh.indexes.length);
        indexes2.set(this.indexes,0);

        var n;
        var iAdd=this.indexes.length;

        for (n=0;n!==mesh.indexes.length;n++) {
            indexes2[n+iAdd]=mesh.indexes[n]+iAdd;
        }

        this.indexes=indexes2;

            // reset counts

        this.vertexCount=Math.floor(this.vertices.length/3);
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
        var vIdx=this.indexes[(trigIdx*3)+vertexIdx]*3;
        return(new wsPoint(this.vertices[vIdx],this.vertices[vIdx+1],this.vertices[vIdx+2]));
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
        this.center=new wsPoint(this.vertices[0],this.vertices[1],this.vertices[2]);
        this.xBound=new wsBound(this.vertices[0],this.vertices[0]);
        this.yBound=new wsBound(this.vertices[1],this.vertices[1]);
        this.zBound=new wsBound(this.vertices[2],this.vertices[2]);

        var n,x,y,z;
        var idx=3;

        for (n=1;n<this.vertexCount;n++) {
            x=this.vertices[idx];
            y=this.vertices[idx+1];
            z=this.vertices[idx+2];

            this.center.x+=x;
            this.center.y+=y;
            this.center.z+=z;

            this.xBound.adjust(x);
            this.yBound.adjust(y);
            this.zBound.adjust(z);

            idx+=3;
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
        var v0Idx,v1Idx,v2Idx;

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
            v0Idx=this.indexes[tIdx++]*3;
            v1Idx=this.indexes[tIdx++]*3;
            v2Idx=this.indexes[tIdx++]*3;

                // point 0 of the triangle

            this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx];
            this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx+1];
            this.trigRayTraceCache[cIdx++]=this.vertices[v0Idx+2];

                // vector of point 1-point 0

            this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx]-this.vertices[v0Idx];    
            this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx+1]-this.vertices[v0Idx+1];    
            this.trigRayTraceCache[cIdx++]=this.vertices[v1Idx+2]-this.vertices[v0Idx+2];    

                // vector of point 2-point 0

            this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx]-this.vertices[v0Idx];    
            this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx+1]-this.vertices[v0Idx+1];    
            this.trigRayTraceCache[cIdx++]=this.vertices[v2Idx+2]-this.vertices[v0Idx+2];    
        }
    };

        //
        // collision geometry
        //

    this.buildCollisionGeometryLine=function(v0Idx,v1Idx,v2Idx)
    {
        var n,nLine,line;
        
            // create the line

        if (this.vertices[v0Idx+1]===this.vertices[v1Idx+1]) {
            line=new wsLine(new wsPoint(this.vertices[v0Idx],this.vertices[v0Idx+1],this.vertices[v0Idx+2]),new wsPoint(this.vertices[v2Idx],this.vertices[v2Idx+1],this.vertices[v2Idx+2]));
        }
        else {
            line=new wsLine(new wsPoint(this.vertices[v0Idx],this.vertices[v0Idx+1],this.vertices[v0Idx+2]),new wsPoint(this.vertices[v1Idx],this.vertices[v1Idx+1],this.vertices[v1Idx+2]));
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
    
    this.buildCollisionGeometryFloor=function(v0Idx,v1Idx,v2Idx)
    {
        var n,nRect;
        var lft,top,rgt,bot;
        
            // get 2D box
            
        lft=rgt=this.vertices[v0Idx];
        top=bot=this.vertices[v0Idx+2];
        
        if (this.vertices[v1Idx]<lft) lft=this.vertices[v1Idx];
        if (this.vertices[v2Idx]<lft) lft=this.vertices[v2Idx];
        if (this.vertices[v1Idx]>rgt) rgt=this.vertices[v1Idx];
        if (this.vertices[v2Idx]>rgt) rgt=this.vertices[v2Idx];
        
        if (this.vertices[v1Idx+2]<top) top=this.vertices[v1Idx+2];
        if (this.vertices[v2Idx+2]<top) top=this.vertices[v2Idx+2];
        if (this.vertices[v1Idx+2]>bot) bot=this.vertices[v1Idx+2];
        if (this.vertices[v2Idx+2]>bot) bot=this.vertices[v2Idx+2];
        
            // build the rect
        
        var cRect=new wsCollisionRect(lft,top,rgt,bot,this.vertices[v0Idx+1]);
        
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
        var tIdx,v0Idx,v1Idx,v2Idx;

            // run through the triangles
            // and find any that make a wall
            // and create a collision lines
            // and boxes
            
        tIdx=0;
            
        for (n=0;n!==this.trigCount;n++) {
            
                // get trig vertices

            v0Idx=this.indexes[tIdx++]*3;
            v1Idx=this.indexes[tIdx++]*3;
            v2Idx=this.indexes[tIdx++]*3;
            
            ny=this.normals[v0Idx+1];
            
                // detect if triangle is a floor
                
            if (ny<=-0.7) {
                this.buildCollisionGeometryFloor(v0Idx,v1Idx,v2Idx);
            }
            
                // detect if triangle is wall like
            
            else {
                if (Math.abs(ny)<=0.3) {
                    this.buildCollisionGeometryLine(v0Idx,v1Idx,v2Idx);
                }
            }
            
            /*
                // create the line
            
            if (this.vertices[v0Idx+1]===this.vertices[v1Idx+1]) {
                line=new wsLine(new wsPoint(this.vertices[v0Idx],this.vertices[v0Idx+1],this.vertices[v0Idx+2]),new wsPoint(this.vertices[v2Idx],this.vertices[v2Idx+1],this.vertices[v2Idx+2]));
            }
            else {
                line=new wsLine(new wsPoint(this.vertices[v0Idx],this.vertices[v0Idx+1],this.vertices[v0Idx+2]),new wsPoint(this.vertices[v1Idx],this.vertices[v1Idx+1],this.vertices[v1Idx+2]));
            }
            
                // is line already in list?
                // usually, two triangles make
                // a single line
            
            skip=false;
            nLine=this.collisionLines.length;
            
            for (k=0;k!==nLine;k++) {
                if (this.collisionLines[k].equals(line)) {
                    skip=true;
                    break;
                }
            }
            
            if (!skip) this.collisionLines.push(line);
            */
        }
    };

        //
        // UVs
        //

    this.rebuildPackedUVBuffer=function()
    {
        var n,uvIdx,arrIdx;

        uvIdx=0;
        arrIdx=0;
        this.vertexAndLightmapUVs=new Float32Array(this.vertexCount*4);

            // if no light map UVs

        if (this.lightmapUVs===null) {

            for (n=0;n!==this.vertexCount;n++) {
                this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx];
                this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx+1];
                this.vertexAndLightmapUVs[arrIdx++]=0.0;
                this.vertexAndLightmapUVs[arrIdx++]=0.0;
                uvIdx+=2;
            }

            return;
        }

            // pack both together

        for (n=0;n!==this.vertexCount;n++) {
            this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx];
            this.vertexAndLightmapUVs[arrIdx++]=this.vertexUVs[uvIdx+1];
            this.vertexAndLightmapUVs[arrIdx++]=this.lightmapUVs[uvIdx];
            this.vertexAndLightmapUVs[arrIdx++]=this.lightmapUVs[uvIdx+1];
            uvIdx+=2;
        }
    };

    this.setLightmap=function(lightmap,lightmapUVs)
    {
        this.lightmap=lightmap;
        this.lightmapUVs=lightmapUVs;
    };

        //
        // mesh binding
        //

    this.setupBuffers=function(view)
    {
            // need to build the combined texture and
            // light map uv buffer

        this.rebuildPackedUVBuffer();

            // create all the buffers
            // expects buffers to already be Float32Array
            // or Uint16Array

        var gl=view.gl;

        this.vertexPosBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertices,gl.STATIC_DRAW);

        this.vertexNormalBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.normals,gl.STATIC_DRAW);

        this.vertexTangentBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.tangents,gl.STATIC_DRAW);

        this.vertexAndLightmapUVBuffer=gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexAndLightmapUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.vertexAndLightmapUVs,gl.STATIC_DRAW);

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
