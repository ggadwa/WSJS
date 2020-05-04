import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';
import ColorClass from '../../utility/color.js';
import Matrix4Class from '../../utility/matrix4.js';
import ShadowmapBitmapClass from './shadowmap_bitmap.js';

    //
    // the worker setup
    //

self.addEventListener("message",run);

function run(message)
{
    let timestamp,returnData;
    
    timestamp=Date.now();
    returnData=(new ShadowmapGeneratorClass(message.data)).run();
    console.info('time='+(Date.now()-timestamp));
    
    self.postMessage(returnData);
}

    //
    // the main ray-tracing shadowmap generator class
    //

class ShadowmapGeneratorClass
{
    constructor(data)
    {
        this.data=data;
        
        this.debugTimestamp=0;
        
            // constants
            
        this.SHADOWMAP_TEXTURE_SIZE=2048; //2048;

        this.SHADOWMAP_CHUNK_SPLIT=16; //16;                  // how many chunks in both the X and Y direction
        this.SHADOWMAP_CHUNK_SIZE=Math.trunc(this.SHADOWMAP_TEXTURE_SIZE/this.SHADOWMAP_CHUNK_SPLIT);    // square pixel size of chunks
        this.SHADOWMAP_CHUNK_PER_TEXTURE=(this.SHADOWMAP_CHUNK_SPLIT*this.SHADOWMAP_CHUNK_SPLIT)*2;        // how many chunks in a single texture (two triangles)

        this.SHADOW_MIN_VALUE=0.3;
        
        this.RENDER_NORMAL=0;
        this.RENDER_ALL_BLACK=1;
        this.RENDER_ALL_WHITE=2;

            // array of bitmaps that make up the shadowmaps
            // each is an object with a canvas and the last chunk
            // drawn to (the chunkIdx)

        this.shadowmapIdx=0;
        this.shadowmapList=[];

            // some pre-allocates
            
        this.lightVector=new PointClass(0,0,0);
        this.lightVectorNormal=new PointClass(0,0,0);
        
        this.lightBoundX=new BoundClass(0,0);
        this.lightBoundY=new BoundClass(0,0);
        this.lightBoundZ=new BoundClass(0,0);
            
        this.v0=new PointClass(0,0,0);      // the 3D triangle in the map
        this.v1=new PointClass(0,0,0);
        this.v2=new PointClass(0,0,0);
        
        this.normal=new PointClass(0,0,0);  // a single normal to eliminate lights
        
        this.t0=new PointClass(0,0,0);      // the 2D shadow map projection
        this.t1=new PointClass(0,0,0);
        this.t2=new PointClass(0,0,0);
        
        this.mat2d=new Matrix4Class();      // these are used to create a transformation matrix from 2D render to 3D triangle
        this.mat2dInvert=new Matrix4Class();
        this.mat3d=new Matrix4Class();
        this.transformMat=new Matrix4Class();
        
        this.rayPoint=new PointClass(0,0,0);
        this.rayTraceVertexColor=new ColorClass(0,0,0);
        
        Object.seal(this);
    }
    
    getMeshTriangleVertexes(mesh,tIdx,v0,v1,v2,normal)
    {
        let vIdx;
        
        tIdx*=3;

        vIdx=mesh.indexArray[tIdx]*3;
        v0.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);
        if (normal!==null) normal.setFromValues(mesh.normalArray[vIdx],mesh.normalArray[vIdx+1],mesh.normalArray[vIdx+2]);
        
