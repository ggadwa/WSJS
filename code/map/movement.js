/* global map, entityList, view */

"use strict";

//
// single move class
//

class MoveClass
{
    constructor(lifeTick,movePnt)
    {
        this.lifeTick=lifeTick;
        this.movePnt=movePnt;
    }
    
}

//
// movement class
//

class MovementClass
{
    constructor(meshIdx,looping,approachDistance)
    {
        this.meshIdx=meshIdx;
        this.looping=looping;
        this.approachDistance=approachDistance;
        
        this.currentMoveIdx=-1;
        this.nextMoveNextTick=0;
        
        this.moving=looping;            // looping movements are always moving
        
        this.movePnt=new wsPoint(0,0,0);
        this.nextOffsetPnt=new wsPoint(0,0,0);
        this.lastOffsetPnt=new wsPoint(0,0,0);
        
        this.moves=[];
        
        this.y=0;
    }
    
    addMove(move)
    {
        this.moves.push(move);
    }
    
    run()
    {
        let mesh,isOpen,prevIdx;
        let f,move;
        
            // skip if no moves
            
        if (this.moves.length===0) return;
        
            // the mesh
            
        mesh=map.getMesh(this.meshIdx);
        
            // if not looping, then do approach disance
            // if not already moving
            
        if (!this.looping) {
            
            if (!this.moving) {
                isOpen=(mesh.center.distance(entityList.getPlayer().position)<this.approachDistance);
                
                if (isOpen) {
                    if (this.currentMoveIdx===1) return;
                    this.currentMoveIdx=1;
                }
                else {
                    if (this.currentMoveIdx===0) return;
                    this.currentMoveIdx=0;
                }
                
                this.moving=true;
                this.nextMoveNextTick=view.timeStamp+this.moves[this.currentMoveIdx].lifeTick;
            }
            else {
                
                    // check if we've finished, and make sure
                    // the movement lands on the final spot
            
                if (this.nextMoveNextTick<view.timeStamp) {
                    this.nextMoveNextTick=view.timeStamp;
                    this.moving=false;
                }
            }
        }
        
            // looping movements
            
        else {
        
                // next view

            if (this.nextMoveNextTick<view.timeStamp) {
                this.currentMoveIdx++;
                if (this.currentMoveIdx>=this.moves.length) this.currentMoveIdx=0;

                this.nextMoveNextTick=view.timeStamp+this.moves[this.currentMoveIdx].lifeTick;
            }
        }
        
            // the next offset we need to move to
            // is between the previous and the next point
            
        move=this.moves[this.currentMoveIdx];
        f=1.0-((this.nextMoveNextTick-view.timeStamp)/move.lifeTick);
        
        prevIdx=this.currentMoveIdx;
        prevIdx--;
        if (prevIdx<0) prevIdx=this.moves.length-1;
        
        this.nextOffsetPnt.tween(this.moves[prevIdx].movePnt,move.movePnt,f);
        this.nextOffsetPnt.trunc();         // stops these calculations from messing with the collisions because of float slop
        
            // move is change from last move
            
        this.movePnt.setFromSubPoint(this.nextOffsetPnt,this.lastOffsetPnt);
        this.lastOffsetPnt.setFromPoint(this.nextOffsetPnt);
        
            // do the move
        
        mesh.move(this.movePnt);
        
            // and any effected entity
            
        entityList.movementPush(this.meshIdx,this.movePnt);
    }
}
