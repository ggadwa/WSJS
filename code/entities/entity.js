"use strict";

//
// entity class
//

function EntityObject(position,angle,radius,high,model,isPlayer)
{
    this.position=position;
    this.angle=angle;
    this.radius=radius;
    this.high=high;
    this.model=model;
    this.isPlayer=isPlayer;
    
    this.weaponCurrentIndex=-1;
    this.weapons=[];
    
    this.turnSpeed=0;
    this.lookSpeed=0;
    this.forwardSpeed=0;
    this.sideSpeed=0;
    this.verticalSpeed=0;
    this.fallSpeed=0;
    this.gravity=0;
    
    this.movePt=new wsPoint(0,0,0);     // this are global to stop them being local and GC'd
    this.slidePt=new wsPoint(0,0,0);
    this.collideMovePt=new wsPoint(0,0,0);
    this.collideSlideMovePt=new wsPoint(0,0,0);
    
    this.xFrustumBound=new wsBound(0,0);
    this.yFrustumBound=new wsBound(0,0);
    this.zFrustumBound=new wsBound(0,0);

    this.collision=new CollisionObject();
    
        //
        // move forward with angle
        //
    
    this.forward=function(map,dist,extraAngle)
    {
        var angY=this.angle.y+extraAngle;
        
            // get the move to point
            
        this.movePt.set(0.0,0.0,dist);
        this.movePt.rotateY(null,angY);
        
            // flying
            
        if (PLAYER_FLY) {
            this.movePt.y=-(20*this.angle.x);
            if (dist<0) this.movePt.y=-this.movePt.y;
        }
        
            // wall clipping setting, remove later
            
        if ((PLAYER_CLIP_WALLS) && (this.isPlayer)) {
            this.position.addPoint(this.movePt);
            return;
        }
        
            // run the collision which
            // will return a new move direction
            // if it's the same as the original or
            // there's been a bump, move it, otherwise,
            // try sliding
            
        this.collision.moveObjectInMap(map,this.position,this.movePt,this.radius,this.high,true,this.collideMovePt);
        if ((this.collideMovePt.equals(this.movePt)) || (this.collideMovePt.y!==0)) {
            this.position.addPoint(this.collideMovePt);
            return;
        }
        
            // try to slide
            
        this.slidePt.set(this.movePt.x,0.0,0.0);
        
        this.collision.moveObjectInMap(map,this.position,this.slidePt,this.radius,this.high,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
        this.slidePt.set(0.0,0.0,this.movePt.z);
        
        this.collision.moveObjectInMap(map,this.position,this.slidePt,this.radius,this.high,false,this.collideSlideMovePt);
        if (this.collideSlideMovePt.equals(this.slidePt)) {
            this.position.addPoint(this.collideSlideMovePt);
            return;
        }
        
            // if nothing works, just use the
            // the original collide point
            
        this.position.addPoint(this.collideMovePt);
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
        // jump
        //
        
    this.startJump=function()
    {
        if (this.fallSpeed===0) this.fallSpeed=-300;
    };
    
        //
        // weapons
        //
        
    this.addWeapon=function(weapon)
    {
        this.weapons.push(weapon);
    };
    
    this.setCurrentWeaponIndex=function(index)
    {
        this.weaponCurrentIndex=index;
    };
    
    this.getCurrentWeapon=function()
    {
        if (this.weaponCurrentIndex===-1) return(null);
        return(this.weapons[this.weaponCurrentIndex]);
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
            // supergumba -- there's some temp calculations here, need real gravity math
        
        if (this.isPlayer) {
            if (PLAYER_FLY) return;
        }
        
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
            // supergumba -- random testing right now
            
            // create current pose
            
        this.model.skeleton.randomPose(view,this.model.modelType);
        this.model.skeleton.animate(view);
       
            // move vertexes to reflect the pose
            // and position in map
            
        this.model.mesh.updateVertexesToPoseAndPosition(view,this.model.skeleton,this.position);
        
            // draw the model
            
        this.model.draw(view);
    };
    
    
}
