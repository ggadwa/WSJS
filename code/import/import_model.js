import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import ImportGLTFClass from '../import/import_gltf.js';

export default class ImportModelClass
{
    constructor(core,model)
    {
        this.core=core;
        this.model=model;
        
        Object.seal(this);
    }
    
    async load(importSettings)
    {
        let importMesh;
        
            // scale is illegal in models, so flag and break
            
        if (importSettings.scale!==undefined) {
            console.log('scale is per entity, it can not be set on a model load: '+importSettings.name);
            return(false);
        }
        
            // import the model
        
        importMesh=new ImportGLTFClass(this.core,importSettings);
        return(await importMesh.import(this.model.meshList,this.model.skeleton));
    }

}
