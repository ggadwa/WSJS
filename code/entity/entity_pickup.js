import PointClass from '../utility/point.js';
import EntityClass from '../game/entity.js';

export default class EntityPickupClass extends EntityClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.passThrough=true;           // can pass through
        
        this.originalY=0;
        this.hideStartTick=0;
        this.hideTick=0;
        this.pickupOnce=false;
        this.spinTick=0;
        this.floatMove=0;
        this.randomPosition=false;
        this.randomPositionAdd=null;
        this.randomPositionOffset=null;
        
        this.idleAnimation=null;
        this.pickupSound=null;
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.hideTick=this.core.game.lookupValue(this.json.config.hideTick,this.data,0);
        this.pickupOnce=this.core.game.lookupValue(this.json.config.pickupOnce,this.data,false);
        this.spinTick=this.core.game.lookupValue(this.json.config.spinTick,this.data,0);
        this.floatMove=this.core.game.lookupValue(this.json.config.floatMove,this.data,0);
        
        this.randomPosition=this.core.game.lookupValue(this.json.config.randomPosition,this.data,false);
        this.randomPositionAdd=new PointClass(this.json.config.randomPositionAdd.x,this.json.config.randomPositionAdd.y,this.json.config.randomPositionAdd.z);
        this.randomPositionOffset=new PointClass(this.json.config.randomPositionOffset.x,this.json.config.randomPositionOffset.y,this.json.config.randomPositionOffset.z);
        
        this.idleAnimation=this.core.game.lookupAnimationValue(this.json.animations.idleAnimation);
        this.pickupSound=this.core.game.lookupSoundValue(this.json.sounds.pickupSound);
        
        return(true);
    }
    
    ready()
    {
        super.ready();
        
        if (this.idleAnimation!==null) this.modelEntityAlter.startAnimationChunkInFrames(this.idleAnimation);
        
        if (this.randomPosition) this.setRandomPosition();
        
        this.hideStartTick=0;
        this.originalY=this.position.y;
    }
    
    setRandomPosition()
    {
        let node;
        let nodes=this.core.game.map.path.nodes;
        
        node=nodes[Math.trunc(nodes.length*Math.random())];
        
        this.position.setFromPoint(node.position);
        this.position.addPoint(this.randomPositionAdd);
        
        this.position.x+=(((Math.random()*2.0)-1.0)*this.randomPositionOffset.x);
        this.position.y+=(((Math.random()*2.0)-1.0)*this.randomPositionOffset.y);
        this.position.z+=(((Math.random()*2.0)-1.0)*this.randomPositionOffset.z);
    }
        
    run()
    {
        super.run();
        
            // if hidden, count down to show
            
        if (!this.show) {
            if (this.pickupOnce) return;
            
            if (this.core.game.timestamp<(this.hideStartTick+this.hideTick)) return;
            
            this.touchEntity=null;          // clear any touches
            this.show=true;
            
            if (this.randomPosition) {
                this.setRandomPosition();
                this.originalY=this.position.y;     // need to reset floating position
            }
        }
        
            // animation
            
        if (this.spinTick!==0) {
            if (this.floatMove!==0) this.position.y=this.originalY+this.core.game.getPeriodicCos(this.spinTick,this.floatMove);
            this.angle.y=this.core.game.getPeriodicLinear(this.spinTick,360);
        }
        
            // check for collisions
            
        if (this.touchEntity===null) return;
        
            // only trigger for entities that can do
            // all the required actions
            
        if (!this.hasActions(this.touchEntity,this.json.config.actions)) return;
        
            // pickup and run actions
            
        this.show=false;
        this.hideStartTick=this.core.game.timestamp;
        
        this.core.audio.soundStartGame(this.core.game.map.soundList,this.position,this.pickupSound);
        
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

