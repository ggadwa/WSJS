"use strict";

//
// generate light map object
//

var genLightmap={};

//
// constants
//

genLightmap.TEXTURE_SIZE=512;
genLightmap.MESH_PER_TEXTURE=16;            // must be square
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

genLightmap.writeMeshToChunk=function(map,meshIdx,lightmapIdx,bitmapCanvas,lft,top,rgt,bot)
{
    var n;
    var mesh=map.meshes[meshIdx];
    var bitmapCTX=bitmapCanvas.getContext('2d');
    
        // size
        
    var chunkWid=rgt-lft;
    var chunkHigh=bot-top;
    
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
        
            // look at the normal to determine if it's
            // wall or floor like
        
        wallLike=(Math.abs(mesh.normals[(v0Idx*3)+1])<=0.3);
        
            // get the triangle 3D bounds
            
        vertexList=this.getVertexesForTriangle(map,meshIdx,n,wallLike);
        
            // get square
            
        squareIdx=Math.floor(n/2);
        topTrig=((n&0x1)===0);
        
        marginLft=(lft+((squareIdx%squareXCount)*squareWid))+this.RENDER_MARGIN;
        marginRgt=(marginLft+squareWid)-(this.RENDER_MARGIN*2);
        
        marginTop=(top+(Math.floor(squareIdx/squareYCount)*squareHigh))+this.RENDER_MARGIN;
        marginBot=(marginTop+squareHigh)-(this.RENDER_MARGIN*2);
        
            // draw the triangle
            
        if (topTrig) {
            this.renderTopTriangle(map,meshIdx,n,bitmapCTX,marginLft,marginTop,marginRgt,marginBot,wallLike,vertexList[0],vertexList[1],vertexList[2]);
        }
        else {
            this.renderBottomTriangle(map,meshIdx,n,bitmapCTX,marginLft,marginTop,marginRgt,marginBot,wallLike,vertexList[0],vertexList[1],vertexList[2]);
        }
        
            // add the UV
            
        uvLft=marginLft/genLightmap.TEXTURE_SIZE;
        uvRgt=marginRgt/genLightmap.TEXTURE_SIZE;
        uvTop=marginTop/genLightmap.TEXTURE_SIZE;
        uvBot=marginBot/genLightmap.TEXTURE_SIZE;
        
        if (topTrig) {
            uvIdx=v0Idx*2;
            lightmapUVs[uvIdx]=uvLft;
            lightmapUVs[uvIdx+1]=uvTop;
            uvIdx=v1Idx*2;
            lightmapUVs[uvIdx]=uvRgt;
            lightmapUVs[uvIdx+1]=uvTop;
            uvIdx=v2Idx*2;
            lightmapUVs[uvIdx]=uvRgt;
            lightmapUVs[uvIdx+1]=uvBot;
        }
        else {
            uvIdx=v0Idx*2;
            lightmapUVs[uvIdx]=uvLft;
            lightmapUVs[uvIdx+1]=uvTop;
            uvIdx=v1Idx*2;
            lightmapUVs[uvIdx]=uvRgt;
            lightmapUVs[uvIdx+1]=uvBot;
            uvIdx=v2Idx*2;
            lightmapUVs[uvIdx]=uvLft;
            lightmapUVs[uvIdx+1]=uvBot;
        }
    }
    
        // finally set the UVs in the mesh
        
    mesh.setLightmapUVs(lightmapIdx,lightmapUVs);
};
    
//
// create lightmap
//

genLightmap.create=function(map)
{
    var n,nMesh,lightmapIdx,chunkIdx;
    var lft,top;
    var bitmapCanvas;
    
        // chunks are one part of the
        // lightmap used to store one meshes
        // triangles
        
    var chunkXCount=Math.floor(Math.sqrt(genLightmap.MESH_PER_TEXTURE));
    var meshChunkWid=Math.floor(genLightmap.TEXTURE_SIZE/chunkXCount);
    var chunkYCount=Math.floor(Math.sqrt(genLightmap.MESH_PER_TEXTURE));
    var meshChunkHigh=Math.floor(genLightmap.TEXTURE_SIZE/chunkYCount);
    
    lightmapIdx=0;
    chunkIdx=genLightmap.MESH_PER_TEXTURE;
    bitmapCanvas=null;
    nMesh=map.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        
            // time for a new chunk?
            // if so, finish old one and start new one
            
        if (chunkIdx===genLightmap.MESH_PER_TEXTURE) {
            
            if (bitmapCanvas!==null) {
                genLightmap.finishBitmap(lightmapIdx,bitmapCanvas);
                lightmapIdx++;
            }
                
            bitmapCanvas=genLightmap.startBitmap();
            chunkIdx=0;
        }
        
            // write mesh to chunk
        
        lft=(chunkIdx%chunkXCount)*meshChunkWid;
        top=Math.floor(chunkIdx/chunkYCount)*meshChunkHigh;

        genLightmap.writeMeshToChunk(map,n,lightmapIdx,bitmapCanvas,lft,top,(lft+meshChunkWid),(top+meshChunkHigh));
        
            // next chunk
            
        chunkIdx++;
    }
    
        // save any current bitmap
        
    if (bitmapCanvas!==null) genLightmap.finishBitmap(lightmapIdx,bitmapCanvas);
};
