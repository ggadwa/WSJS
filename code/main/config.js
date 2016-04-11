"use strict";

//
// Configuration Class
//

class ConfigClass
{
    constructor()
    {
            //
            // room generation
            //

        this.ROOM_MAX_RECURSION_DEPTH=2;//3;               // how far we recurse building the map, room to room, determines the size of the map
        this.ROOM_MAX_CONNECTION_COUNT=10;             // how many times we try to create a room that connects with this room

        this.ROOM_BLOCK_WIDTH=8000;                    // x/z dimension of a block (rooms are made up of a grid of blocks)
        this.ROOM_FLOOR_HEIGHT=8000;                   // how tall each floor of a room is
        this.ROOM_FLOOR_DEPTH=700;                     // the depth of the area between floors

        this.ROOM_MIN_BLOCK_PER_SIDE=3;                // minimum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_PER_SIDE=10;               // maximum number of blocks that can make up one side of a room
        this.ROOM_MAX_BLOCK_COUNT=50;                  // maximum number of blocks in total for a room (x * z block count)

        this.ROOM_MAX_CONNECT_TRY=20;                  // maximum times to try to find a place to connect a room to another room

        this.ROOM_DOOR_PERCENTAGE=0.33;                // what % of the time a connection to a room is a door
        this.ROOM_LEVEL_CHANGE_PERCENTAGE=0.5;         // what % of the time a connection to a room is up a story
        this.ROOM_UPPER_TALL_PERCENTAGE=0.5;           // what % of the time an upper level room is taller than normal

            //
            // closets, platforms, ledges
            //

        this.ROOM_CLOSET_MAX_COUNT=5;                  // maximum number of possible closets in room
        this.ROOM_CLOSET_UP_PERCENTAGE=0.25;           // what % of the time a closet goes to a second level if available

        this.ROOM_PLATFORM_2ND_PERCENTAGE=0.6;         // what % of the time a platform will have a secondary turn
        this.ROOM_PLATFORM_3RD_PERCENTAGE=0.4;         // what % of the time a platform will have a third turn

        this.ROOM_LEDGE_PERCENTAGE=0.5;                // percentage of > 1 story rooms that have ledges
        this.ROOM_LEDGE_MIN_HEIGHT=300;                // minimum height of ledges
        this.ROOM_LEDGE_EXTRA_HEIGHT=1500;             // extra height of ledges
        this.ROOM_LEDGE_MIN_WIDTH=2000;                // minum width of ledges
        this.ROOM_LEDGE_EXTRA_WIDTH=3000;              // extra width

        this.STAIR_STEP_COUNT=10;

        this.ROOM_CLOSETS=true;                       // turns on or off closets
        this.ROOM_PLATFORMS=true;                      // turns on or off platforms
        this.ROOM_LEDGES=true;                        // turns on or off ledges

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

        this.MAP_LIGHT_AMBIENT=[0.0,0.0,0.0];//[0.15,0.15,0.15];       // all over ambient light [r,g,b]

        this.MAP_LIGHT_FACTOR=0.8;                     // lights are initially set to room radius, this factor is multipled in
        this.MAP_LIGHT_FACTOR_EXTRA=0.6;               // random addition to light factor above
        this.MAP_LIGHT_TWO_STORY_BOOST=1.3;            // multiply boost when a light is in a two story room

        this.MAP_LIGHT_EXPONENT_MINIMUM=0.2;           // minimum light exponent (0.0 is completely hard light with no fall off)
        this.MAP_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add

        this.MAP_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
        this.MAP_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights
        this.MAP_LIGHT_ALWAYS_WHITE=false;              // make sure map lights are always white

        this.MAP_GENERATE_LIGHTMAP=true;              // set to true to generate light maps

            //
            // monsters
            //

        this.MONSTER_TYPE_COUNT=1;//3;
        this.MONSTER_ENTITY_COUNT=0;//10;

        this.MONSTER_AI_ON=true;

            //
            // random seeds,
            // hard set these to generate the same map pieces every time
            //

        this.SEED=Date.now();

        this.SEED_BITMAP_MAP=Math.trunc((Math.random()*this.SEED));
        this.SEED_MAP=6;//Math.trunc((Math.random()*this.SEED));
        this.SEED_BITMAP_MODEL=Math.trunc((Math.random()*this.SEED));
        this.SEED_MODEL=Math.trunc((Math.random()*this.SEED));
        this.SEED_ENTITY=5;//Math.trunc((Math.random()*this.SEED));
        this.SEED_WEAPON=Math.trunc((Math.random()*this.SEED));
        this.SEED_PROJECTILE=Math.trunc((Math.random()*this.SEED));
        this.SEED_SOUND=Math.trunc((Math.random()*this.SEED));

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

        this.DEBUG_DRAW_MODEL_SKELETON=false;
        this.DEBUG_DRAW_MODEL_MESH_LINES=false;
        this.DEBUG_DRAW_MODEL_MESH_NORMALS=false;
        this.DEBUG_DRAW_MODEL_MESH_TANGENTS=false;
    }
}

var config=new ConfigClass();
