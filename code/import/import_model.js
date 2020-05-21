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
    
    async load(json)
    {
        let importMesh;
        
        importMesh=new ImportGLTFClass(this.core,json);
        return(await importMesh.import(null,this.model.meshList,this.model.skeleton,false));
    }

}
