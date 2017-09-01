//
// Constants
// 

    // misc math
    
export const DEGREE_TO_RAD=Math.PI/180.0;
export const RAD_TO_DEGREE=180.0/Math.PI;

    // loop timing
    
export const PHYSICS_MILLISECONDS=16;
export const DRAW_MILLISECONDS=16;
export const BAIL_MILLISECONDS=5000;

    // room settings
    
export const ROOM_BLOCK_WIDTH=8000;                     // x/z dimension of a block (rooms are made up of a grid of blocks)
export const ROOM_FLOOR_HEIGHT=8000;                    // how tall each floor of a room is
export const ROOM_FLOOR_DEPTH=700;                      // the depth of the area between floors
            
export const ROOM_SIDE_LEFT=0;
export const ROOM_SIDE_TOP=1;
export const ROOM_SIDE_RIGHT=2;
export const ROOM_SIDE_BOTTOM=3;
        
export const ROOM_LEVEL_NORMAL=0;
export const ROOM_LEVEL_LOWER=1;
export const ROOM_LEVEL_HIGHER=2;
export const ROOM_LEVEL_COUNT=3;
        
export const ROOM_EXTENSION_DIRECTION_LEFT_RIGHT=0;
export const ROOM_EXTENSION_DIRECTION_TOP_BOTTOM=1;
        
export const ROOM_PATH_TYPE_NORMAL=0;
export const ROOM_PATH_TYPE_START=1;
export const ROOM_PATH_TYPE_GOAL=2;

export const ROOM_DECORATION_NONE=-1;
export const ROOM_DECORATION_PILLARS=0;
export const ROOM_DECORATION_STORAGE=1;
export const ROOM_DECORATION_COMPUTER=2;
export const ROOM_DECORATION_PIPE=3;
export const ROOM_DECORATION_CUBICAL=4;
export const ROOM_DECORATION_LAB=5;

    // map mesh flag types

export const MESH_FLAG_NONE=0;
export const MESH_FLAG_ROOM_WALL=1;
export const MESH_FLAG_ROOM_FLOOR=2;
export const MESH_FLAG_ROOM_CEILING=3;
export const MESH_FLAG_PLATFORM=4;
export const MESH_FLAG_LEDGE=5;
export const MESH_FLAG_STAIR=6;
export const MESH_FLAG_DOOR=7;
export const MESH_FLAG_LIFT=8;
export const MESH_FLAG_LIGHT=9;
export const MESH_FLAG_DECORATION=10;
export const MESH_FLAG_WINDOW=11;

    // extra room features
    
export const STAIR_STEP_COUNT=10;
        
export const LEDGE_PERCENTAGE=0.5;              // percentage of > 1 story rooms that have ledges
export const LEDGE_MIN_HEIGHT=300;              // minimum height of ledges
export const LEDGE_EXTRA_HEIGHT=1500;           // extra height of ledges
export const LEDGE_MIN_WIDTH=2000;              // minum width of ledges
export const LEDGE_EXTRA_WIDTH=3000;            // extra width

export const WINDOW_MAX_COUNT=5;            // maximum number of possible windows in room
export const CLOSET_MAX_COUNT=5;            // maximum number of possible closets in room

export const PIPE_SIDE_COUNT=12;
export const PIPE_CURVE_SEGMENT_COUNT=5;

    // model limb types
    
export const LIMB_TYPE_BODY=0;
export const LIMB_TYPE_NECK=1;
export const LIMB_TYPE_HEAD=2;
export const LIMB_TYPE_HEAD_SNOUT=3;
export const LIMB_TYPE_HEAD_JAW=4;
export const LIMB_TYPE_ARM=5;
export const LIMB_TYPE_HAND=6;
export const LIMB_TYPE_FINGER=7;
export const LIMB_TYPE_LEG=8;
export const LIMB_TYPE_FOOT=9;
export const LIMB_TYPE_TOE=10;
export const LIMB_TYPE_WHIP=11;

export const LIMB_AXIS_X=0;
export const LIMB_AXIS_Y=1;
export const LIMB_AXIS_Z=2;

    // particles
    
export const PARTICLE_MAX_COUNT=50;
export const PARTICLE_MAX_POINTS=200;


    // bitmap types
            
export const BITMAP_TYPE_WALL=0;
export const BITMAP_TYPE_FLOOR=1;
export const BITMAP_TYPE_CEILING=2;
export const BITMAP_TYPE_DOOR=3;
export const BITMAP_TYPE_METAL=4;
export const BITMAP_TYPE_BOX=5;
export const BITMAP_TYPE_PANEL=6;
export const BITMAP_TYPE_LIQUID=7;
export const BITMAP_TYPE_MACHINE=8;
export const BITMAP_TYPE_PLATFORM=9;
export const BITMAP_TYPE_PIPE=10;
export const BITMAP_TYPE_FRAME=11;
export const BITMAP_TYPE_PILLAR=12;
export const BITMAP_TYPE_GLASS=13;
export const BITMAP_TYPE_GOO=14;
export const BITMAP_TYPE_PARTICLE=15;
export const BITMAP_TYPE_ITEM=16;
export const BITMAP_TYPE_SKIN=17;
export const BITMAP_TYPE_SKY=18;

export const BITMAP_TYPE_NAMES=
                [
                    'Wall','Floor','Ceiling','Door','Metal',
                    'Box','Panel','Liquid','Machine',
                    'Platform','Pipe','Frame','Pillar','Glass',
                    'Goo','Particle','Item','Skin','Sky'
                ];

