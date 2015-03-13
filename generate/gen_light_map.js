"use strict";

//
// generate light map object
//

var genLightmap={};

//
// constants
//

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
    bitmapCanvas.width=this.TEXTURE_SIZE;
    bitmapCanvas.height=this.TEXTURE_SIZE;
    var bitmapCTX=bitmapCanvas.getContext('2d');
    
        // clear to black
    
    genBitmapUtility.drawRect(bitmapCTX,0,0,bitmapCanvas.width,bitmapCanvas.height,'000000');
    
    return(bitmapCanvas);
};

genLightmap.finishBitmap=function(lightmapIdx,bitmapCanvas)
{
        // load the bitmap into webGL

    lightmap.load(lightmapIdx,bitmapCanvas);
    
        // debugging code
   
    if (lightmapIdx<6) {
        var x=810+((lightmapIdx%3)*205);
        var y=100+(Math.floor(lightmapIdx/3)*205);
        debug.displayCanvasData(bitmapCanvas,x,y,200,200);
    }
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
    var n,nLight;
    var light;
    
    nLight=map.lights.length;
    
    for (n=0;n!==nLight;n++) {
        light=map.lights[n];
        if (!light.withinLightRadius(v)) continue;  //supergumba--do by intensity here and exponent
        
        return(true);
    }
    
    
    
    return(false);
};


//
// get 3D vertexes for triangle to render
// 
// this routine determines the hypotenuse and gets
// the central vertex with will form the two legs
// that the vertexes to ray trace from will be calculated
//

genLightmap.getVertexesForTriangle=function(map,meshIdx,trigIdx,wallLike)
{
    var v0Idx,v1Idx,v2Idx;
    var mesh=map.meshes[meshIdx];
    
        // get the points
        
    v0Idx=mesh.indexes[trigIdx*3]*3;
    var v0=new wsPoint(mesh.vertices[v0Idx],mesh.vertices[v0Idx+1],mesh.vertices[v0Idx+2]);

    v1Idx=mesh.indexes[(trigIdx*3)+1]*3;
    var v1=new wsPoint(mesh.vertices[v1Idx],mesh.vertices[v1Idx+1],mesh.vertices[v1Idx+2]);

    v2Idx=mesh.indexes[(trigIdx*3)+2]*3;
    var v2=new wsPoint(mesh.vertices[v2Idx],mesh.vertices[v2Idx+1],mesh.vertices[v2Idx+2]);
    
        // find the vertex opposite the hypotenuse
        // we use this to form the two legs that will
        // be used to build the points to ray trace from
        // since the 2D version traces down the two legs
        // of a right triangle
        
        // the return is
        // 1st element = opposite vertex
        // 2nd element = vertex changing on the 2D Y during render
        // 3rd element = vertex changing on the 2D X during render
    
    var v0v1dist=v0.noSquareDistance(v1);
    var v0v2dist=v0.noSquareDistance(v2);
    var v1v2dist=v1.noSquareDistance(v2);
    
    if ((v1v2dist>v0v1dist) && (v1v2dist>v0v2dist)) {
        
            // v0 is opposite
            
        if (wallLike) {
            if (Math.abs(v0.y-v1.y)>Math.abs(v0.y-v2.y)) return([v0,v1,v2]);
            return([v0,v2,v1]);
        }
        if (Math.abs(v0.z-v1.z)>Math.abs(v0.z-v2.z)) return([v0,v1,v2]);
        return([v0,v2,v1]);
    }
    else {
        
            // v1 is opposite
            
        if ((v0v2dist>v0v1dist) && (v0v2dist>v1v2dist)) {
            if (wallLike) {
                if (Math.abs(v1.y-v0.y)>Math.abs(v1.y-v2.y)) return([v1,v0,v2]);
                return([v1,v2,v0]);
            }
            if (Math.abs(v1.z-v0.z)>Math.abs(v1.z-v2.z)) return([v1,v0,v2]);
            return([v1,v2,v0]);
        }
        
            // v2 is opposite
            
        else {
            if (wallLike) {
                if (Math.abs(v2.y-v0.y)>Math.abs(v2.y-v1.y)) return([v2,v0,v1]);
                return([v2,v1,v0]);
            }
            if (Math.abs(v2.z-v0.z)>Math.abs(v2.z-v1.z)) return([v2,v0,v1]);
            return([v2,v1,v0]);
        }
    }
};

