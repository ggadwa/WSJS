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

