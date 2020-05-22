//
// map path node class
//

export default class MapPathNodeClass
{
    constructor(nodeIdx,position,links,key,pathHints,data)
    {
        this.nodeIdx=nodeIdx;
        this.position=position;
        this.links=links;
        this.key=(key===undefined)?null:key;
        this.pathHints=pathHints;
        this.data=(data===undefined)?null:data;

        this.pathHintCounts=null;   // used in path hints construction
    }
    
}
