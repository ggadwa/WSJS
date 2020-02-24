import PointClass from '../utility/point.js';
import ProjectEntityClass from '../project/project_entity.js';

export default class EntityPickupClass extends ProjectEntityClass
{
    constructor(core,name,json,position,angle,data)
    {
        super(core,name,json,position,angle,data);
        
        this.passThrough=true;           // can pass through
        
        this.originalY=0;
        this.hideStartTick=0;
        this.hideTick=0;
        this.pickupOnce=false;
        this.spinTick=0;
        this.floatMove=0;
        this.idleAnimation=null;
        this.pickupSound=null;
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.hideTick=this.core.game.lookupValue(this.json.config.hideTick,this.data);
        this.pickupOnce=this.core.game.lookupValue(this.json.config.pickupOnce,this.data);
        this.spinTick=this.core.game.lookupValue(this.json.config.spinTick,this.data);
        this.floatMove=this.core.game.lookupValue(this.json.config.floatMove,this.data);
        this.idleAnimation=this.json.config.idleAnimation;
        this.pickupSound=this.json.config.pickupSound;
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        if (this.idleAnimation!==null) this.modelEntityAlter.startAnimationChunkInFrames(null,30,this.idleAnimation[0],this.idleAnimation[1]);
        
        this.hideStartTick=0;
        this.originalY=this.position.y;
    }
        
    run()
    {
        super.run();
        
            // if hidden, count down to show
            
        if (!this.show) {
            if (this.pickupOnce) return;
            
            if (this.getTimestamp()<(this.hideStartTick+this.hideTick)) return;
            
            this.touchEntity=null;          // clear any touches
            this.show=true;
        }
        
            // animation
            
        if (this.spinTick!==0) {
            if (this.floatMove!==0) this.position.y=this.originalY+this.core.getPeriodicCos(this.spinTick,this.floatMove);
            this.angle.y=this.getPeriodicLinear(this.spinTick,360);
        }
        
            // check for collisions
            
        if (this.touchEntity===null) return;
        
            // can this entity pickup?
            
        if (!this.touchEntity.pickup) return;
        
            // pickup and run actions
            
        this.show=false;
        this.hideStartTick=this.getTimestamp();
        
        this.core.soundList.playJson(this,null,this.pickupSound);
        
        this.runActions(this.touchEntity,this.json.config.actions);
    }
    
    drawSetup()
    {
        if (this.model===null) return(false);
        
        this.modelEntityAlter.position.setFromPoint(this.position);
        this.modelEntityAlter.angle.setFromPoint(this.angle);
        this.modelEntityAlter.scale.setFromPoint(this.scale);
        this.modelEntityAlter.inCameraSpace=false;

        return(true);
    }
}

