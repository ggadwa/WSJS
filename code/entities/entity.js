"use strict";

//
// main entity object
//
// 

function entityObject(position,angle,model,isPlayer)
{
    this.position=position;
    this.angle=angle;
    this.model=model;
    this.isPlayer=isPlayer;
    
    this.collision=new collisionObject();
    
    
}
