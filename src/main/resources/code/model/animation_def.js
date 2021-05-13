class AnimationMeshHideClass
{
    constructor(name,hide)
    {
        this.name=name;
        this.hide=hide;
    }
}

export default class AnimationDefClass
{
    constructor(startFrame,endFrame,actionFrame)
    {
        this.startFrame=startFrame;
        this.endFrame=endFrame;
        this.actionFrame=actionFrame;
        this.meshes=null;
    }
    
    addMeshHide(name,hide)
    {
        if (this.meshes===null) this.meshes=[];
        this.meshes.push(new AnimationMeshHideClass(name,hide));
        
        return(this);
    }
}
