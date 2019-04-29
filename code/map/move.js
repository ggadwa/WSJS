//
// single move class
//

export default class MoveClass
{
    static PAUSE_NONE=0;
    static PAUSE_TRIGGER=1;
    static PAUSE_APPROACH=2;
    static PAUSE_LEAVE=3;
    static PAUSE_STOP=4;
    
    constructor(lifeTick,movePnt,rotateAngle,pauseType,pauseData,soundName,triggerName)
    {
        this.lifeTick=lifeTick;
        this.movePnt=movePnt;
        this.rotateAngle=rotateAngle;
        this.pauseType=pauseType;
        this.pauseData=pauseData;
        this.soundName=(soundName===undefined)?null:soundName;
        this.triggerName=(triggerName===undefined)?null:triggerName;
    }
    
    static lookupPauseType(pauseName)
    {
        if (pauseName==='trigger') return(MoveClass.PAUSE_TRIGGER);
        if (pauseName==='approach') return(MoveClass.PAUSE_APPROACH);
        if (pauseName==='leave') return(MoveClass.PAUSE_LEAVE);
        if (pauseName==='stop') return(MoveClass.PAUSE_STOP);
        return(MoveClass.PAUSE_NONE);
    }
    
}
