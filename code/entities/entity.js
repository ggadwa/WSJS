"use strict";

//
// entity class
//

function EntityObject(position,angle,radius,model,isPlayer)
{
    this.position=position;
    this.angle=angle;
    this.radius=radius;
    this.model=model;
    this.isPlayer=isPlayer;
    
    this.turnSpeed=0;
    this.lookSpeed=0;
    this.forwardSpeed=0;
    this.sideSpeed=0;
    this.verticalSpeed=0;
    
    this.collision=new CollisionObject();
    
        //
        // move forward with angle
        //
    
    this.forward=function(map,dist,extraAngle)
    {
            // get the move to point
            
        var pt=new wsPoint(0.0,0.0,dist);        
        pt.rotateY(null,(this.angle.y+extraAngle));
        
        var entityPt=this.position.copy();
        entityPt.addPoint(pt);
        
            // run the collision and set
            // to the hit point (which will
            // be entityPt is nothing is hit)
            
        entityPt=this.collision.moveObjectInMap(map,entityPt,radius,true);
        this.position.setFromPoint(entityPt);
    };
    
        //
        // move directly
        //

    this.move=function(x,y,z)
    {
        this.position.move(x,y,z);
    };
    
        //
        // turn (y angle)
        //

    this.turn=function(addAngle)
    {
        this.angle.y+=addAngle;
        if (this.angle.y<0.0) this.angle.y+=360.0;
        if (this.angle.y>=360.00) this.angle.y-=360.0;
    };
    
        //
        // look (x angle)
        //

    this.look=function(addAngle)
    {
        this.angle.x+=addAngle;
        if (this.angle.x<-80.0) this.angle.x=-80.0;
        if (this.angle.x>=80.0) this.angle.x=80.0;
    };
    
        //
        // run entity
        //
        
    this.run=function(map)
    {
        if (this.turnSpeed!==0.0) this.turn(this.turnSpeed);
        if (this.lookSpeed!==0.0) this.look(this.lookSpeed);
        if (this.forwardSpeed!==0.0) this.forward(map,this.forwardSpeed,0.0);
        if (this.sideSpeed!==0.0) this.forward(map,this.sideSpeed,90.0);
        if (this.verticalSpeed!==0.0) this.move(0.0,this.verticalSpeed,0.0);
    };
        
    
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
