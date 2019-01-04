import PointClass from '../../code/utility/point.js';
import genRandom from '../../code/utility/random.js';

//
// limb class
//

export default class ModelLimbClass
{
    constructor(limbType,index,axis,flipped,acrossSurfaceCount,aroundSurfaceCount,randomize,scaleMin,scaleMax,boneIndexes)
    {
        this.limbType=limbType;
        this.index=index;
        this.axis=axis;
        this.flipped=flipped;
        this.acrossSurfaceCount=acrossSurfaceCount;
        this.aroundSurfaceCount=aroundSurfaceCount;
        this.randomize=randomize;
        this.scaleMin=scaleMin;
        this.scaleMax=scaleMax;
        this.boneIndexes=boneIndexes;
        
        Object.seal(this);
    }
    
    getRandomBoneIndex()
    {
        return(this.boneIndexes[genRandom.randomIndex(this.boneIndexes.length)]);
    }
};
