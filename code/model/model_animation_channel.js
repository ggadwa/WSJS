//
// model animation channel class
//

export default class ModelAnimationChannelClass
{
    static TRS_TYPE_TRANSLATION=0;
    static TRS_TYPE_ROTATION=1;
    static TRS_TYPE_SCALE=2;
    
    constructor(nodeIdx,trsType)
    {
        this.nodeIdx=nodeIdx;
        this.trsType=trsType;
        
        this.poses=[];
        
        Object.seal(this);
    }
    
    getPoseDataForTick(tick,outData)
    {
        let n,f;
        // let fi,x,y,z,w;
        let tickLen,tickOffset;
        let endPoseIdx;
        let startPose,endPose;
        
            // get poses tick is inbetween
            
        endPoseIdx=this.poses.length-1;
        
        for (n=0;n!==this.poses.length;n++) {
            if (tick<this.poses[n].tick) {
                endPoseIdx=n;
                break;
            }
        }
        
            // supergumba -- tweening is bad here, we need
            // to figure out why, most like the quanternions don't
            // linearly interpt right
        
            // if we are at end or directly on a pose,
            // then just pass back the pose
            
        //if ((endPoseIdx===0) || (this.poses[endPoseIdx].tick===tick)) {
            endPose=this.poses[endPoseIdx];
            
            for (n=0;n!==endPose.data.length;n++) {
                outData[n]=endPose.data[n];
            }
            
            return;
        //}
        
            // get the tween factor
            
        startPose=this.poses[endPoseIdx-1];
        endPose=this.poses[endPoseIdx];
        
        f=0;
        
        tickOffset=tick-startPose.tick;
        tickLen=endPose.tick-startPose.tick;
        if (tickLen>0) f=tickOffset/tickLen;
            
        for (n=0;n!==startPose.data.length;n++) {
            outData[n]=startPose.data[n]+(f*(endPose.data[n]-startPose.data[n]));
        }
    }
    
}