//
// render a triangle
//

genLightmap.renderTopTriangle=function(map,meshIdx,trigIdx,bitmapCTX,lft,top,rgt,bot,wallLike,trigPt0,trigPt1,trigPt2)
{
    var x,y,lx,idx;
    var v=new wsPoint(0,0,0);
    
    var wid=rgt-lft;
    var high=bot-top;
    
        // get the image data to render to
        
    var imgData=bitmapCTX.getImageData(lft,top,wid,high);
    var data=imgData.data;
    
        // render the triangle
    
    for (y=0;y!==high;y++) {
        
            // get vertical line and
            // bitmap index
            
        lx=Math.floor(wid*((y+1)/high));
        idx=((y*wid)+lx)*4;
        
            // one direction for ray trace
            // vertex
            
        if (wallLike) {
            v.y=trigPt0.y+((trigPt1.y-trigPt0.y)*((y+1)/high));
        }
        else {
            v.y=trigPt0.y;
            v.z=trigPt0.z+((trigPt1.z-trigPt0.z)*((y+1)/high));
        }
        
            // render the lines
            
        for (x=lx;x<wid;x++) {
            
                // get the other direction
                
            if (wallLike) {
                v.x=trigPt0.x+((trigPt2.x-trigPt0.x)*((x+1)/wid));
                v.z=trigPt0.z+((trigPt2.z-trigPt0.z)*((x+1)/wid));
            }
            else {
                v.x=trigPt0.x+((trigPt2.x-trigPt0.x)*((x+1)/wid));
            }
            
                // write the pixel
            
            if (this.rayTraceVertex(map,meshIdx,trigIdx,v)) {
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
            }
            else {
                data[idx++]=0;
                data[idx++]=0;
                data[idx++]=0;
                data[idx++]=255;
            }
        }
    }
    
        // replace image data
        
    bitmapCTX.putImageData(imgData,lft,top);
};

genLightmap.renderBottomTriangle=function(map,meshIdx,trigIdx,bitmapCTX,lft,top,rgt,bot,wallLike,trigPt0,trigPt1,trigPt2)
{
    var x,y,rx,idx;
    var v=new wsPoint(0,0,0);
    
    var wid=rgt-lft;
    var high=bot-top;
    
        // get the image data to render to
        
    var imgData=bitmapCTX.getImageData(lft,top,wid,high);
    var data=imgData.data;
    
        // render the triangle
    
    for (y=0;y!==high;y++) {
        
            // get vertical line and
            // bitmap index
            
        rx=Math.floor(wid*(y/high));
        idx=(y*wid)*4;
        
            // one direction for ray trace
            // vertex
            
        if (wallLike) {
            v.y=trigPt0.y+((trigPt1.y-trigPt0.y)*((y+1)/high));
        }
        else {
            v.y=trigPt0.y;
            v.z=trigPt0.z+((trigPt1.z-trigPt0.z)*((y+1)/high));
        }
        
        for (x=0;x<rx;x++) {
            
                // get the other direction
                
            if (wallLike) {
                v.x=trigPt0.x+((trigPt2.x-trigPt0.x)*((x+1)/wid));
                v.z=trigPt0.z+((trigPt2.z-trigPt0.z)*((x+1)/wid));
            }
            else {
                v.x=trigPt0.x+((trigPt2.x-trigPt0.x)*((x+1)/wid));
            }
            
                // write the pixel
            
            if (this.rayTraceVertex(map,meshIdx,trigIdx,v)) {
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
                data[idx++]=255;
            }
            else {
                data[idx++]=0;
                data[idx++]=0;
                data[idx++]=0;
                data[idx++]=255;
            }
        }
    }
    
        // replace image data
        
    bitmapCTX.putImageData(imgData,lft,top);
};

