"use strict";

//
// main entity object
//
// 

function entityObject(position,angle,model)
{
    this.position=position;
    this.angle=angle;
    this.model=model;
    
    this.collision=new collisionObject();
    
    
}
