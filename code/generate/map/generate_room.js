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
        
            // vertex hiding array, had 3 possible stories
            
        this.vertexHideArray=new Uint8Array(this.piece.vertexes.length*3);
        
            // grids for blocking off floor/stories/etc
            
        this.grid=new Uint8Array((this.piece.size.x*this.piece.size.z)*this.storyCount);
    }
    
    hideVertex(story,vIdx)
    {
        this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]=1;
    }
    
    isWallHidden(story,vIdx)
    {
        return(this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]===1);
    }
    
    blockGrid(storyIdx,x,z)
    {
        this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]=1;
    }
    
    blockGridAllStories(x,z)
    {
        let n;
        
        for (n=0;n!=this.storyCount;n++) {
            this.blockGrid(n,x,z);
        }
    }
    
    checkGrid(storyIdx,x,z)
    {
        return(this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]!==0);
    }
    
}