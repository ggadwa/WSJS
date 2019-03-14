//
// model skeleton class
//

export default class ModelSkeletonClass
{
    static MAX_SKELETON_JOINT=128;
    
    constructor(core)
    {
        this.core=core;
        
            // nodes
            // we need all nodes, as certain non-joint modes
            // also effect the children joints
            
        this.nodes=[];
        
            // skins
            // these are a collections of node indexes
            // used to create skin matrixes

        this.skins=[];
        
            // animations
            
        this.animations=[];
        
        Object.seal(this);
    }
    
        //
        // initialize and release
        //
        
    initialize()
    {
    }

    release()
    {
        this.nodes=[];
    }
    
        //
        // finds
        //
        
    findNodeIndex(name)
    {
        let n;
        let nNode=this.nodes.length;
        
        for (n=0;n!==nNode;n++) {
            if (this.nodes[n].name===name) return(n);
        }
        
        return(-1);
    }
    
    findAnimationIndex(name)
    {
        let n;
        
        for (n=0;n!==this.animations.length;n++) {
            if (this.animations[n].name===name) return(n);
        }
        
        return(-1);
    }
    
}
