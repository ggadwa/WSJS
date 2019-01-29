import PointClass from '../../code/utility/point.js';
import BoundClass from '../../code/utility/bound.js';
import ColorClass from '../../code/utility/color.js';
import ImportObjClass from '../../code/import/import_obj.js';

export default class ImportModelClass
{
    constructor(view,model)
    {
        this.view=view;
        this.model=model;
    }
    
    async load(importSettings)
    {
        let importObj;
        
        importObj=new ImportObjClass(this.view,importSettings);
        return(await importObj.import(this.model.meshList));
    }

}
