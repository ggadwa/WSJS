import PointClass from '../../utility/point.js';

//
// this object contains one of the lights in the scene,
// plus a list of all it's collision meshes to speed
// up the tracing
//

export default class ShadowmapLightClass
{
    constructor(meshes,shadowMapSkinBitmaps,mapLight)
    {
        this.meshes=meshes;
        this.shadowMapSkinBitmaps=shadowMapSkinBitmaps;
        
        this.position=mapLight.position;
        this.intensity=mapLight.intensity;
        this.invertIntensity=mapLight.invertIntensity;
        this.exponent=mapLight.exponent;
        
            // if being used on this trig
            
        this.inUse=false;
        
            // some ray trace optimization values
            
        this.lastBlockMeshIdx=-1;
        this.lastBlockTriangleIdx=-1;

            // all the meshes that collide with
            // the light globe
            
        this.collideMeshes=[];
    }
    
    calculateCollisionList()
    {
        let n,mesh;
        let pnt=new PointClass(0,0,0);
        
        for (n=0;n!==this.meshes.length;n++) {
            mesh=this.meshes[n];
            if (mesh.moveable) continue;
            
                // skipped meshes
            
            if (this.shadowMapSkinBitmaps!==undefined) {
                if (this.shadowMapSkipBitmaps.indexOf(mesh.bitmapName)!==-1) continue;
            }
            
                // check if center in light globe
                
            if (mesh.center.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            
                // now the 8 cube corners
            
            pnt.setFromValues(mesh.xBound.min,mesh.yBound.min,mesh.zBound.min);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.min,mesh.yBound.min,mesh.zBound.max);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.max,mesh.yBound.min,mesh.zBound.min);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.max,mesh.yBound.min,mesh.zBound.max);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            
            pnt.setFromValues(mesh.xBound.min,mesh.yBound.max,mesh.zBound.min);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.min,mesh.yBound.max,mesh.zBound.max);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.max,mesh.yBound.max,mesh.zBound.min);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
            pnt.setFromValues(mesh.xBound.max,mesh.yBound.max,mesh.zBound.max);
            if (pnt.distance(this.position)<this.intensity) {
                this.collideMeshes.push(n);
                continue;
            }
        }
    }
}
