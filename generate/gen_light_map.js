"use strict";

//
// Light Map Generation
// 
// This code generates light maps.  We have to pass
// everything through instead of relying on variables in
// the object because the callbacks make the "this" equal
// to the window object.
//

var genLightmap={};

//
// lightmap bitmap object
// records each generated lightmap
// canvas and the last chunk written to
//

function genLightmapBitmapObject(canvas)
{
    this.chunkIdx=0;
    this.canvas=canvas;
}

//
// constants
//

genLightmap.TIMEOUT_MSEC=100;

genLightmap.TEXTURE_SIZE=512;
genLightmap.TRIG_PER_TEXTURE=64;            // must be square
genLightmap.RENDER_MARGIN=2;                // margin around each light map triangle

//
// start and finish light map bitmaps
//

genLightmap.startBitmap=function()
{
        // setup the canvas
        
    var bitmapCanvas=document.createElement('canvas');
    bitmapCanvas.width=genLightmap.TEXTURE_SIZE;
    bitmapCanvas.height=genLightmap.TEXTURE_SIZE;
    var ctx=bitmapCanvas.getContext('2d');
    
        // clear to black
    
    genBitmapUtility.drawRect(ctx,0,0,bitmapCanvas.width,bitmapCanvas.height,'#000000');
    
    return(bitmapCanvas);
};

genLightmap.finishBitmap=function(lightmapIdx,bitmapCanvas)
{
        // load the bitmap into webGL

    lightmap.load(lightmapIdx,bitmapCanvas);
    
        // debugging code
/*   
    if (lightmapIdx<6) {
        var x=810+((lightmapIdx%3)*205);
        var y=100+(Math.floor(lightmapIdx/3)*205);
        debug.displayCanvasData(bitmapCanvas,x,y,200,200);
    }
*/
};

//
// ray tracing
//

genLightmap.rayTraceCollision=function(v,vector,trigPt0,trigPt1,trigPt2)
{
		// get triangle vectors
        
    var v1=vec3.fromValues((trigPt1.x-trigPt0.x),(trigPt1.y-trigPt0.y),(trigPt1.z-trigPt0.z));
    var v2=vec3.fromValues((trigPt2.x-trigPt0.x),(trigPt2.y-trigPt0.y),(trigPt2.z-trigPt0.z));
	
		// calculate the determinate
        // perpVector is cross(vector,v2)
        // det is dot(v1,perpVector)
        
    var perpVector=new wsPoint(((vector.y*v2.z)-(vector.z*v2.y)),((vector.z*v2.x)-(vector.x*v2.z)),((vector.x*v2.y)-(vector.y*v2.x)));
    var det=(v1.x*perpVector.x)+(v1.y*perpVector.y)+(v1.z*perpVector.z);

		// is line on the same plane as triangle?
		
	if ((det>-0.00001) && (det<0.00001)) return(false);

		// get the inverse determinate

	var invDet=1.0/det;

		// calculate triangle U and test
        // lineToTrigPointVector is vector from vertex to triangle point 0
        // u is invDet * dot(lineToTrigPointVector,perpVector)
        
    var lineToTrigPointVector=new wsPoint((v.x-trigPt0.x),(v.y-trigPt0.y),(v.z-trigPt0.z));
    var u=invDet*((lineToTrigPointVector.x*perpVector.x)+(lineToTrigPointVector.y*perpVector.y)+(lineToTrigPointVector.z*perpVector.z));
	if ((u<0.0) || (u>1.0)) return(false);
	
		// calculate triangle V and test
        // lineToTrigPerpVector is cross(lineToTrigPointVector,v1)
        // v is invDet * dot(vector,lineToTrigPerpVector)
        
    var lineToTrigPerpVector=new wsPoint(((lineToTrigPointVector.y*v1.z)-(lineToTrigPointVector.z*v1.y)),((lineToTrigPointVector.z*v1.x)-(lineToTrigPointVector.x*v1.z)),((lineToTrigPointVector.x*v1.y)-(lineToTrigPointVector.y*v1.x)));
    var v=invDet*((vector.x*lineToTrigPerpVector.x)+(vector.y*lineToTrigPerpVector.y)+(vector.z*lineToTrigPerpVector.z));
	if ((v<0.0) || ((u+v)>1.0)) return(false);
	
		// t is the point on the line, from the
        // invDet*dot(v2,lineToTrigPerpVector)
		
		// this is a little different then normal ray trace
		// hits, we add in an extra 0.01f slop so polygons that are
		// touching each other don't have edges grayed in

    var t=invDet*((v2.x*lineToTrigPerpVector.x)+(v2.y*lineToTrigPerpVector.y)+(v2.z*lineToTrigPerpVector.z));
	return(t>0.01);
};

