"use strict";

//
// close model
//

function modelClose(view)
{
    this.mesh.close(view);
    this.skeleton.close();
}

//
// model object
//

function modelObject(name)
{
    this.name=name;
    this.mesh=null;
    this.skeleton=new modelSkeletonObject();
    
        // close functions
        
    this.close=modelClose;
}
