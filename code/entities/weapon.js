import wsPoint from '../../code/utility/point.js';
import view from '../../code/main/view.js';

//
// weapon class
//

export default class WeaponClass
{
    constructor(model)
    {
        this.model=model;
        this.projectiles=[];

        this.lastFireTimeStamp=0;

        this.handOffset=new wsPoint(0,0,0);     // global to stop GCd
        this.handAngle=new wsPoint(0,0,0);
        this.fireAngle=new wsPoint(0,0,0);
        this.firePos=new wsPoint(0,0,0);
        
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
        
    fire(entity)
    {
            // time to fire again?
            
        if (view.timeStamp<this.lastFireTimeStamp) return;
        
        this.lastFireTimeStamp=view.timeStamp+1000;
        
            // create projectile
            
        this.fireAngle.setFromPoint(entity.angle);
        
        this.firePos.setFromValues(0,0,4000);      // supergumba -- all this is hardcoded!
        this.firePos.rotate(this.fireAngle);
        this.firePos.addPoint(entity.position);
        this.firePos.y-=2000;        // supergumba -- all this is hardcoded!
        
        this.projectiles[0].fire(entity.id,this.firePos,this.fireAngle);
    }
    
        //
        // draw weapon
        //

    drawStart()
    {
        this.model.drawStart();
    }

    drawEnd()
    {
        this.model.drawEnd();
    }

    draw(entity)
    {
        let pos=entity.position;
        let angle=entity.angle;
        
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
            
        this.model.mesh.updateVertexesToAngleAndPosition(this.handAngle,this.handOffset);
        
            // draw the model
            
        this.model.draw();
    }

}
