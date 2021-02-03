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
        // path hints are a list that shows, from any node,
        // the next linked node to goto to get the shortest
        // path to any key node
        //
    
    initNodePathHints(nodeIdx,nodes)
    {
        let n;
        let node=nodes[nodeIdx];
        let nNode=nodes.length;
        
        node.pathHints=new Int16Array(nNode);
        node.pathHintCounts=new Int16Array(nNode);
        
        for (n=0;n!==nNode;n++) {
            node.pathHints[n]=-1;
            node.pathHintCounts[n]=0;
        }
    }
    
    traceNodeToNode(fromNodeIdx,toNodeIdx,nodes,blockedNodes,currentLen)
    {
        let n;
        let linkNodeIdx,len,currentWinNodeIdx,currentWinLinkLen;
        let nextBlockedNodes;
        let fromNode=nodes[fromNodeIdx];
        
            // if currentLen > number of nodes, this
            // path is to long and there must either be no path
            // or a shorter one
            
        if (currentLen>nodes.length) return(-1);
        
            // if we hit something we already found a count
            // for, just return that, which should speed up
            // tracing as we fill in more nodes
            
        if (fromNode.pathHints[toNodeIdx]!==-1) return(currentLen+fromNode.pathHintCounts[toNodeIdx]);
        
            // each link gets a new block list,
            // so we can't go backwards on a path towards a goal node
           
        nextBlockedNodes=new Uint8Array(blockedNodes);
        nextBlockedNodes[fromNodeIdx]=1;
        
            // find the shortest path
            
        currentWinNodeIdx=-1;
        currentWinLinkLen=-1;
        
        for (n=0;n!==fromNode.links.length;n++) {
            
            linkNodeIdx=fromNode.links[n];
            
                // have we looped back?
                
            if (nextBlockedNodes[linkNodeIdx]!==0) continue;
                
                // have we hit this node?

            if (linkNodeIdx===toNodeIdx) {
                currentWinNodeIdx=linkNodeIdx;
                currentWinLinkLen=currentLen+1;
                break;
            }
                
                // move down the line
                
            len=this.traceNodeToNode(linkNodeIdx,toNodeIdx,nodes,nextBlockedNodes,(currentLen+1));
            if (len===-1) continue;
            
                // is this the winner
                
            if ((currentWinNodeIdx===-1) || (len<currentWinLinkLen)) {
                currentWinNodeIdx=linkNodeIdx;
                currentWinLinkLen=len;
            }
        }
        
            // if the current len is 0, it means we are at the
            // first node on a trace, so setup the path hint
            
        if (currentLen===0) {
            fromNode.pathHints[toNodeIdx]=currentWinNodeIdx;
            fromNode.pathHintCounts[toNodeIdx]=currentWinLinkLen;
        }
        
        return(currentWinLinkLen);
    }
    
    createNodePathHints(nodeIdx,nodes)
    {
        let n;
        let blockedNodes;
        let node=nodes[nodeIdx];
        let nNode=nodes.length;
        
        console.info('tracing node '+nodeIdx+'/'+nNode);
        
        for (n=0;n!==nNode;n++) {

                // path to itself
                
            if (n===nodeIdx) {
                node.pathHints[n]=n;
                node.pathHintCounts[n]=0;
                continue;
            }
            
            if (nodes[n].key!==null) {
                console.info('   trace to ['+n+'] '+nodes[n].key);
            }
            else {
                console.info('   trace to ['+n+']');
            }
            
                // trace it
                
            blockedNodes=new Uint8Array(nodes.length);
            this.traceNodeToNode(nodeIdx,n,nodes,blockedNodes,0);
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
        if ((key==='spawn') && (value===false)) return(undefined);
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
        let n,nNode,str;
        let nodes=this.data.nodes;
        
        console.info('path started');
        
            // build the path hints
            
        this.fixBrokenLinks();
        
        nNode=nodes.length;
        
        for (n=0;n!==nNode;n++) {
            this.initNodePathHints(n,nodes);
        }
        
        for (n=0;n!==nNode;n++) {
            this.createNodePathHints(n,nodes);
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


