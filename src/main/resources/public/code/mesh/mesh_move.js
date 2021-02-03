//
// single move class
//

export default class MeshMoveClass
{
    constructor(lifeTick,movePnt,rotateAngle,pauseType,pauseData,sound,triggerName)
    {
        this.lifeTick=lifeTick;
        this.movePnt=movePnt;
        this.rotateAngle=rotateAngle;
        this.pauseType=pauseType;
        this.pauseData=pauseData;
        this.sound=(sound===undefined)?null:sound;
        this.triggerName=(triggerName===undefined)?null:triggerName;
    }
    
}