/*
 
float light_map_ray_trace_triangle(d3pnt *spt,d3vct *vct,int *x,int *y,int *z)
{
	float				det,invDet,t,u,v;
	d3vct				perpVector,lineToTrigPointVector,lineToTrigPerpVector,v1,v2;
	
		// get triangle vectors
		
	ray_trace_create_vector_from_points(&v1,x[1],y[1],z[1],x[0],y[0],z[0]);
	ray_trace_create_vector_from_points(&v2,x[2],y[2],z[2],x[0],y[0],z[0]);
	
		// calculate the determinate

	ray_trace_vector_cross_product(&perpVector,vct,&v2);
	det=ray_trace_vector_inner_product(&v1,&perpVector);
	
		// is line on the same plane as triangle?
		
	if ((det>-0.00001f) && (det<0.00001f)) return(-1.0f);

		// get the inverse determinate

	invDet=1.0f/det;

		// calculate triangle U and test
	
	ray_trace_create_vector_from_points(&lineToTrigPointVector,spt->x,spt->y,spt->z,x[0],y[0],z[0]);
	u=invDet*ray_trace_vector_inner_product(&lineToTrigPointVector,&perpVector);
	if ((u<0.0f) || (u>1.0f)) return(-1.0f);
	
		// calculate triangle V and test

	ray_trace_vector_cross_product(&lineToTrigPerpVector,&lineToTrigPointVector,&v1);
	v=invDet*ray_trace_vector_inner_product(vct,&lineToTrigPerpVector);
	if ((v<0.0f) || ((u+v)>1.0f)) return(-1.0f);
	
		// get line T for point(t) =  start_point + (vector*t)
		// -t are on the negative vector behind the point, so ignore
		
		// this is a little different then normal ray trace
		// hits, we add in an extra 0.01f slop so polygons that are
		// touching each other don't have edges grayed in

	t=invDet*ray_trace_vector_inner_product(&v2,&lineToTrigPerpVector);
	if (t<=0.01f) return(-1.0f);
	
		// a hit!
		
	return(t);
}

 */


