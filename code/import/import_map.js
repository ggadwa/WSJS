import PointClass from '../../code/utility/point.js';
import ImportObjClass from '../../code/import/import_obj.js';

export default class ImportMapClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
    }
    
    load(name,scale,skyBoxBitmapNames,callback)
    {
        let importObj;
        
        importObj=new ImportObjClass(this.view,('./data/objs/'+name+'.obj'),scale);
        importObj.import(this.addMeshesToMap.bind(this,importObj,skyBoxBitmapNames,callback));        
    }
    
    addMeshesToMap(importObj,skyBoxBitmapNames,callback)
    {
        let n;
        
            // add the meshes to the map
            
        for (n=0;n!==importObj.meshes.length;n++) {
            this.map.meshList.add(importObj.meshes[n]);
        }
        
            // load the sky
            
        this.map.sky.loadBitmaps(skyBoxBitmapNames,callback);
    }
}
