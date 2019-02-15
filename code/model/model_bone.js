import PointClass from '../utility/point.js';

//
// model bone class
//

export default class ModelBoneClass
{
    constructor(name,vectorFromParent)
    {
        this.name=name;
        this.vectorFromParent=vectorFromParent;
        this.parentBoneIdx=-1;

            // parenting

        this.childBoneIndexes=[];

            // animation position
            
        this.curPoseAngle=new PointClass(0.0,0.0,0.0);
        this.curPosePosition=new PointClass(0.0,0.0,0.0);

        this.prevPoseAngle=new PointClass(0.0,0.0,0.0);
        this.nextPoseAngle=new PointClass(0.0,0.0,0.0);
        
            // importing data
            
        this.fbxImportUID=0;
        this.fbxImportIndexes=null;
        this.fbxImportWeights=null;

        Object.seal(this);
    }
}
