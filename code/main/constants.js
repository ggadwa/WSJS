//
// room generation
//

const ROOM_MAX_COUNT=5;                        // the maximum possible number of rooms in the map
const ROOM_MAX_RECURSIONS=3;                    // how far down you will recurse to make rooms off a single room
const ROOM_DIMENSIONS=[80000,7000,80000];       // maximum size for a room [x,y,z]

const ROOM_BLOCK_WIDTH=8000;

const ROOM_FLOOR_DEPTH=700;

const ROOM_MAX_CONNECT_TRY=100;

const ROOM_CONNECTION_PERCENTAGE=0.25;          // what % of the time a connection in a room spawns another room
const ROOM_LEVEL_CHANGE_PERCENTAGE=0.5;         // what % of the time a connection to a room is up a story

const ROOM_CLOSET_MAX_COUNT=5;                  // maximum number of possible closets in room
const ROOM_CLOSET_MAX_LENGTH=10;                // maximum length of closet
const ROOM_CLOSET_UP_PERCENTAGE=0.25;           // what % of the time a closet goes to a second level if available

const ROOM_PLATFORM_2ND_PERCENTAGE=0.6;         // what % of the time a platform will have a secondary turn
const ROOM_PLATFORM_3RD_PERCENTAGE=0.4;         // what % of the time a platform will have a third turn

const ROOM_MAX_DIVISIONS=10;                    // max division for dividing a room up into chunks

const ROOM_PLATFORMS=true;                      // turns on or off platforms

//
// decorations
//

const ROOM_DECORATIONS=true;                   // set to false for no decorations in the map

const ROOM_DECORATIONS_BOX_EXTRA_COUNT=8;       // extra number of boxes

const ROOM_DECORATIONS_PILLAR_FACTOR=0.03;      // the max size (in % of room) for pillars
const ROOM_DECORATIONS_PILLAR_MIN_RADIUS=200;   // minimum radius for pillars
const ROOM_DECORATIONS_PILLAR_EXTRA_SEGMENTS=4; // possible number of extra segments for pillars

//
// lighting
//

const MAP_LIGHT_AMBIENT=[0.0,0.0,0.0];          // all over ambient light [r,g,b]
    
const MAP_LIGHT_FACTOR=0.5;                     // lights are initially set to room radius, this factor is multipled in
const MAP_LIGHT_FACTOR_EXTRA=0.3;               // random addition to light factor above
const MAP_LIGHT_TWO_STORY_BOOST=1.4;            // multiply boost when a light is in a two story room
  
const MAP_LIGHT_EXPONENT_MINIMUM=0.2;           // minimum light exponent (0.0 is completely hard light with no fall off)
const MAP_LIGHT_EXPONENT_EXTRA=0.5;             // exponent add
    
const MAP_LIGHT_RGB_MINIMUM=0.6;                // minimum r, g, or b value for map lights
const MAP_LIGHT_RGB_MINIMUM_EXTRA=0.4;          // random r, g, b add for map lights
const MAP_LIGHT_ALWAYS_WHITE=true;              // make sure map lights are always white

const MAP_GENERATE_LIGHTMAP=false;              // set to true to generate light maps

//
// monsters
//

const MONSTER_MODEL_COUNT=0;
const MONSTER_ENTITY_COUNT=0;

//
// overlays
//

const OVERLAY_DRAW=true;

//
// random seeds,
// hard set these to generate the same map pieces every time
//

const SEED=Date.now();

const SEED_MAP_BITMAP=Math.floor((Math.random()*SEED));
const SEED_MAP=2; //Math.floor((Math.random()*SEED));
const SEED_MODEL_BITMAP=Math.floor((Math.random()*SEED));
const SEED_MODEL=Math.floor((Math.random()*SEED));
const SEED_ENTITY=Math.floor((Math.random()*SEED));

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
// bitmap generation
//

const GEN_BITMAP_TEXTURE_SIZE=512;

const GEN_BITMAP_TYPE_BRICK_STACK=0;
const GEN_BITMAP_TYPE_BRICK_RANDOM=1;
const GEN_BITMAP_TYPE_STONE=2;
const GEN_BITMAP_TYPE_TILE_SIMPLE=3;
const GEN_BITMAP_TYPE_TILE_COMPLEX=4;
const GEN_BITMAP_TYPE_TILE_SMALL=5;
const GEN_BITMAP_TYPE_METAL=6;
const GEN_BITMAP_TYPE_METAL_BAR=7;
const GEN_BITMAP_TYPE_METAL_CORRUGATED=8;
const GEN_BITMAP_TYPE_CONCRETE=9;
const GEN_BITMAP_TYPE_PLASTER=10;
const GEN_BITMAP_TYPE_MOSAIC=11;
const GEN_BITMAP_TYPE_WOOD_PLANK=12;
const GEN_BITMAP_TYPE_WOOD_BOX=13;
const GEN_BITMAP_TYPE_SKIN_SCALE=14;
const GEN_BITMAP_TYPE_SKIN_LEATHER=15;
const GEN_BITMAP_TYPE_SKIN_FUR=16;

const GEN_BITMAP_TILE_STYLE_BORDER=0;
const GEN_BITMAP_TILE_STYLE_CHECKER=1;
const GEN_BITMAP_TILE_STYLE_STRIPE=2;

//
// resource IDs
//

const TEXTURE_WALL=0;
const TEXTURE_FLOOR=1;
const TEXTURE_CEILING=2;
const TEXTURE_STAIR=3;
const TEXTURE_PLATFORM=4;
const TEXTURE_LIGHT=5;
const TEXTURE_BOX=6;
const TEXTURE_PILLAR=7;
const TEXTURE_CLOSET=8;

//
// map mesh flags
//

const MESH_FLAG_NONE=0;
const MESH_FLAG_ROOM_WALL=1;
const MESH_FLAG_ROOM_FLOOR=2;
const MESH_FLAG_ROOM_CEILING=3;
const MESH_FLAG_ROOM_PLATFORM=4;
const MESH_FLAG_STAIR=5;
const MESH_FLAG_LIGHT=6;
const MESH_FLAG_DECORATION=7;

//
// room sides
//

const ROOM_SIDE_LEFT=0;
const ROOM_SIDE_TOP=1;
const ROOM_SIDE_RIGHT=2;
const ROOM_SIDE_BOTTOM=3;

//
// map stairs
//
        
const STAIR_MODE_NONE=0;
const STAIR_MODE_UP=1;
const STAIR_MODE_DOWN=2;

const STAIR_STEP_COUNT=10;

//
// map platforms
//

const PLATFORM_MAX_OPEN_BLOCK_TRY=25;

//
// model limb types
//

const LIMB_TYPE_BODY=0;
const LIMB_TYPE_HEAD=1;
const LIMB_TYPE_ARM=2;
const LIMB_TYPE_LEG=3;

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
const LIGHTMAP_CHUNK_SIZE=Math.floor(LIGHTMAP_TEXTURE_SIZE/LIGHTMAP_CHUNK_SPLIT);    // square pixel size of chunks
const LIGHTMAP_CHUNK_PER_TEXTURE=(LIGHTMAP_CHUNK_SPLIT*LIGHTMAP_CHUNK_SPLIT);        // how many chunks in a single texture

const LIGHTMAP_RENDER_MARGIN=3;                // margin around each light map triangle
const LIGHTMAP_BLUR_COUNT=3;

//
// bitmap generation
//

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
// model types
//

const MODEL_TYPE_HUMANOID=0;
const MODEL_TYPE_ANIMAL=1;
const MODEL_TYPE_BLOB=2;
const MODEL_TYPE_WEAPON=3;

