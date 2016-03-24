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
    constructor(meshIdx)
    {
        this.meshIdx=meshIdx;
        
        this.currentMoveIdx=-1;
        this.nextMoveNextTick=0;
        
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
    
    run(view,soundList,map)
    {
        var prevIdx;
        var f,move;
        
            // skip if no moves
            
        if (this.moves.length===0) return;
        
            // next view
            
        if (this.nextMoveNextTick<view.timeStamp) {
            this.currentMoveIdx++;
            if (this.currentMoveIdx>=this.moves.length) this.currentMoveIdx=0;
            
            this.nextMoveNextTick=view.timeStamp+this.moves[this.currentMoveIdx].lifeTick;
        }
        
            // the next offset we need to move to
            // is between the previous and the next point
            
        move=this.moves[this.currentMoveIdx];
        f=1.0-((this.nextMoveNextTick-view.timeStamp)/move.lifeTick);
        
        prevIdx=this.currentMoveIdx;
        prevIdx--;
        if (prevIdx<0) prevIdx=this.moves.length-1;
        
        this.nextOffsetPnt.tween(this.moves[prevIdx].movePnt,move.movePnt,f);
        
            // move is change from last move
            
        this.movePnt.setFromSubPoint(this.nextOffsetPnt,this.lastOffsetPnt);
        this.lastOffsetPnt.setFromPoint(this.nextOffsetPnt);
        
            // do the move
            
        map.getMesh(this.meshIdx).move(view,this.movePnt);
    }
}