genLightmap.rayTraceVertex=function(map,meshIdx,trigIdx,v)
{
    var n,nLight,trigCount;
    var light;
    var k,p,hit,mesh,nMesh,tIdx;
    var trigPointCache;
    var lightVector;
    var lightBoundX,lightBoundY,lightBoundZ;
    var dist,att;
    var col=new wsColor(0.0,0.0,0.0);
    
    nMesh=map.meshes.length;
    nLight=map.lights.length;
    
    for (n=0;n!==nLight;n++) {
        light=map.lights[n];
        
            // light within light range?
            
        dist=light.distance(v);
        if (dist>light.intensity) continue;
        
            // light vector
            
        lightVector=new wsPoint((light.position.x-v.x),(light.position.y-v.y),(light.position.z-v.z));
        lightBoundX=new wsBound(v.x,light.position.x);
        lightBoundY=new wsBound(v.y,light.position.y);
        lightBoundZ=new wsBound(v.z,light.position.z);
        
            // any hits?
           
        hit=false;
        
        for (k=0;k!==nMesh;k++) {
            mesh=map.meshes[k];
            if (!mesh.boxBoundCollision(lightBoundX,lightBoundY,lightBoundZ)) continue;
            
            tIdx=0;
            trigCount=mesh.trigCount;
            trigPointCache=mesh.trigPointCache;
            
            for (p=0;p!==trigCount;p++) {
                
                if ((k===meshIdx) && (p===trigIdx)) {
                    tIdx+=3;
                    continue;
                }
                
                //if (genLightmap.rayTraceCollision(v,lightVector,trigPointCache[tIdx],trigPointCache[tIdx+1],trigPointCache[tIdx+2])) {
                //    hit=true;
                //    break;
                //}
                
                tIdx+=3;
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
// render a triangle
//

genLightmap.renderTriangle=function(map,meshIdx,trigIdx,ctx,pts,vs,lft,top,rgt,bot)
{
    var x,y,lx,rx,tempX,ty,by,idx;
    var lxFactor,rxFactor,vFactor;
    var v=new wsPoint(0,0,0);
    var vlx=new wsPoint(0,0,0);
    var vrx=new wsPoint(0,0,0);
    var col;
    
    var wid=rgt-lft;
    var high=bot-top;
    
    if ((wid<=0) || (high<=0)) return;
    
        // get the image data to render to
        
    var imgData=ctx.getImageData(lft,top,wid,high);
    var data=imgData.data;
    
        // find the top and bottom points
        
    var topPtIdx=0;
    if (pts[1].y<pts[topPtIdx].y) topPtIdx=1;
    if (pts[2].y<pts[topPtIdx].y) topPtIdx=2;
   
    var botPtIdx=0;
    if (pts[1].y>pts[botPtIdx].y) botPtIdx=1;
    if (pts[2].y>pts[botPtIdx].y) botPtIdx=2;
    
        // find the current lines to
        // scan against
    
    var l1StartPtIdx=topPtIdx;
    var l1EndPtIdx=topPtIdx-1;
    if (l1EndPtIdx===-1) l1EndPtIdx=2;
    
    var l2StartPtIdx=topPtIdx;
    var l2EndPtIdx=topPtIdx+1;
    if (l2EndPtIdx===3) l2EndPtIdx=0;
    
        // render the triangle by scan
        // lines from top to bottom
    
    ty=pts[topPtIdx].y;
    by=pts[botPtIdx].y;
    if (ty>=by) return;

    for (y=ty;y!==by;y++) {
        
            // time to switch lines?
        
        if (y>=pts[l1EndPtIdx].y) {
            l1StartPtIdx=l1EndPtIdx;
            l1EndPtIdx--;
            if (l1EndPtIdx===-1) l1EndPtIdx=2;
        }
        
        if (y>=pts[l2EndPtIdx].y) {
            l2StartPtIdx=l2EndPtIdx;
            l2EndPtIdx++;
            if (l2EndPtIdx===3) l2EndPtIdx=0;
        }
        
            // get the left right
        
        lxFactor=(y-pts[l1StartPtIdx].y)/(pts[l1EndPtIdx].y-pts[l1StartPtIdx].y);
        lx=pts[l1StartPtIdx].x+Math.floor((pts[l1EndPtIdx].x-pts[l1StartPtIdx].x)*lxFactor);
        
        rxFactor=(y-pts[l2StartPtIdx].y)/(pts[l2EndPtIdx].y-pts[l2StartPtIdx].y);
        rx=pts[l2StartPtIdx].x+Math.floor((pts[l2EndPtIdx].x-pts[l2StartPtIdx].x)*rxFactor);
        
            // get the vertex left and right
            
        vlx.x=vs[l1StartPtIdx].x+((vs[l1EndPtIdx].x-vs[l1StartPtIdx].x)*lxFactor);
        vlx.y=vs[l1StartPtIdx].y+((vs[l1EndPtIdx].y-vs[l1StartPtIdx].y)*lxFactor);
        vlx.z=vs[l1StartPtIdx].z+((vs[l1EndPtIdx].z-vs[l1StartPtIdx].z)*lxFactor);
        
        vrx.x=vs[l2StartPtIdx].x+((vs[l2EndPtIdx].x-vs[l2StartPtIdx].x)*rxFactor);
        vrx.y=vs[l2StartPtIdx].y+((vs[l2EndPtIdx].y-vs[l2StartPtIdx].y)*rxFactor);
        vrx.z=vs[l2StartPtIdx].z+((vs[l2EndPtIdx].z-vs[l2StartPtIdx].z)*rxFactor);
        
            // sometimes we need to swap
            // left and right
            
        if (lx>rx) {
            tempX=lx;
            lx=rx;
            rx=tempX;
            
            tempX=vlx;
            vlx=vrx;
            vrx=tempX;
        }
        
            // get the bitmap data index
            
        idx=((y*wid)+lx)*4;
        
            // render the scan line
            
        for (x=lx;x!==rx;x++) {
            
                // get the ray trace vetex
            
            vFactor=(x-lx)/(rx-lx);
            v.x=vlx.x+((vrx.x-vlx.x)*vFactor);
            v.y=vlx.y+((vrx.y-vlx.y)*vFactor);
            v.z=vlx.z+((vrx.z-vlx.z)*vFactor);
            
                // write the pixel
                
            col=genLightmap.rayTraceVertex(map,meshIdx,trigIdx,v);
            data[idx++]=Math.floor(col.r*255.0);
            data[idx++]=Math.floor(col.g*255.0);
            data[idx++]=Math.floor(col.b*255.0);
            data[idx++]=255;
        }
    }

        // replace image data
        
    ctx.putImageData(imgData,lft,top);
};

//
// build light map in chunk
//

genLightmap.writePolyToChunk=function(map,meshIdx,trigIdx,lightmapIdx,ctx,chunkSize,lft,top,lightmapUVs)
{
    var mesh=map.meshes[meshIdx];
    var vIdx,uvIdx;
    var pt0,pt1,pt2;
    
        // get the vertexes for the triangle
        
    vIdx=mesh.indexes[trigIdx*3]*3;
    var v0=new wsPoint(mesh.vertices[vIdx],mesh.vertices[vIdx+1],mesh.vertices[vIdx+2]);

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
        
    var renderSize=chunkSize-(genLightmap.RENDER_MARGIN*2);

    var sz=xBound.max-xBound.min;
    var xFactor=(sz===0)?0:renderSize/sz;
    
    var sz=yBound.max-yBound.min;
    var yFactor=(sz===0)?0:renderSize/sz;
    
    var sz=zBound.max-zBound.min;
    var zFactor=(sz===0)?0:renderSize/sz;
    
    var renderLft=lft+genLightmap.RENDER_MARGIN;
    var renderTop=top+genLightmap.RENDER_MARGIN;
    var renderRgt=lft+renderSize;
    var renderBot=top+renderSize;

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
    
        // ray trace the triangle
       
    genLightmap.renderTriangle(map,meshIdx,trigIdx,ctx,[pt0,pt1,pt2],[v0,v1,v2],renderLft,renderTop,renderRgt,renderBot);

        // add the UV

    uvIdx=mesh.indexes[trigIdx*3]*2;
    lightmapUVs[uvIdx]=(pt0.x+renderLft)/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt0.y+renderTop)/genLightmap.TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+1]*2;
    lightmapUVs[uvIdx]=(pt1.x+renderLft)/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt1.y+renderTop)/genLightmap.TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+2]*2;
    lightmapUVs[uvIdx]=(pt2.x+renderLft)/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=(pt2.y+renderTop)/genLightmap.TEXTURE_SIZE;
};
    
