//
// room generation
//

const ROOM_MAX_RECURSION_DEPTH=3;               // how far we recurse building the map, room to room, determines the size of the map
const ROOM_MAX_CONNECTION_COUNT=10;             // how many times we try to create a room that connects with this room

const ROOM_BLOCK_WIDTH=8000;                    // x/z dimension of a block (rooms are made up of a grid of blocks)
const ROOM_FLOOR_HEIGHT=8000;                   // how tall each floor of a room is
const ROOM_FLOOR_DEPTH=700;                     // the depth of the area between floors

const ROOM_MIN_BLOCK_PER_SIDE=3;                // minimum number of blocks that can make up one side of a room
const ROOM_MAX_BLOCK_PER_SIDE=10;               // maximum number of blocks that can make up one side of a room
const ROOM_MAX_BLOCK_COUNT=50;                  // maximum number of blocks in total for a room (x * z block count)

const ROOM_MAX_CONNECT_TRY=20;                  // maximum times to try to find a place to connect a room to another room

const ROOM_DOOR_PERCENTAGE=0.33;                // what % of the time a connection to a room is a door
const ROOM_LEVEL_CHANGE_PERCENTAGE=0.5;         // what % of the time a connection to a room is up a story
const ROOM_UPPER_TALL_PERCENTAGE=0.5;           // what % of the time an upper level room is taller than normal

//
// closets, platforms, ledges
//

const ROOM_CLOSET_MAX_COUNT=5;                  // maximum number of possible closets in room
const ROOM_CLOSET_UP_PERCENTAGE=0.25;           // what % of the time a closet goes to a second level if available

const ROOM_PLATFORM_2ND_PERCENTAGE=0.6;         // what % of the time a platform will have a secondary turn
const ROOM_PLATFORM_3RD_PERCENTAGE=0.4;         // what % of the time a platform will have a third turn

const ROOM_LEDGE_PERCENTAGE=0.5;                // percentage of > 1 story rooms that have ledges
const ROOM_LEDGE_MIN_HEIGHT=300;                // minimum height of ledges
const ROOM_LEDGE_EXTRA_HEIGHT=1500;             // extra height of ledges
const ROOM_LEDGE_MIN_WIDTH=2000;                // minum width of ledges
const ROOM_LEDGE_EXTRA_WIDTH=3000;              // extra width

const ROOM_CLOSETS=true;                       // turns on or off closets
const ROOM_PLATFORMS=true;                      // turns on or off platforms
const ROOM_LEDGES=true;                        // turns on or off ledges

//
// pillars and decorations
//

const ROOM_MAX_PILLAR_PERCENTAGE=0.5;           // amount of time a room has pillars

const ROOM_DECORATION_MIN_COUNT=1;              // minimum number of decoration pieces in a room
const ROOM_DECORATION_EXTRA_COUNT=3;            // extra number of decoration pieces

const ROOM_PILLARS=true;                        // turns on or off pillars
const ROOM_DECORATIONS=true;                    // turns on or off decorations

//
// lighting
//

const MAP_LIGHT_AMBIENT=[0.15,0.15,0.15];       // all over ambient light [r,g,b]
    
const MAP_LIGHT_FACTOR=0.8;                     // lights are initially set to room radius, this factor is multipled in
const MAP_LIGHT_FACTOR_EXTRA=0.6;               // random addition to light factor above
const MAP_LIGHT_TWO_STORY_BOOST=1.3;            // multiply boost when a light is in a two story room
  
const MAP_LIGHT_EXPONENT_MINIMUM=0.2;           // minimum light exponent (0.0 is completely hard light with no fall off)
const MAP_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add
    
const MAP_LIGHT_RGB_MINIMUM=0.7;                // minimum r, g, or b value for map lights
const MAP_LIGHT_RGB_MINIMUM_EXTRA=0.3;          // random r, g, b add for map lights
const MAP_LIGHT_ALWAYS_WHITE=false;              // make sure map lights are always white

const MAP_GENERATE_LIGHTMAP=false;              // set to true to generate light maps

//
// monsters
//

const MONSTER_MODEL_COUNT=3;
const MONSTER_ENTITY_COUNT=15;

const MONSTER_AI_ON=true;

//
// particles
//

const PARTICLE_MAX_COUNT=50;                        // maximum number of live particles (all this must be precreated for GC)
const PARTICLE_MAX_POINTS=200;                      // maximum number of points in a particle effect

//
// random seeds,
// hard set these to generate the same map pieces every time
//

