import PointClass from '../../code/utility/point.js';

//
// weapon class
//

export default class WeaponClass
{
    constructor(view,model,name)
    {
        this.view=view;
        this.model=model;
        this.name=name;
        
        this.projectile=null;
        this.altProjectile=null;

        this.lastFireTimestamp=0;

        this.handOffset=new PointClass(0,0,0);     // global to stop GCd
        this.handAngle=new PointClass(0,0,0);
        this.fireAngle=new PointClass(0,0,0);
        this.firePos=new PointClass(0,0,0);
        
        this.displayStr='';         // todo -- probably temp, but pre-create so we don't realloc this a lot
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
        this.model.initialize();
    }
    
    release()
    {
        this.model.release();
    }
    
        //
        // player display purposes
        //
        
    setName(name)
    {
        this.name=name;
    }
    
        //
        // projectiles
        //
    
    setProjectile(projectile)
    {
        this.projectile=projectile;
    }
    
    setAltProjectile(altProjectile)
    {
        this.altProjectile=altProjectile;
    }
    
        //
        // weapon display strings
        //
        
    getWeaponDisplayString()            // todo -- this is probably all temporary for now
    {
        this.displayStr=this.name;
        
        if (this.projectile!=null) this.displayStr+=(' | '+20);
        if (this.altProjectile!=null) this.displayStr+=(' | '+40);
        
        return(this.displayStr);
    }
    
        //
        // fire weapon
        //
        
    fire(entity)
    {
            // time to fire again?
            
        if (this.view.timestamp<this.lastFireTimestamp) return;
        
        this.lastFireTimestamp=this.view.timestamp+1000;
        
            // create projectile
            
        this.fireAngle.setFromPoint(entity.angle);
        
        this.firePos.setFromValues(0,0,4000);      // supergumba -- all this is hardcoded!
        this.firePos.rotate(this.fireAngle);
        this.firePos.addPoint(entity.position);
        this.firePos.y-=2000;        // supergumba -- all this is hardcoded!
        
        this.projectile.fire(entity.id,this.firePos,this.fireAngle);
    }
    
    altFire(entity)
    {
            // time to fire again?
            
        if (this.view.timestamp<this.lastFireTimestamp) return;
        
        this.lastFireTimestamp=this.view.timestamp+1000;
        
            // create projectile
            
        this.fireAngle.setFromPoint(entity.angle);
        
        this.firePos.setFromValues(0,0,4000);      // supergumba -- all this is hardcoded!
        this.firePos.rotate(this.fireAngle);
        this.firePos.addPoint(entity.position);
        this.firePos.y-=2000;        // supergumba -- all this is hardcoded!
        
        this.altProjectile.fire(entity.id,this.firePos,this.fireAngle);
    }
    
        //
        // draw weapon
        //

    draw(entity)
    {
        let pos=entity.position;
        let angle=entity.angle;
        
            // get new position
            
        this.handOffset.setFromValues(0,0,80000);      // supergumba -- all this is hardcoded!
        this.handOffset.rotate(angle);
        this.handOffset.addPoint(pos);
        
        this.handOffset.y-=1000;        // supergumba -- all this is hardcoded!
        
            // and rotational angle
            
        this.handAngle.setFromPoint(angle);
        this.handAngle.x=(-this.handAngle.x)-15.0;
        //this.handAngle.y+=180.0;
        this.handAngle.y+=20;
       
            // move vertexes to reflect
            // angle and offset of weapon
            
        this.model.drawMesh.updateVertexesToAngleAndPosition(this.handAngle,this.handOffset);
        
            // draw the model
            
        this.model.draw();
    }

}
