"use strict";

//
// weapon class
//

function WeaponObject(model)
{
    this.model=model;
    
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
            
        var pos=new wsPoint(0,0,3000);      // supergumba -- all this is hardcoded!
        pos.rotate(entity.angle);
        pos.addPoint(entity.position);
        
        pos.y-=1000;        // supergumba -- all this is hardcoded!
        
            // and rotational angle
            
        var ang=entity.angle.copy();
        ang.y+=180.0;
       
            // move vertexes to reflect
            // angle and offset of weapon
            
        this.model.mesh.updateVertexesToAngleAndPosition(view,ang,pos);
        
            // draw the model
            
        this.model.draw(view);
    };

}
