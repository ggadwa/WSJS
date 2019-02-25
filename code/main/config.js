//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
        this.SEED=Date.now();                       // random seed for generation; guarenteed to make exact same game with same seed
        
            //
            // temp map testing
            //
            
        this.START_MAP=0;
        this.START_MAP_LIST=['Dual Castles','Dungeon'];

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
        this.DRAW_SKELETONS=true;
    }
}

let config=new ConfigClass();

export default config;