//
// create lightmap
//

genLightmap.createLightmapForMesh=function(map,meshIdx,chunkCount,chunkSize,lightmapList,callbackFunc)
{
    var n,lightmapIdx,chunkIdx,nTrig;
    var lft,top;
    var mesh,ctx;
    var lightmapUVs;
    
    wsNextStatusBar();
    
    mesh=map.meshes[meshIdx];
    nTrig=mesh.trigCount;

        // find a lightmap to put mesh into

    lightmapIdx=-1;

    for (n=0;n!==lightmapList.length;n++) {

            // check to see if we can fit

        if ((genLightmap.TRIG_PER_TEXTURE-lightmapList[n].chunkIdx)>nTrig) {
            lightmapIdx=n;
            break;
        }
    }

        // if we didn't find a lightmap, make a new one

    if (lightmapIdx===-1) {
        lightmapIdx=lightmapList.length;
        lightmapList[lightmapIdx]=new genLightmapBitmapObject(genLightmap.startBitmap());
    }

        // UVs for this mesh

    lightmapUVs=new Float32Array(mesh.vertexCount*2);

        // write polys to chunk

    chunkIdx=lightmapList[lightmapIdx].chunkIdx;
    ctx=lightmapList[lightmapIdx].canvas.getContext('2d');

    for (n=0;n!==nTrig;n++) {

        lft=(chunkIdx%chunkCount)*chunkSize;
        top=Math.floor(chunkIdx/chunkCount)*chunkSize;

        genLightmap.writePolyToChunk(map,meshIdx,n,lightmapIdx,ctx,chunkSize,lft,top,lightmapUVs);

        chunkIdx++;
    }

    lightmapList[lightmapIdx].chunkIdx=chunkIdx;

        // set the lightmap UVs in the mesh

    mesh.setLightmapUVs(lightmapIdx,lightmapUVs);
    
        // move on to next mesh
        // if out of mesh, finish up creation
        // by saving the light maps
        
    meshIdx++;
    if (meshIdx>=map.meshes.length) {
        setTimeout(function() { genLightmap.createFinish(lightmapList,callbackFunc); },genLightmap.IMEOUT_MSEC);
        return;
    }
    
        // next mesh
    
    setTimeout(function() { genLightmap.createLightmapForMesh(map,meshIdx,chunkCount,chunkSize,lightmapList,callbackFunc); },genLightmap.IMEOUT_MSEC);
};

