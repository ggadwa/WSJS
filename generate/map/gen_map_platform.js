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
    
    this.createPlatforms=function(storyCount,yStoryAdd,xBound,yBound,zBound)
    {
        var n,platform;
        var platformBoundX,platformBoundZ;
        
            // platform bitmap
            
        var bitmap=this.map.getBitmapById(BITMAP_WOOD_PLANK);
        
            // do a platform for each story

        var platformBoundY=yBound.copy();
        platformBoundY.min-=500;
        platformBoundY.max=platformBoundY.min+500;
        
            // get random platform

        var platformIdx=this.genRandom.randomInt(0,this.platforms.length);

            // platform for each story
            
        for (n=1;n!==storyCount;n++) {
            
                // get the platform data
                
            platform=this.platforms[platformIdx];
                
                // supergumba -- need to have corners (0.25 of size)

            if (platform[0]!==0) {
                platformBoundX=xBound.copy();
                platformBoundX.min=xBound.min;
                platformBoundX.max=xBound.min+(xBound.getSize()*0.25);
                platformBoundZ=zBound.copy();
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,platformBoundX,platformBoundY,platformBoundZ,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[1]!==0) {
                platformBoundX=xBound.copy();
                platformBoundZ=zBound.copy();
                platformBoundZ.min=zBound.min;
                platformBoundZ.max=zBound.min+(zBound.getSize()*0.25);
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,platformBoundX,platformBoundY,platformBoundZ,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[2]!==0) {
                platformBoundX=xBound.copy();
                platformBoundX.max=xBound.max;
                platformBoundX.min=xBound.max-(xBound.getSize()*0.25);
                platformBoundZ=zBound.copy();
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,platformBoundX,platformBoundY,platformBoundZ,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            if (platform[3]!==0) {
                platformBoundX=xBound.copy();
                platformBoundZ=zBound.copy();
                platformBoundZ.max=zBound.max;
                platformBoundZ.min=zBound.max-(zBound.getSize()*0.25);
                this.map.addMesh(meshPrimitives.createMeshCube(bitmap,platformBoundX,platformBoundY,platformBoundZ,false,true,true,true,true,true,true,this.map.MESH_FLAG_ROOM_PLATFORM));
            }
            
                // the next story platform is always
                // the next platform on the list
                // as they are opposites of
                // each other
                
            platformIdx++;
            if (platformIdx>=this.platforms.length) platformIdx=0;
            
                // next story

            platformBoundY.add(-yStoryAdd);
        }
    };
    
}

