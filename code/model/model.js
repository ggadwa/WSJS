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

function modelObject(name,mesh,skeleton)
{
    this.name=name;
    this.mesh=mesh;
    this.skeleton=skeleton;
    
        // close functions
        
    this.close=modelClose;
}
