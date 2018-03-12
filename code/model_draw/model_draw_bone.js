import PointClass from '../../code/utility/point.js';

//
// model draw bone class
//

export default class ModelDrawBoneClass
{
    constructor(bone)
    {
        this.bone=bone;
        
        this.curPoseAngle=new PointClass(0.0,0.0,0.0);
        this.curPosePosition=bone.position.copy();

        this.prevPoseAngle=new PointClass(0.0,0.0,0.0);
        this.nextPoseAngle=new PointClass(0.0,0.0,0.0);
        
        Object.seal(this);
    }
}
