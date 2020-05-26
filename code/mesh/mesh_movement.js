import PointClass from '../utility/point.js';
import MeshClass from '../mesh/mesh.js';
import MeshMoveClass from '../mesh/mesh_move.js';

//
// movement class
//

export default class MeshMovementClass
{
    constructor(core,mesh,rotateOffset)
    {
        this.MOVEMENT_PAUSE_NONE=0;
        this.MOVEMENT_PAUSE_TRIGGER=1;
        this.MOVEMENT_PAUSE_APPROACH=2;
        this.MOVEMENT_PAUSE_LEAVE=3;
        this.MOVEMENT_PAUSE_STOP=4;
    
        this.core=core;
        this.mesh=mesh;
        this.rotateOffset=rotateOffset;
        
        this.reverseRotateOffet=new PointClass(-this.rotateOffset.x,-this.rotateOffset.x,-this.rotateOffset.z);
        
        this.currentMoveIdx=0;
        this.nextMoveNextTick=0;
        this.stopped=false;
        
        this.originalCenterPnt=null;
        
        this.movePnt=new PointClass(0,0,0);
        this.nextMovePnt=new PointClass(0,0,0);
        this.lastMovePnt=new PointClass(0,0,0);
        
        this.rotateAng=new PointClass(0,0,0);
        this.nextRotateAng=new PointClass(0,0,0);
        this.lastRotateAng=new PointClass(0,0,0);
        
        this.moves=[];
    }
    
    lookupPauseType(pauseName)
    {
        if (pauseName==='trigger') return(this.MOVEMENT_PAUSE_TRIGGER);
        if (pauseName==='approach') return(this.MOVEMENT_PAUSE_APPROACH);
        if (pauseName==='leave') return(this.MOVEMENT_PAUSE_LEAVE);
        if (pauseName==='stop') return(this.MOVEMENT_PAUSE_STOP);
        return(this.MOVEMENT_PAUSE_NONE);
    }
    
    addMove(move)
    {
        this.moves.push(move);
    }
    
    run()
    {
        let paused,nextIdx,prevIdx,needPush;
        let f,move;
        
            // skip if no moves or we
            // are permanently stopped
            
        if (this.stopped) return;
        if (this.moves.length===0) return;
        
            // the first time we run, we grab the
            // current center point for the mesh
            // because a big movement can change the distance
            
        if (this.originalCenterPnt===null) this.originalCenterPnt=this.mesh.center.copy();
        
            // are we moving to another movement?
            
        if (this.nextMoveNextTick<this.core.timestamp) {
            
            nextIdx=this.currentMoveIdx+1;
            if (nextIdx>=this.moves.length) nextIdx=0;
            
                // should we pause?
            
            paused=false;
            move=this.moves[nextIdx];
            
            switch (move.pauseType) {
                case this.MOVEMENT_PAUSE_TRIGGER:
                    paused=!this.core.checkTrigger(move.pauseData);
                    break;
                case this.MOVEMENT_PAUSE_APPROACH:
                    paused=(this.originalCenterPnt.distance(this.core.map.entityList.getPlayer().position)>move.pauseData);
                    break;
                case this.MOVEMENT_PAUSE_LEAVE:
                    paused=(this.originalCenterPnt.distance(this.core.map.entityList.getPlayer().position)<move.pauseData);
                    break;
                case this.MOVEMENT_PAUSE_STOP:
                    paused=true;
                    this.stopped=true;      // do one last move to line up with end, and then this movement permanently stops
                    break;
            }
            
                // if paused, make sure we are at end of
                // current move, otherwise switch
            
            if (paused) {
                this.nextMoveNextTick=this.core.timestamp;
            }
            else {
                this.currentMoveIdx=nextIdx;
                this.nextMoveNextTick=this.core.timestamp+this.moves[this.currentMoveIdx].lifeTick;
                
                    // set any trigger or sound
                    
                if (move.triggerName!==null) this.core.setTrigger(move.triggerName);
                if (move.sound!==null) this.core.soundList.playJson(this.mesh.center,move.sound);
            }
        }
        
            // if we aren't moving to another movement
            // then always clear any trigger
            
        else {
            move=this.moves[this.currentMoveIdx];
            if (move.triggerName!==null) this.core.clearTrigger(move.triggerName);
        }
            
            // the next offset we need to move to
            // is between the previous and the next point
            
        move=this.moves[this.currentMoveIdx];
        
        f=1.0-((this.nextMoveNextTick-this.core.timestamp)/move.lifeTick);
        
        prevIdx=this.currentMoveIdx;
        prevIdx--;
        if (prevIdx<0) prevIdx=this.moves.length-1;
        
        this.nextMovePnt.tween(this.moves[prevIdx].movePnt,move.movePnt,f);
        this.nextMovePnt.trunc();         // stops these calculations from messing with the collisions because of float slop
        
        this.nextRotateAng.tween(this.moves[prevIdx].rotateAngle,move.rotateAngle,f);
        
            // moves and rotates are changes from last move
            
        this.movePnt.setFromSubPoint(this.nextMovePnt,this.lastMovePnt);
        this.lastMovePnt.setFromPoint(this.nextMovePnt);
        
        this.rotateAng.setFromSubPoint(this.nextRotateAng,this.lastRotateAng);
        this.lastRotateAng.setFromPoint(this.nextRotateAng);
        
            // do the moves
            
            // we set a moving flag here because bots need to
            // detect if they are on moving platforms and pause
        
        needPush=false;

        if (!this.movePnt.isZero()) {
            needPush=true;
            this.mesh.move(this.movePnt);
        }

        if (!this.rotateAng.isZero()) {
            needPush=true;
            this.mesh.rotate(this.rotateAng,this.rotateOffset);
        }

        if (needPush) this.core.map.entityList.meshPush(this.mesh,this.movePnt,this.rotateAng);
    }
}
