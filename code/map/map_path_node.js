//
// map path node class
//

export default class MapPathNodeClass
{
    constructor(nodeIdx,position,links,key,data)
    {
        this.nodeIdx=nodeIdx;
        this.position=position;
        this.links=links;
        this.key=(key===undefined)?null:key;
        this.data=(data===undefined)?null:data;

        this.pathHints=null;
        this.pathHintCounts=null;
    }
    
        //
        // build a list of indexes that tell you
        // the next linked node to go to for the
        // shortest path to that node from this one
        //
     
    countPathToNode(nodes,nodeHits,fromNodeIdx,toNodeIdx,pathCount)
    {
        let n,node,nextNodeHits;
        let linkPathCount,count;
            
        node=nodes[fromNodeIdx];
        
            // has this node already gotten a count?
            
        if (node.pathHintCounts!==null) return(pathCount+node.pathHintCounts[toNodeIdx]);
        
            // follow the links
          
        linkPathCount=-1;
        
        for (n=0;n!==node.links.length;n++) {
            
                // we hit it, start return this as
                // the node count to this node
                
            if (node.links[n]===toNodeIdx) return(pathCount);
            
                // if we already hit this
                // node then cancel the path
                // note this might miss quicker paths but still
                // guarentees a quick path to node under most
                // circumstances
            
            if (nodeHits[node.links[n]]!==0) continue;
            
                // recurse further and return the link
                // with the shortest node count
                
            nextNodeHits=new Uint8Array(nodeHits);
            nextNodeHits[node.links[n]]=1;
                
            count=this.countPathToNode(nodes,nextNodeHits,node.links[n],toNodeIdx,(pathCount+1));
            if (count===-1) continue;
            
            if ((linkPathCount===-1) || (count<linkPathCount)) linkPathCount=count;
        }
        
        return(linkPathCount);
    }
    
    buildPathHints(nodes)
    {
        let n,k;
        let count,linkPathCount,nodeHits;
        let nNode=nodes.length;
        
        this.pathHints=new Uint16Array(nNode);
        this.pathHintCounts=new Uint16Array(nNode);
        
        for (n=0;n!==nNode;n++) {
            
                // we only trace to nodes that
                // have keys
                
            if (nodes[n].key===null) {
                this.pathHints[n]=-1;
                this.pathHintCounts[n]=0;
                continue;
            }
            
                // path to itself
                
            if (n===this.nodeIdx) {
                this.pathHints[n]=n;
                this.pathHintCounts[n]=0;
                continue;
            }
            
                // else find which link has the
                // shortest path
                
            linkPathCount=-1;
            
            for (k=0;k!==this.links.length;k++) {
                
                    // quick hit from this link
                    
                if (this.links[k]===n) {
                    this.pathHints[n]=this.links[k];
                    this.pathHintCounts[n]=1;
                    break;
                }
                
                    // keep track of what we've hit recursively
                    // so we can cancel out paths that wrap around
                    
                nodeHits=new Uint8Array(nNode);
                nodeHits[this.nodeIdx]=1;
                
                count=this.countPathToNode(nodes,nodeHits,this.links[k],n,1);
                if (count===-1) continue;
                
                if ((linkPathCount===-1) || (count<linkPathCount)) {
                    linkPathCount=count;
                    this.pathHints[n]=this.links[k];
                    this.pathHintCounts[n]=count;
                }
            }
        }
    }
    
}
