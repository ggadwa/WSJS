import PointClass from '../utility/point.js';
import MoveClass from '../map/move.js';

//
// movement class
//

export default class MovementClass
{
    constructor(meshIdxList,rotateOffset,looping,approachDistance)
    {
        this.meshIdxList=meshIdxList;
        this.rotateOffset=rotateOffset;
        this.looping=looping;
        this.approachDistance=approachDistance;
        
        this.currentMoveIdx=0;
        this.nextMoveNextTick=0;
        
        this.moving=looping;            // looping movements are always moving
        
        this.originalCenterPnt=null;
        
        this.movePnt=new PointClass(0,0,0);
        this.nextMovePnt=new PointClass(0,0,0);
        this.lastMovePnt=new PointClass(0,0,0);
        
        this.rotateAng=new PointClass(0,0,0);
        this.nextRotateAng=new PointClass(0,0,0);
        this.lastRotateAng=new PointClass(0,0,0);
        
        this.moves=[];
        
        this.y=0;
    }
    
    addMove(move)
    {
        this.moves.push(move);
    }
    
    run(view,map)
    {
        let n,nMesh;
        let mesh,isOpen,prevIdx;
        let f,move;
        
            // skip if no moves
            
        if (this.moves.length===0) return;
        
            // the mesh count
            
        nMesh=this.meshIdxList.length;
        
            // the first time we run, we grab the
            // current center point for all meshes
            // because a big movement can change the distance
            
        if (this.originalCenterPnt===null) {
            
            this.originalCenterPnt=new PointClass(0,0,0);
            
            for (n=0;n!==nMesh;n++) {
                mesh=map.meshList.get(this.meshIdxList[n]);
                this.originalCenterPnt.addPoint(mesh.center);
            }
            
            this.originalCenterPnt.x=Math.trunc(this.originalCenterPnt.x/nMesh);
            this.originalCenterPnt.y=Math.trunc(this.originalCenterPnt.y/nMesh);
            this.originalCenterPnt.z=Math.trunc(this.originalCenterPnt.z/nMesh);
        }
        
            // if not looping, then do approach disance
            // if not already moving
            
        if (!this.looping) {
            
            if (!this.moving) {
                isOpen=(this.originalCenterPnt.distance(map.entityList.getPlayer().position)<this.approachDistance);
                
                if (isOpen) {
                    if (this.currentMoveIdx===1) return;
                    this.currentMoveIdx=1;
                }
                else {
                    if (this.currentMoveIdx===0) return;
                    this.currentMoveIdx=0;
                }
                
                this.moving=true;
                this.nextMoveNextTick=view.timestamp+this.moves[this.currentMoveIdx].lifeTick;
            }
            else {
                
                    // check if we've finished, and make sure
                    // the movement lands on the final spot
            
                if (this.nextMoveNextTick<view.timestamp) {
                    this.nextMoveNextTick=view.timestamp;
                    this.moving=false;
                }
            }
        }
        
            // looping movements
            
        else {
        
                // next view

            if (this.nextMoveNextTick<view.timestamp) {
                this.currentMoveIdx++;
                if (this.currentMoveIdx>=this.moves.length) this.currentMoveIdx=0;

                this.nextMoveNextTick=view.timestamp+this.moves[this.currentMoveIdx].lifeTick;
            }
        }
        
            // the next offset we need to move to
            // is between the previous and the next point
            
        move=this.moves[this.currentMoveIdx];
        f=1.0-((this.nextMoveNextTick-view.timestamp)/move.lifeTick);
        
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
        
        for (n=0;n!==nMesh;n++) {
            mesh=map.meshList.get(this.meshIdxList[n]);
            if (!this.movePnt.isZero()) mesh.move(this.movePnt);
            if (!this.rotateAng.isZero()) mesh.rotate(this.rotateAng,this.rotateOffset);
            map.entityList.movementPush(this.meshIdxList[n],this.movePnt);
        }
    }
}
