import PointClass from '../../code/utility/point.js';
import genRandom from '../../generate/utility/random.js';

//
// limb class
//

export default class ModelLimbClass
{
    constructor(limbType,index,axis,acrossSurfaceCount,aroundSurfaceCount,boneIndexes)
    {
        this.limbType=limbType;
        this.index=index;
        this.axis=axis;
        this.acrossSurfaceCount=acrossSurfaceCount;
        this.aroundSurfaceCount=aroundSurfaceCount;
        this.boneIndexes=boneIndexes;
        
        this.hunchAngle=0.0;
        
        Object.seal(this);
    }
    
    getRandomBoneIndex()
    {
        return(this.boneIndexes[genRandom.randomIndex(this.boneIndexes.length)]);
    }
};
