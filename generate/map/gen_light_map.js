"use strict";

//
// lightmap bitmap class
// records each generated lightmap
// canvas and the last chunk written to
//

class GenLightmapBitmapClass
{
    constructor()
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
        
            // the next chunk is always white
            
        var x,y;

        for (y=0;y!==LIGHTMAP_CHUNK_SIZE;y++) {
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+LIGHTMAP_CHUNK_SIZE)*4;
            for (x=0;x!==LIGHTMAP_CHUNK_SIZE;x++) {
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
            }
        }

            // start at chunk 2 as the first free chunk

        this.chunkIdx=2;
        
        Object.seal(this);
    }
    
        // replace image data

    fixCanvasImageData()
    {
        this.ctx.putImageData(this.imgData,0,0);
    }
}

//
// this is a object used to hold the last mesh/trig
// that blocked a light.  we use this as an optimization
// as a trig that blocked this light probably blocks
// further pixels in the current trig render
//

class GetLightmapLastBlockClass
{
    constructor()
    {
        this.meshIdx=-1;
        this.cacheTrigIdx=-1;
        
        Object.seal(this);
    }
}

//
// generate lightmaps class
//

class GenLightmapClass
{
    constructor(view,bitmapList,map,debug,generateLightmap,callbackFunc)
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
        
            // UVs for all black and all white items
        
        this.blackChunkUV=new ws2DPoint((LIGHTMAP_RENDER_MARGIN/LIGHTMAP_TEXTURE_SIZE),(LIGHTMAP_RENDER_MARGIN/LIGHTMAP_TEXTURE_SIZE));
        this.whiteChunkUV=new ws2DPoint(((LIGHTMAP_CHUNK_SIZE+LIGHTMAP_RENDER_MARGIN)/LIGHTMAP_TEXTURE_SIZE),(LIGHTMAP_RENDER_MARGIN/LIGHTMAP_TEXTURE_SIZE));

            // global variables to reduce new/GC during light maps

        this.rayTraceVertexColor=new wsColor(0.0,0.0,0.0);

        this.lightBoundX=new wsBound(0,0);
        this.lightBoundY=new wsBound(0,0);
        this.lightBoundZ=new wsBound(0,0);

        this.vlx=new wsPoint(0,0,0);
        this.vrx=new wsPoint(0,0,0);

        this.lightVectorNormal=new wsPoint(0.0,0.0,0.0);
        
