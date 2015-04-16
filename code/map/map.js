"use strict";

//
// clear map
//

function mapClear()
{
    var n;
    var nMesh=this.meshes.length;
    var nBitmap=this.bitmaps.length;
    var nLightmap=this.lightmaps.length;
    
    for (n=0;n!==nMesh;n++) {
        this.meshes[n].close();
    }
    
    for (n=0;n!==nBitmap;n++) {
        this.bitmaps[n].close;
    }
    
    for (n=0;n!==nLightmap;n++) {
        this.lightmaps[n].close;
    }
    
    this.meshes=[];
    this.lights=[];
    this.bitmaps=[];
    this.lightmaps=[];
}

//
// add items to map
//

function mapAddMesh(mesh)
{
    this.meshes.push(mesh);
}

function mapAddLight(light)
{
    this.lights.push(light);
}

function mapAddBitmap(bitmap)
{
    this.bitmaps.push(bitmap);
}

function mapAddLightmap(lightmap)
{
    this.lightmaps.push(lightmap);
}

//
// bitmap/lightmap lookup
//

function mapGetBitmapById(bitmapId)
{
    var n;
    var nBitmap=this.bitmaps.length;
    
    for (n=0;n!==nBitmap;n++) {
        if (this.bitmaps[n].bitmapId===bitmapId) return(this.bitmaps[n]);
    }
    
    return(null);
}

function mapGetLightmapById(lightmapId)
{
    var n;
    var nLightmap=this.lightmaps.length;
    
    for (n=0;n!==nLightmap;n++) {
        if (this.lightmaps[n].lightmapId===lightmapId) return(this.lightmaps[n]);
    }
    
    return(null);
}

//
// check for map mesh collisions
//

function mapBoxBoundCollision(xBound,yBound,zBound,onlyFlag)
{
    var n;
    var nMesh=this.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        if (onlyFlag!==null) {
            if (this.meshes[n].flag!==onlyFlag) continue;
        }
        if (this.meshes[n].boxBoundCollision(xBound,yBound,zBound)) return(n);
    }
    
    return(-1);
}

function mapBoxMeshCollision(checkMesh,onlyFlag)
{
    var n;
    var nMesh=this.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        if (onlyFlag!==null) {
            if (this.meshes[n].flag!==onlyFlag) continue;
        }
        if (this.meshes[n].boxMeshCollision(checkMesh)) return(n);
    }
    
    return(-1);
}

//
// flag counts
//

function mapCountMeshByFlag(onlyFlag)
{
    var n;
    var nMesh=this.meshes.length;
    
    if (onlyFlag===null) return(nMesh);
    
    var count=0;
    
    for (n=0;n!==nMesh;n++) {
        if (this.meshes[n].flag===onlyFlag) count++;
    }
    
    return(count);
}

//
// check if point is in light
//

function mapPointInLight(pt)
{
    var n;
    var nLight=this.lights.length;
    
    for (n=0;n!==nLight;n++) {
        if (this.lights[n].position.distance(pt)<this.lights[n].intensity) return(true);
    }
    
    return(false);
}

function mapPointInSingleLight(light,pt)
{
    return(light.position.distance(pt)<light.intensity);
}

//
// build list of meshes that intersect with
// light and a list of lights that intersect with
// meshes
//

function mapBuildLightMeshIntersectLists()
{
    var n,k,i,nIntersect,light,mesh,pt;
    var meshIndexes,lightIndexes;
    var nLight=this.lights.length;
    var nMesh=this.meshes.length;
    
        // build the meshes intersecting lights
        // list
        
    for (n=0;n!==nLight;n++) {
        light=this.lights[n];
        
        meshIndexes=[];
        
            // check the 8 corners of the cube
            
        for (k=0;k!==nMesh;k++) {
            mesh=this.meshes[k];
            
            pt=new wsPoint(mesh.xBound.min,mesh.yBound.min,mesh.zBound.min);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.min,mesh.yBound.min,mesh.zBound.max);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.max,mesh.yBound.min,mesh.zBound.min);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.max,mesh.yBound.min,mesh.zBound.max);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.min,mesh.yBound.max,mesh.zBound.min);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.min,mesh.yBound.max,mesh.zBound.max);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.max,mesh.yBound.max,mesh.zBound.min);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            pt=new wsPoint(mesh.xBound.max,mesh.yBound.max,mesh.zBound.max);
            if (this.pointInSingleLight(light,pt)) {
                meshIndexes.push(k);
                continue;
            }
            
        }
        
            // add to the list
            
        light.meshIntersectList=new Uint16Array(meshIndexes);
    }
    
        // now reverse the list for lights
        // intersecting meshes list
        
    for (n=0;n!==nMesh;n++) {
        mesh=this.meshes[n];
        
        lightIndexes=[];
        
        for (k=0;k!==nLight;k++) {
            light=this.lights[k];
            
            nIntersect=light.meshIntersectList.length;
            for (i=0;i!==nIntersect;i++) {
                if (light.meshIntersectList[i]===n) {
                    lightIndexes.push(k);
                    break;
                }
            }
        }
        
        mesh.lightIntersectList=new Uint16Array(lightIndexes);
    }
}

