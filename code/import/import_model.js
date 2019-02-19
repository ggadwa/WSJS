import PointClass from '../utility/point.js';
import BoundClass from '../utility/bound.js';
import ColorClass from '../utility/color.js';
import ImportSettingsClass from '../import/import_settings.js';
import ImportObjClass from '../import/import_obj.js';
import ImportGLTFClass from '../import/import_gltf.js';

export default class ImportModelClass
{
    constructor(view,model)
    {
        this.view=view;
        this.model=model;
        
        Object.seal(this);
    }
    
    async load(importSettings)
    {
        let importMesh;
        
        if (importSettings.format===ImportSettingsClass.FORMAT_OBJ) {
            importMesh=new ImportObjClass(this.view,importSettings);
        }
        else {
            importMesh=new ImportGLTFClass(this.view,importSettings);
        }
        return(await importMesh.import(this.model.meshList,this.model.skeleton));
    }

}
