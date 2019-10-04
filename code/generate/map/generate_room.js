import PointClass from '../../utility/point.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateRoomClass
{
    constructor(piece,segmentSize,sideRoom,stairRoom)
    {
        this.piece=piece;
        this.sideRoom=sideRoom;
        this.stairRoom=stairRoom;
        
        this.forwardPath=false;     // be filled in later during construction
        this.pathXDeviation=0;
        
        this.offset=new PointClass(0,0,0);
        if (stairRoom) {
            this.storyCount=2;
        }
        else {
            this.storyCount=(this.piece.multistory)?(Math.trunc(GenerateUtilityClass.randomInt(1,3))):1;
        }
        
        this.size=new PointClass((segmentSize*piece.size.x),(segmentSize*this.storyCount),(segmentSize*piece.size.z));
        
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