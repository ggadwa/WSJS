//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
        this.SEED=300; // Date.now();                       // random seed for generation; guarenteed to make exact same game with same seed

            //
            // map generation
            //
            
        this.ROOM_PATH_COUNT=6;                     // how many rooms in the map path

        this.ROOM_DECORATIONS=true;                // if the room has decorations
        this.ROOM_LIQUIDS=true;                     // turns on or off liquids
        this.SIMPLE_TEST_MAP=false;                  // a special simple map for testing other elements
        this.SHOW_OVERLAY_MAP=false;                 // to turn on/off the overlay map

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT=0.0;                 // all over ambient light [r,g,b]

            //
            // monsters
            //

        this.MONSTER_TYPE_COUNT=1;
        this.MONSTER_ENTITY_COUNT=5;
        
        this.MONSTER_AI_ON=false;
        this.MONSTER_BOSS=true;
        
            //
            // sounds
            //
            
        this.VOLUME=0.3;                            // main volume
        
            //
            // controls
            //
            
        this.MOUSE_TURN_SENSITIVITY=0.8;
        this.MOUSE_LOOK_SENSITIVITY=0.2;

            //
            // play testing
            //

        this.PLAYER_CLIP_WALLS=false;
        this.PLAYER_FLY=false;
    }
}

let config=new ConfigClass();

export default config;
