"use strict";

//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
            //
            // random seed for generation
            // guarenteed to make exact same game with same seed
            //

        this.SEED=Date.now();
        
            //
            // room generation
            //

        this.ROOM_PATH_COUNT=5;                        // how many rooms in the map path

        this.ROOM_BLOCK_WIDTH=8000;                    // x/z dimension of a block (rooms are made up of a grid of blocks)
        this.ROOM_FLOOR_HEIGHT=8000;                   // how tall each floor of a room is
        this.ROOM_FLOOR_DEPTH=700;                     // the depth of the area between floors

        this.ROOM_MIN_BLOCK_PER_SIDE=5;                // minimum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_PER_SIDE=10;               // maximum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_COUNT=100;                  // maximum number of blocks in total for a room (x * z block count)

        this.ROOM_MAX_CONNECT_TRY=20;                  // maximum times to try to find a place to connect a room to another room

        this.ROOM_LEVEL_CHANGE_PERCENTAGE=0.5;         // what % of the time a connection to a room is up a story

            //
            // closets, platforms, ledges
            //

        this.ROOM_CLOSET_MAX_COUNT=5;                  // maximum number of possible closets in room

        this.ROOM_LONG_HALLWAY_PERCENTAGE=0.3;          // what percentage of the time the general room path will have a long hallway

        this.ROOM_LEDGE_PERCENTAGE=0.5;                // percentage of > 1 story rooms that have ledges
        this.ROOM_LEDGE_MIN_HEIGHT=300;                // minimum height of ledges
        this.ROOM_LEDGE_EXTRA_HEIGHT=1500;             // extra height of ledges
        this.ROOM_LEDGE_MIN_WIDTH=2000;                // minum width of ledges
        this.ROOM_LEDGE_EXTRA_WIDTH=3000;              // extra width
        
        this.STAIR_STEP_COUNT=10;
        
            //
            // liquids
            //
            
        this.ROOM_LIQUID_PERCENTAGE=0.2;                // what % of time a two story room can have a liquid
        
        this.ROOM_LIQUID_WAVE_FREQUENCY=4000;           // frequency in milliseconds of waves
        this.ROOM_LIQUID_WAVE_HEIGHT=400;               // pixel height of waves
                
        this.ROOM_LIQUIDS=true;                         // turns on or off liquids

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT_R=0.2;                   // all over ambient light [r,g,b]
        this.MAP_LIGHT_AMBIENT_G=0.2;
        this.MAP_LIGHT_AMBIENT_B=0.2;

        this.MAP_LIGHT_FACTOR=0.45;                    // lights are initially set to room radius, this factor is multipled in
        this.MAP_LIGHT_FACTOR_EXTRA=0.4;               // random addition to light factor above

        this.MAP_LIGHT_EXPONENT_MINIMUM=0.2;           // minimum light exponent (0.0 is completely hard light with no fall off)
        this.MAP_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add

        this.MAP_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
        this.MAP_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights
        this.MAP_LIGHT_ALWAYS_WHITE=true;              // make sure map lights are always white

        this.MAP_GENERATE_LIGHTMAP=false;              // set to true to generate light maps

            //
            // monsters
            //

        this.MONSTER_TYPE_COUNT=3;
        this.MONSTER_ENTITY_COUNT=10;
        
        this.MONSTER_AI_ON=true;
        
            //
            // sounds
            //
            
        this.VOLUME=0.3;                                // main volume
        
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
