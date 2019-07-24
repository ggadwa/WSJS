//
// sound play class
//

export default class SoundPlayClass
{
    constructor(soundList)
    {
        this.soundList=soundList;
        
        this.free=true;
        this.entity=null;
        this.mesh=null;
        
        this.sourceNode=null;
        this.gainNode=null;
        this.pannerNode=null;
        
        Object.seal(this);
    }
    
    close()
    {
    }
    
        //
        // play a sound buffer at this entity
        //
        
    play(ctx,entityListener,entity,mesh,sound,rate,loop)
    {
        let dist;
        
            // skip if over max distance from entity/mesh
        
        if (entity!==null) {
            dist=entity.position.distance(entityListener.position);
            if (dist>sound.maxDistance) return(false);
        }
        
        if (mesh!==null) {
            dist=mesh.center.distance(entityListener.position);
            if (dist>sound.maxDistance) return(false);
        }
        
            // set the audio nodes
        
        this.sourceNode=ctx.createBufferSource();
        this.sourceNode.buffer=sound.buffer;
        this.sourceNode.playbackRate.value=rate;
        this.sourceNode.loopStart=sound.loopStart;
        this.sourceNode.loopEnd=sound.loopEnd;
        this.sourceNode.loop=loop;
        this.sourceNode.onended=this.ended.bind(this);
        
            // if no entity/mesh, than just add
            // a gain node, otherwise a panner
            
        if ((entity===null) && (mesh===null)) {
            this.gainNode=ctx.createGain();
            this.gainNode.gain.value=this.soundList.core.setup.soundVolume;
        
            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);
        }
        else {
            this.pannerNode=ctx.createPanner();
            
            this.pannerNode.panningModel='HRTF';
            this.pannerNode.distanceModel='inverse';
            this.pannerNode.refDistance=sound.maxDistance*0.25;
            this.pannerNode.maxDistance=sound.maxDistance;
            this.pannerNode.rolloffFactor=1;
            this.pannerNode.coneInnerAngle=360;
            this.pannerNode.coneOuterAngle=0;
            this.pannerNode.coneOuterGain=0;
            
            if (entity!==null) {
                this.pannerNode.positionX.value=entity.position.x;
                this.pannerNode.positionY.value=entity.position.y;
                this.pannerNode.positionZ.value=entity.position.z;
            }
            else {
                this.pannerNode.positionX.value=mesh.center.x;
                this.pannerNode.positionY.value=mesh.center.y;
                this.pannerNode.positionZ.value=mesh.center.z;
            }
            
            this.pannerNode.orientationX.value=1;
            this.pannerNode.orientationY.value=0;
            this.pannerNode.orientationZ.value=0;
            
            this.sourceNode.connect(this.pannerNode);
            
            this.gainNode=ctx.createGain();
            this.gainNode.gain.value=this.soundList.core.setup.soundVolume;

            this.pannerNode.connect(this.gainNode);
            this.gainNode.connect(ctx.destination);
        }
       
            // set to entity and mark as used
        
        this.entity=entity;
        this.mesh=mesh;
        
        this.free=false;
        
            // finally play the sound
            
        this.sourceNode.start();
    }
    
    ended()
    {
        this.free=true;
        this.entity=null;           // otherwise entities/meshes cleared from entity list will be cleaned up late
        this.mesh=null;
        this.sourceNode=null;
        this.gainNode=null;
        this.pannerNode=null;
    }
    
        //
        // stop a playing sound
        //
        
    stop()
    {
        this.sourceNode.stop();
    }
    
        //
        // change the rate
        //
        
    changeRate(rate)
    {
        this.sourceNode.playbackRate.value=rate;
    }
    
        //
        // handle any entity updates to this sound
        //
        
    update()
    {
        if (this.entity!==null) {
            this.pannerNode.positionX.value=this.entity.position.x;
            this.pannerNode.positionY.value=this.entity.position.y;
            this.pannerNode.positionZ.value=this.entity.position.z;
            return;
        }
        if (this.mesh!==null) {
            this.pannerNode.positionX.value=this.mesh.center.x;
            this.pannerNode.positionY.value=this.mesh.center.y;
            this.pannerNode.positionZ.value=this.mesh.center.z;
        }
    }

}
