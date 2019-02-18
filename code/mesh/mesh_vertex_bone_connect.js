import PointClass from '../utility/point.js';

//
// mesh vertex bone connection
//

export default class MeshVertexBoneConnectClass
{
    constructor(boneIdx,weight)
    {
        this.boneIdx=boneIdx;
        this.weight=weight;
        this.vectorFromBone=new PointClass(0,0,0);
        
        Object.seal(this);
    }
}
