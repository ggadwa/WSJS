"use strict";

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
            
        this.ROOM_PATH_COUNT=6;                     // how many rooms in the map path

        this.MAP_GENERATE_LIGHTMAP=false;           // set to true to generate light maps
        this.ROOM_DECORATIONS=true;                // if the room has decorations
        this.ROOM_LIQUIDS=true;                     // turns on or off liquids
        this.SIMPLE_TEST_MAP=false;                  // a special simple map for testing other elements
        this.SHOW_OVERLAY_MAP=true;                 // to turn on/off the overlay map

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT=0.15;                 // all over ambient light [r,g,b]

            //
            // monsters
            //

        this.MONSTER_TYPE_COUNT=1;
        this.MONSTER_ENTITY_COUNT=0;
        
        this.MONSTER_AI_ON=false;
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

            //
            // draw debuging
            //

        this.DEBUG_DRAW_MAP_MESH_LINES=false;
        this.DEBUG_DRAW_MAP_MESH_NORMALS=false;
        this.DEBUG_DRAW_MAP_MESH_TANGENTS=false;

        this.DEBUG_DRAW_MODEL_HITBOX=false;
        this.DEBUG_DRAW_MODEL_SKELETON=false;
        this.DEBUG_DRAW_MODEL_MESH_LINES=false;
        this.DEBUG_DRAW_MODEL_MESH_NORMALS=false;
        this.DEBUG_DRAW_MODEL_MESH_TANGENTS=false;
    }
}

let config=new ConfigClass();
