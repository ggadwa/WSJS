"use strict";

//
// NOTE!
// 
// We need to keep a global copy of the current
// light map object because light maps require
// time outs and the "this" on the timeout is
// the window object.
//

var currentGlobalLightMapObject=null;

//
// lightmap bitmap class
// records each generated lightmap
// canvas and the last chunk written to
//

function GenLightmapBitmapObject()
{
        // setup the canvas

    this.canvas=document.createElement('canvas');
    this.canvas.width=LIGHTMAP_TEXTURE_SIZE;
    this.canvas.height=LIGHTMAP_TEXTURE_SIZE;
    this.ctx=this.canvas.getContext('2d');
    
    this.imgData=this.ctx.getImageData(0,0,LIGHTMAP_TEXTURE_SIZE,LIGHTMAP_TEXTURE_SIZE);
    this.pixelData=this.imgData.data;
    
        // data for blur
        
    this.blurData=new Uint8ClampedArray(this.pixelData.length);

        // clear to black with
        // open alpha (we use this later
        // for smearing)

    var n;
    var pixelCount=LIGHTMAP_TEXTURE_SIZE*LIGHTMAP_TEXTURE_SIZE;
    var idx=0;
    
    var data=this.pixelData;

    for (n=0;n!==pixelCount;n++) {
        data[idx++]=0;
        data[idx++]=0;
        data[idx++]=0;
        data[idx++]=0;
    }
    
        // the first chunk is always all black
    
    var x,y;
    
    for (y=0;y!==LIGHTMAP_CHUNK_SIZE;y++) {
        idx=(y*LIGHTMAP_TEXTURE_SIZE)*4;
        for (x=0;x!==LIGHTMAP_CHUNK_SIZE;x++) {
            data[idx+3]=255;
            idx+=4;
        }
    }
    
        // the current chunk, we start at
        // 1 to leave the first chunk black
        // for triangles with no lights
        
    this.chunkIdx=1;

        // replace image data

    this.fixCanvasImageData=function()
    {
        this.ctx.putImageData(this.imgData,0,0);
    };
}

//
// this is a object used to hold the last mesh/trig
// that blocked a light.  we use this as an optimization
// as a trig that blocked this light probably blocks
// further pixels in the current trig render
//

function GetLightmapLastBlockObject()
{
    this.meshIdx=-1;
    this.cacheTrigIdx=-1;
}

//
// generate lightmaps class
//

