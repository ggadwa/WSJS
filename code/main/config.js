//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
        this.SEED=Date.now();                       // random seed for generation; guarenteed to make exact same game with same seed

            //
            // map generation
            //
            
        this.MAP_DESIGN_TYPE=1;
        this.MAP_DESIGN_TYPE_LIST=['Sparse','Medium','Compact'];
        
        this.ROOM_PATH_COUNT=2;                     // how many rooms in the map path

        this.ROOM_LIQUIDS=false;                     // turns on or off liquids
        this.SIMPLE_TEST_MAP=true;                 // a special simple map for testing other elements
        this.SHOW_OVERLAY_MAP=false;                // to turn on/off the overlay map
        
        this.DECORATION_DENSTIY=0.9;                // 0.0 to 1.0, how dense the decorations, 0.0=none

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT=1.0;                 // ambient light [r,g,b]

            //
            // monsters
            //

        this.MONSTER_COUNT=0;
        
        this.MONSTER_AI_ON=true;
        this.MONSTER_BOSS=false;
        
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

        this.PLAYER_CLIP_WALLS=true;
        this.PLAYER_FLY=true;
    }
}

let config=new ConfigClass();

export default config;
