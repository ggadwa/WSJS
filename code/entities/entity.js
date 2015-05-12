"use strict";

//
// entity class
//

function EntityObject(position,angle,model,isPlayer)
{
    this.position=position;
    this.angle=angle;
    this.model=model;
    this.isPlayer=isPlayer;
    
    this.collision=new CollisionObject();
    
        //
        // draw entity
        //

    this.drawStart=function(view)
    {
        this.model.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.model.drawEnd(view);
    };

    this.draw=function(view)
    {
        this.model.mesh.tempMoveUpdateVertexes(view,this.position);     // supergumba -- temporary
        this.model.draw(view);
    };
    
    
}
