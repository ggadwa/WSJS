//
// model skeleton class
//

export default class ModelSkeletonClass
{
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
        
            // the single animation track
            
        this.animation=null;
        
            // the root node, right now we consider
            // that there is only one root node in the skeleton
            
        this.rootNodeIdx=0;
        
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
    
}
