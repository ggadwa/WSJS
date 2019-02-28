//
// model animation class
//

export default class ModelAnimationClass
{
    constructor(name)
    {
        this.name=name;
        
        this.channels=[];
        
        this.tickLength=0;
        
        this.startTimestamp=0;
        this.loopStartTick=-1;
        this.loopEndTick=-1;

        Object.seal(this);
    }
    
    calcAnimationLength()
    {
        let n,tick,channel;
        
        this.tickLength=0;
        
        for (n=0;n!==this.channels.length;n++) {
            channel=this.channels[n];
            
            tick=channel.poses[channel.poses.length-1].tick;
            if (tick>this.tickLength) this.tickLength=tick;
        }
    }
}
