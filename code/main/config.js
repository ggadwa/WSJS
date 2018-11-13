//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
        this.SEED=42; // Date.now();                       // random seed for generation; guarenteed to make exact same game with same seed

            //
            // map generation
            //
            
        this.MAP_DESIGN_TYPE=1;
        this.MAP_DESIGN_TYPE_LIST=['Sparse','Medium','Compact'];
        
        this.ROOM_PATH_COUNT=6;                     // how many rooms in the map path

        this.ROOM_LIQUIDS=true;                     // turns on or off liquids
        this.SIMPLE_TEST_MAP=false;                 // a special simple map for testing other elements
        this.SHOW_OVERLAY_MAP=true;                // to turn on/off the overlay map
        
        this.DECORATION_DENSTIY=0.9;                // 0.0 to 1.0, how dense the decorations, 0.0=none

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT=0.1;                 // all over ambient light [r,g,b]
        this.NON_STATIC_LIGHTS=true;                // allows lights that flicker or strobe

            //
            // monsters
            //

        this.MONSTER_TYPE_COUNT=3;
        
        this.MONSTER_AI_ON=true;
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
