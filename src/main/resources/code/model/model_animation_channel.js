//
// model animation channel class
//

export default class ModelAnimationChannelClass
{
    constructor(nodeIdx,trsTypeName)
    {
        this.TRS_TYPE_TRANSLATION=0;
        this.TRS_TYPE_ROTATION=1;
        this.TRS_TYPE_SCALE=2;
    
        this.nodeIdx=nodeIdx;
        
        switch (trsTypeName) {
            case 'translation':
                this.trsType=this.TRS_TYPE_TRANSLATION;
                break;
            case 'rotation':
                this.trsType=this.TRS_TYPE_ROTATION;
                break;
            case 'scale':
                this.trsType=this.TRS_TYPE_SCALE;
                break;
        }
        
        this.poses=[];
        
        Object.seal(this);
    }
    
    getPoseDataForTick(tick)
    {
        let n;
        
        for (n=0;n!==this.poses.length;n++) {
            if (tick<this.poses[n].tick) return(this.poses[n].data);
        }
        
        return(this.poses[this.poses.length-1].data);
    }
    
}
