"use strict";

//
// close model
//

function modelClose()
{
    this.mesh.close();
    this.skeleton.close();
}

//
// model object
//

function modelObject(mesh,skeleton)
{
    this.mesh=mesh;
    this.skeleton=skeleton;
    
        // close functions
        
    this.close=modelClose;
}
