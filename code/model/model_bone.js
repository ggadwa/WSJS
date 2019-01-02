import PointClass from '../../code/utility/point.js';

//
// model bone class
//

export default class ModelBoneClass
{
    constructor(name,parentBoneIdx,position)
    {
        this.name=name;
        this.parentBoneIdx=parentBoneIdx;
        this.position=position;

            // parenting

        this.vectorFromParent=new PointClass(0.0,0,0,0,0);
        this.childBoneIndexes=[];

            // mesh creation

        this.gravityLockDistance=500;

            // animation position
            
        this.curPoseAngle=new PointClass(0.0,0.0,0.0);
        this.curPosePosition=position.copy();

        this.prevPoseAngle=new PointClass(0.0,0.0,0.0);
        this.nextPoseAngle=new PointClass(0.0,0.0,0.0);

        Object.seal(this);
    }
    
        //
        // bone types and flags
        //
        
    isBase()
    {
        return(this.name==='Base');
    }
    
    hasParent()
    {
        return(this.parentBoneIdx!==-1);
    }
}
