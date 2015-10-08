"use strict";

//
// map platforms
//

function GenRoomPlatform(map,genRandom)
{
    this.map=map;
    this.genRandom=genRandom;
    
        // platform constants
        
    this.SIDE_MIN_Z=0;
    this.SIDE_MIN_X=1;
    this.SIDE_MAX_Z=2;
    this.SIDE_MAX_X=3;
    
        //
        // platform mainline
        // 
    
    this.createPlatforms=function(storyCount,yStoryAdd,roomBitmap,xBound,yBound,zBound)
    {
        var n,platformSide,platformSize;
        var xPlatformBound,zPlatformBound;
        var xStairBound,yStairBound,zStairBound,stairFlip;
        
            // bitmaps
            
        var platformBitmap=this.map.getBitmapById(BITMAP_WOOD_PLANK);
        var stairBitmap=this.map.getBitmapById(BITMAP_STAIR_TILE);
        
            // stairs
            
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);
        
            // do a platform for each story

        var yPlatformBound=yBound.copy();
        var yPlatformBound=new wsBound((yBound.min-500),yBound.min);
        
            // platform for each story
            
        for (n=1;n!==storyCount;n++) {
            
                // get random side to start
                // platform and steps on
                
            platformSide=this.genRandom.randomInt(0,4);
            
                // get random platform size for
                // this side
                
            platformSize=this.genRandom.randomInt(10,20)/100;
            
                // add the first platform
                // and steps
                
            switch (platformSide) {
                case this.SIDE_MIN_Z:
                    xPlatformBound=xBound;
                    zPlatformBound=new wsBound(zBound.min,(zBound.min+(zBound.getSize()*platformSize)));
                    
                    stairFlip=false;
                    xStairBound=new wsBound(xBound.min+((xBound.getSize()*0.50)-2000),xBound.min+((xBound.getSize()*0.50)+2000));
                    zStairBound=new wsBound(zPlatformBound.max,(zPlatformBound.max+5000));
                    break;
                case this.SIDE_MIN_X:
                    xPlatformBound=new wsBound(xBound.min,(xBound.min+(xBound.getSize()*platformSize)));
                    zPlatformBound=zBound;
                    
                    stairFlip=false;
                    xStairBound=new wsBound(xPlatformBound.max,(xPlatformBound.max+5000));
                    zStairBound=new wsBound(zBound.min+((zBound.getSize()*0.50)-2000),zBound.min+((zBound.getSize()*0.50)+2000));
                    break;
                case this.SIDE_MAX_Z:
                    xPlatformBound=xBound;
                    zPlatformBound=new wsBound((zBound.max-(zBound.getSize()*platformSize)),zBound.max);
                    
                    stairFlip=true;
                    xStairBound=new wsBound(xBound.min+((xBound.getSize()*0.50)-2000),xBound.min+((xBound.getSize()*0.50)+2000));
                    zStairBound=new wsBound((zPlatformBound.min-5000),zPlatformBound.min);
                    break;
                case this.SIDE_MAX_X:
                    xPlatformBound=new wsBound((xBound.max-(xBound.getSize()*platformSize)),xBound.max);
                    zPlatformBound=zBound;
                    
                    stairFlip=true;
                    xStairBound=new wsBound((xPlatformBound.min-5000),xPlatformBound.min);
                    zStairBound=new wsBound(zBound.min+((zBound.getSize()*0.50)-2000),zBound.min+((zBound.getSize()*0.50)+2000));
                    break;
            }   

            this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            
            switch (platformSide) {
                case this.SIDE_MIN_Z:
                case this.SIDE_MAX_Z:
                    genRoomStairs.createStairsZ(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,stairFlip);
                    break;
                case this.SIDE_MIN_X:
                case this.SIDE_MAX_X:
                    genRoomStairs.createStairsX(roomBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,stairFlip);
                    break;
            }

            break;  // testing
            //
                // next story

            yPlatformBound.add(-yStoryAdd);
        }
    };
    
}

