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

        this.ROOM_PLATFORM_2ND_PERCENTAGE=0.6;         // what % of the time a platform will have a secondary turn
        this.ROOM_PLATFORM_3RD_PERCENTAGE=0.4;         // what % of the time a platform will have a third turn
        
        this.ROOM_LONG_HALLWAY_PERCENTAGE=0.3;          // what percentage of the time the general room path will have a long hallway

        this.ROOM_LEDGE_PERCENTAGE=0.5;                // percentage of > 1 story rooms that have ledges
        this.ROOM_LEDGE_MIN_HEIGHT=300;                // minimum height of ledges
        this.ROOM_LEDGE_EXTRA_HEIGHT=1500;             // extra height of ledges
        this.ROOM_LEDGE_MIN_WIDTH=2000;                // minum width of ledges
        this.ROOM_LEDGE_EXTRA_WIDTH=3000;              // extra width
        
        this.STAIR_STEP_COUNT=10;
        
        this.ROOM_CLOSETS=true;                         // turns on or off closets
        this.ROOM_PLATFORMS=true;                       // turns on or off platforms
        this.ROOM_LEDGES=true;                          // turns on or off ledges
        
            //
            // liquids
            //
            
        this.ROOM_LIQUID_PERCENTAGE=0.2;                // what % of time a two story room can have a liquid
        
        this.ROOM_LIQUID_WAVE_FREQUENCY=4000;           // frequency in milliseconds of waves
        this.ROOM_LIQUID_WAVE_HEIGHT=400;               // pixel height of waves
                
        this.ROOM_LIQUIDS=true;                         // turns on or off liquids

            //
            // pillars and decorations
            //

        this.ROOM_MAX_PILLAR_PERCENTAGE=0.5;           // amount of time a room has pillars

        this.ROOM_DECORATION_MIN_COUNT=1;              // minimum number of decoration pieces in a room
        this.ROOM_DECORATION_EXTRA_COUNT=3;            // extra number of decoration pieces

        this.ROOM_PILLARS=true;                        // turns on or off pillars
        this.ROOM_DECORATIONS=true;                    // turns on or off decorations

            //
            // lighting
            //

        this.MAP_LIGHT_AMBIENT_R=0.2;                   // all over ambient light [r,g,b]
        this.MAP_LIGHT_AMBIENT_G=0.2;
        this.MAP_LIGHT_AMBIENT_B=0.2;

        this.MAP_LIGHT_FACTOR=0.5;                     // lights are initially set to room radius, this factor is multipled in
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

        this.MONSTER_TYPE_COUNT=1;
        this.MONSTER_ENTITY_COUNT=0;
        
        this.MONSTER_FIRE_PERCENTAGE=0.75;              // amount of time a monster can fire
        
        this.MONSTER_MIN_SPEED=15;                      // minimum speed for monster
        this.MONSTER_RANDOM_EXTRA_SPEED=60;             // additional random speed for monster
        this.MONSTER_MIN_ACCELERATION=1;                // minimum acceleration
        this.MONSTER_RANDOM_EXTRA_ACCELERATION=20;
        this.MONSTER_MIN_DECLERATION=1;                 // minimum deceleration
        this.MONSTER_RANDOM_EXTRA_DECELERATION=20;
        
        this.MONSTER_MIN_STAND_TURN_SPEED=0.2;
        this.MONSTER_RANDOM_EXTRA_STAND_TURN_SPEED=0.5;
        this.MONSTER_MIN_WALK_TURN_SPEED=0.2;
        this.MONSTER_RANDOM_EXTRA_WALK_TURN_SPEED=0.5;

        this.MONSTER_AI_ON=false;
        
            //
            // sounds
            //
            
        this.MAX_CONCURRENT_SOUNDS=8;                   // maximum number of concurrent sounds you can have playing
        
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

var config=new ConfigClass();
