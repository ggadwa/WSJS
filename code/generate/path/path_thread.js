import PointClass from '../../utility/point.js';

    //
    // the worker setup
    //

self.addEventListener("message",run);

function run(message)
{
    let returnData;
    
    returnData=(new PathGeneratorClass(message.data)).run();
    self.postMessage(returnData);
}

    //
    // the main ray-tracing shadowmap generator class
    //

class PathGeneratorClass
{
    constructor(data)
    {
        this.data=data;
        
        Object.seal(this);
    }
    
        //
        // path routines
        //
        
    fixBrokenLinks()
    {
        let n,k,node,linkNode;
        
        for (n=0;n!==this.data.nodes.length;n++) {
            node=this.data.nodes[n];
            
            for (k=0;k!==node.links.length;k++) {
                linkNode=this.data.nodes[node.links[k]];
                if (!linkNode.links.includes(n)) linkNode.links.push(n);
            }
        }
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
    
    buildPathHints(node,nodes)
    {
        let n,k;
        let count,linkPathCount,nodeHits;
        let nNode=nodes.length;
        
        node.pathHints=new Int16Array(nNode);
        node.pathHintCounts=new Int16Array(nNode);
        
        for (n=0;n!==nNode;n++) {
            
                // we only trace to nodes that
                // have keys
    
            if (nodes[n].key===null) {
                node.pathHints[n]=-1;
                node.pathHintCounts[n]=0;
                continue;
            }

                // path to itself
                
            if (n===node.nodeIdx) {
                node.pathHints[n]=n;
                node.pathHintCounts[n]=0;
                continue;
            }
            
                // else find which link has the
                // shortest path
                
            linkPathCount=-1;
            
            for (k=0;k!==node.links.length;k++) {
                
                    // quick hit from this link
                    
                if (node.links[k]===n) {
                    node.pathHints[n]=node.links[k];
                    node.pathHintCounts[n]=1;
                    break;
                }
                
                    // keep track of what we've hit recursively
                    // so we can cancel out paths that wrap around
                    
                nodeHits=new Uint8Array(nNode);
                nodeHits[node.nodeIdx]=1;
                
                count=this.countPathToNode(nodes,nodeHits,node.links[k],n,1);
                if (count===-1) continue;
                
                if ((linkPathCount===-1) || (count<linkPathCount)) {
                    linkPathCount=count;
                    node.pathHints[n]=node.links[k];
                    node.pathHintCounts[n]=count;
                }
            }
        }
    }
    
        //
        // path to json utility
        //
        
    pathJSONReplacer(key,value)
    {
        if (key==='nodeIdx') return(undefined);
        if (key==='pathHints') return(new Array(...value));
        if (key==='pathHintCounts') return(undefined);
        if ((key==='key') && (value===null)) return(undefined);
        if ((key==='data') && (value===null)) return(undefined);
        return(value);
    }

        //
        // this run builds the path hints, which tells
        // the quickest path to get to key nodes from
        // other nodes
        //
        
    run()
    {
        let n,node,str;
        let nodes=this.data.nodes;
        
        console.info('path started');
        
            // build the path hints
            
        this.fixBrokenLinks();
        
        for (node of this.data.nodes) {
            this.buildPathHints(node,this.data.nodes);
        }

            // create the json
            
        str='[\n';

        for (n=0;n!==nodes.length;n++) {
            str+='    ';
            str+=JSON.stringify(nodes[n],this.pathJSONReplacer.bind(this));
            if (n!==(nodes.length-1)) str+=',';
            str+='\n';
        }

        str+=']\n';
        
        console.info('path completed');
        
            // pass back the json to be uploaded
            
        postMessage({json:str});        
    }
}


