//
// model object
//

export default class ModelClass
{
    constructor(view,name)
    {
        this.view=view;
        this.name=name;
        
        this.mesh=null;
        this.skeleton=null;
        
        Object.seal(this);
    }
    
        //
        // close model
        //

    close()
    {
        this.mesh.close();
        this.skeleton.close();
    }
    
        //
        // clone this model
        //
        
    clone()
    {
        let model=new ModelClass(this.view,this.name);
        
        model.mesh=this.mesh.clone();
        model.skeleton=this.skeleton.clone();

        return(model);
    }
    
        //
        // information
        //
        
    calculateRadius()
    {
        return(this.mesh.calculateRadius(this.skeleton));
    }
    
    calculateHeight()
    {
        return(this.mesh.calculateHeight());
    }

}
