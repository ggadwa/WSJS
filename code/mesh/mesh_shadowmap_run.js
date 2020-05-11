export default class MeshShadowmapRunClass
{
    constructor(bitmap,startTrigIdx,endTrigIdx)
    {
        this.bitmap=bitmap;     // generator sticks an interger in here, at runtime it's a bitmap
        this.startTrigIdx=startTrigIdx;
        this.endTrigIdx=endTrigIdx;
    }
}
