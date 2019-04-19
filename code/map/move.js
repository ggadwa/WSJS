//
// single move class
//

export default class MoveClass
{
    constructor(lifeTick,movePnt,rotateAngle,triggerName)
    {
        this.lifeTick=lifeTick;
        this.movePnt=movePnt;
        this.rotateAngle=rotateAngle;
        this.triggerName=(triggerName===undefined)?null:triggerName;
    }
    
}
