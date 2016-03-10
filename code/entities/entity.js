"use strict";

//
// entity base class
//

class EntityClass
{
    constructor(name,position,angle,radius,high,model)
    {
        this.name=name;
        this.position=position;
        this.angle=angle;
        this.radius=radius;
        this.high=high;
        this.model=model;

        this.id=-1;

        this.fallSpeed=0;
        this.gravity=0;

        this.markedForDeletion=false;              // used to delete this outside the run loop

        this.touchEntity=null;

        this.movePt=new wsPoint(0,0,0);     // this are global to stop them being local and GC'd
        this.slidePt=new wsPoint(0,0,0);
        this.collideMovePt=new wsPoint(0,0,0);
        this.collideSlideMovePt=new wsPoint(0,0,0);

        this.xFrustumBound=new wsBound(0,0);
        this.yFrustumBound=new wsBound(0,0);
        this.zFrustumBound=new wsBound(0,0);

        this.collision=new CollisionClass();
    }
    
        //
        // deleting
        //
        
    markAsDelete()
    {
        this.markedForDeletion=true;
    }
    
    isMarkedForDeletion()
    {
        return(this.markedForDeletion);
    }
    
        //
        // touching
        //
        
    clearTouchEntity()
    {
        this.touchEntity=null;
    }
    
    setTouchEntity(entity)
    {
        this.touchEntity=entity;
    }
    
    getTouchEntity()
    {
        return(this.touchEntity);
    }
    
        //
        // move entity
        //
    
    moveComplex(map,entityList,dist,extraAngle,bump,flying,clipping)
    {
        var angY=this.angle.y+extraAngle;
        
            // get the move to point
            
        this.movePt.setFromValues(0.0,0.0,dist);
        this.movePt.rotateY(null,angY);
        
            // flying
            
        if (flying) {
            this.movePt.y=-(20*this.angle.x);
            if (dist<0) this.movePt.y=-this.movePt.y;
        }
        
            // if clipping on
            
        if (clipping) {
            this.position.addPoint(this.movePt);
            return;
        }
        
            // run the collision which
            // will return a new move direction
            // if it's the same as the original or
            // there's been a bump, move it, otherwise,
            // try sliding
            
        this.collision.moveObjectInMap(map,entityList,this,this.movePt,bump,this.collideMovePt);
        if ((this.collideMovePt.equals(this.movePt)) || (this.collideMovePt.y!==0)) {
            this.position.addPoint(this.collideMovePt);
            return;
        }
        
            // try to slide
            
        this.slidePt.setFromValues(this.movePt.x,0.0,0.0);
        
        this.collision.moveObjectInMap(map,entityList,this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
        this.slidePt.setFromValues(0.0,0.0,this.movePt.z);
        
        this.collision.moveObjectInMap(map,entityList,this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPoint(this.collideMovePt);
    }
    
    moveSimple(map,entityList,dist,bump)
    {
        this.movePt.setFromValues(0.0,0.0,dist);
        this.movePt.rotateY(null,this.angle.y);
            
        this.collision.moveObjectInMap(map,entityList,this,this.movePt,bump,this.collideMovePt);
        if (!this.collideMovePt.equals(this.movePt)) return(true);
        
        this.position.addPoint(this.collideMovePt);
        return(false);
    }
    
    moveDirect(x,y,z)
    {
        this.position.move(x,y,z);
    }
    
        //
        // falling
        //
        
    fall(map)
    {        
        this.fallSpeed+=this.gravity;
        this.gravity+=2;
        if (this.gravity>25) this.gravity=25;       // supergumba -- there's a lot of made-up numbers here, need to be real numbers in the future
        
        var yChange=this.fallSpeed;
        
        if (yChange>=0) {
            if (yChange===0) yChange=10;        // always try to fall
            if (yChange>500) yChange=500;
        
            var fallY=this.collision.fallObjectInMap(map,this.position,this.radius,yChange);
            this.position.move(0,fallY,0);
        
            if (fallY<=0) {
                this.fallSpeed=0;
                this.gravity=0;
            }
        }
        else {
            this.position.move(0,yChange,0);
        }
    }
    
    isFalling()
    {
        return(this.fallSpeed>0);
    }
    
        //
        // turn (y angle)
        //

    turn(addAngle)
    {
        this.angle.y+=addAngle;
        if (this.angle.y<0.0) this.angle.y+=360.0;
        if (this.angle.y>=360.00) this.angle.y-=360.0;
    }
    
    turnTowards(toY,speed)
    {
        var subway,addway;
        
        if (this.angle.y===toY) return;
	
            // which way is faster?
	
	if (this.angle.y>toY) {
            subway=this.angle.y-toY;
            addway=360.0-(this.angle.y-toY);
	}
	else {
            subway=360.0-(toY-this.angle.y);
            addway=toY-this.angle.y;
	}
		
            // now turn
		
	if (subway<addway) {
            if (subway>speed) subway=speed;
            this.turn(-subway);
	}
        else {
            if (addway>speed) addway=speed;
            this.turn(addway);
        }
    }
    
        //
        // look (x angle)
        //

    look(addAngle)
    {
        this.angle.x+=addAngle;
        if (this.angle.x<-80.0) this.angle.x=-80.0;
        if (this.angle.x>=80.0) this.angle.x=80.0;
    }
    
        //
        // run entity
        //
        
    run(view,soundList,map,entityList)
    {
    }
    
        //
        // frustum checks
        //
        
    inFrustum(view)
    {
        this.xFrustumBound.setFromValues((this.position.x-this.radius),(this.position.x+this.radius));
        this.yFrustumBound.setFromValues(this.position.y,(this.position.y-this.high));
        this.zFrustumBound.setFromValues((this.position.z-this.radius),(this.position.z+this.radius));

        return(view.boundBoxInFrustum(this.xFrustumBound,this.yFrustumBound,this.zFrustumBound));
    }
    
        //
        // draw entity
        //
        
    drawStart(view)
    {
        this.model.drawStart(view);
    }

    drawEnd(view)
    {
        this.model.drawEnd(view);
    }

    draw(view)
    {
            // either update skeleton and create
            // vertices or just move to current position
            // and angle
            
        if (this.model.skeleton!==null) {
            this.model.skeleton.animate(view);
            this.model.mesh.updateVertexesToPoseAndPosition(view,this.model.skeleton,this.angle,this.position);
        }
        else {
            this.model.mesh.updateVertexesToAngleAndPosition(view,this.angle,this.position);
        }
        
            // draw the model
            
        this.model.draw(view);
    }
    
    
}
