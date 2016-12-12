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
const ROOM_DECORATION_WALLS=4;

const ROOM_DECORATION_COUNT=5;

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
