"use strict";

//
// weapon class
//

class WeaponClass
{
    constructor(model,projectile)
    {
        this.model=model;
        this.projectiles=[];

        this.lastFireTimeStamp=0;

        this.handOffset=new wsPoint(0,0,0);     // global to stop GCd
        this.handAngle=new wsPoint(0,0,0);
        
        Object.seal(this);
    }
    
        //
        // projectiles
        //
    
    addProjectile(projectile)
    {
        this.projectiles.push(projectile);
    }
    
        //
        // fire weapon
        //
        
    fire(view,entityList,entity)
    {
            // time to fire again?
            
        if (view.timeStamp<this.lastFireTimeStamp) return;
        
        this.lastFireTimeStamp=view.timeStamp+1000;
        
            // create projectile
            
        var ang=new wsPoint(0,0,0);
        ang.setFromPoint(entity.angle);
        
        var pos=new wsPoint(0,0,4000);      // supergumba -- all this is hardcoded!
        pos.rotate(ang);
        pos.addPoint(entity.position);
        pos.y-=2000;        // supergumba -- all this is hardcoded!
        
        this.projectiles[0].fire(view,entityList,pos,ang);
    }
    
        //
        // draw weapon
        //

    drawStart(view)
    {
        this.model.drawStart(view);
    }

    drawEnd(view)
    {
        this.model.drawEnd(view);
    }

    draw(view,entity)
    {
        var pos=entity.position;
        var angle=entity.angle;
        
            // get new position
            
        this.handOffset.setFromValues(0,0,2500);      // supergumba -- all this is hardcoded!
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
    }

}
