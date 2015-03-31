"use strict";

//
// close map
//

function mapClose()
{
    var n;
    var nMesh=this.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        this.meshes[n].close();
    }
    
    this.meshes=[];
    this.lights=[];
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
        
    for (k=0;k!==shader.LIGHT_COUNT;k++) {
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
            if (view.lights.length<shader.LIGHT_COUNT) view.lights.push(light);
        }
        else {
            view.lights.splice(idx,0,light);
            if (view.lights.length>shader.LIGHT_COUNT) view.lights.pop();
        }
    }
    
        // fill in any missing lights
        
    while (view.lights.length<shader.LIGHT_COUNT) {
        view.lights.push(null);
    }
}

//
// setup all the mesh buffers
//

function mapSetupBuffers()
{
    var n;
    var nMesh=map.meshes.length;
    
        // setup all the gl
        // buffers and indexes
    
    for (n=0;n!==nMesh;n++) {
        map.meshes[n].setupBuffers();
    }
}
   
//
// draw map
//

function mapDraw()
{
    var n,mesh;
    var nMesh=this.meshes.length;
    
    for (n=0;n!==nMesh;n++) {
        mesh=this.meshes[n];
        mesh.setupShader();
        mesh.enableBuffers();
        mesh.bindBuffers();
        mesh.draw();
        mesh.disableBuffers();
    }
    
    /* debuging
    for (n=0;n!==nMesh;n++) {
        mesh=this.meshes[n];
        debug.drawMeshLines(SHADER_DEBUG,mesh);
        debug.drawMeshNormals(SHADER_DEBUG,mesh);
    }
    */
}

//
// map object
//

function mapObject()
{
    this.meshes=[];
    this.lights=[];
    
    this.close=mapClose;
    
    this.addMesh=mapAddMesh;
    this.addLight=mapAddLight;
    
    this.countMeshByFlag=mapCountMeshByFlag;
    
    this.boxBoundCollision=mapBoxBoundCollision;
    this.boxMeshCollision=mapBoxMeshCollision;
    
    this.pointInLight=mapPointInLight;
    
    this.createViewLightsFromMapLights=mapCreateViewLightsFromMapLights;
    this.setupBuffers=mapSetupBuffers;
    
    this.draw=mapDraw;
}