const SEED=Date.now();

const SEED_BITMAP_MAP=Math.trunc((Math.random()*SEED));
const SEED_MAP=2; //Math.trunc((Math.random()*SEED));
const SEED_BITMAP_MODEL=Math.trunc((Math.random()*SEED));
const SEED_MODEL=Math.trunc((Math.random()*SEED));
const SEED_ENTITY=2; //Math.trunc((Math.random()*SEED));
const SEED_SOUND=Math.trunc((Math.random()*SEED));

//
// timing
//

const PHYSICS_MILLISECONDS=16;
const DRAW_MILLISECONDS=16;
const BAIL_MILLISECONDS=5000;

//
// play testing
//

const PLAYER_CLIP_WALLS=false;
const PLAYER_FLY=false;

//
// draw debuging
//

const DEBUG_DRAW_MAP_MESH_LINES=false;
const DEBUG_DRAW_MAP_MESH_NORMALS=false;
const DEBUG_DRAW_MAP_MESH_TANGENTS=false;

const DEBUG_DRAW_MODEL_SKELETON=false;
const DEBUG_DRAW_MODEL_MESH_LINES=false;
const DEBUG_DRAW_MODEL_MESH_NORMALS=false;
const DEBUG_DRAW_MODEL_MESH_TANGENTS=false;

//
// math
//

const DEGREE_TO_RAD=Math.PI/180.0;

//
// processing
//

const PROCESS_TIMEOUT_MSEC=1;           // this is used when using a timeout to keep browser active during long processes

//
// map mesh flags
//

const MESH_FLAG_NONE=0;
const MESH_FLAG_ROOM_WALL=1;
const MESH_FLAG_ROOM_FLOOR=2;
const MESH_FLAG_ROOM_CEILING=3;
const MESH_FLAG_ROOM_PLATFORM=4;
const MESH_FLAG_ROOM_LEDGE=5;
const MESH_FLAG_STAIR=6;
const MESH_FLAG_DOOR=7;
const MESH_FLAG_LIGHT=8;
const MESH_FLAG_DECORATION=9;

//
// room sides
//

const ROOM_SIDE_LEFT=0;
const ROOM_SIDE_TOP=1;
const ROOM_SIDE_RIGHT=2;
const ROOM_SIDE_BOTTOM=3;

//
// room connection modes
//
        
const ROOM_CONNECT_MODE_NONE=0;
const ROOM_CONNECT_MODE_UP=1;
const ROOM_CONNECT_MODE_DOWN=2;
const ROOM_CONNECT_MODE_DOOR=3;

const STAIR_STEP_COUNT=10;

//
// model types
//

const MODEL_TYPE_HUMANOID=0;
const MODEL_TYPE_ANIMAL=1;
const MODEL_TYPE_BLOB=2;
const MODEL_TYPE_WEAPON=3;
const MODEL_TYPE_PROJECTILE=4;

//
// model limb types
//

const LIMB_TYPE_BODY=0;
const LIMB_TYPE_HEAD=1;
const LIMB_TYPE_ARM_LEFT=2;
const LIMB_TYPE_ARM_RIGHT=3;
const LIMB_TYPE_LEG_LEFT=4;
const LIMB_TYPE_LEG_RIGHT=5;
const LIMB_TYPE_HAND_LEFT=8;
const LIMB_TYPE_HAND_RIGHT=9;
const LIMB_TYPE_FINGER_LEFT=6;
const LIMB_TYPE_FINGER_RIGHT=7;
const LIMB_TYPE_FOOT_LEFT=8;
const LIMB_TYPE_FOOT_RIGHT=9;
const LIMB_TYPE_TOE_LEFT=10;
const LIMB_TYPE_TOE_RIGHT=11;
const LIMB_TYPE_WHIP=12;

const LIMB_AXIS_X=0;
const LIMB_AXIS_Y=1;
const LIMB_AXIS_Z=2;

//
// text drawing
//

const TEXT_TEXTURE_WIDTH=512;
const TEXT_TEXTURE_HEIGHT=512;
const TEXT_CHAR_PER_ROW=10;
const TEXT_CHAR_WIDTH=50;
const TEXT_CHAR_HEIGHT=50;
const TEXT_FONT_SIZE=48;
const TEXT_FONT_NAME='Arial';

const TEXT_ALIGN_LEFT=0;
const TEXT_ALIGN_CENTER=1;
const TEXT_ALIGN_RIGHT=2;

