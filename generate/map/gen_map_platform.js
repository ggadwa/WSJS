"use strict";

//
// map platforms
//

function GenRoomPlatform(map,genRandom)
{
    this.map=map;
    this.genRandom=genRandom;
    
        // platform definitions
        // [left,top,bottom,right,left stub,top stub,bottom stub,right stub]
        
    this.platforms=[];
    
    this.platforms.push([1,1,0,0,0,0,0,0]);
    this.platforms.push([0,0,1,1,0,0,0,0]);
    this.platforms.push([1,1,0,0,1,1,0,0]);
    this.platforms.push([0,0,1,1,0,0,1,1]);
    this.platforms.push([1,1,1,1,0,0,0,0]);
    this.platforms.push([1,1,1,1,1,1,1,1]);
    this.platforms.push([1,1,1,0,0,0,0,0]);
    this.platforms.push([1,0,1,1,0,0,0,0]);
    
        //
        // platform mainline
        // 
    
    this.createPlatforms=function(storyCount,yStoryAdd,roomBitmap,xBound,yBound,zBound)
    {
        var n,platform;
        var xPlatformBound,zPlatformBound;
        var xStairBound,yStairBound,zStairBound;
        
            // platform bitmap
            
        var bitmap=this.map.getBitmapById(BITMAP_WOOD_PLANK);
        
            // stairs
            
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);
        
            // do a platform for each story

        var yPlatformBound=yBound.copy();
        yPlatformBound.min-=500;
        yPlatformBound.max=yPlatformBound.min+500;
        
            // get random platform

        var platformIdx=this.genRandom.randomInt(0,this.platforms.length);
        var nextPlatformIdx;
        
            // platform for each story
            
        for (n=1;n!==storyCount;n++) {
            
                // get the platform data
                
            platform=this.platforms[platformIdx];
                
                // supergumba -- need to have corners (0.25 of size)

            if (platform[0]!==0) {
                xPlatformBound=xBound.copy();
                xPlatformBound.min=xBound.min;
                xPlatformBound.max=xBound.min+(xBound.getSize()*0.25);
                zPlatformBound=zBound.copy();
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[1]!==0) {
                xPlatformBound=xBound.copy();
                zPlatformBound=zBound.copy();
                zPlatformBound.min=zBound.min;
                zPlatformBound.max=zBound.min+(zBound.getSize()*0.25);
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[2]!==0) {
                xPlatformBound=xBound.copy();
                xPlatformBound.max=xBound.max;
                xPlatformBound.min=xBound.max-(xBound.getSize()*0.25);
                zPlatformBound=zBound.copy();
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[3]!==0) {
                xPlatformBound=xBound.copy();
                zPlatformBound=zBound.copy();
                zPlatformBound.max=zBound.max;
                zPlatformBound.min=zBound.max-(zBound.getSize()*0.25);
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,xPlatformBound,yPlatformBound,zPlatformBound,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            
                // stairs
                
            var stairBitmap=this.map.getBitmapById(BITMAP_STAIR_TILE);
            
            xStairBound=new wsBound(0,0);
            yStairBound=yBound.copy();
            zStairBound=new wsBound(0,0);
            
            xStairBound.min=xBound.min+(xBound.getSize()*0.25);
            xStairBound.max=xBound.min+((xBound.getSize()*0.25)+4000);
            zStairBound.min=zBound.min+((zBound.getSize()*0.50)-1000);
            zStairBound.max=zBound.min+((zBound.getSize()*0.50)+1000);
            genRoomStairs.createStairsPosX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,true);

            xStairBound.min=xBound.min+((xBound.getSize()*0.50)-1000);
            xStairBound.max=xBound.min+((xBound.getSize()*0.50)+1000);
            zStairBound.min=zBound.min+(zBound.getSize()*0.25);
            zStairBound.max=zBound.min+((zBound.getSize()*0.25)+4000);
            genRoomStairs.createStairsPosZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,true);

            xStairBound.min=xBound.max-((xBound.getSize()*0.25)+4000);
            xStairBound.max=xBound.max-(xBound.getSize()*0.25);
            zStairBound.min=zBound.min+((zBound.getSize()*0.50)-1000);
            zStairBound.max=zBound.min+((zBound.getSize()*0.50)+1000);
            genRoomStairs.createStairsNegX(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,true);

            xStairBound.min=xBound.min+((xBound.getSize()*0.50)-1000);
            xStairBound.max=xBound.min+((xBound.getSize()*0.50)+1000);
            zStairBound.min=zBound.max-((zBound.getSize()*0.25)+4000);
            zStairBound.max=zBound.max-(zBound.getSize()*0.25);
            genRoomStairs.createStairsNegZ(roomBitmap,stairBitmap,xStairBound,yStairBound,zStairBound,true);

            
                // pick another platform, but don't
                // use the same one
                
            nextPlatformIdx=this.genRandom.randomInt(0,this.platforms.length);
            if (nextPlatformIdx===platformIdx) {
                nextPlatformIdx++;
                if (nextPlatformIdx>=this.platforms.length) nextPlatformIdx=0;
            }
            platformIdx=nextPlatformIdx;
            
                // next story

            yPlatformBound.add(-yStoryAdd);
        }
    };
    
}

