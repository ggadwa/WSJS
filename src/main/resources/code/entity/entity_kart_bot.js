import PointClass from '../utility/point.js';
import Entity from '../game/entity.js';
import EntityKartBaseClass from '../entity/entity_kart_base.js';

//
// kart bot module
//

export default class EntityKartBotClass extends EntityKartBaseClass
{
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.targetScanYRange=0;
        this.maxFireDistance=0;
        this.minFireDistance=0;
        this.fireWaitTick=0;
        
            // variables
            
        this.currentTargetYScan=0;
        this.nextFireTick=0;
        
            // pre-allocates
            
        this.lookPoint=new PointClass(0,0,0);
        this.lookVector=new PointClass(0,0,0);
        this.lookHitPoint=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
            // bot specific json
            
        this.targetScanYRange=this.core.game.lookupValue(this.json.config.targetScanYRange,this.data,0);
        this.maxFireDistance=this.core.game.lookupValue(this.json.config.maxFireDistance,this.data,0);
        this.minFireDistance=this.core.game.lookupValue(this.json.config.minFireDistance,this.data,0);
        this.fireWaitTick=this.core.game.lookupValue(this.json.config.fireWaitTick,this.data,0);

        return(true);
    }
    
        //
        // ready
        //
        
    ready()
    {
        super.ready();
        
            // setup the path
            
        this.trackOffsetSetup();
        this.pathSetup(1);
        
            // start scanning in middle
            
        this.currentTargetYScan=Math.trunc(this.targetScanYRange*0.5);
        
            // can fire at any time
            
        this.nextFireTick=this.core.game.timestamp;
    }
    
        //
        // find monster to fire at
        //
        
    checkFire()
    {
            // is it time to fire?
        
        if (this.core.game.timestamp<this.nextFireTick) return(false);
        
            // ray trace for entities
            // we do one look angle per tick
            
        this.lookPoint.setFromPoint(this.position);
        this.lookPoint.y+=this.eyeOffset;
        
        this.lookVector.setFromValues(0,0,this.maxFireDistance);
        this.lookVector.rotateY(null,(this.angle.y+(this.currentTargetYScan-Math.trunc(this.targetScanYRange*0.5))));
        
        this.currentTargetYScan++;
        if (this.currentTargetYScan>=this.targetScanYRange) this.currentTargetYScan=0;
        
        if (!this.rayCollision(this.lookPoint,this.lookVector,this.lookHitPoint)) return(false);
        
            // have we hit a kart entity, and right distance to fire?
            
        if (this.hitEntity===null) return(false);
        if (!(this.hitEntity instanceof EntityKartBaseClass)) return(false);
        if (this.hitEntity.position.distance(this.position)<this.minFireDistance) return(false);
        
        this.nextFireTick=this.core.game.timestamp+this.fireWaitTick;
        return(true);
    }
    
        //
        // run bot kart
        //
        
    run()
    {
        let turnAdd,ang,drifting,brake;
        
        super.run();

            // skip if AI is frozen
            
        if (this.core.game.freezeAI) return;
        
            // run the kart base
        
        super.run();
        
            // run the path
            
        this.pathRun();
        
            // turn towards the position
            // and figure out if we need to drift or break
        
        turnAdd=this.angle.getTurnYTowards(this.position.angleYTo(this.gotoPosition));
        
        ang=Math.abs(turnAdd);
        brake=(ang>=this.brakeMinAngle);
        drifting=brake?false:(ang>this.driftMinAngle);
        
            // run the kart
            
        this.moveKart(turnAdd,true,false,drifting,brake,this.checkFire(),false);
    }
}

