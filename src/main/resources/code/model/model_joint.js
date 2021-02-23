import Matrix4Class from '../utility/matrix4.js';

//
// model joint class
//

export default class ModelJointClass
{
    constructor(nodeIdx,inverseBindMatrix)
    {
        this.nodeIdx=nodeIdx;
        this.inverseBindMatrix=inverseBindMatrix;
        
        this.translateMatrix=new Matrix4Class();        // pre loaded to avoid GC
        this.rotMatrix=new Matrix4Class();
        this.scaleMatrix=new Matrix4Class();

        Object.seal(this);
    }
}
