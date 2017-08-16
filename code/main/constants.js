//
// Constants Class
// 
// supergumba!
// Remove all this and move these constants to classes
// when javascript gets class fields
//

class ConstantsClass
{
    constructor()
    {
        
            // to MapRoomClass
            
        this.ROOM_BLOCK_WIDTH=8000;                     // x/z dimension of a block (rooms are made up of a grid of blocks)
        this.ROOM_FLOOR_HEIGHT=8000;                    // how tall each floor of a room is
        this.ROOM_FLOOR_DEPTH=700;                      // the depth of the area between floors
            
        this.ROOM_SIDE_LEFT=0;
        this.ROOM_SIDE_TOP=1;
        this.ROOM_SIDE_RIGHT=2;
        this.ROOM_SIDE_BOTTOM=3;
        
        this.LEVEL_NORMAL=0;
        this.LEVEL_LOWER=1;
        this.LEVEL_HIGHER=2;
        this.LEVEL_COUNT=3;
        
        this.ROOM_EXTENSION_DIRECTION_LEFT_RIGHT=0;
        this.ROOM_EXTENSION_DIRECTION_TOP_BOTTOM=1;
        
        this.ROOM_PATH_TYPE_NORMAL=0;
        this.ROOM_PATH_TYPE_START=1;
        this.ROOM_PATH_TYPE_GOAL=2;

        this.ROOM_DECORATION_NONE=-1;
        this.ROOM_DECORATION_PILLARS=0;
        this.ROOM_DECORATION_STORAGE=1;
        this.ROOM_DECORATION_COMPUTER=2;
        this.ROOM_DECORATION_PIPE=3;
        this.ROOM_DECORATION_CUBICAL=4;
        this.ROOM_DECORATION_LAB=5;
    }
}

let constants=new ConstantsClass();

export default constants;
