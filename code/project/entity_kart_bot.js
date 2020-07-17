import PointClass from '../utility/point.js';
import Entity from '../project/entity.js';
import EntityKartBaseClass from '../project/entity_kart_base.js';

//
// kart bot module
//

export default class EntityKartBotClass extends EntityKartBaseClass
{
    /*
    constructor(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show)
    {
        super(core,name,jsonName,position,angle,data,mapSpawn,spawnedBy,heldBy,show);
        
        this.targetScanYRange=0;
        
            // variables
            
        this.trackZOffset=0;
        this.nextNodeIdx=-1;
        
        this.currentTargetYScan=0;
        
            // pre-allocates
            
        this.gotoRotPoint=new PointClass(0,0,0);
        this.gotoPosition=new PointClass(0,0,0);
        
        Object.seal(this);
    }
    
    initialize()
    {
        if (!super.initialize()) return(false);
        
        this.targetScanYRange=this.core.game.lookupValue(this.json.targetScanYRange,this.data,0);
        
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
        this.trackZOffset=this.position.z-goalPosition.z;
        
            // always start by going to node directly after goal
            
        this.nextNodeIdx=this.goalNodeIdx+1;
        this.calcGotoPosition(this.goalNodeIdx,this.nextNodeIdx);
        
            // start scanning in middle
            
        this.currentTargetYScan=Math.trunc(this.targetScanYRange*0.5);
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

    checkFireAtMonster()
    {
                    // ray trace for entities
            // we do one look angle per tick
            
        this.lookPoint.setFromPoint(this.position);
        this.lookPoint.y+=Math.trunc(this.height*0.5);      // use middle instead of eye position in case other stuff is smaller
        
        this.lookVector.setFromValues(0,0,this.targetForgetDistance);
        this.lookVector.rotateY(null,(this.currentTargetYScan-Math.trunc(this.targetScanYRange*0.5)));
        
        this.currentTargetYScan++;
        if (this.currentTargetYScan>=this.targetScanYRange) this.currentTargetYScan=0;
        
        if (this.rayCollision(this.lookPoint,this.lookVector,this.lookHitPoint)) {
            if (this.hitEntity!==null) {
                //if (this.hitEntity.fighter) this.targetEntity=this.hitEntity;
            }
        }



            // ray trace for entities
            // we do one look angle per tick
            
        this.lookPoint.setFromPoint(this.position);
        this.lookPoint.y+=Math.trunc(this.height*0.5);      // use middle instead of eye position in case other stuff is smaller
        
        this.lookVector.setFromValues(0,0,this.FIRE_DISTANCE);
        this.lookVector.rotateY(null,this.TARGET_SCAN_Y_ANGLES[this.currentLookIdx]);
        
        this.currentLookIdx++;
        if (this.currentLookIdx>=this.TARGET_SCAN_Y_ANGLES.length) this.currentLookIdx=0;
        
        return(this.rayCollision(this.lookPoint,this.lookVector,this.lookHitPoint));
    }
         

    
        //
        // run bot kart
        //
        
    run()
    {
        let turnAdd,drifting;
        let fromNodeIdx;
        
        super.run();
        
        return;
        
            // have we hit the next drive to position?
            
        if (this.position.distance(this.gotoPosition)<this.NODE_SLOP) {
            fromNodeIdx=this.nextNodeIdx;
            
            if (this.getNodeKey(this.nextNodeIdx)==='end') {
                this.nextNodeIdx=this.findKeyNodeIndex('goal');
            }
            else {
                this.nextNodeIdx++;
            }
            
            this.calcGotoPosition(fromNodeIdx,this.nextNodeIdx);
        }

            // turn towards the position
        
        turnAdd=this.angle.getTurnYTowards(this.position.angleYTo(this.gotoPosition));
        drifting=(Math.abs(turnAdd)>this.DRIFT_MIN_ANGLE);
        
            // run the kart
            
        this.moveKart(turnAdd,true,false,drifting,false,this.checkFireAtMonster(),false,false);
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
         * 
     */
}

