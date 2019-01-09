//
// Constants
// 

export const GL_OPTIONS={
            alpha:false,
            depth:true,
            stencil:false,
            antialias:false,
            premultipliedAlpha:false,
            preserveDrawingBuffer:true,
            failIfMajorPerformanceCaveat:false
        }; 

    // misc math
    
export const DEGREE_TO_RAD=Math.PI/180.0;
export const RAD_TO_DEGREE=180.0/Math.PI;

    // loop timing
    
export const PHYSICS_MILLISECONDS=16;
export const DRAW_MILLISECONDS=16;
export const BAIL_MILLISECONDS=5000;

    // input timing
    
export const INPUT_WHEEL_REFRESH_TICK=500;

    // entity physics
    
export const BUMP_HEIGHT=1000;                          // heights we can bump up
export const FLOOR_RISE_HEIGHT=2000;                    // heights we can move up or down on a slanted triangle
            
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
export const MESH_FLAG_ROOM_FENCE=12;
export const MESH_FLAG_ROOM_GROUND=13;

    // particles
    
export const PARTICLE_MAX_COUNT=50;
export const PARTICLE_MAX_POINTS=200;
