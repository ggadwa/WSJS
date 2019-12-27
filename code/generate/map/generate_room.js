import PointClass from '../../utility/point.js';
import GenerateUtilityClass from '../utility/generate_utility.js';

export default class GenerateRoomClass
{
    static STAIR_PATH_DIRECTION_Z=0;
    static STAIR_PATH_DIRECTION_X=1;
    
    constructor(piece,segmentSize)
    {
        this.piece=piece;

        this.storyCount=GenerateUtilityClass.randomInt(this.piece.storyMinimum,3);
        
        this.offset=new PointClass(0,0,0);
        this.size=new PointClass((segmentSize*piece.size.x),(segmentSize*this.storyCount),(segmentSize*piece.size.z));
        
            // flags set during creation
            
        this.requiresExitPlatform=false;
        
            // vertex hiding array, had 3 possible stories
            
        this.vertexHideArray=new Uint8Array(this.piece.vertexes.length*3);
        
            // grids for blocking off floor/stories/etc
            
        this.grid=new Uint8Array((this.piece.size.x*this.piece.size.z)*5);        // up to 5 stories
    }
    
    collides(rooms)
    {
        let n,checkRoom;
        
        for (n=0;n!==rooms.length;n++) {
            checkRoom=rooms[n];
            if (this.offset.x>=(checkRoom.offset.x+checkRoom.size.x)) continue;
            if ((this.offset.x+this.size.x)<=checkRoom.offset.x) continue;
            if (this.offset.z>=(checkRoom.offset.z+checkRoom.size.z)) continue;
            if ((this.offset.z+this.size.z)<=checkRoom.offset.z) continue;
            
            return(true);
        }
        
        return(false);
    }
    
    touches(rooms)
    {
        let n,checkRoom;
        
        for (n=0;n!==rooms.length;n++) {
            checkRoom=rooms[n];
            if ((this.offset.x===(checkRoom.offset.x+checkRoom.size.x)) || ((this.offset.x+this.size.x)===checkRoom.offset.x)) {
                if (this.offset.z>=(checkRoom.offset.z+checkRoom.size.z)) continue;
                if ((this.offset.z+this.size.z)<=checkRoom.offset.z) continue;
                return(n);
            }
            
            if ((this.offset.z===(checkRoom.offset.z+checkRoom.size.z)) || ((this.offset.z+this.size.z)===checkRoom.offset.z)) {
                if (this.offset.x>=(checkRoom.offset.x+checkRoom.size.x)) continue;
                if ((this.offset.x+this.size.x)<=checkRoom.offset.x) continue;
                return(n);
            }
        }
        
        return(-1);
    }
    
    hideVertex(story,vIdx)
    {
        this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]=1;
    }
    
    isWallHidden(story,vIdx)
    {
        return(this.vertexHideArray[(story*this.piece.vertexes.length)+vIdx]===1);
    }
    
    setGrid(storyIdx,x,z,flag)
    {
        this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]=flag;
    }
    
    setGridAllStories(x,z,flag)
    {
        let n;
        
        for (n=0;n!=(this.storyCount+1);n++) {
            this.setGrid(n,x,z,flag);
        }
    }
    
    getGrid(storyIdx,x,z)
    {
        return(this.grid[((this.piece.size.x*this.piece.size.z)*storyIdx)+(z*this.piece.size.z)+x]);
    }
    
}