//
// create lightmap
// creation has to be done by a timer because this
// is too slow and browsers will bounce the script
//

genLightmap.create=function(map,callbackFunc)
{
    var n,nMesh;
    
    wsStartStatusBar(map.meshes.length+2);

        // chunks are one part of the
        // lightmap used to store one triangle
        
    var chunkCount=Math.floor(Math.sqrt(genLightmap.TRIG_PER_TEXTURE));
    var chunkSize=Math.floor(genLightmap.TEXTURE_SIZE/chunkCount);
    
        // array of bitmaps that make up the lightmap
        // each is an object with a canvas and the last chunk
        // drawn to (the chunkIdx)
        
    var lightmapList=[];
    
        // run through the meshes and build
        // point lists for all of them to speed up
        // triangle collisions
    
    nMesh=map.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        map.meshes[n].buildTrigPointCache();
    }
    
    wsNextStatusBar();
    
        // run through the meshes
        // by a timer so we don't trigger the
        // script time out problem
        
    setTimeout(function() { genLightmap.createLightmapForMesh(map,0,chunkCount,chunkSize,lightmapList,callbackFunc); },genLightmap.IMEOUT_MSEC);
};
    
genLightmap.createFinish=function(lightmapList,callbackFunc)
{
    var n;
    
        // load all the bitmaps into
        // webgl
        
    for (n=0;n!==lightmapList.length;n++) {
        genLightmap.finishBitmap(n,lightmapList[n].canvas);
    }
    
    wsNextStatusBar();
    
        // finish with the callback
        
    callbackFunc();
};
