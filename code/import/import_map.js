import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import LightClass from '../light/light.js';
import ImportGLTFClass from '../import/import_gltf.js';

export default class ImportMapClass
{
    constructor(core)
    {
        this.core=core;
        
        Object.seal(this);
    }
    
    async load(json)
    {
        let n,idx;
        let light,lightDef,lightAmbient;
        let importMesh;
        
            // import the map itself
          
        importMesh=new ImportGLTFClass(this.core,json);
        if (!(await importMesh.import(this.core.map,this.core.map.meshList,null))) return(false);
        
            // the lights
            
        if (json.lightMin!==undefined) this.core.map.lightList.lightMin.setFromValues(json.lightMin.r,json.lightMin.g,json.lightMin.b);
        if (json.lightMax!==undefined) this.core.map.lightList.lightMax.setFromValues(json.lightMax.r,json.lightMax.g,json.lightMax.b);
            
        
            // some physics settings
            
        if (json.maxFloorCeilingDetectionFactor!==undefined) {
            this.core.map.meshList.maxFloorCeilingDetectionFactor=1.0-json.maxFloorCeilingDetectionFactor;     // 0 = walls facing straight up only, to 1 which is pretty much anything
        }
        
            // paths json
            
        this.core.map.path.load();
        
        return(true);
    }
}