//
// map light utilities
//

function mapCreateViewLightsFromMapLights(view,camera)
{
    var n,k,nLight,idx;
    var x,y,z;
    var light;
    
        // get the distance from the camera
        // to all the lights
        
    nLight=this.lights.length;
    
    for (n=0;n!==nLight;n++) {
        light=this.lights[n];
        
        light.origIndex=n;
        
        x=camera.position.x-light.position.x;
        y=camera.position.y-light.position.y;
        z=camera.position.z-light.position.z;
        light.dist=Math.sqrt((x*x)+(y*y)+(z*z));        // sqrt not required here, but overflow could be a problem
    }
    
        // find the four closest lights
        // and put them into the view list
        
    for (k=0;k!==view.LIGHT_COUNT;k++) {
        view.lights[k]=null;
    }
    
    view.lights=[];
    
    for (n=0;n!==nLight;n++) {
        light=this.lights[n];
        
        idx=-1;
        
        for (k=0;k!==view.lights.length;k++) {
            if (view.lights[k].dist>light.dist) {
                idx=k;
                break;
            }
        }
        
        if (idx===-1) {
            if (view.lights.length<view.LIGHT_COUNT) view.lights.push(light);
        }
        else {
            view.lights.splice(idx,0,light);
            if (view.lights.length>view.LIGHT_COUNT) view.lights.pop();
        }
    }
    
        // fill in any missing lights
        
    while (view.lights.length<view.LIGHT_COUNT) {
        view.lights.push(null);
    }
}

//
// setup all the mesh buffers
//

function mapSetupBuffers()
{
    var n;
    var nMesh=this.meshes.length;
    
        // setup all the gl
        // buffers and indexes
    
    for (n=0;n!==nMesh;n++) {
        this.meshes[n].setupBuffers();
    }
}
   
//
// draw map
//

function mapDrawStart(view)
{
    this.mapShader.drawStart(view);
}

function mapDrawEnd()
{
    this.mapShader.drawEnd();
}

function mapDraw(view)
{
    var n,mesh;
    var meshCount=0;
    var nMesh=this.meshes.length;
    var currentBitmap,currentLightmap;
    
        // setup map drawing
        
    currentBitmap=null;
    currentLightmap=null;
    
        // draw the meshes
    
    for (n=0;n!==nMesh;n++) {
        mesh=this.meshes[n];
        
            // skip if not in view frustum
            
        if (!view.boundBoxInFrustum(mesh.xBound,mesh.yBound,mesh.zBound)) continue;
        
            // time to change bitmap
            // or lightmap?
            
        if (mesh.bitmap!==currentBitmap) {
            currentBitmap=mesh.bitmap;
            mesh.bitmap.attach(this.mapShader);
        }
        
        if (mesh.lightmap!==currentLightmap) {
            currentLightmap=mesh.lightmap;
            mesh.lightmap.attach(this.mapShader);
        }
        
            // draw the mesh
            
        mesh.bindBuffers(this.mapShader);
        mesh.draw();
        
        meshCount++;
    }
    
    return(meshCount);
}

//
// initialize and release
//

function mapInitialize(view)
{
    return(this.mapShader.initialize(view));
}

function mapRelease()
{
    this.mapShader.release();
}

//
// map object
//

function mapObject()
{
    this.mapShader=new mapShaderObject();
    
    this.meshes=[];
    this.lights=[];
    this.bitmaps=[];
    this.lightmaps=[];
    
    this.initialize=mapInitialize;
    this.release=mapRelease;
    
    this.clear=mapClear;
    
    this.addMesh=mapAddMesh;
    this.addLight=mapAddLight;
    this.addBitmap=mapAddBitmap;
    this.addLightmap=mapAddLightmap;
    
    this.getBitmapById=mapGetBitmapById;
    this.getLightmapById=mapGetLightmapById;
    
    this.countMeshByFlag=mapCountMeshByFlag;
    
    this.boxBoundCollision=mapBoxBoundCollision;
    this.boxMeshCollision=mapBoxMeshCollision;
    
    this.pointInLight=mapPointInLight;
    this.pointInSingleLight=mapPointInSingleLight;
    this.buildLightMeshIntersectLists=mapBuildLightMeshIntersectLists;
    
    this.createViewLightsFromMapLights=mapCreateViewLightsFromMapLights;
    this.setupBuffers=mapSetupBuffers;
    
    this.drawStart=mapDrawStart;
    this.drawEnd=mapDrawEnd;
    this.draw=mapDraw;
}

