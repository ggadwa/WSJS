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
    
    
}
