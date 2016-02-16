"use strict";

//
// weapon class
//

function WeaponObject(model)
{
    this.model=model;
    
    this.lastFireTimeStamp=0;
    
    this.handOffset=new wsPoint(0,0,0);     // global to stop GCd
    this.handAngle=new wsPoint(0,0,0);
    
        //
        // fire weapon
        //
        
    this.fire=function(view,entityList,entity)
    {
            // time to fire again?
            
        if (view.timeStamp<this.lastFireTimeStamp) return;
        
        this.lastFireTimeStamp=view.timeStamp+1000;
        
            // create projectile
            
        var ang=new wsPoint(0,0,0);
        ang.setFromPoint(entity.getAngle());
        
        var pos=new wsPoint(0,0,4000);      // supergumba -- all this is hardcoded!
        pos.rotate(ang);
        pos.addPoint(entity.getPosition());
        pos.y-=2000;        // supergumba -- all this is hardcoded!
        
        entityList.add(new EntityProjectileObject(view,pos,ang,500,500,this.model));
    };
    
        //
        // draw weapon
        //

    this.drawStart=function(view)
    {
        this.model.drawStart(view);
    };

    this.drawEnd=function(view)
    {
        this.model.drawEnd(view);
    };

    this.draw=function(view,entity)
    {
        var pos=entity.getPosition();
        var angle=entity.getAngle();
        
            // get new position
            
        this.handOffset.set(0,0,2500);      // supergumba -- all this is hardcoded!
        this.handOffset.rotate(angle);
        this.handOffset.addPoint(pos);
        
        this.handOffset.y-=1000;        // supergumba -- all this is hardcoded!
        
            // and rotational angle
            
        this.handAngle.setFromPoint(angle);
        this.handAngle.x=(-this.handAngle.x)-15.0;
        this.handAngle.y+=180.0;
       
            // move vertexes to reflect
            // angle and offset of weapon
            
        this.model.mesh.updateVertexesToAngleAndPosition(view,this.handAngle,this.handOffset);
        
            // draw the model
            
        this.model.draw(view);
    };

}
