//
// mesh vertex bone connection
//

export default class MeshVertexBoneConnectClass
{
    constructor(boneIndex,weight)
    {
        this.boneIndex=boneIndex;
        this.weight=weight;
        
        Object.seal(this);
    }
}
