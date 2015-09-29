"use strict";

//
// NOTE!
// 
// We need to keep a global copy of the current
// light map object because light maps require
// time outs and the "this" on the timeout is
// the window object.
// EMAScript 6 probably has a work-around for this
// in the future.
//

var currentGlobalLightMapObject=null;

//
// lightmap bitmap class
// records each generated lightmap
// canvas and the last chunk written to
//

function GenLightmapBitmapObject(canvas)
{
    this.chunkIdx=0;
    this.canvas=canvas;
}

//
// this object keeps a list of which
// light map and UVs go to which mesh
//

function GenLightmapMeshObject()
{
    this.lightmapIdx=0;
    this.lightmapUVs=null;
}

//
// generate lightmaps class
//

function GenLightmapObject(view,map,debug,generateLightmap,callbackFunc)
{
        // constants

    this.TIMEOUT_MSEC=10;
    this.TEXTURE_SIZE=1024;
    
    // chunk is one block available to draw a light map
    this.CHUNK_SPLIT=16;                  // how many chunks in both the X and Y direction
    this.CHUNK_SIZE=Math.floor(this.TEXTURE_SIZE/this.CHUNK_SPLIT);    // square pixel size of chunks
    this.CHUNK_PER_TEXTURE=(this.CHUNK_SPLIT*this.CHUNK_SPLIT);        // how many chunks in a single texture

    this.RENDER_MARGIN=3;                // margin around each light map triangle
    this.BLUR_COUNT=3;

        // variables
        
    this.view=view;
    this.map=map;
    this.debug=debug;
    this.generateLightmap=generateLightmap;
    
        // array of bitmaps that make up the lightmap
        // each is an object with a canvas and the last chunk
        // drawn to (the chunkIdx)
        
    this.lightmapList=[];
    
        // a list paralell to the meshes that keeps
        // a record of indexes and UVs so we can set
        // all the meshes at the end (because the light
        // map object isn't created until then)
        
    this.meshList=[];
    
        // the callback function when
        // generation concludes
        
    this.callbackFunc=callbackFunc;
    
        // a link to this object so we can
        // use it in the "this" callbacks
        
    var currentGlobalLightMapObject;

        //
        // start light map canvas
        //

    this.startCanvas=function()
    {
            // setup the canvas

        var canvas=document.createElement('canvas');
        canvas.width=this.TEXTURE_SIZE;
        canvas.height=this.TEXTURE_SIZE;
        var ctx=canvas.getContext('2d');

            // clear to black with
            // open alpha (we use this later
            // for smearing)

        var imgData=ctx.getImageData(0,0,this.TEXTURE_SIZE,this.TEXTURE_SIZE);
        var data=imgData.data;

        var n;
        var pixelCount=this.TEXTURE_SIZE*this.TEXTURE_SIZE;
        var idx=0;

        for (n=0;n!==pixelCount;n++) {
            data[idx++]=0;
            data[idx++]=0;
            data[idx++]=0;
            data[idx++]=0;
        }

            // replace image data

        ctx.putImageData(imgData,0,0);

            // return new canvas

        return(canvas);
    };

        //
        // border and smear polygons
        //
        
    this.smudgeChunk=function(data,wid,high)
    {
        var x,y,idx;
        var r,g,b;
        var hasColor;
        
            // we run through the entire chunk
            // from left to right, right to left,
            // top to bottom, and bottom to top
            // smearing any colors we find to
            // build an edge around the triangle

        for (y=0;y!==high;y++) {
            
            idx=(y*wid)*4;
            hasColor=false;
            
            for (x=0;x!==wid;x++) {
                
                if (data[idx+3]!==0) {
                    hasColor=true;
                    r=data[idx];
                    g=data[idx+1];
                    b=data[idx+2];
                }
                else {
                    if (hasColor) {
                        data[idx]=r;
                        data[idx+1]=g;
                        data[idx+2]=b;
                        data[idx+3]=255;
                    }
                }
                
                idx+=4;
            }
            
            idx=((y*wid)+(wid-1))*4;
            hasColor=false;
            
            for (x=0;x!==wid;x++) {
                
                if (data[idx+3]!==0) {
                    hasColor=true;
                    r=data[idx];
                    g=data[idx+1];
                    b=data[idx+2];
                }
                else {
                    if (hasColor) {
                        data[idx]=r;
                        data[idx+1]=g;
                        data[idx+2]=b;
                        data[idx+3]=255;
                    }
                }
             
                idx-=4;
            }
        }
        
        for (x=0;x!==wid;x++) {
            
            hasColor=false;
            
            for (y=0;y!==high;y++) {
                
                idx=((y*wid)+x)*4;
                if (data[idx+3]!==0) {
                    hasColor=true;
                    r=data[idx];
                    g=data[idx+1];
                    b=data[idx+2];
                }
                else {
                    if (hasColor) {
                        data[idx]=r;
                        data[idx+1]=g;
                        data[idx+2]=b;
                        data[idx+3]=255;
                    }
                }
            }
            
            for (y=(high-1);y>=0;y--) {
                
                idx=((y*wid)+x)*4;
                if (data[idx+3]!==0) {
                    hasColor=true;
                    r=data[idx];
                    g=data[idx+1];
                    b=data[idx+2];
                }
                else {
                    if (hasColor) {
                        data[idx]=r;
                        data[idx+1]=g;
                        data[idx+2]=b;
                        data[idx+3]=255;
                    }
                }
            }
        }
    };
    
    this.blurChunk=function(data,wid,high)
    {
        var n,k,idx,pixelCount;
        var x,y,cx,cy,cxs,cxe,cys,cye;
        var colCount,r,g,b;
        var backData;

            // create a copy of the data

        var backData=new Uint8ClampedArray(data);

            // blur pixels to count

        for (n=0;n!==this.BLUR_COUNT;n++) {

            for (y=0;y!==high;y++) {

                cys=y-1;
                if (cys<0) cys=0;
                cye=y+2;
                if (cye>=high) cye=high-1;

                for (x=0;x!==wid;x++) {

                        // get blur from 8 surrounding pixels

                    colCount=0;
                    r=g=b=0;

                    cxs=x-1;
                    if (cxs<0) cxs=0;
                    cxe=x+2;
                    if (cxe>=wid) cxe=wid-1;

                    for (cy=cys;cy!==cye;cy++) {
                        for (cx=cxs;cx!==cxe;cx++) {
                            if ((cy===y) && (cx===x)) continue;       // ignore self

                                // add up blur from the
                                // original pixels

                            idx=((cy*wid)+cx)*4;

                            r+=data[idx];
                            g+=data[idx+1];
                            b+=data[idx+2];
                            colCount++;
                        }
                    }
                    
                    r=Math.floor(r/colCount);
                    if (r>255) r=255;

                    g=Math.floor(g/colCount);
                    if (g>255) g=255;

                    b=Math.floor(b/colCount);
                    if (b>255) b=255;

                    idx=((y*wid)+x)*4;

                    backData[idx]=r;
                    backData[idx+1]=g;
                    backData[idx+2]=b;
                }
            }

                // transfer over the changed pixels

            pixelCount=wid*high;
            idx=0;

            for (k=0;k!==pixelCount;k++) {
                data[idx]=backData[idx];
                data[idx+1]=backData[idx+1];
                data[idx+2]=backData[idx+2];
                idx+=4;
            }
        } 
    };

        //
        // ray tracing
        //

    this.rayTraceCollision=function(vx,vy,vz,vctX,vctY,vctZ,t0x,t0y,t0z,tv1x,tv1y,tv1z,tv2x,tv2y,tv2z)
    {
            // we pass in a single vertex (t0x,t0y,t0z) and
            // these pre-calculated vectors for the other
            // sides of the triangle
            // tv1[x,y,z]=t1[x,y,z]-t0[x,y,z]
            // tv2[x,y,z]=t2[x,y,z]-t0[x,y,z]

            // calculate the determinate
            // perpVector is cross(vector,v2)
            // det is dot(v1,perpVector)

        var perpVectorX=(vctY*tv2z)-(vctZ*tv2y);
        var perpVectorY=(vctZ*tv2x)-(vctX*tv2z);
        var perpVectorZ=(vctX*tv2y)-(vctY*tv2x);

        var det=(tv1x*perpVectorX)+(tv1y*perpVectorY)+(tv1z*perpVectorZ);

            // is line on the same plane as triangle?

        if ((det>-0.00001) && (det<0.00001)) return(false);

            // get the inverse determinate

        var invDet=1.0/det;

            // calculate triangle U and test
            // lineToTrigPointVector is vector from vertex to triangle point 0
            // u is invDet * dot(lineToTrigPointVector,perpVector)

        var lineToTrigPointVectorX=vx-t0x;
        var lineToTrigPointVectorY=vy-t0y;
        var lineToTrigPointVectorZ=vz-t0z;

        var u=invDet*((lineToTrigPointVectorX*perpVectorX)+(lineToTrigPointVectorY*perpVectorY)+(lineToTrigPointVectorZ*perpVectorZ));
        if ((u<0.0) || (u>1.0)) return(false);

            // calculate triangle V and test
            // lineToTrigPerpVector is cross(lineToTrigPointVector,v1)
            // v is invDet * dot(vector,lineToTrigPerpVector)

        var lineToTrigPerpVectorX=(lineToTrigPointVectorY*tv1z)-(lineToTrigPointVectorZ*tv1y);
        var lineToTrigPerpVectorY=(lineToTrigPointVectorZ*tv1x)-(lineToTrigPointVectorX*tv1z);
        var lineToTrigPerpVectorZ=(lineToTrigPointVectorX*tv1y)-(lineToTrigPointVectorY*tv1x);

        var v=invDet*((vctX*lineToTrigPerpVectorX)+(vctY*lineToTrigPerpVectorY)+(vctZ*lineToTrigPerpVectorZ));
        if ((v<0.0) || ((u+v)>1.0)) return(false);

            // t is the point on the line, from the
            // invDet*dot(v2,lineToTrigPerpVector)

            // this is a little different then normal ray trace
            // hits, we add in an extra 0.01 slop so polygons that are
            // touching each other don't have edges grayed in

        var t=invDet*((tv2x*lineToTrigPerpVectorX)+(tv2y*lineToTrigPerpVectorY)+(tv2z*lineToTrigPerpVectorZ));
        return((t>0.01)&&(t<1.0));
    };

    this.rayTraceVertex=function(meshIdx,trigIdx,vx,vy,vz,normal)
    {
        var n,nLight,trigCount;
        var light;
        var k,p,hit,lightMesh,mesh,nMesh,cIdx;
        var trigRayTraceCache;
        var lightVectorX,lightVectorY,lightVectorZ;
        var lightBoundX,lightBoundY,lightBoundZ;
        var dist,att;
        var col=new wsColor(0.0,0.0,0.0);
        var lightVectorNormal=new wsPoint(0.0,0.0,0.0);

            // we have a list of mesh/light intersections we
            // use to reduce the number of lights we check for
            // a mesh

            // we precalculated a list of a single point on the
            // triangle and two vectors for each side around that point
            // to speed this up.  That's what the trigRayTraceCache is for

        lightMesh=this.map.meshes[meshIdx];
        nLight=lightMesh.lightIntersectList.length;

        for (n=0;n!==nLight;n++) {
            light=this.map.lights[lightMesh.lightIntersectList[n]];

                // light within light range?

            dist=light.distanceByTriplet(vx,vy,vz);
            if (dist>light.intensity) continue;

                // light vector
                // break this up into X,Y,Z to avoid
                // lookup penalities for this code

            lightVectorX=light.position.x-vx;
            lightVectorY=light.position.y-vy;
            lightVectorZ=light.position.z-vz;

                // ignore all triangles that are facing
                // away from the light

            lightVectorNormal.set(lightVectorX,lightVectorY,lightVectorZ);
            lightVectorNormal.normalize();
            if (lightVectorNormal.dot(normal)<0.0) continue;

                // light bounding

            lightBoundX=new wsBound(vx,light.position.x);
            lightBoundY=new wsBound(vy,light.position.y);
            lightBoundZ=new wsBound(vz,light.position.z);

                // each light has a list of meshes within
                // it's light cone, these are the only meshes
                // that can block

            nMesh=light.meshIntersectList.length;

                // any hits?

            hit=false;

            for (k=0;k!==nMesh;k++) {
                mesh=this.map.meshes[light.meshIntersectList[k]];
                if (!mesh.boxBoundCollision(lightBoundX,lightBoundY,lightBoundZ)) continue;

                cIdx=0;
                trigCount=mesh.trigCount;
                trigRayTraceCache=mesh.trigRayTraceCache;

                for (p=0;p!==trigCount;p++) {

                    if (this.rayTraceCollision(vx,vy,vz,lightVectorX,lightVectorY,lightVectorZ,trigRayTraceCache[cIdx],trigRayTraceCache[cIdx+1],trigRayTraceCache[cIdx+2],trigRayTraceCache[cIdx+3],trigRayTraceCache[cIdx+4],trigRayTraceCache[cIdx+5],trigRayTraceCache[cIdx+6],trigRayTraceCache[cIdx+7],trigRayTraceCache[cIdx+8])) {
                        hit=true;
                        break;
                    }

                    cIdx+=9;
                }

                if (hit) break;
            }

                // if a hit, don't add in light

            if (hit) continue;

                // get the color, attenuate
                // it and add it to base color

            att=1.0-(dist*light.invertIntensity);
            att+=Math.pow(att,light.exponent);
            col.add(light.color.attenuate(att));
        }

        col.fixOverflow();

        return(col);
    };
    
        //
        // render a single color to a chunk, used for
        // special circumstances like no light maps or
        // all black areas
        //
        
    this.renderColor=function(ctx,lft,top)
    {
            // get the image data to render to

        var imgData=ctx.getImageData(lft,top,this.CHUNK_SIZE,this.CHUNK_SIZE);
        var data=imgData.data;
        
        var n;
        var idx=0;
        var pixelCount=this.CHUNK_SIZE*this.CHUNK_SIZE;
        
        for (n=0;n!==pixelCount;n++) {
            data[idx++]=0;
            data[idx++]=0;
            data[idx++]=0;
            data[idx++]=255;    
        }
            
        ctx.putImageData(imgData,lft,top);
    };

        //
        // render a triangle
        //

    this.renderTriangle=function(meshIdx,trigIdx,ctx,pts,vs,normal,lft,top,rgt,bot)
    {
        var x,y,lx,rx,tempX,ty,my,by,idx;
        var lxFactor,rxFactor,vFactor;
        var vx,vy,vz;
        var vlx=new wsPoint(0,0,0);
        var vrx=new wsPoint(0,0,0);
        var col;

        var wid=rgt-lft;
        var high=bot-top;

        if ((wid<=0) || (high<=0)) return;

            // get the image data to render to

        var imgData=ctx.getImageData(lft,top,wid,high);
        var data=imgData.data;
        
            // find the min and max Y points
            // we will build the scan line around this

        var topPtIdx=0;
        if (pts[1].y<pts[topPtIdx].y) topPtIdx=1;
        if (pts[2].y<pts[topPtIdx].y) topPtIdx=2;

        var botPtIdx=0;
        if (pts[1].y>pts[botPtIdx].y) botPtIdx=1;
        if (pts[2].y>pts[botPtIdx].y) botPtIdx=2;
        
            // find the middle point
            
        var midPtIdx=topPtIdx+1;
        if (midPtIdx===3) midPtIdx=0;
        
        if (midPtIdx===botPtIdx) {
            midPtIdx=topPtIdx-1;
            if (midPtIdx===-1) midPtIdx=2;
        }

            // on line scans from top to
            // bottom and the other goes from
            // top point to midpoint and then
            // midpoint to bottom point
            
        var midStartPtIdx=topPtIdx;
        var midEndPtIdx=midPtIdx;
        
            // render the triangle by scan
            // lines from top to bottom

        ty=pts[topPtIdx].y;
        my=pts[midPtIdx].y;
        by=pts[botPtIdx].y;
        if (ty>=by) return;

        for (y=ty;y!==by;y++) {

                // hit the midpoint and need
                // to switch lines?

            if (y===my) {
                midStartPtIdx=midPtIdx;
                midEndPtIdx=botPtIdx;
            }

                // get the left right

            lxFactor=(y-pts[topPtIdx].y)/(pts[botPtIdx].y-pts[topPtIdx].y);
            lx=pts[topPtIdx].x+Math.floor((pts[botPtIdx].x-pts[topPtIdx].x)*lxFactor);

            rxFactor=(y-pts[midStartPtIdx].y)/(pts[midEndPtIdx].y-pts[midStartPtIdx].y);
            rx=pts[midStartPtIdx].x+Math.floor((pts[midEndPtIdx].x-pts[midStartPtIdx].x)*rxFactor);

                // get the vertex left and right

            vlx.x=vs[topPtIdx].x+Math.floor((vs[botPtIdx].x-vs[topPtIdx].x)*lxFactor);
            vlx.y=vs[topPtIdx].y+Math.floor((vs[botPtIdx].y-vs[topPtIdx].y)*lxFactor);
            vlx.z=vs[topPtIdx].z+Math.floor((vs[botPtIdx].z-vs[topPtIdx].z)*lxFactor);

            vrx.x=vs[midStartPtIdx].x+Math.floor((vs[midEndPtIdx].x-vs[midStartPtIdx].x)*rxFactor);
            vrx.y=vs[midStartPtIdx].y+Math.floor((vs[midEndPtIdx].y-vs[midStartPtIdx].y)*rxFactor);
            vrx.z=vs[midStartPtIdx].z+Math.floor((vs[midEndPtIdx].z-vs[midStartPtIdx].z)*rxFactor);

                // sometimes we need to swap
                // left and right

            if (lx>rx) {
                tempX=lx;
                lx=rx;
                rx=tempX;

                tempX=vlx.copy();
                vlx=vrx.copy();
                vrx=tempX.copy();
            }

                // get the bitmap data index

            idx=((y*wid)+lx)*4;

                // render the scan line

            for (x=lx;x!==rx;x++) {

                    // get the ray trace vetex

                vFactor=(x-lx)/(rx-lx);
                vx=vlx.x+Math.floor((vrx.x-vlx.x)*vFactor);
                vy=vlx.y+Math.floor((vrx.y-vlx.y)*vFactor);
                vz=vlx.z+Math.floor((vrx.z-vlx.z)*vFactor);
                
                    // write the pixel

                col=this.rayTraceVertex(meshIdx,trigIdx,vx,vy,vz,normal);
                
                data[idx++]=Math.floor(col.r*255.0);
                data[idx++]=Math.floor(col.g*255.0);
                data[idx++]=Math.floor(col.b*255.0);
                data[idx++]=255;
            }
        }

            // smear and blur chunk

        this.smudgeChunk(data,wid,high);
        this.blurChunk(data,wid,high);

            // replace image data

        ctx.putImageData(imgData,lft,top);
    };

        //
        // build light map in chunk
        //

    this.writePolyToChunk=function(meshIdx,trigIdx,lightmapIdx,ctx,lft,top,lightmapUVs)
    {
        var mesh=this.map.meshes[meshIdx];
        var vIdx,uvIdx;
        var pt0,pt1,pt2;

            // get the vertexes for the triangle
            // and one normal

        vIdx=mesh.indexes[trigIdx*3]*3;
        var v0=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);
        var normal=new wsPoint(mesh.normals[vIdx],mesh.normals[vIdx+1],mesh.normals[vIdx+2]);

        vIdx=mesh.indexes[(trigIdx*3)+1]*3;
        var v1=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);

        vIdx=mesh.indexes[(trigIdx*3)+2]*3;
        var v2=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);

            // look at one of the normal to determine if it's
            // wall or floor like

        var wallLike=(Math.abs(mesh.normals[vIdx+1])<=0.3);

            // get the bounds of the 3D point

        var xBound=new wsBound(v0.x,v0.x);
        xBound.adjust(v1.x);
        xBound.adjust(v2.x);

        var yBound=new wsBound(v0.y,v0.y);
        yBound.adjust(v1.y);
        yBound.adjust(v2.y);

        var zBound=new wsBound(v0.z,v0.z);
        zBound.adjust(v1.z);
        zBound.adjust(v2.z);

            // 2D reduction factors
            // we are drawing into a CHUNK_SIZE, but
            // the actual points are within the margin
            // so we have extra pixels to smear

        var renderSize=this.CHUNK_SIZE-(this.RENDER_MARGIN*2);

        var sz=xBound.getSize();
        var xFactor=(sz===0)?0:renderSize/sz;

        var sz=yBound.getSize();
        var yFactor=(sz===0)?0:renderSize/sz;

        var sz=zBound.getSize();
        var zFactor=(sz===0)?0:renderSize/sz;

            // now create the 2D version of it
            // these points are offsets WITHIN the margin box

        if (wallLike) {
            if (xBound.getSize()>zBound.getSize()) {
                pt0=new ws2DPoint(((v0.x-xBound.min)*xFactor),((v0.y-yBound.min)*yFactor));
                pt1=new ws2DPoint(((v1.x-xBound.min)*xFactor),((v1.y-yBound.min)*yFactor));
                pt2=new ws2DPoint(((v2.x-xBound.min)*xFactor),((v2.y-yBound.min)*yFactor));
            }
            else {
                pt0=new ws2DPoint(((v0.z-zBound.min)*zFactor),((v0.y-yBound.min)*yFactor));
                pt1=new ws2DPoint(((v1.z-zBound.min)*zFactor),((v1.y-yBound.min)*yFactor));
                pt2=new ws2DPoint(((v2.z-zBound.min)*zFactor),((v2.y-yBound.min)*yFactor));
            }
        }
        else {
            pt0=new ws2DPoint(((v0.x-xBound.min)*xFactor),((v0.z-zBound.min)*zFactor));
            pt1=new ws2DPoint(((v1.x-xBound.min)*xFactor),((v1.z-zBound.min)*zFactor));
            pt2=new ws2DPoint(((v2.x-xBound.min)*xFactor),((v2.z-zBound.min)*zFactor));
        }

            // move so the triangle renders within
            // the margins so we have area to smear

        pt0.move(this.RENDER_MARGIN,this.RENDER_MARGIN);
        pt1.move(this.RENDER_MARGIN,this.RENDER_MARGIN);
        pt2.move(this.RENDER_MARGIN,this.RENDER_MARGIN);

            // ray trace the triangle

        this.renderTriangle(meshIdx,trigIdx,ctx,[pt0,pt1,pt2],[v0,v1,v2],normal,lft,top,(lft+this.CHUNK_SIZE),(top+this.CHUNK_SIZE));

            // add the UV
            // pt0-pt2 are already moved within the margin

        uvIdx=mesh.indexes[trigIdx*3]*2;
        lightmapUVs[uvIdx]=(pt0.x+lft)/this.TEXTURE_SIZE;
        lightmapUVs[uvIdx+1]=(pt0.y+top)/this.TEXTURE_SIZE;

        uvIdx=mesh.indexes[(trigIdx*3)+1]*2;
        lightmapUVs[uvIdx]=(pt1.x+lft)/this.TEXTURE_SIZE;
        lightmapUVs[uvIdx+1]=(pt1.y+top)/this.TEXTURE_SIZE;

        uvIdx=mesh.indexes[(trigIdx*3)+2]*2;
        lightmapUVs[uvIdx]=(pt2.x+lft)/this.TEXTURE_SIZE;
        lightmapUVs[uvIdx+1]=(pt2.y+top)/this.TEXTURE_SIZE;
    };

        //
        // create lightmap for single mesh
        //

    this.createLightmapForMesh=function(meshIdx)
    {
        var n,lightmapIdx,chunkIdx,nTrig;
        var lft,top;
        var mesh,ctx;
        var lightmapUVs;

            // run the status bar

        mesh=this.map.meshes[meshIdx];
        nTrig=mesh.trigCount;
        
            // if we aren't generating lightmaps,
            // then always use the same single lightmap
            // set to black
            
        if (!this.generateLightmap) {
            
            lightmapIdx=0;

            if (this.lightmapList.length===0) {     // have no lightmaps yet, so make a white one
                this.lightmapList[0]=new GenLightmapBitmapObject(this.startCanvas());
                this.renderColor(this.lightmapList[0].canvas.getContext('2d'),0,0);
            }
        }
        
            // else we need to pack triangles
            // into lightmaps
            
        else {

                // find a lightmap to put mesh into
                // we do this by checking if we have enough
                // room for the set of triangles

            lightmapIdx=-1;

            for (n=0;n!==this.lightmapList.length;n++) {
                if ((this.CHUNK_PER_TEXTURE-this.lightmapList[n].chunkIdx)>nTrig) {
                    lightmapIdx=n;
                    break;
                }
            }

                // if we didn't find a lightmap, make a new one

            if (lightmapIdx===-1) {
                lightmapIdx=this.lightmapList.length;
                this.lightmapList[lightmapIdx]=new GenLightmapBitmapObject(this.startCanvas());
            }
        }
        
            // UVs for this mesh

        lightmapUVs=new Float32Array(mesh.vertexCount*2);
        
            // starting chunk and context
            
        chunkIdx=this.lightmapList[lightmapIdx].chunkIdx;
        ctx=this.lightmapList[lightmapIdx].canvas.getContext('2d');
        
            // if no light map, then just create
            // UVs for the top-left white map
            
        if (!this.generateLightmap) {
            var singleUV=this.RENDER_MARGIN/this.TEXTURE_SIZE;
            for (n=0;n!==(mesh.vertexCount*2);n++) {
                lightmapUVs[n]=singleUV;
            }
        }

            // otherwise render the triangles

        else {
            
                // write polys to chunk

            for (n=0;n!==nTrig;n++) {

                lft=(chunkIdx%this.CHUNK_SPLIT)*this.CHUNK_SIZE;
                top=Math.floor(chunkIdx/this.CHUNK_SPLIT)*this.CHUNK_SIZE;

                this.writePolyToChunk(meshIdx,n,lightmapIdx,ctx,lft,top,lightmapUVs);

                chunkIdx++;
            }
        }
        
            // mark off the chunks we used
            
        this.lightmapList[lightmapIdx].chunkIdx=chunkIdx;

            // set this data in the meshList
            // will be used later to setup the meshes
            // themselves

        this.meshList[meshIdx].lightmapIdx=lightmapIdx;
        this.meshList[meshIdx].lightmapUVs=lightmapUVs;

            // move on to next mesh
            // if out of mesh, finish up creation
            // by saving the light maps

        meshIdx++;
        if (meshIdx>=this.map.meshes.length) {
            setTimeout(function() { currentGlobalLightMapObject.createFinish(); },this.TIMEOUT_MSEC);
            return;
        }

            // next mesh

        this.view.loadingScreenDraw(meshIdx/(this.map.meshes.length+2.0));
        setTimeout(function() { currentGlobalLightMapObject.createLightmapForMesh(meshIdx); },this.TIMEOUT_MSEC);
    };

        //
        // create lightmap
        // creation has to be done by a timer because this
        // is too slow and browsers will bounce the script
        //

    this.create=function()
    {
        var n;
        var nMesh=this.map.meshes.length;

            // remember the light map object
            // globally for callbacks because "this" is
            // the window object during them.  this is
            // an ugly hack but there's no way around it

        currentGlobalLightMapObject=this;

            // run through the meshes and build
            // cache to speed up ray tracing

        for (n=0;n!==nMesh;n++) {
            this.meshList.push(new GenLightmapMeshObject());
            this.map.meshes[n].buildTrigRayTraceCache();
        }

            // run through the meshes
            // by a timer so we don't trigger the
            // script time out problem   

        this.view.loadingScreenDraw(1.0/(nMesh+2.0));
        setTimeout(function() { currentGlobalLightMapObject.createLightmapForMesh(0); },this.TIMEOUT_MSEC);
    };

    this.createFinish=function()
    {
        var n;

            // turn canvas into lightmap
            // and put lightmap in map

            // the index is used as the id

        for (n=0;n!==this.lightmapList.length;n++) {
            this.map.addLightmap(new MapLightmapObject(this.view,n,this.lightmapList[n].canvas));
        }

            // and finally push all the required
            // data to the meshes

        var lightMesh;
        var nMesh=this.map.meshes.length;

        for (n=0;n!==nMesh;n++) {
            lightMesh=this.meshList[n];
            this.map.meshes[n].setLightmap(this.map.lightmaps[lightMesh.lightmapIdx],lightMesh.lightmapUVs);
        }
        
                    // debugging

        //if (this.lightmapList.length!==0) debug.displayCanvasData(this.lightmapList[0].canvas,1050,10,1024,1024);

            // finish with the callback

        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    };

}
