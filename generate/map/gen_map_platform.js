"use strict";

//
// map platforms
//

function GenRoomPlatform(map,genRandom,piece)
{
    this.map=map;
    this.genRandom=genRandom;
    this.piece=piece;
    
        // constants
        
    this.MAX_OPEN_BLOCK_TRY=25;
    
        //
        // platform mainline
        // 
    
    this.createPlatforms=function(xBound,yBound,zBound)
    {
        var n,x,z,moveOk,tryCount,isPillar;
        var xAdd=Math.floor(xBound.getSize()/5);
        var zAdd=Math.floor(xBound.getSize()/5);
        
        var xPlatformBound,zPlatformBound;
        var yPlatformBound=new wsBound((yBound.min-settings.roomFloorDepth),yBound.min);
        var yPlatformPillarBound=new wsBound((yBound.min-settings.roomFloorDepth),yBound.max);
        
        var platformBitmap=this.map.getBitmapById(TEXTURE_PLATFORM);
        
            // the grid to put down platform pieces is
            // the reverse of the floor grid
        
        var grid=[
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ];

        for (z=0;z!==5;z++) {
            for (x=0;x!==5;x++) {
                grid[z][x]=(piece.floorGrid[z][x]===1)?0:1;
            }
        }
        
            // find a spot to start
            
        x=-1;
        z=-1;
        tryCount=0;
        
        while (x===-1) {
            x=this.genRandom.randomInt(0,5);
            z=this.genRandom.randomInt(0,5);
            
            if (grid[z][x]===0) break;
            
            x=-1;
            
            tryCount++;
            if (tryCount>this.MAX_OPEN_BLOCK_TRY) return;
        }
        
            // make the platforms
        
        var platformCount=this.genRandom.randomInt(5,10);

        for (n=0;n!==platformCount;n++) {
            
                // is this a pillar version?
                // don't do on edges or in middle (as
                // player will spawn there)
                
            isPillar=false;
            
            if ((x!==0) && (x!==4) && (z!==0) && (z!==4)) {
                if (!((x===2) && (z===2))) {
                    isPillar=(this.genRandom.random()<0.5);
                }
            }
            
                // add platform and mark grid
                // as being used
                
            xPlatformBound=new wsBound((xBound.min+(x*xAdd)),(xBound.min+((x+1)*xAdd)));
            zPlatformBound=new wsBound((zBound.min+(z*zAdd)),(zBound.min+((z+1)*zAdd)));
            
            this.map.addMesh(meshPrimitives.createMeshCube(platformBitmap,xPlatformBound,(isPillar?yPlatformPillarBound:yPlatformBound),zPlatformBound,false,true,true,true,true,true,(!isPillar),this.map.MESH_FLAG_ROOM_PLATFORM));

            grid[z][x]=2;       // we use 2 so we can later re-check list for stair locations
            
                // move to next platform area
                
            moveOk=false;
            tryCount=0;
            
            while (true) {
                
                switch (this.genRandom.randomInt(0,4)) {
                    case 0:
                        if (x<4) {
                            if (grid[z][x+1]===0) {
                                x++;
                                moveOk=true;
                            }
                        }
                        break;
                    case 1:
                        if (z<4) {
                            if (grid[z+1][x]===0) {
                                z++;
                                moveOk=true;
                            }
                        }
                        break;
                    case 2:
                        if (x>0) {
                            if (grid[z][x-1]===0) {
                                x--;
                                moveOk=true;
                            }
                        }
                        break;
                    case 3:
                        if (z>0) {
                            if (grid[z-1][x]===0) {
                                z--;
                                moveOk=true;
                            }
                        }
                        break;
                }
                
                if (moveOk) break;
                
                    // if we tried to move and couldn't
                    // find a place in a while, break out
                    
                tryCount++;
                if (tryCount>this.MAX_OPEN_BLOCK_TRY) return;
            }
        }
        
            // try to find a place to put
            // some stairs
            
        x=-1;
        z=-1;
        
        var stairDir=0;
        
        tryCount=0;
        
        while (x===-1) {
            
                // skip the edges
                
            x=this.genRandom.randomInt(1,3);
            z=this.genRandom.randomInt(1,3);
            
                // always skip middle, player
                // can spawn there
                
            if (!((x===2) && (z===2))) {
            
                    // if this spot is open,
                    // find if there's a block near
                    // it to build stairs too

                if (grid[z][x]===0) {
                    if (grid[z][x+1]==2) {
                        stairDir=0;
                        break;
                    }
                    if (grid[z][x-1]===2) {
                        stairDir=2;
                        break;
                    }
                    if (grid[z+1][x]===2) {
                        stairDir=1;
                        break;
                    }
                    if (grid[z+1][x]===2) {
                        stairDir=3;
                        break;
                    }
                }
            }
            
                // try again
                
            x=-1;
            
            tryCount++;
            if (tryCount>this.MAX_OPEN_BLOCK_TRY) return;
        }
        
            // finally add a stair case
        
        var stairBitmap=this.map.getBitmapById(TEXTURE_STAIR);
        var genRoomStairs=new GenRoomStairs(this.map,this.genRandom);

        var xStairBound=new wsBound((xBound.min+(x*xAdd)),(xBound.min+((x+1)*xAdd)));
        var zStairBound=new wsBound((zBound.min+(z*zAdd)),(zBound.min+((z+1)*zAdd)));
        
        switch (stairDir) {
            case 0:
                genRoomStairs.createStairsX(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true);
                break;
            case 1:
                genRoomStairs.createStairsZ(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,true);
                break;
            case 2:
                genRoomStairs.createStairsX(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,false);
                break;
            case 3:
                genRoomStairs.createStairsZ(platformBitmap,stairBitmap,xStairBound,yBound,zStairBound,true,false);
                break;
        }
    };
    
}