//
// build light map in chunk
//

genLightmap.writePolyToChunk=function(map,meshIdx,trigIdx,lightmapIdx,ctx,lft,top,rgt,bot,lightmapUVs)
{
    var n;
    var mesh=map.meshes[meshIdx];
    
        // size
        
    var chunkWid=rgt-lft;
    var chunkHigh=bot-top;
  /*  
        // find out how many squares we need
        // to render each trig
        
    var trigCount=mesh.trigCount;
        
    var squareCount=Math.floor(trigCount/2);
    if ((trigCount%2)!==0) squareCount++;
    var squareXCount=Math.floor(Math.sqrt(mesh.trigCount));
    var squareYCount=Math.floor(Math.sqrt(mesh.trigCount));
    while ((squareXCount*squareYCount)<squareCount) {
        squareXCount++;
        squareYCount++;
    }
    var squareWid=Math.floor(chunkWid/squareXCount);
    var squareHigh=Math.floor(chunkHigh/squareYCount);
    
        // light map packed UV array
        
    var lightmapUVs=new Float32Array(mesh.vertexCount*2);
    
        // render the triangles
    
    var uvIdx,squareIdx,topTrig,wallLike;
    var marginLft,marginTop,marginRgt,marginBot;
    var IndexIdx,v0Idx,v1Idx,v2Idx;
    var uvLft,uvTop,uvRgt,uvBot;
    var vertexList;
    
    for (n=0;n!==trigCount;n++) {
        
        
        

        
        
        
        // vertex indexes

    IndexIdx=n*3;
    v0Idx=mesh.indexes[IndexIdx];
    v1Idx=mesh.indexes[IndexIdx+1];
    v2Idx=mesh.indexes[IndexIdx+2];
    */
   
   
   
   
   
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

    var wallLike=(Math.abs(mesh.normals[(vIdx*3)+1])<=0.3);
    
        // get the bounds of the 3D point
        
    var xBound=new wsBound(v0.x,v1.x);
    xBound.adjust(v1.x);
    xBound.adjust(v2.x);
    
    var yBound=new wsBound(v0.y,v1.y);
    yBound.adjust(v1.y);
    yBound.adjust(v2.y);
    
    var zBound=new wsBound(v0.z,v1.z);
    zBound.adjust(v1.z);
    zBound.adjust(v2.z);
    
        // 2D reduction factors

    var xFactor=chunkWid/(xBound.max-xBound.min);
    var yFactor=chunkWid/(yBound.max-yBound.min);
    var zFactor=chunkWid/(zBound.max-zBound.min);

        // now create the 2D version of it
        
    if (wallLike) {
        if (xBound.getSize()>zBound.getSize()) {
            pt0=new ws2DPoint((lft+((v0.x-xBound.min)*xFactor)),(top+((v0.y-yBound.min)*yFactor)));
            pt1=new ws2DPoint((lft+((v1.x-xBound.min)*xFactor)),(top+((v1.y-yBound.min)*yFactor)));
            pt2=new ws2DPoint((lft+((v2.x-xBound.min)*xFactor)),(top+((v2.y-yBound.min)*yFactor)));
        }
        else {
            pt0=new ws2DPoint((lft+((v0.z-zBound.min)*zFactor)),(top+((v0.y-yBound.min)*yFactor)));
            pt1=new ws2DPoint((lft+((v1.z-zBound.min)*zFactor)),(top+((v1.y-yBound.min)*yFactor)));
            pt2=new ws2DPoint((lft+((v2.z-zBound.min)*zFactor)),(top+((v2.y-yBound.min)*yFactor)));
        }
    }
    else {
        pt0=new ws2DPoint((lft+((v0.x-xBound.min)*xFactor)),(top+((v0.z-zBound.min)*zFactor)));
        pt1=new ws2DPoint((lft+((v1.x-xBound.min)*xFactor)),(top+((v1.z-zBound.min)*zFactor)));
        pt2=new ws2DPoint((lft+((v2.x-xBound.min)*xFactor)),(top+((v2.z-zBound.min)*zFactor)));
    }
        
        // ray trace the triangle
       
//    this.renderTriangle(map,meshIdx,trigIdx,ctx,(lft+this.RENDER_MARGIN),(top+this.RENDER_MARGIN),(rgt-this.RENDER_MARGIN),(bot-this.RENDER_MARGIN));

        // add the UV

    uvIdx=mesh.indexes[trigIdx*3]*2;
    lightmapUVs[uvIdx]=pt0.x/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=pt0.y/genLightmap.TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+1]*3;
    lightmapUVs[uvIdx]=pt1.x/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=pt1.y/genLightmap.TEXTURE_SIZE;
    
    uvIdx=mesh.indexes[(trigIdx*3)+2]*3;
    lightmapUVs[uvIdx]=pt2.x/genLightmap.TEXTURE_SIZE;
    lightmapUVs[uvIdx+1]=pt2.y/genLightmap.TEXTURE_SIZE;
};
    
