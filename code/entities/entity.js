"use strict";

//
// entity base class
//

function EntityObject(name,position,angle,radius,high,model)
{
    this.name=name;
    this.position=position;
    this.angle=angle;
    this.radius=radius;
    this.high=high;
    this.model=model;
    
    this.id=-1;
    
    this.turnSpeed=0;
    this.lookSpeed=0;
    this.forwardSpeed=0;
    this.sideSpeed=0;
    this.verticalSpeed=0;
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

    this.collision=new CollisionObject();
    
        //
        // getters -- supergumba -- replace these with real getters!
        //
    
    this.getName=function()
    {
        return(this.name);
    };
    
    this.getModel=function()
    {
        return(this.model);
    };
        
    this.getPosition=function()
    {
        return(this.position);
    };
    
    this.getAngle=function()
    {
        return(this.angle);
    };
    
    this.getRadius=function()
    {
        return(this.radius);
    };
    
    this.getHigh=function()
    {
        return(this.high);
    };
    
        //
        // IDs
        //
        
    this.setId=function(id)
    {
        this.id=id;
    };
    
    this.getId=function()
    {
        return(this.id);
    };
    
        //
        // deleting
        //
        
    this.markAsDelete=function()
    {
        this.markedForDeletion=true;
    };
    
    this.isMarkedForDeletion=function()
    {
        return(this.markedForDeletion);
    };
    
        //
        // touching
        //
        
    this.clearTouchEntity=function()
    {
        this.touchEntity=null;
    };
    
    this.setTouchEntity=function(entity)
    {
        this.touchEntity=entity;
    };
    
    this.getTouchEntity=function()
    {
        return(this.touchEntity);
    };
    
        //
        // bumping
        //
        
    this.canBump=function()
    {
        return(true);
    };
    
        //
        // move entity
        //
    
    this.moveComplex=function(map,entityList,dist,extraAngle,flying,clipping)
    {
        var angY=this.angle.y+extraAngle;
        
            // get the move to point
            
        this.movePt.set(0.0,0.0,dist);
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
            
        this.collision.moveObjectInMap(map,entityList,this,this.movePt,this.canBump(),this.collideMovePt);
        if ((this.collideMovePt.equals(this.movePt)) || (this.collideMovePt.y!==0)) {
            this.position.addPoint(this.collideMovePt);
            return;
        }
        
            // try to slide
            
        this.slidePt.set(this.movePt.x,0.0,0.0);
        
        this.collision.moveObjectInMap(map,entityList,this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
        this.slidePt.set(0.0,0.0,this.movePt.z);
        
        this.collision.moveObjectInMap(map,entityList,this,this.slidePt,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPoint(this.collideMovePt);
    };
    
    this.moveSimple=function(map,entityList,dist)
    {
        this.movePt.set(0.0,0.0,dist);
        this.movePt.rotateY(null,angle.y);
            
        this.collision.moveObjectInMap(map,entityList,this,this.movePt,this.canBump(),this.collideMovePt);
        if (!this.collideMovePt.equals(this.movePt)) return(true);
        
        this.position.addPoint(this.collideMovePt);
        return(false);
    };
    
    this.moveDirect=function(x,y,z)
    {
        this.position.move(x,y,z);
    };
    
        //
        // falling
        //
        
    this.fall=function()
    {
        this.fallSpeed+=this.gravity;
        this.gravity+=2;
        if (this.gravity>25) this.gravity=25;
        
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
    
    this.turnTowards=function(toY,speed)
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
        
    this.run=function(view,map,entityList)
    {
    };
    
        //
        // frustum checks
        //
        
    this.inFrustum=function(view)
    {
        this.xFrustumBound.set((this.position.x-this.radius),(this.position.x+this.radius));
        this.yFrustumBound.set(this.position.y,(this.position.y-this.high));
        this.zFrustumBound.set((this.position.z-this.radius),(this.position.z+this.radius));

        return(view.boundBoxInFrustum(this.xFrustumBound,this.yFrustumBound,this.zFrustumBound));
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
            // either update skeleton and create
            // vertices or just move to current position
            // and angle
            
        if (this.model.skeleton!==null) {
            this.model.skeleton.randomPose(view,this.model.modelType);
            this.model.skeleton.animate(view);
            this.model.mesh.updateVertexesToPoseAndPosition(view,this.model.skeleton,this.angle,this.position);
        }
        else {
            this.model.mesh.updateVertexesToAngleAndPosition(view,this.angle,this.position);
        }
        
            // draw the model
            
        this.model.draw(view);
    };
    
    
}
