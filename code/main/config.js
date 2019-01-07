//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
        this.SEED=Date.now();                       // random seed for generation; guarenteed to make exact same game with same seed

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
