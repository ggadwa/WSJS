//
// map path node class
//

export default class MapPathNodeClass
{
    constructor(nodeIdx,position,links,data)
    {
        this.nodeIdx=nodeIdx;
        this.position=position;
        this.links=links;
        this.data=(data===undefined)?null:data;
        
        this.recurseFlag=false;
        this.pathHints=null;
    }
    
        //
        // build a list of indexes that tell you
        // the next linked node to go to for the
        // shortest path to that node from this one
        //
     
    countPathToNode(nodes,fromNodeIdx,toNodeIdx,pathCount)
    {
        let n,node;
        let linkNodeIdx,linkPathCount,count;
        
            // if we already hit this
            // then return -1
            
        node=nodes[fromNodeIdx];
        
        if (node.recurseFlag) return(-1);
        
        node.recurseFlag=true;
        
            // follow the links
          
        linkNodeIdx=-1;
        linkPathCount=-1;
        
        for (n=0;n!==node.links.length;n++) {
            
                // we hit it, start return this as
                // the node count to this node
                
            if (node.links[n]===toNodeIdx) return(pathCount);

                // recurse further and return the link
                // with the shortest node count
                
            count=this.countPathToNode(nodes,node.links[n],toNodeIdx,(pathCount+1));
            if (count===-1) continue;
            
            if ((linkPathCount===-1) || (count<linkPathCount)) linkPathCount=count;
        }
        
        return(linkPathCount);
    }
    
    buildPathHints(nodes)
    {
        let n,k,t;
        let count,linkPathCount;
        let nNode=nodes.length;
        
        this.pathHints=new Uint16Array(nNode);
        
        for (n=0;n!==nNode;n++) {
            
                // path to itself
                
            if (n===this.nodeIdx) {
                this.pathHints[n]=n;
                continue;
            }
            
            linkPathCount=-1;
            
            for (k=0;k!==this.links.length;k++) {
                
                    // for each path navigate,
                    // make sure we don't circle back
                    // on ourselves
                    
                for (t=0;t!==nNode;t++) {
                    nodes[t].recurseFlag=false;
                }
                
                    // now find shortest link
                    
                count=this.countPathToNode(nodes,this.links[k],n,0);
                if ((linkPathCount===-1) || (count<linkPathCount)) {
                    linkPathCount=count;
                    this.pathHints[n]=this.links[k];
                }
            }
        }
    }
    
}
