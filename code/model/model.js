"use strict";

//
// model object
//

function ModelObject(name)
{
    this.name=name;
    this.mesh=null;
    this.skeleton=new ModelSkeletonObject();
    
        //
        // close model
        //

    this.close=function(view)
    {
        this.mesh.close(view);
        this.skeleton.close();
    };

}