const TEXT_MAX_STRING_LEN=256;

//
// lightmap generation
//

const LIGHTMAP_TEXTURE_SIZE=1024;
    
const LIGHTMAP_CHUNK_SPLIT=16;                  // how many chunks in both the X and Y direction
const LIGHTMAP_CHUNK_SIZE=Math.trunc(LIGHTMAP_TEXTURE_SIZE/LIGHTMAP_CHUNK_SPLIT);    // square pixel size of chunks
const LIGHTMAP_CHUNK_PER_TEXTURE=(LIGHTMAP_CHUNK_SPLIT*LIGHTMAP_CHUNK_SPLIT);        // how many chunks in a single texture

const LIGHTMAP_RENDER_MARGIN=3;                // margin around each light map triangle
const LIGHTMAP_BLUR_COUNT=3;

//
// bitmap generation
//

const GEN_BITMAP_TEXTURE_SIZE=512;

const BITMAP_STACKED_X_MIN_COUNT=1;
const BITMAP_STACKED_X_EXTRA_COUNT=4;
const BITMAP_STACKED_Y_MIN_COUNT=3;
const BITMAP_STACKED_Y_EXTRA_COUNT=4;

const BITMAP_GRID_DIVISION=100;
const BITMAP_GRID_MIN_BLOCK_WIDTH=30;
const BITMAP_GRID_EXTRA_BLOCK_WIDTH=10;
const BITMAP_GRID_ELIMINATE_BLOCK_MIN_WIDTH=20;
const BITMAP_GRID_MIN_BLOCK_HEIGHT=10;
const BITMAP_GRID_EXTRA_BLOCK_HEIGHT=15;
const BITMAP_GRID_ELIMINATE_BLOCK_MIN_HEIGHT=10;

//
// bitmap generation types
//

const GEN_BITMAP_MAP_TYPE_BRICK_STACK=0;
const GEN_BITMAP_MAP_TYPE_BRICK_RANDOM=1;
const GEN_BITMAP_MAP_TYPE_STONE=2;
const GEN_BITMAP_MAP_TYPE_BLOCK=3;
const GEN_BITMAP_MAP_TYPE_TILE_SIMPLE=4;
const GEN_BITMAP_MAP_TYPE_TILE_COMPLEX=5;
const GEN_BITMAP_MAP_TYPE_TILE_SMALL=6;
const GEN_BITMAP_MAP_TYPE_HEXAGONAL=7;
const GEN_BITMAP_MAP_TYPE_METAL=8;
const GEN_BITMAP_MAP_TYPE_METAL_BAR=9;
const GEN_BITMAP_MAP_TYPE_METAL_CORRUGATED=10;
const GEN_BITMAP_MAP_TYPE_METAL_SHUTTER=11;
const GEN_BITMAP_MAP_TYPE_CONCRETE=12;
const GEN_BITMAP_MAP_TYPE_CEMENT=13;
const GEN_BITMAP_MAP_TYPE_PLASTER=14;
const GEN_BITMAP_MAP_TYPE_MOSAIC=15;
const GEN_BITMAP_MAP_TYPE_WOOD_PLANK=16;
const GEN_BITMAP_MAP_TYPE_WOOD_BOX=17;
const GEN_BITMAP_MAP_TYPE_MACHINE=18;

const GEN_BITMAP_MAP_TYPE_NAMES=[
                        'Brick Stack','Brick Random','Stone','Block',
                        'Tile Simple','Tile Complex','Tile Small','Hexagonal',
                        'Metal','Metal Bar','Metal Corrugated','Metal Shutter',
                        'Concrete','Cement','Plaster','Mosaic',
                        'Wood Plank','Wood Box','Machine'
                    ];

const GEN_BITMAP_MODEL_TYPE_SKIN_SCALE=0;
const GEN_BITMAP_MODEL_TYPE_SKIN_LEATHER=1;
const GEN_BITMAP_MODEL_TYPE_SKIN_FUR=2;

const GEN_BITMAP_MODEL_TYPE_NAMES=[
                        'Skin Scale','Skin Leather','Skin Fur'
                    ];

//
// sound generation types
//

const GEN_SOUND_TYPE_GUN_FIRE=0;
const GEN_SOUND_TYPE_EXPLOSION=1;
const GEN_SOUND_TYPE_MONSTER_SCREAM=2;

const GEN_SOUND_TYPE_NAMES= [
                                'Gun Fire','Explosion','Monster Scream'
                            ];
