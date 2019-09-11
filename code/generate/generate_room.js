import PointClass from '../utility/point.js';

export default class GenerateRoomClass
{
    constructor(piece)
    {
        this.piece=piece;
        this.offset=new PointClass(0,0,0);
        this.storyCount=(this.piece.multistory)?(1+Math.trunc(Math.random()*3)):1;
        
        this.vertexHideArray=new Uint8Array(this.piece.vertexes.length*3); // 3 possible stories
    }
    
    hideVertex(story,vIdx)
    {
        this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]=1;
    }
    
    isWallHidden(story,vIdx)
    {
        return(this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]===1);
    }
        
}