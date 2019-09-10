export default class GenerateRoomClass
{
    constructor(piece,offset)
    {
        this.piece=piece;
        this.offset=offset.copy();
        
        this.vertexHideArray=new Uint8Array(this.piece.vertexes)
    }
    
    hideVertex(vIdx)
    {
        this.vertexHideArray[vIdx]=1;
    }
    
    isLineHidden(vIdx)
    {
        return(this.vertexHideArray[vIdx]===1);
    }
        
}