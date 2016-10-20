//
// constants
//

    //
    // math
    //

const DEGREE_TO_RAD=Math.PI/180.0;
const RAD_TO_DEGREE=180.0/Math.PI;

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
const MESH_FLAG_PLATFORM=4;
const MESH_FLAG_LEDGE=5;
const MESH_FLAG_STAIR=6;
const MESH_FLAG_DOOR=7;
const MESH_FLAG_LIFT=8;
const MESH_FLAG_LIGHT=9;
const MESH_FLAG_DECORATION=10;

    //
    // room sides
    //

const ROOM_SIDE_LEFT=0;
const ROOM_SIDE_TOP=1;
const ROOM_SIDE_RIGHT=2;
const ROOM_SIDE_BOTTOM=3;

    //
    // room levels
    //
    
const ROOM_LEVEL_MAIN=0;
const ROOM_LEVEL_LOWER=1;
const ROOM_LEVEL_UPPER=2;

    //
    // decorations
    // 

const ROOM_DECORATION_NONE=-1;
const ROOM_DECORATION_PILLARS=0;
const ROOM_DECORATION_STORAGE=1;
const ROOM_DECORATION_MACHINES=2;
const ROOM_DECORATION_EQUIPMENT=3;

const ROOM_DECORATION_COUNT=4;

    //
    // particles
    //

const PARTICLE_MAX_COUNT=50;                        // maximum number of live particles (all this must be precreated for GC)
const PARTICLE_MAX_POINTS=200;                      // maximum number of points in a particle effect

    //
    // timing
    //

const PHYSICS_MILLISECONDS=16;
const DRAW_MILLISECONDS=16;
const BAIL_MILLISECONDS=5000;

    //
    // model types
    //

const MODEL_TYPE_HUMANOID=0;
const MODEL_TYPE_ANIMAL=1;
const MODEL_TYPE_BLOB=2;
const MODEL_TYPE_WEAPON=3;
const MODEL_TYPE_PROJECTILE=4;

const MODEL_MONSTER_TYPES=[MODEL_TYPE_HUMANOID,MODEL_TYPE_ANIMAL,MODEL_TYPE_BLOB];

    //
    // model limb types
    //

const LIMB_TYPE_BODY=0;
const LIMB_TYPE_HEAD=1;
const LIMB_TYPE_ARM_LEFT=2;
const LIMB_TYPE_ARM_RIGHT=3;
const LIMB_TYPE_LEG_LEFT=4;
const LIMB_TYPE_LEG_RIGHT=5;
const LIMB_TYPE_LEG_FRONT=6;
const LIMB_TYPE_LEG_BACK=7;
const LIMB_TYPE_HAND=8;
const LIMB_TYPE_FINGER=9;
const LIMB_TYPE_FOOT=10;
const LIMB_TYPE_TOE=11;
const LIMB_TYPE_WHIP=12;
const LIMB_TYPE_HEAD_SNOUT=13;
const LIMB_TYPE_HEAD_JAW=14;

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

const LIGHTMAP_RENDER_MARGIN=4;                // margin around each light map triangle
const LIGHTMAP_BLUR_COUNT=3;

    //
    // bitmap generation
    //

const GEN_BITMAP_MAP_TEXTURE_SIZE=512;
const GEN_BITMAP_MODEL_TEXTURE_SIZE=512;
const GEN_BITMAP_SKY_TEXTURE_SIZE=512;
const GEN_BITMAP_PARTICLE_TEXTURE_SIZE=32;

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
