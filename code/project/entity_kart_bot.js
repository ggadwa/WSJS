import PointClass from '../utility/point.js';
import Entity from '../project/entity.js';
import EntityKartBaseClass from '../project/entity_kart_base.js';

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

        this.pathNodeSlop=0;
        this.driftMinAngle=0;
        
            // variables
            
        this.trackZOffset=0;
        this.nextNodeIdx=-1;
        
        this.currentTargetYScan=0;
        this.nextFireTick=0;
        
            // pre-allocates
            
        this.gotoRotPoint=new PointClass(0,0,0);
        this.gotoPosition=new PointClass(0,0,0);
        
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

        this.pathNodeSlop=this.core.game.lookupValue(this.json.config.pathNodeSlop,this.data,0);
        this.driftMinAngle=this.core.game.lookupValue(this.json.config.driftMinAngle,this.data,0);
        
        return(true);
    }
    
        //
        // ready
        //
        
    ready()
    {
        let goalPosition;
        
        super.ready();
        
            // we assume all maps have the starting direction
            // heading -x, so we get the Z distance and that
            // makes our track when turned 90 degrees from
            // the node path
            
        goalPosition=this.getNodePosition(this.goalNodeIdx);
        this.trackZOffset=goalPosition.z-this.position.z;
        
            // always start by going to node directly after goal
            
        this.nextNodeIdx=this.goalNodeIdx+1;
        this.calcGotoPosition(this.goalNodeIdx,this.nextNodeIdx);
        
            // start scanning in middle
            
        this.currentTargetYScan=Math.trunc(this.targetScanYRange*0.5);
        
            // can fire at any time
            
        this.nextFireTick=this.core.timestamp;
    }
    
        //
        // calc the goto position from the
        // next node and the track offset
        //
        
    calcGotoPosition(fromNodeIdx,toNodeIdx)
    {
        let angY;
        
            // get direction of driving,
            // add in 90 degrees and then rotate
            // the offset
            
        angY=this.getNodePosition(fromNodeIdx).angleYTo(this.getNodePosition(toNodeIdx))+90;
        if (angY>360.0) angY-=360.0;
        
        this.gotoRotPoint.setFromValues(0,0,this.trackZOffset);
        this.gotoRotPoint.rotateY(null,angY);
        
        this.gotoPosition.setFromAddPoint(this.getNodePosition(toNodeIdx),this.gotoRotPoint);
    }
    
        //
        // find monster to fire at
        //
        
    checkFire()
    {
            // is it time to fire?
        
        if (this.core.timestamp<this.nextFireTick) return(false);
        
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
        
        this.nextFireTick=this.core.timestamp+this.fireWaitTick;
        return(true);
    }
    
        //
        // run bot kart
        //
        
    run()
    {
        let turnAdd,drifting;
        let fromNodeIdx;
        
        super.run();
        
            // have we hit the next drive to position?
            
        if (this.position.distance(this.gotoPosition)<this.pathNodeSlop) {
            fromNodeIdx=this.nextNodeIdx;
            
            if (this.getNodeKey(this.nextNodeIdx)==='end') {
                this.nextNodeIdx=this.findKeyNodeIndex('goal');
            }
            else {
                this.nextNodeIdx++;
            }
            
            this.calcGotoPosition(fromNodeIdx,this.nextNodeIdx);
        }
        
            // scan for other karts
            
        //this.scan();

            // turn towards the position
        
        turnAdd=this.angle.getTurnYTowards(this.position.angleYTo(this.gotoPosition));
        drifting=false; // (Math.abs(turnAdd)>this.driftMinAngle);
        
            // run the kart
            
        this.moveKart(turnAdd,true,false,drifting,false,this.checkFire(),false);
    }
}

