import * as constants from '../../code/main/constants.js';
import MapRoomClass from '../../code/map/map_room.js';
import config from '../../code/main/config.js';
import genRandom from '../../generate/utility/random.js';

//
// map room list class
//

export default class MapRoomListClass
{
    constructor(view,map)
    {
        this.view=view;
        this.map=map;
        
        this.rooms=[];

        Object.seal(this);
    }
    
        //
        // initialize and release
        //

    initialize()
    {
        return(true);
    }

    release()
    {
    }
    
        //
        // clear map
        //

    clear()
    {
        this.rooms=[];
    }

        //
        // room items
        //
        
    add(pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid,outdoor)
    {
        this.rooms.push(new MapRoomClass(this.view,this.map,pathType,xBlockSize,zBlockSize,xBound,yBound,zBound,storyCount,extensionDirection,mainPath,mainPathSide,mainPathConnectedRoom,level,liquid,outdoor));
        return(this.rooms.length-1);
    }
    
    get(idx)
    {
        return(this.rooms[idx]);
    }
    
    count()
    {
        return(this.rooms.length);
    }

        //
        // find positions in map
        //
    
    findRoomForPathType(pathType)
    {
        let n;
        let nRoom=this.rooms.length;
        
        for (n=0;n!==nRoom;n++) {
            if (this.rooms[n].pathType===pathType) return(n);
        }
        
        return(-1);
    }
    
    findRandomMonsterPosition()
    {
        let roomIdx;
        let pos;
        let findTry=0;
        
        while (findTry<25) {

                // find a random room,            
                // only put in normal rooms, unless we are in
                // simple map mode where there's only one room
                
            if (config.SIMPLE_TEST_MAP) {
                roomIdx=0;
            }
            else {
                roomIdx=genRandom.randomIndex(this.rooms.length);
                
                if (this.rooms[roomIdx].pathType!==constants.ROOM_PATH_TYPE_NORMAL) {
                    findTry++;
                    continue;
                }
            }
            
                // find a random spot in room
                
            pos=this.rooms[roomIdx].findAndBlockSpawnPosition(false);
            if (pos!==null) return(pos);
            
            findTry++;
        }

        return(null);
    }
    
    findRandomPlayerPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_START);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
    findRandomBossPosition()
    {
        let roomIdx=this.findRoomForPathType(constants.ROOM_PATH_TYPE_GOAL);
        return(this.rooms[roomIdx].findAndBlockSpawnPosition(true));
    }
    
}