        Object.seal(this);
    }
    
        //
        // border and smear polygons
        //
        
    smudgeChunk(lightBitmap,lft,top)
    {
        var x,y,idx;
        var r,g,b;
        var hasColor;
        
        var rgt=lft+LIGHTMAP_CHUNK_SIZE;
        var bot=top+LIGHTMAP_CHUNK_SIZE;
        
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
    }
    
    blurChunk(lightBitmap,lft,top)
    {
        var n,idx;
        var x,y,cx,cy,cxs,cxe,cys,cye;
        var colCount,fCount,r,g,b;
        
        var rgt=lft+LIGHTMAP_CHUNK_SIZE;
        var bot=top+LIGHTMAP_CHUNK_SIZE;
        
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
                        fCount=1/colCount;
                        
                        idx=((y*LIGHTMAP_TEXTURE_SIZE)+x)*4;

                        blurData[idx]=Math.trunc(r*fCount);
                        blurData[idx+1]=Math.trunc(g*fCount);
                        blurData[idx+2]=Math.trunc(b*fCount);
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
    }

        //
        // ray tracing
        //

    rayTraceCollision(vx,vy,vz,vctX,vctY,vctZ,trigCache)
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
    }

    rayTraceVertex(lightList,vx,vy,vz,col)
    {
        var n,nLight,lightIdx,trigCount;
        var light;
        var k,p,hit,mesh,nMesh;
        var trigRayTraceCache;
        var lightVectorX,lightVectorY,lightVectorZ;
        var dist,att;
        
            // start at black
            
        col.setFromValues(0.0,0.0,0.0);
        
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

            this.lightBoundX.setFromValues(vx,light.position.x);
            this.lightBoundY.setFromValues(vy,light.position.y);
            this.lightBoundZ.setFromValues(vz,light.position.z);

                // each light has a list of meshes within
                // it's light cone, these are the only meshes
                // that can block

            nMesh=light.meshIntersectList.length;

                // any hits?

            hit=false;

            for (k=0;k!==nMesh;k++) {
                mesh=this.map.meshes[light.meshIntersectList[k]];
                if (!mesh.boxBoundCollision(this.lightBoundX,this.lightBoundY,this.lightBoundZ)) continue;
                
                    // skip doors, lifts, and lights as
                    // they either move or project light
                    
                if ((mesh.flag===MESH_FLAG_DOOR) || (mesh.flag===MESH_FLAG_LIFT) || (mesh.flag===MESH_FLAG_LIGHT)) continue;

                    // do all the trigs
                    
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
    }
    
        //
        // render a single color to a chunk
        //
        
    renderColor(pixelData,r,g,b,lft,top)
    {
        var x,y,idx;
        var rgt=lft+LIGHTMAP_CHUNK_SIZE;
        var bot=top+LIGHTMAP_CHUNK_SIZE;
        
        for (y=top;y!==bot;y++) {
            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lft)*4;
            for (x=lft;x!==rgt;x++) {
                pixelData[idx++]=r;
                pixelData[idx++]=g;
                pixelData[idx++]=b;
                pixelData[idx++]=255;    
            }
        }
    }
    
    clearChunk(pixelData,lft,top)
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
    }

        //
        // render a triangle
        //

    renderTriangle(lightBitmap,meshIdx,v0,v1,v2,lft,top)
    {
        var n,x,y,lx,rx,ty,by,idx;
        var xFactor,yFactor;
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

                // check all the vertex normals
                // only eliminate if all vertexes are
                // behind
                
            this.lightVectorNormal.setFromValues((light.position.x-v0.position.x),(light.position.y-v0.position.y),(light.position.z-v0.position.z));
            this.lightVectorNormal.normalize();
            if (this.lightVectorNormal.dot(v0.normal)>=0.0) {
                lightList.push(lightIdx);
                continue;
            }
            
            this.lightVectorNormal.setFromValues((light.position.x-v1.position.x),(light.position.y-v1.position.y),(light.position.z-v1.position.z));
            this.lightVectorNormal.normalize();
            if (this.lightVectorNormal.dot(v1.normal)>=0.0) {
                lightList.push(lightIdx);
                continue;
            }
            
            this.lightVectorNormal.setFromValues((light.position.x-v2.position.x),(light.position.y-v2.position.y),(light.position.z-v2.position.z));
            this.lightVectorNormal.normalize();
            if (this.lightVectorNormal.dot(v2.normal)>=0.0) {
                lightList.push(lightIdx);
                continue;
            }
        }
        
        if (lightList.length===0) return(false);
        
            // render the triangle by scan
            // lines from top to bottom

        ty=top+LIGHTMAP_RENDER_MARGIN;
        by=(top+LIGHTMAP_CHUNK_SIZE)-LIGHTMAP_RENDER_MARGIN;
        
        lx=lft+LIGHTMAP_RENDER_MARGIN;
        
        blackCheck=0;

        for (y=ty;y!==by;y++) {
            
                // get the 2D x line
                
            yFactor=(y-ty)/(by-ty);
            rx=lx+Math.trunc((LIGHTMAP_CHUNK_SIZE-LIGHTMAP_RENDER_MARGIN)*(1.0-yFactor));
            
                // get the 3D x line
                
            this.vlx.x=v0.position.x+Math.trunc((v2.position.x-v0.position.x)*yFactor);
            this.vlx.y=v0.position.y+Math.trunc((v2.position.y-v0.position.y)*yFactor);
            this.vlx.z=v0.position.z+Math.trunc((v2.position.z-v0.position.z)*yFactor);

            this.vrx.x=v1.position.x+Math.trunc((v2.position.x-v1.position.x)*yFactor);
            this.vrx.y=v1.position.y+Math.trunc((v2.position.y-v1.position.y)*yFactor);
            this.vrx.z=v1.position.z+Math.trunc((v2.position.z-v1.position.z)*yFactor);

                // get the bitmap data index

            idx=((y*LIGHTMAP_TEXTURE_SIZE)+lx)*4;
            
                // render the scan line

            for (x=lx;x!==rx;x++) {

                    // get the ray trace vetex

                xFactor=(x-lx)/(rx-lx);
                vx=this.vlx.x+Math.trunc((this.vrx.x-this.vlx.x)*xFactor);
                vy=this.vlx.y+Math.trunc((this.vrx.y-this.vlx.y)*xFactor);
                vz=this.vlx.z+Math.trunc((this.vrx.z-this.vlx.z)*xFactor);
                
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
            this.clearChunk(pixelData,lft,top);
            return(false);
        }

            // smear and blur chunk

        this.smudgeChunk(lightBitmap,lft,top);
        this.blurChunk(lightBitmap,lft,top);
        
        return(true);
    }

        //
        // build light map in chunk
        //

    writePolyToChunk(lightBitmap,meshIdx,trigIdx,lft,top)
    {
        var mesh=this.map.meshes[meshIdx];
        
            // get the vertexes for the triangle
            // and one normal

        var tIdx=trigIdx*3;
        
        var v0=mesh.vertexList[mesh.indexes[tIdx]];
        var v1=mesh.vertexList[mesh.indexes[tIdx+1]];
        var v2=mesh.vertexList[mesh.indexes[tIdx+2]];
        
            // lights are always highlighted

        if (mesh.flag===MESH_FLAG_LIGHT) {
            v0.lightmapUV.setFromPoint(this.whiteChunkUV);
            v1.lightmapUV.setFromPoint(this.whiteChunkUV);
            v2.lightmapUV.setFromPoint(this.whiteChunkUV);
            return(false);
        }

            // ray trace the 3D triangle onto
            // a 2D triangle in the chunk within the render margin
            
        var hitLight=this.renderTriangle(lightBitmap,meshIdx,v0,v1,v2,lft,top);

            // if it didn't hit any lights, UV
            // to the 0 black chunk
        
        if (!hitLight) {
            v0.lightmapUV.setFromPoint(this.blackChunkUV);
            v1.lightmapUV.setFromPoint(this.blackChunkUV);
            v2.lightmapUV.setFromPoint(this.blackChunkUV);
            return(false);
        }
        
            // add the UV
            // pt0-pt2 are already moved within the margin

        v0.lightmapUV.x=(lft+LIGHTMAP_RENDER_MARGIN)/LIGHTMAP_TEXTURE_SIZE;
        v0.lightmapUV.y=(top+LIGHTMAP_RENDER_MARGIN)/LIGHTMAP_TEXTURE_SIZE;

        v1.lightmapUV.x=(lft+(LIGHTMAP_CHUNK_SIZE-LIGHTMAP_RENDER_MARGIN))/LIGHTMAP_TEXTURE_SIZE;
        v1.lightmapUV.y=(top+LIGHTMAP_RENDER_MARGIN)/LIGHTMAP_TEXTURE_SIZE;

        v2.lightmapUV.x=(lft+LIGHTMAP_RENDER_MARGIN)/LIGHTMAP_TEXTURE_SIZE;
        v2.lightmapUV.y=(top+(LIGHTMAP_CHUNK_SIZE-LIGHTMAP_RENDER_MARGIN))/LIGHTMAP_TEXTURE_SIZE;
        
        return(true);
    }

        //
        // create lightmap for single mesh
        //

    createLightmapForMesh(meshIdx)
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
            if (this.lightmapList.length===0) this.lightmapList[0]=new GenLightmapBitmapClass();     // have no lightmaps yet, so make one
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
                this.lightmapList[lightmapIdx]=new GenLightmapBitmapClass();
            }
        }
        
            // starting chunk and context
        
        var lightBitmap=this.lightmapList[lightmapIdx];
        chunkIdx=lightBitmap.chunkIdx;
        
            // if no light map, then just create
            // UVs for the top-left white map (in a real
            // generation, this would be the black map but we
            // just reuse the UV here.)
            
        if (!this.generateLightmap) {
            for (n=0;n!==mesh.vertexCount;n++) {
                mesh.vertexList[n].lightmapUV.setFromPoint(this.blackChunkUV);
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
            setTimeout(this.createFinish.bind(this),PROCESS_TIMEOUT_MSEC);
            return;
        }

            // next mesh

        this.view.loadingScreenDraw(meshIdx/(this.map.meshes.length+2.0));
        setTimeout(this.createLightmapForMesh.bind(this,meshIdx),PROCESS_TIMEOUT_MSEC);
    }

        //
        // create lightmap
        // creation has to be done by a timer because this
        // is too slow and browsers will bounce the script
        //

    create()
    {
        var n;
        var nMesh=this.map.meshes.length;

            // run through the meshes and build
            // cache to speed up ray tracing

        for (n=0;n!==nMesh;n++) {
            this.map.meshes[n].buildTrigRayTraceCache();
        }
        
            // now build the last block list, which
            // is used to optimize ray collisions
            
        for (n=0;n!==this.map.lights.length;n++) {
            this.lastBlockList.push(new GetLightmapLastBlockClass());
        }

            // run through the meshes
            // by a timer so we don't trigger the
            // script time out problem   

        this.view.loadingScreenDraw(1.0/(nMesh+2.0));
        setTimeout(this.createLightmapForMesh.bind(this,0),PROCESS_TIMEOUT_MSEC);
    }

    createFinish()
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
            this.bitmapList.addBitmap(new BitmapClass(this.view,('Lightmap '+n),this.lightmapList[n].canvas,null,null,1.0,0.0));
        }

            // and set the light map on the meshes

        var mesh;
        var nMesh=this.map.meshes.length;

        for (n=0;n!==nMesh;n++) {
            mesh=this.map.meshes[n];
            mesh.lightmap=this.bitmapList.getBitmap('Lightmap '+mesh.tempLightmapIdx);
        }
        
            // debugging
/*
        var y=2000;
        for (n=0;n!==this.lightmapList.length;n++) {
            this.debug.displayCanvasData(this.lightmapList[n].canvas,10,y,1024,1024);
            y+=1034;
        }
*/
            // finish with the callback

        this.view.loadingScreenDraw(1.0);
        this.callbackFunc();
    }

}