//
// create lightmap
//

genLightmap.create=function(map)
{
    var n,k,nMesh,nTrig,lightmapIdx,chunkIdx;
    var lft,top;
    var mesh,bitmapCanvas,bitmapCTX;
    var lightmapUVs;
    
        // chunks are one part of the
        // lightmap used to store one triangle
        
    var chunkXCount=Math.floor(Math.sqrt(genLightmap.TRIG_PER_TEXTURE));
    var meshChunkWid=Math.floor(genLightmap.TEXTURE_SIZE/chunkXCount);
    var chunkYCount=Math.floor(Math.sqrt(genLightmap.TRIG_PER_TEXTURE));
    var meshChunkHigh=Math.floor(genLightmap.TEXTURE_SIZE/chunkYCount);
    
        // first light map
        
    lightmapIdx=0;
    
    bitmapCanvas=genLightmap.startBitmap();
    bitmapCTX=bitmapCanvas.getContext('2d');
    
    chunkIdx=0;
    
        // run through the meshes and trigs
        
    nMesh=map.meshes.length;
        
    for (n=0;n!==nMesh;n++) {
        
        mesh=map.meshes[n];
        nTrig=mesh.trigCount;
        
            // UVs for this mesh
            
        var lightmapUVs=new Float32Array(mesh.vertexCount*2);
        
            // can this meshes trigs fit into
            // this chunk?  if not, time for new
            // texture
            
        if ((chunkIdx+nTrig)>genLightmap.TRIG_PER_TEXTURE) {
            
            if (bitmapCanvas!==null) {
                genLightmap.finishBitmap(lightmapIdx,bitmapCanvas);
                lightmapIdx++;
            }
                
            bitmapCanvas=genLightmap.startBitmap();
            bitmapCTX=bitmapCanvas.getContext('2d');
            chunkIdx=0;
        }
        
            // write polys to chunk
            
        for (k=0;k!==nTrig;k++) {
        
            lft=(chunkIdx%chunkXCount)*meshChunkWid;
            top=Math.floor(chunkIdx/chunkYCount)*meshChunkHigh;

            genLightmap.writePolyToChunk(map,n,k,lightmapIdx,bitmapCTX,lft,top,(lft+meshChunkWid),(top+meshChunkHigh),lightmapUVs);
        
            chunkIdx++;
        }
        
            // set the lightmap UVs in the mesh
            
        mesh.setLightmapUVs(lightmapIdx,lightmapUVs);
    }
    
        // save any current bitmap
        
    if (bitmapCanvas!==null) genLightmap.finishBitmap(lightmapIdx,bitmapCanvas);
};