function GenLightmapObject(view,bitmapList,map,debug,generateLightmap,callbackFunc)
{
    this.view=view;
    this.bitmapList=bitmapList;
    this.map=map;
    this.debug=debug;
    this.generateLightmap=generateLightmap;
    
        // chunk is one block available to draw a light map
    
        // array of bitmaps that make up the lightmap
        // each is an object with a canvas and the last chunk
        // drawn to (the chunkIdx)
        
    this.lightmapList=[];
    
        // the last block optimization list
        
    this.lastBlockList=[];
    
        // the callback function when
        // generation concludes
        
    this.callbackFunc=callbackFunc;
    
        // a link to this object so we can
        // use it in the "this" callbacks
        
    var currentGlobalLightMapObject;
    
        // global variables to reduce new/GC during light maps
    
    this.rayTraceVertexColor=new wsColor(0.0,0.0,0.0);
    
    this.lightBoundX=new wsBound(0,0);
    this.lightBoundY=new wsBound(0,0);
    this.lightBoundZ=new wsBound(0,0);
    
    this.vlx=new wsPoint(0,0,0);
    this.vrx=new wsPoint(0,0,0);
    
    this.lightVectorNormal=new wsPoint(0.0,0.0,0.0);
    
    this.xTrigBound=new wsBound(0,0);
    this.yTrigBound=new wsBound(0,0);
    this.zTrigBound=new wsBound(0,0);
    
    this.pt0=new ws2DIntPoint(0,0);
    this.pt1=new ws2DIntPoint(0,0);
    this.pt2=new ws2DIntPoint(0,0);

        //
        // border and smear polygons
        //
        
    this.smudgeChunk=function(lightBitmap,lft,top,rgt,bot)
    {
        var x,y,idx;
        var r,g,b;
        var hasColor;
        
        var pixelData=lightBitmap.pixelData;
        
            // we run through the entire chunk
            // from left to right, right to left,
            // top to bottom, and bottom to top
            // smearing any colors we find to
            // build an edge around the triangle

        for (y=top;y!==bot;y++) {
            
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
            hasColor=false;
            
            for (x=lft;x!==rgt;x++) {
                
                if (pixelData[idx+3]!==0) {
                    hasColor=true;
                    r=pixelData[idx];
                    g=pixelData[idx+1];
                    b=pixelData[idx+2];
                }
                else {
                    if (hasColor) {
                        pixelData[idx]=r;
                        pixelData[idx+1]=g;
                        pixelData[idx+2]=b;
                        pixelData[idx+3]=255;
                    }
                }
                
                idx+=4;
            }
            
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+(rgt-1))*4;
            hasColor=false;
            
            for (x=lft;x!==rgt;x++) {
                
                if (pixelData[idx+3]!==0) {
                    hasColor=true;
                    r=pixelData[idx];
                    g=pixelData[idx+1];
                    b=pixelData[idx+2];
                }
                else {
                    if (hasColor) {
                        pixelData[idx]=r;
                        pixelData[idx+1]=g;
                        pixelData[idx+2]=b;
                        pixelData[idx+3]=255;
                    }
                }
             
                idx-=4;
            }
        }
        
        for (x=lft;x!==rgt;x++) {
            
            hasColor=false;
            
            for (y=top;y!==bot;y++) {
                
                idx=((y*LIGHTMAP_TEXTURE_SIZE)+x)*4;
                if (pixelData[idx+3]!==0) {
                    hasColor=true;
                    r=pixelData[idx];
                    g=pixelData[idx+1];
                    b=pixelData[idx+2];
                }
                else {
                    if (hasColor) {
                        pixelData[idx]=r;
                        pixelData[idx+1]=g;
                        pixelData[idx+2]=b;
                        pixelData[idx+3]=255;
                    }
                }
            }
            
            hasColor=false;
            
            for (y=(bot-1);y>=top;y--) {
                
                idx=((y*LIGHTMAP_TEXTURE_SIZE)+x)*4;
                if (pixelData[idx+3]!==0) {
                    hasColor=true;
                    r=pixelData[idx];
                    g=pixelData[idx+1];
                    b=pixelData[idx+2];
                }
                else {
                    if (hasColor) {
                        pixelData[idx]=r;
                        pixelData[idx+1]=g;
                        pixelData[idx+2]=b;
                        pixelData[idx+3]=255;
                    }
                }
            }
        }
    };
    
    this.blurChunk=function(lightBitmap,lft,top,rgt,bot)
    {
        var n,idx;
        var x,y,cx,cy,cxs,cxe,cys,cye;
        var colCount,r,g,b;
        
        var pixelData=lightBitmap.pixelData;
        var blurData=lightBitmap.blurData;
        
            // default to current color if blur
            // fails because of alpha
            
        for (y=top;y!==bot;y++) {
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
            for (x=lft;x!==rgt;x++) {       
                blurData[idx]=pixelData[idx];
                blurData[idx+1]=pixelData[idx+1];
                blurData[idx+2]=pixelData[idx+2];
                idx+=4;
            }
        }
        
            // blur pixels to count

        for (n=0;n!==LIGHTMAP_BLUR_COUNT;n++) {

            for (y=top;y!==bot;y++) {

                cys=y-1;
                if (cys<0) cys=0;
                cye=y+2;
                if (cye>=LIGHTMAP_TEXTURE_SIZE) cye=LIGHTMAP_TEXTURE_SIZE-1;

                for (x=lft;x!==rgt;x++) {

                        // get blur from 8 surrounding pixels

                    colCount=0;
                    r=g=b=0;

                    cxs=x-1;
                    if (cxs<0) cxs=0;
                    cxe=x+2;
                    if (cxe>=LIGHTMAP_TEXTURE_SIZE) cxe=LIGHTMAP_TEXTURE_SIZE-1;

                    for (cy=cys;cy!==cye;cy++) {
                        for (cx=cxs;cx!==cxe;cx++) {
                            if ((cy===y) && (cx===x)) continue;       // ignore self

                                // add up blur from the
                                // original pixels

                            idx=((cy*LIGHTMAP_TEXTURE_SIZE)+cx)*4;

                            if (pixelData[idx+3]!==0) {
                                r+=pixelData[idx];
                                g+=pixelData[idx+1];
                                b+=pixelData[idx+2];
                                colCount++;
                            }
                        }
                    }
                    
                    if (colCount!==0) {
                        r=Math.trunc(r/colCount);
                        if (r>255) r=255;

                        g=Math.trunc(g/colCount);
                        if (g>255) g=255;

                        b=Math.trunc(b/colCount);
                        if (b>255) b=255;

                        idx=((y*LIGHTMAP_TEXTURE_SIZE)+x)*4;

                        blurData[idx]=r;
                        blurData[idx+1]=g;
                        blurData[idx+2]=b;
                    }
                }
            }

                // transfer over the changed pixels

            for (y=top;y!==bot;y++) {
                idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
                for (x=lft;x!==rgt;x++) {       
                    pixelData[idx]=blurData[idx];
                    pixelData[idx+1]=blurData[idx+1];
                    pixelData[idx+2]=blurData[idx+2];
                    idx+=4;
                }
            }
        } 
    };

        //
        // ray tracing
        //

    this.rayTraceCollision=function(vx,vy,vz,vctX,vctY,vctZ,trigCache)
    {
            // we pass in a single vertex (t0x,t0y,t0z) and
            // these pre-calculated items:
            // v0 = vertex of triangle
            // v10[x,y,z]=t1[x,y,z]-t0[x,y,z]
            // v20[x,y,z]=t2[x,y,z]-t0[x,y,z]

            // calculate the determinate
            // perpVector is cross(vector,v2)
            // det is dot(v1,perpVector)

        var perpVectorX=(vctY*trigCache.v20.z)-(vctZ*trigCache.v20.y);
        var perpVectorY=(vctZ*trigCache.v20.x)-(vctX*trigCache.v20.z);
        var perpVectorZ=(vctX*trigCache.v20.y)-(vctY*trigCache.v20.x);

        var det=(trigCache.v10.x*perpVectorX)+(trigCache.v10.y*perpVectorY)+(trigCache.v10.z*perpVectorZ);

            // is line on the same plane as triangle?

        if ((det>-0.00001) && (det<0.00001)) return(false);

            // get the inverse determinate

        var invDet=1.0/det;

            // calculate triangle U and test
            // lineToTrigPointVector is vector from vertex to triangle point 0
            // u is invDet * dot(lineToTrigPointVector,perpVector)

        var lineToTrigPointVectorX=vx-trigCache.v0.x;
        var lineToTrigPointVectorY=vy-trigCache.v0.y;
        var lineToTrigPointVectorZ=vz-trigCache.v0.z;

        var u=invDet*((lineToTrigPointVectorX*perpVectorX)+(lineToTrigPointVectorY*perpVectorY)+(lineToTrigPointVectorZ*perpVectorZ));
        if ((u<0.0) || (u>1.0)) return(false);

            // calculate triangle V and test
            // lineToTrigPerpVector is cross(lineToTrigPointVector,v1)
            // v is invDet * dot(vector,lineToTrigPerpVector)

        var lineToTrigPerpVectorX=(lineToTrigPointVectorY*trigCache.v10.z)-(lineToTrigPointVectorZ*trigCache.v10.y);
        var lineToTrigPerpVectorY=(lineToTrigPointVectorZ*trigCache.v10.x)-(lineToTrigPointVectorX*trigCache.v10.z);
        var lineToTrigPerpVectorZ=(lineToTrigPointVectorX*trigCache.v10.y)-(lineToTrigPointVectorY*trigCache.v10.x);

        var v=invDet*((vctX*lineToTrigPerpVectorX)+(vctY*lineToTrigPerpVectorY)+(vctZ*lineToTrigPerpVectorZ));
        if ((v<0.0) || ((u+v)>1.0)) return(false);

            // t is the point on the line, from the
            // invDet*dot(v2,lineToTrigPerpVector)

            // this is a little different then normal ray trace
            // hits, we add in an extra 0.01 slop so polygons that are
            // touching each other don't have edges grayed in

        var t=invDet*((trigCache.v20.x*lineToTrigPerpVectorX)+(trigCache.v20.y*lineToTrigPerpVectorY)+(trigCache.v20.z*lineToTrigPerpVectorZ));
        return((t>0.01)&&(t<1.0));
    };

    this.rayTraceVertex=function(lightList,vx,vy,vz,col)
    {
        var n,nLight,lightIdx,trigCount;
        var light;
        var k,p,hit,mesh,nMesh;
        var trigRayTraceCache;
        var lightVectorX,lightVectorY,lightVectorZ;
        var dist,att;
        
            // start at black
            
        col.set(0.0,0.0,0.0);

            // we use the passed in light list which is a cut down
            // list precalculcated from mesh/light interactions and
            // removing any lights that are facing away from the
            // front side of the triangle

            // we precalculated a list of a single point on the
            // triangle and two vectors for each side around that point
            // to speed this up.  That's what the trigRayTraceCache is for

        nLight=lightList.length;

        for (n=0;n!==nLight;n++) {
            lightIdx=lightList[n];
            light=this.map.lights[lightIdx];

                // light within light range?

            dist=light.distanceByTriplet(vx,vy,vz);
            if (dist>light.intensity) continue;

                // light vector
                // break this up into X,Y,Z to avoid
                // lookup penalities for this code

            lightVectorX=light.position.x-vx;
            lightVectorY=light.position.y-vy;
            lightVectorZ=light.position.z-vz;

                // check the optimized list of last hits
                
            if (this.lastBlockList[lightIdx].meshIdx!==-1) {
                mesh=this.map.meshes[this.lastBlockList[lightIdx].meshIdx];
                if (this.rayTraceCollision(vx,vy,vz,lightVectorX,lightVectorY,lightVectorZ,mesh.trigRayTraceCache[this.lastBlockList[lightIdx].cacheTrigIdx])) continue;
            }
            
                // light bounding

            this.lightBoundX.set(vx,light.position.x);
            this.lightBoundY.set(vy,light.position.y);
            this.lightBoundZ.set(vz,light.position.z);

                // each light has a list of meshes within
                // it's light cone, these are the only meshes
                // that can block

            nMesh=light.meshIntersectList.length;

                // any hits?

            hit=false;

            for (k=0;k!==nMesh;k++) {
                mesh=this.map.meshes[light.meshIntersectList[k]];
                if (!mesh.boxBoundCollision(this.lightBoundX,this.lightBoundY,this.lightBoundZ)) continue;

                trigCount=mesh.trigCount;
                trigRayTraceCache=mesh.trigRayTraceCache;

                for (p=0;p!==trigCount;p++) {
                    if (this.rayTraceCollision(vx,vy,vz,lightVectorX,lightVectorY,lightVectorZ,trigRayTraceCache[p])) {
                        hit=true;
                        this.lastBlockList[lightIdx].meshIdx=light.meshIntersectList[k];
                        this.lastBlockList[lightIdx].cacheTrigIdx=p;
                        break;
                    }
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
        // render a single color to a chunk
        //
        
    this.renderColor=function(pixelData,lft,top)
    {
        var x,y,idx;
        var rgt=lft+LIGHTMAP_CHUNK_SIZE;
        var bot=top+LIGHTMAP_CHUNK_SIZE;
        
        for (y=top;y!==bot;y++) {
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
            for (x=lft;x!==rgt;x++) {
                pixelData[idx++]=0;
                pixelData[idx++]=0;
                pixelData[idx++]=0;
                pixelData[idx++]=255;    
            }
        }
    };
    
    this.clearChunk=function(pixelData,lft,top)
    {
        var x,y,idx;
        var rgt=lft+LIGHTMAP_CHUNK_SIZE;
        var bot=top+LIGHTMAP_CHUNK_SIZE;
        
        for (y=top;y!==bot;y++) {
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
            for (x=lft;x!==rgt;x++) {
                pixelData[idx++]=0;
                pixelData[idx++]=0;
                pixelData[idx++]=0;
                pixelData[idx++]=0;    
            }
        }
    };

        //
        // render a triangle
        //

    this.renderTriangle=function(lightBitmap,meshIdx,pts,vs,normal,lft,top,rgt,bot)
    {
        var n,x,y,lx,rx,tempX,ty,my,by,idx;
        var lxFactor,rxFactor,vFactor;
        var vx,vy,vz;
        var blackCheck;
        
        var pixelData=lightBitmap.pixelData;
        
            // create a list of possible lights
            // for this triangle based on the compiled
            // mesh light lists and triangle normal to
            // determine if the triangle is facing away
            // from the light
            
        var mesh=this.map.meshes[meshIdx];
        var nLight=mesh.lightIntersectList.length;
        
        var light,lightIdx;
        
        var lightList=[];

        for (n=0;n!==nLight;n++) {
            lightIdx=mesh.lightIntersectList[n];
            light=this.map.lights[lightIdx];

            this.lightVectorNormal.set((light.position.x-vs[0].x),(light.position.y-vs[0].y),(light.position.z-vs[0].z));
            this.lightVectorNormal.normalize();
            if (this.lightVectorNormal.dot(normal)>=0.0) lightList.push(lightIdx);
        }
        
        if (lightList.length===0) return(false);

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
        if (ty>=by) return(false);
        
        blackCheck=0;

        for (y=ty;y!==by;y++) {

                // hit the midpoint and need
                // to switch lines?

            if (y===my) {
                midStartPtIdx=midPtIdx;
                midEndPtIdx=botPtIdx;
            }

                // get the left right

            lxFactor=(y-pts[topPtIdx].y)/(pts[botPtIdx].y-pts[topPtIdx].y);
            lx=pts[topPtIdx].x+Math.trunc((pts[botPtIdx].x-pts[topPtIdx].x)*lxFactor);

            rxFactor=(y-pts[midStartPtIdx].y)/(pts[midEndPtIdx].y-pts[midStartPtIdx].y);
            rx=pts[midStartPtIdx].x+Math.trunc((pts[midEndPtIdx].x-pts[midStartPtIdx].x)*rxFactor);

                // get the vertex left and right

            this.vlx.x=vs[topPtIdx].x+Math.trunc((vs[botPtIdx].x-vs[topPtIdx].x)*lxFactor);
            this.vlx.y=vs[topPtIdx].y+Math.trunc((vs[botPtIdx].y-vs[topPtIdx].y)*lxFactor);
            this.vlx.z=vs[topPtIdx].z+Math.trunc((vs[botPtIdx].z-vs[topPtIdx].z)*lxFactor);

            this.vrx.x=vs[midStartPtIdx].x+Math.trunc((vs[midEndPtIdx].x-vs[midStartPtIdx].x)*rxFactor);
            this.vrx.y=vs[midStartPtIdx].y+Math.trunc((vs[midEndPtIdx].y-vs[midStartPtIdx].y)*rxFactor);
            this.vrx.z=vs[midStartPtIdx].z+Math.trunc((vs[midEndPtIdx].z-vs[midStartPtIdx].z)*rxFactor);

                // sometimes we need to swap
                // left and right

            if (lx>rx) {
                tempX=lx;
                lx=rx;
                rx=tempX;

                tempX=this.vlx;
                this.vlx=this.vrx;
                this.vrx=tempX;
            }

                // get the bitmap data index

            idx=(((y+top)*LIGHTMAP_TEXTURE_SIZE)+(lx+lft))*4;

                // render the scan line

            for (x=lx;x!==rx;x++) {

                    // get the ray trace vetex

                vFactor=(x-lx)/(rx-lx);
                vx=this.vlx.x+Math.trunc((this.vrx.x-this.vlx.x)*vFactor);
                vy=this.vlx.y+Math.trunc((this.vrx.y-this.vlx.y)*vFactor);
                vz=this.vlx.z+Math.trunc((this.vrx.z-this.vlx.z)*vFactor);
                
                    // write the pixel

                this.rayTraceVertex(lightList,vx,vy,vz,this.rayTraceVertexColor);
                
                pixelData[idx++]=Math.trunc(this.rayTraceVertexColor.r*255.0);
                pixelData[idx++]=Math.trunc(this.rayTraceVertexColor.g*255.0);
                pixelData[idx++]=Math.trunc(this.rayTraceVertexColor.b*255.0);
                pixelData[idx++]=255;
                
                    // check if we only wrote black
                    
                blackCheck+=(this.rayTraceVertexColor.r+this.rayTraceVertexColor.g+this.rayTraceVertexColor.b);
            }
        }
        
            // all black?
            // if so, we use the all black chunk 0
            // and we re-clear the chunk
            
        if (blackCheck===0) {
            this.clearChunk(lightBitmap.pixelData,lft,top);
            return(false);
        }

            // smear and blur chunk

        this.smudgeChunk(lightBitmap,lft,top,rgt,bot);
        this.blurChunk(lightBitmap,lft,top,rgt,bot);
        
        return(true);
    };

        //
        // build light map in chunk
        //

    this.writePolyToChunk=function(lightBitmap,meshIdx,trigIdx,lft,top)
    {
        var mesh=this.map.meshes[meshIdx];

            // get the vertexes for the triangle
            // and one normal

        var tIdx=trigIdx*3;
        
        var v0=mesh.vertexList[mesh.indexes[tIdx]];
        var v1=mesh.vertexList[mesh.indexes[tIdx+1]];
        var v2=mesh.vertexList[mesh.indexes[tIdx+2]];

            // look at one of the normal to determine if it's
            // wall or floor like

        var wallLike=(Math.abs(v0.normal.y)<=0.3);

            // get the bounds of the 3D triangle

        this.xTrigBound.set(v0.position.x,v0.position.x);
        this.xTrigBound.adjust(v1.position.x);
        this.xTrigBound.adjust(v2.position.x);

        this.yTrigBound.set(v0.position.y,v0.position.y);
        this.yTrigBound.adjust(v1.position.y);
        this.yTrigBound.adjust(v2.position.y);

        this.zTrigBound.set(v0.position.z,v0.position.z);
        this.zTrigBound.adjust(v1.position.z);
        this.zTrigBound.adjust(v2.position.z);

            // 2D reduction factors
            // we are drawing into a CHUNK_SIZE, but
            // the actual points are within the margin
            // so we have extra pixels to smear

        var renderSize=LIGHTMAP_CHUNK_SIZE-(LIGHTMAP_RENDER_MARGIN*2);

        var sz=this.xTrigBound.getSize();
        var xFactor=(sz===0)?0:renderSize/sz;

        var sz=this.yTrigBound.getSize();
        var yFactor=(sz===0)?0:renderSize/sz;

        var sz=this.zTrigBound.getSize();
        var zFactor=(sz===0)?0:renderSize/sz;

            // now create the 2D version of it
            // these points are offsets WITHIN the margin box

        if (wallLike) {
            if (this.xTrigBound.getSize()>this.zTrigBound.getSize()) {
                this.pt0.set(((v0.position.x-this.xTrigBound.min)*xFactor),((v0.position.y-this.yTrigBound.min)*yFactor));
                this.pt1.set(((v1.position.x-this.xTrigBound.min)*xFactor),((v1.position.y-this.yTrigBound.min)*yFactor));
                this.pt2.set(((v2.position.x-this.xTrigBound.min)*xFactor),((v2.position.y-this.yTrigBound.min)*yFactor));
            }
            else {
                this.pt0.set(((v0.position.z-this.zTrigBound.min)*zFactor),((v0.position.y-this.yTrigBound.min)*yFactor));
                this.pt1.set(((v1.position.z-this.zTrigBound.min)*zFactor),((v1.position.y-this.yTrigBound.min)*yFactor));
                this.pt2.set(((v2.position.z-this.zTrigBound.min)*zFactor),((v2.position.y-this.yTrigBound.min)*yFactor));
            }
        }
        else {
            this.pt0.set(((v0.position.x-this.xTrigBound.min)*xFactor),((v0.position.z-this.zTrigBound.min)*zFactor));
            this.pt1.set(((v1.position.x-this.xTrigBound.min)*xFactor),((v1.position.z-this.zTrigBound.min)*zFactor));
            this.pt2.set(((v2.position.x-this.xTrigBound.min)*xFactor),((v2.position.z-this.zTrigBound.min)*zFactor));
        }

            // move so the triangle renders within
            // the margins so we have area to smear

        this.pt0.move(LIGHTMAP_RENDER_MARGIN,LIGHTMAP_RENDER_MARGIN);
        this.pt1.move(LIGHTMAP_RENDER_MARGIN,LIGHTMAP_RENDER_MARGIN);
        this.pt2.move(LIGHTMAP_RENDER_MARGIN,LIGHTMAP_RENDER_MARGIN);

            // ray trace the triangle

        var hitLight=this.renderTriangle(lightBitmap,meshIdx,[this.pt0,this.pt1,this.pt2],[v0.position,v1.position,v2.position],v0.normal,lft,top,(lft+LIGHTMAP_CHUNK_SIZE),(top+LIGHTMAP_CHUNK_SIZE));

            // if it didn't hit any lights, UV
            // to the 0 black chunk
        
        if (!hitLight) {
            var singleUV=LIGHTMAP_RENDER_MARGIN/LIGHTMAP_TEXTURE_SIZE;
            v0.lightmapUV.x=v0.lightmapUV.y=singleUV;
            v1.lightmapUV.x=v1.lightmapUV.y=singleUV;
            v2.lightmapUV.x=v2.lightmapUV.y=singleUV;
            return(false);
        }
            // add the UV
            // pt0-pt2 are already moved within the margin

        v0.lightmapUV.x=(this.pt0.x+lft)/LIGHTMAP_TEXTURE_SIZE;
        v0.lightmapUV.y=(this.pt0.y+top)/LIGHTMAP_TEXTURE_SIZE;

        v1.lightmapUV.x=(this.pt1.x+lft)/LIGHTMAP_TEXTURE_SIZE;
        v1.lightmapUV.y=(this.pt1.y+top)/LIGHTMAP_TEXTURE_SIZE;

        v2.lightmapUV.x=(this.pt2.x+lft)/LIGHTMAP_TEXTURE_SIZE;
        v2.lightmapUV.y=(this.pt2.y+top)/LIGHTMAP_TEXTURE_SIZE;
        
        return(true);
    };

        //
        // create lightmap for single mesh
        //

    this.createLightmapForMesh=function(meshIdx)
    {
        var n,lightmapIdx,chunkIdx,nTrig;
        var lft,top;
        var mesh;
        
            // run the status bar

        mesh=this.map.meshes[meshIdx];
        nTrig=mesh.trigCount;
        
            // if we aren't generating lightmaps,
            // then always use the same single lightmap
            // and the default black chunk
            
        if (!this.generateLightmap) {            
            lightmapIdx=0;
            if (this.lightmapList.length===0) this.lightmapList[0]=new GenLightmapBitmapObject();     // have no lightmaps yet, so make one
        }
        
            // else we need to pack triangles
            // into lightmaps
            
        else {

                // find a lightmap to put mesh into
                // we do this by checking if we have enough
                // room for the set of triangles

            lightmapIdx=-1;

            for (n=0;n!==this.lightmapList.length;n++) {
                if ((LIGHTMAP_CHUNK_PER_TEXTURE-this.lightmapList[n].chunkIdx)>nTrig) {
                    lightmapIdx=n;
                    break;
                }
            }

                // if we didn't find a lightmap, make a new one

            if (lightmapIdx===-1) {
                lightmapIdx=this.lightmapList.length;
                this.lightmapList[lightmapIdx]=new GenLightmapBitmapObject();
            }
        }
        
            // starting chunk and context
        
        var lightBitmap=this.lightmapList[lightmapIdx];
        chunkIdx=lightBitmap.chunkIdx;
        
            // if no light map, then just create
            // UVs for the top-left white map
            
        if (!this.generateLightmap) {
            var v;
            var singleUV=LIGHTMAP_RENDER_MARGIN/LIGHTMAP_TEXTURE_SIZE;
            for (n=0;n!==mesh.vertexCount;n++) {
                v=mesh.vertexList[n];
                v.lightmapUV.x=singleUV;
                v.lightmapUV.x=singleUV;
            }
        }

            // otherwise render the triangles

        else {
            
                // write polys to chunk
                // only advance the chunk if this trig
                // hit a light, otherwise it's using the
                // all-black chunk 0
                
            for (n=0;n!==nTrig;n++) {

                lft=(chunkIdx%LIGHTMAP_CHUNK_SPLIT)*LIGHTMAP_CHUNK_SIZE;
                top=Math.trunc(chunkIdx/LIGHTMAP_CHUNK_SPLIT)*LIGHTMAP_CHUNK_SIZE;

                if (this.writePolyToChunk(lightBitmap,meshIdx,n,lft,top)) chunkIdx++;
            }
        }
        
            // mark off the chunks we used
            
        lightBitmap.chunkIdx=chunkIdx;

            // map meshes have a temporary index for
            // the light map.  we don't create the light
            // maps into the very end so this is used for tracking
            // it until we can create it
            
        mesh.tempLightmapIdx=lightmapIdx;

            // move on to next mesh
            // if out of mesh, finish up creation
            // by saving the light maps

        meshIdx++;
        if (meshIdx>=this.map.meshes.length) {
            setTimeout(function() { currentGlobalLightMapObject.createFinish(); },PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next mesh

        this.view.loadingScreenDraw(meshIdx/(this.map.meshes.length+2.0));
        setTimeout(function() { currentGlobalLightMapObject.createLightmapForMesh(meshIdx); },PROCESS_TIMEOUT_MSEC);
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
            this.map.meshes[n].buildTrigRayTraceCache();
        }
        
            // now build the last block list, which
            // is used to optimize ray collisions
            
        for (n=0;n!==this.map.lights.length;n++) {
            this.lastBlockList.push(new GetLightmapLastBlockObject());
        }

            // run through the meshes
            // by a timer so we don't trigger the
            // script time out problem   

        this.view.loadingScreenDraw(1.0/(nMesh+2.0));
        setTimeout(function() { currentGlobalLightMapObject.createLightmapForMesh(0); },PROCESS_TIMEOUT_MSEC);
    };

    this.createFinish=function()
    {
        var n;
        
            // put all the pixel data back in
            // the canvases
            
        for (n=0;n!==this.lightmapList.length;n++) {
            this.lightmapList[n].fixCanvasImageData();
        }
        

            // turn canvas into lightmap
            // and put lightmap in map

            // the index is used as the id

        for (n=0;n!==this.lightmapList.length;n++) {
            this.bitmapList.add(new Bitmap(this.view,('Lightmap '+n),this.lightmapList[n].canvas,null,null,1.0,0.0));
        }

            // and set the light map on the meshes

        var mesh;
        var nMesh=this.map.meshes.length;

        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshes[n];
            mesh.lightmap=this.bitmapList.get('Lightmap '+mesh.tempLightmapIdx);
        }
        
                    // debugging

        //if (this.lightmapList.length!==0) debug.displayCanvasData(this.lightmapList[0].canvas,1050,10,1024,1024);

            // finish with the callback

        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    };

}
