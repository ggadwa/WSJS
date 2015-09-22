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
        var angY=this.angle.y+extraAngle;
        
            // get the move to point
            
        var movePt=new wsPoint(0.0,0.0,dist);
        movePt.rotateY(null,angY);
        
            // wall clipping setting, remove later
            
        if ((settings.clipWalls) && (this.isPlayer)) {
            this.position.addPoint(movePt);
            return;
        }
        
            // run the collision which
            // will return a new move direction
            // if it's the same as the original or
            // there's been a bump, move it, otherwise,
            // try sliding
            
        var collideMovePt=this.collision.moveObjectInMap(map,this.position,movePt,this.radius,true);
        if ((collideMovePt.equals(movePt)) || (collideMovePt.y!==0)) {
            this.position.addPoint(collideMovePt);
            return;
        }
        
            // try to slide
            
        var slidePt,collideSlidePt;
            
        slidePt=new wsPoint(movePt.x,0.0,0.0);
        
        collideSlidePt=this.collision.moveObjectInMap(map,this.position,slidePt,this.radius,false);
        if (collideSlidePt.equals(slidePt)) {
            this.position.addPoint(collideSlidePt);
            return;
        }
        
        slidePt=new wsPoint(0.0,0.0,movePt.z);
        
        collideSlidePt=this.collision.moveObjectInMap(map,this.position,slidePt,this.radius,false);
        if (collideSlidePt.equals(slidePt)) {
            this.position.addPoint(collideSlidePt);
            return;
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPoint(collideMovePt);
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
            // input movement
            
        if (this.turnSpeed!==0.0) this.turn(this.turnSpeed);
        if (this.lookSpeed!==0.0) this.look(this.lookSpeed);
        if (this.forwardSpeed!==0.0) this.forward(map,this.forwardSpeed,0.0);
        if (this.sideSpeed!==0.0) this.forward(map,this.sideSpeed,90.0);
        if (this.verticalSpeed!==0.0) this.move(0.0,this.verticalSpeed,0.0);
        
            // falling
        
        if ((!settings.fly) && (this.isPlayer)) {
            var fallY=this.collision.fallObjectInMap(map,this.position,this.radius,50);
            this.position.move(0,fallY,0);
        }
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
