import PointClass from '../utility/point.js';
import QuaternionClass from '../utility/quaternion.js';

//
// model bone class
//

export default class ModelBoneClass
{
    constructor(name,parentBoneIdx,translation,rotation,scale)
    {
        this.name=name;
        this.parentBoneIdx=parentBoneIdx;
        this.translation=translation;   // a point
        this.rotation=rotation;         // a quaternion
        this.scale=scale;               // a point

            // children

        this.childBoneIdxs=[];

            // pose position

        this.curPosePosition=new PointClass(0.0,0.0,0.0);
        this.curPoseChildBoneQuat=new QuaternionClass();

        this.prevPoseAngle=new PointClass(0.0,0.0,0.0);
        this.nextPoseAngle=new PointClass(0.0,0.0,0.0);

        Object.seal(this);
    }
}
