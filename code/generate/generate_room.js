import PointClass from '../utility/point.js';
import GenerateUtilityClass from '../generate/generate_utility.js';

export default class GenerateRoomClass
{
    constructor(piece,sideRoom)
    {
        this.piece=piece;
        this.sideRoom=sideRoom;
        
        this.offset=new PointClass(0,0,0);
        this.storyCount=(this.piece.multistory)?(1+Math.trunc(GenerateUtilityClass.random()*3)):1;
        
        this.stairVertexIdx=0;
        this.stairVertexIdx2=0;
        
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