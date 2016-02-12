"use strict";

//
// weapon class
//

function WeaponObject(model)
{
    this.model=model;
    
    this.handOffset=new wsPoint(0,0,0);
    this.handAngle=new wsPoint(0,0,0);
    
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
            // get new position
            
        this.handOffset.set(0,0,2500);      // supergumba -- all this is hardcoded!
        this.handOffset.rotate(entity.angle);
        this.handOffset.addPoint(entity.position);
        
        this.handOffset.y-=1000;        // supergumba -- all this is hardcoded!
        
            // and rotational angle
            
        this.handAngle.setFromPoint(entity.angle);
        this.handAngle.x=(-this.handAngle.x)-15.0;
        this.handAngle.y+=180.0;
       
            // move vertexes to reflect
            // angle and offset of weapon
            
        this.model.mesh.updateVertexesToAngleAndPosition(view,this.handAngle,this.handOffset);
        
            // draw the model
            
        this.model.draw(view);
    };

}
