import PointClass from '../../utility/point.js';
import BoundClass from '../../utility/bound.js';

//
// this object contains one of the lights in the scene,
// plus a list of all it's collision meshes to speed
// up the tracing
//

export default class ShadowmapLightClass
{
    constructor(meshes,mapLight)
    {
        this.meshes=meshes;
        
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
        let xBound,yBound,zBound;
            
            // this check is loose, we treat the light
            // like a cube and then collide them, if we did
            // something like check corners/centers we'd
            // miss many meshes
            
        xBound=new BoundClass((this.position.x-this.intensity),(this.position.x+this.intensity));
        yBound=new BoundClass((this.position.y-this.intensity),(this.position.y+this.intensity));
        zBound=new BoundClass((this.position.z-this.intensity),(this.position.z+this.intensity));
        
        for (n=0;n!==this.meshes.length;n++) {
            mesh=this.meshes[n];
            
                // moveable meshes and meshes with
                // no collisions are skipped
                
            if ((mesh.moveable) || (mesh.noCollisions)) continue;
            
                // the bounds check
            
            if (xBound.min>=mesh.xBound.max) continue;
            if (xBound.max<=mesh.xBound.min) continue;
            if (yBound.min>=mesh.yBound.max) continue;
            if (yBound.max<=mesh.yBound.min) continue;
            if (zBound.min>=mesh.zBound.max) continue;
            if (zBound.max<=mesh.zBound.min) continue;

            this.collideMeshes.push(n);
        }
    }
}
