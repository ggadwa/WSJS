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
        
    buildPathHints()
    {
        let node;
        
        for (node of this.data.nodes) {
            node.buildPathHints(this.data.nodes);
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
        let n,str;
        let nodes=this.data.nodes;
        
        console.info('path started');
        
            // build the path hints
            
        this.fixBrokenLinks();
        this.buildPathHints();

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


