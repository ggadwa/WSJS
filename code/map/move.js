//
// single move class
//

export default class MoveClass
{
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
    
}