        vIdx=mesh.indexArray[tIdx+1]*3;
        v1.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);
        
        vIdx=mesh.indexArray[tIdx+2]*3;
        v2.setFromValues(mesh.vertexArray[vIdx],mesh.vertexArray[vIdx+1],mesh.vertexArray[vIdx+2]);
    }
    
        //
        // need to recreate some utility routines because
        // the clone makes objects, not the original classes
        //
        
    distance(pnt1,pnt2)
    {
        let px=pnt1.x-pnt2.x;
        let py=pnt1.y-pnt2.y;
        let pz=pnt1.z-pnt2.z;
        return(Math.sqrt((px*px)+(py*py)+(pz*pz)));
    }
    
        //
        // ray tracing
        //

    rayTraceTriangle(vrt,vct,t0,v10,v20)
    {
        let perpVectorX,perpVectorY,perpVectorZ;
        let det,invDet,u,v;
        let lineToTrigPointVectorX,lineToTrigPointVectorY,lineToTrigPointVectorZ;
        let lineToTrigPerpVectorX,lineToTrigPerpVectorY,lineToTrigPerpVectorZ;
        
            // vrt = point to ray trace
            // v10[x,y,z]=t1[x,y,z]-t0[x,y,z]
            // v20[x,y,z]=t2[x,y,z]-t0[x,y,z]
        
        //this.v10.setFromSubPoint(t1,t0);  // all this is cached, code here for reference
        //this.v20.setFromSubPoint(t2,t0);

            // calculate the determinate
            // perpVector is cross(vector,v2)
            // det is dot(v1,perpVector)

        perpVectorX=(vct.y*v20.z)-(vct.z*v20.y);
        perpVectorY=(vct.z*v20.x)-(vct.x*v20.z);
        perpVectorZ=(vct.x*v20.y)-(vct.y*v20.x);

        det=(v10.x*perpVectorX)+(v10.y*perpVectorY)+(v10.z*perpVectorZ);

            // is line on the same plane as triangle?

        if ((det>-0.00001) && (det<0.00001)) return(false);

            // get the inverse determinate

        invDet=1.0/det;

            // calculate triangle U and test
            // lineToTrigPointVector is vector from vertex to triangle point 0
            // u is invDet * dot(lineToTrigPointVector,perpVector)

        lineToTrigPointVectorX=vrt.x-t0.x;
        lineToTrigPointVectorY=vrt.y-t0.y;
        lineToTrigPointVectorZ=vrt.z-t0.z;

        u=invDet*((lineToTrigPointVectorX*perpVectorX)+(lineToTrigPointVectorY*perpVectorY)+(lineToTrigPointVectorZ*perpVectorZ));
        if ((u<0.0) || (u>1.0)) return(false);

            // calculate triangle V and test
            // lineToTrigPerpVector is cross(lineToTrigPointVector,v1)
            // v is invDet * dot(vector,lineToTrigPerpVector)

        lineToTrigPerpVectorX=(lineToTrigPointVectorY*v10.z)-(lineToTrigPointVectorZ*v10.y);
        lineToTrigPerpVectorY=(lineToTrigPointVectorZ*v10.x)-(lineToTrigPointVectorX*v10.z);
        lineToTrigPerpVectorZ=(lineToTrigPointVectorX*v10.y)-(lineToTrigPointVectorY*v10.x);

        v=invDet*((vct.x*lineToTrigPerpVectorX)+(vct.y*lineToTrigPerpVectorY)+(vct.z*lineToTrigPerpVectorZ));
        if ((v<0.0) || ((u+v)>1.0)) return(false);

            // t is the point on the line, from the
            // invDet*dot(v2,lineToTrigPerpVector)

            // this is a little different then normal ray trace
            // hits, we add in an extra 0.01 slop so polygons that are
            // touching each other don't have edges grayed in

        let t=invDet*((v20.x*lineToTrigPerpVectorX)+(v20.y*lineToTrigPerpVectorY)+(v20.z*lineToTrigPerpVectorZ));
        return((t>0.05)&&(t<1.0));
    }

    rayTraceMap(meshIdx,trigIdx,lightList,vrt)
    {
        let n,nLight,trigCount;
        let light;
        let k,p,hit,mesh,nMesh;
        let dist;
        
            // we use the passed in light list which is a cut down
            // list precalculcated from mesh/light interactions and
            // removing any lights that are facing away from the
            // front side of the triangle

        nLight=lightList.length;

        for (n=0;n!==nLight;n++) {
            light=lightList[n];

                // light within light range?

            dist=this.distance(light.position,vrt);
            if (dist>light.intensity) continue;

                // vector from render point to light

            this.lightVector.setFromSubPoint(light.position,vrt);

                // we keep a list of the last mesh
                // to block a light and we check that first
                // because a lot of the time the same mesh will come
                // up rendering a triangle in a mesh
   
            if (light.lastBlockMeshIdx!==-1) {
                mesh=this.data.meshes[light.lastBlockMeshIdx];
                if (this.rayTraceTriangle(vrt,this.lightVector,mesh.shadowmapCacheV0[light.lastBlockTriangleIdx],mesh.shadowmapCacheV10[light.lastBlockTriangleIdx],mesh.shadowmapCacheV20[light.lastBlockTriangleIdx])) continue;
            }

                // ray bounding

            this.lightBoundX.setFromValues(vrt.x,light.position.x);
            this.lightBoundY.setFromValues(vrt.y,light.position.y);
            this.lightBoundZ.setFromValues(vrt.z,light.position.z);

                // any hits?
                // only run through the meshes that collide with
                // the light globe because only they can block

            hit=false;
            nMesh=light.collideMeshes.length;

            for (k=0;k!==nMesh;k++) {
                mesh=this.data.meshes[light.collideMeshes[k]];
                
                    // only deal with meshes in the ray to light bound
                    // do x/z first these are probably quicker eliminations
                    
                if ((mesh.xBound.min>=this.lightBoundX.max) || (mesh.xBound.max<=this.lightBoundX.min)) continue;
                if ((mesh.zBound.min>=this.lightBoundZ.max) || (mesh.zBound.max<=this.lightBoundZ.min)) continue;
                if ((mesh.yBound.min>=this.lightBoundY.max) || (mesh.yBound.max<=this.lightBoundY.min)) continue;

                    // do all the trigs
                    
                trigCount=mesh.trigCount;

                for (p=0;p!==trigCount;p++) {
                    if ((meshIdx===light.collideMeshes[k]) && (trigIdx===p)) continue;   // skip self
                    
                    if (this.rayTraceTriangle(vrt,this.lightVector,mesh.shadowmapCacheV0[p],mesh.shadowmapCacheV10[p],mesh.shadowmapCacheV20[p])) {
                        hit=true;
                        light.lastBlockMeshIdx=light.collideMeshes[k];
                        light.lastBlockTriangleIdx=p;
                        break;
                    }
                }

                if (hit) break;
            }
            
                // at least one light got through, not in shadow
                
            if (!hit) return(true);
        }
        
        return(false);
    }
        
        //
        // render shadowmap for mesh and triangle
        //

    renderTriangle(shadowmap,meshIdx,trigIdx,v0,v1,v2,normal,t0,t1,t2)
    {
        let n,k,x,y,lx,rx,ty,by,pIdx;
        let tlx,blx,trx,brx;
        let dist0,dist1,dist2,allBlack,allWhite;
        let light,lightList,normalOK,insertIdx;
        let lumData=shadowmap.lumData;
        
            // create a light list to check the
            // triangle against
            
        lightList=this.data.lights;
        
        lightList=[];

        for (n=0;n!==this.data.lights.length;n++) {
            light=this.data.lights[n];
            
                // only consider a light if it collides
                // with this mesh
                
            if (light.collideMeshes.indexOf(meshIdx)===-1) continue;
            
                // eliminate for distance
                
            dist0=this.distance(light.position,v0);
            dist1=this.distance(light.position,v1);
            dist2=this.distance(light.position,v2);
            if ((dist0>light.intensity) && (dist1>light.intensity) && (dist2>light.intensity)) continue;
            
                // check all the vertex normals
                // only eliminate if all vertexes are
                // behind
  
            this.lightVectorNormal.setFromValues((light.position.x-v0.x),(light.position.y-v0.y),(light.position.z-v0.z));
            this.lightVectorNormal.normalize();
            normalOK=(this.lightVectorNormal.dot(normal)>=0.0);
            
            if (!normalOK) {
                this.lightVectorNormal.setFromValues((light.position.x-v1.x),(light.position.y-v1.y),(light.position.z-v1.z));
                this.lightVectorNormal.normalize();
                normalOK=(this.lightVectorNormal.dot(normal)>=0.0);
                
                if (!normalOK) {
                    this.lightVectorNormal.setFromValues((light.position.x-v2.x),(light.position.y-v2.y),(light.position.z-v2.z));
                    this.lightVectorNormal.normalize();
                    normalOK=(this.lightVectorNormal.dot(normal)>=0.0);
                }
            }
            
            if (!normalOK) continue;
            
            light.distance=dist0;

            insertIdx=lightList.length;

            for (k=0;k!==lightList.length;k++) {
                if (dist0<lightList[k].distance) {
                    insertIdx=k;
                    break;
                }
            }

            lightList.splice(insertIdx,0,light);
        }
        
            // if no lights, it's all black
            
        if (lightList.length===0) return(this.RENDER_ALL_BLACK);
        
            // flag to see if we only wrote black or white lum values
            
        allBlack=true;
        allWhite=true;
        
            // create a transformation matrix to get
            // the 2d triangle to the 3d one
            // the transform matrix is [3d points]*invert([2d point (z=0)])
            
        this.mat2d.fromArray([t0.x,t0.y,0,1,t1.x,t1.y,0,1,t2.x,t2.y,0,1,1,1,1,1]);
        this.mat2dInvert.setFromInvertMatrix(this.mat2d);
        this.mat3d.fromArray([v0.x,v0.y,v0.z,1,v1.x,v1.y,v1.z,1,v2.x,v2.y,v2.z,1,1,1,1,1]);
        this.transformMat.setFromMultiply(this.mat3d,this.mat2dInvert);
        
            // render the triangle
            
        if (shadowmap.chunkIdx&0x1) {
            ty=t1.y;
            by=t0.y;
            
            tlx=blx=t1.x;
            trx=t2.x;
            brx=t0.x;
        }
        else {
            ty=t0.y;
            by=t1.y;
            
            tlx=t0.x;
            blx=t2.x;
            trx=brx=t0.x;
        }
        
        for (y=ty;y<by;y++) {
            lx=tlx+Math.trunc(((blx-tlx)*(y-ty))/(by-ty));
            rx=trx+Math.trunc(((brx-trx)*(y-ty))/(by-ty));
            
            pIdx=(y*this.SHADOWMAP_TEXTURE_SIZE)+lx;
                
            for (x=lx;x<rx;x++) {
            
                // ray trace the 3d pixel
                
                this.rayPoint.setFromValues(x,y,0);    
                this.rayPoint.matrixMultiply(this.transformMat);
                
                if (this.rayTraceMap(meshIdx,trigIdx,lightList,this.rayPoint)) {
                    lumData[pIdx]=1.0;
                    allBlack=false;
                }
                else {
                    allWhite=false;
                }
                
                pIdx++;
            }
        }
        
        if (allBlack) return(this.RENDER_ALL_BLACK);
        if (allWhite) return(this.RENDER_ALL_WHITE);
        return(this.RENDER_NORMAL);
    }

    renderMesh(meshIdx)
    {
        let n,renderResult,resetOnce,originalChunkIdx;
        let rv0,rv1,rv2,dist0,dist1,dist2;
        let vertexShadowArray,uvShadowArray;
        let mesh,shadowmap,highlight;
        
        mesh=this.data.meshes[meshIdx];
        
        console.info('Ray tracing mesh '+meshIdx+'/'+this.data.meshes.length);
        
            // moveable or highlighted meshes are skipped
                
        highlight=false;
        if (this.data.shadowMapHighlightBitmaps!==undefined) highlight=(this.data.shadowMapHighlightBitmaps.indexOf(mesh.bitmapName)!==-1);

        if ((mesh.moveable) || (highlight)) {
            mesh.shadowMapIndex=0;
            mesh.vertexShadowArray=null;
            mesh.uvShadowArray=null;
            return;
        }
        
            // we use regular arrays so we
            // can do push, converting them to
            // floats at the end
            
        vertexShadowArray=[];
        uvShadowArray=[];
        
            // we need to put the entire mesh into
            // one shadow map, but we don't know how many
            // triangles we will have so we start filling
            // and fail and start over if we go over
            
        resetOnce=false;
        
        while (true) {
            
            shadowmap=this.shadowmapList[this.shadowmapIdx];
            originalChunkIdx=shadowmap.chunkIdx;

                // run through the triangles
                // if no lights hit a triangle, it's
                // autoset to chunk 0, the all black trig

            for (n=0;n!==mesh.trigCount;n++) {

                    // get vertexes for the 3D world triangle
                    // and a single normal

                this.getMeshTriangleVertexes(mesh,n,this.v0,this.v1,this.v2,this.normal);
                        
                    // rotate triangles so hypontenuses line up
                    // so we have best surface to draw on (the draw
                    // triangles always have the hypontenuse at p2->p0)

                dist0=this.distance(this.v0,this.v1);
                dist1=this.distance(this.v1,this.v2);
                dist2=this.distance(this.v2,this.v0);

                if ((dist0>dist1) && (dist0>dist2)) {
                    rv0=this.v1;
                    rv1=this.v2;
                    rv2=this.v0;            
                }
                else {
                    if ((dist1>dist0) && (dist1>dist2)) {
                        rv0=this.v2;
                        rv1=this.v0;
                        rv2=this.v1;
                    }
                    else {
                        rv0=this.v0;
                        rv1=this.v1;
                        rv2=this.v2;
                    }
                }

                    // and the vertexes for the 2D chunk shadowmap

                shadowmap.getChunkDrawCoordinates(shadowmap.chunkIdx,this.t0,this.t1,this.t2);

                    // render the triangle

                renderResult=this.renderTriangle(shadowmap,meshIdx,n,rv0,rv1,rv2,this.normal,this.t0,this.t1,this.t2);

                    // if all white, then skip any triangles
                    // as they won't draw anything

                if (renderResult===this.RENDER_ALL_WHITE) continue;

                    // advance chunk if not all black (which means
                    // we used a chunk instead of the default all black chunk

                if (renderResult===this.RENDER_ALL_BLACK) {
                    shadowmap.getChunkUVCoordinates(0,this.t0,this.t1,this.t2);
                }
                else {
                    shadowmap.getChunkUVCoordinates(shadowmap.chunkIdx,this.t0,this.t1,this.t2);
                    shadowmap.chunkIdx++;
                    
                        // did we overfill this shadowmap and need
                        // to start over on a new one?
                        
                    if (shadowmap.chunkIdx>=this.SHADOWMAP_CHUNK_PER_TEXTURE) break;
                }

                    // add the shadow map pass triangle

                vertexShadowArray.push(rv0.x,rv0.y,rv0.z);
                uvShadowArray.push((this.t0.x/this.SHADOWMAP_TEXTURE_SIZE),(this.t0.y/this.SHADOWMAP_TEXTURE_SIZE));

                vertexShadowArray.push(rv1.x,rv1.y,rv1.z);
                uvShadowArray.push((this.t1.x/this.SHADOWMAP_TEXTURE_SIZE),(this.t1.y/this.SHADOWMAP_TEXTURE_SIZE));

                vertexShadowArray.push(rv2.x,rv2.y,rv2.z);
                uvShadowArray.push((this.t2.x/this.SHADOWMAP_TEXTURE_SIZE),(this.t2.y/this.SHADOWMAP_TEXTURE_SIZE));
            }
            
                // did we go over and need to repeat?
                // we only do this once, otherwise it's a mesh too
                // big to fit into one shadow map and we just only do
                // the trigs that fit
                
            if (shadowmap.chunkIdx>=this.SHADOWMAP_CHUNK_PER_TEXTURE) {
                if (resetOnce) {
                    console.info('mesh '+meshIdx+':'+mesh.name+' has too many triangles for shadowmap');
                    break;
                }
                else {
                    resetOnce=true;

                        // put the map back to it's earlier state

                    for (n=originalChunkIdx;n<shadowmap.chunkIdx;n++) {
                        shadowmap.fillChunk(n,this.SHADOW_MIN_VALUE);
                    }
                    shadowmap.chunkIdx=originalChunkIdx;

                        // now move onto a new map

                    this.shadowmapIdx=this.shadowmapList.length;
                    this.shadowmapList.push(new ShadowmapBitmapClass(this));

                    console.info('reset='+this.shadowmapIdx);

                    continue;
                }
            }
            
            break;
        }
        
            // now add the vertex and uvs
            
        if (vertexShadowArray.length===0) {
            mesh.shadowMapIndex=0;
            mesh.vertexShadowArray=null;
            mesh.uvShadowArray=null;
        }
        else {
                // map meshes have a temporary index for
                // the light map.  we don't create the light
                // maps into the very end (as they can be shared)
                // so this is used for tracking it until than

            mesh.shadowMapIndex=this.shadowmapIdx;
            mesh.vertexShadowArray=new Float32Array(vertexShadowArray);
            mesh.uvShadowArray=new Float32Array(uvShadowArray);
        }
    }
    
        //
        // build shadowmap model bin
        // mesh count (int)
        //   bitmap index (int)
        //   vertex byte count (int)
        //   uv byte count (int)
        //   vertexes (array of 3 floats)
        //   uvs (array of 2 floats)
        //
        
    buildShadowMapModelBin()
    {
        let n,k,len,offset,mesh;
        let data,dataView;
        let byteBuffer,str;
        let nMesh=this.data.meshes.length;
        
            // calculate the length
            
        len=4;      // mesh count
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.data.meshes[n];
            
            len+=12;        // bitmap index and vertex/uv byte count
            if (mesh.vertexShadowArray!==null) len+=((mesh.vertexShadowArray.length*4)+(mesh.uvShadowArray.length*4)); // vertex and UVs
        }
        
            // fill the data
            
        data=new ArrayBuffer(len);
        
        dataView=new DataView(data,0,len);
        
        dataView.setInt32(0,nMesh);
        
        offset=4;
        
        for (n=0;n!==nMesh;n++) {
            mesh=this.data.meshes[n];
            
            if (mesh.vertexShadowArray===null) {
                dataView.setInt32(offset,0);
                offset+=4;
                dataView.setInt32(offset,0);
                offset+=4;
                dataView.setInt32(offset,0);
                offset+=4;
            }
            else {
                dataView.setInt32(offset,mesh.shadowMapIndex);
                offset+=4;
                dataView.setInt32(offset,mesh.vertexShadowArray.length);
                offset+=4;
                dataView.setInt32(offset,mesh.uvShadowArray.length);
                offset+=4;

                for (k=0;k!==mesh.vertexShadowArray.length;k++) {
                    dataView.setFloat32(offset,mesh.vertexShadowArray[k]);
                    offset+=4;
                }
                for (k=0;k!==mesh.uvShadowArray.length;k++) {
                    dataView.setFloat32(offset,mesh.uvShadowArray[k]);
                    offset+=4;
                }
            }
        }
        
            // now do the base64 conversion
            
        byteBuffer=new Uint8Array(data);
        str='';
        
        for (n=0;n!==byteBuffer.byteLength;n++) {
            str+=String.fromCharCode(byteBuffer[n]);
        }
        
        return(btoa(str));
    }
    
        //
        // create shadowmaps
        // creation has to be done by a timer because this
        // is too slow and browsers will bounce the script
        //

    run()
    {
        let n,bin;
        
            // start the shadowmap bitmap cache
            // with the initial shadow map
            
        this.shadowmapIdx=0;
        this.shadowmapList.push(new ShadowmapBitmapClass(this));
        
            // ray trace the meshes
            
        for (n=0;n!==this.data.meshes.length;n++) {
            this.renderMesh(n);
        }
        
            // create the shadow map data and pass
            // out of worker to be uploaded
            // (uses canvas DOM, so can't be done here)
            
        bin=this.buildShadowMapModelBin();         // already in base64
        postMessage({textureSize:this.SHADOWMAP_TEXTURE_SIZE,bin:bin,shadowmapList:this.shadowmapList});        
    }
}


