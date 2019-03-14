import PointClass from '../utility/point.js';
import Matrix4Class from '../utility/matrix4.js';
import QuaternionClass from '../utility/quaternion.js';

//
// local entity alter node class for per
// entity model changes
//

export default class ModelEntityAlterNodeClass
{
    constructor(name,parentNodeIdx,childNodeIdxs,translation,rotation,scale)
    {
        this.name=name;
        this.parentNodeIdx=parentNodeIdx;
        this.childNodeIdxs=childNodeIdxs;
        this.translation=translation.copy();   // a point, no animation translation
        this.rotation=rotation.copy();         // a quaternion, no animation rotation
        this.scale=scale.copy();               // a point, no animation scale

            // the pose versions
            
        this.poseTranslation=translation.copy();
        this.poseRotation=rotation.copy();
        this.poseScale=scale.copy();

        this.curPoseMatrix=new Matrix4Class();
        this.curPosePosition=new PointClass(0,0,0);

        Object.seal(this);
    }
}
