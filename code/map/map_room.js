"use strict";

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

function MapRoomObject(xBound,yBound,zBound,floorGrid,hasStories)
{
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.hasStories=hasStories;
    
        // floor grid becomes first part
        // of lower and upper grid
        
    this.lowerGrid=[
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ];
    
    this.upperGrid=[
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0],
      [0,0,0,0,0]
    ];
        
    var x,z;
    
    for (z=0;z!==5;z++) {
        for (x=0;x!==5;x++) {
            this.lowerGrid[z][x]=floorGrid[z][x];
            this.upperGrid[z][x]=floorGrid[z][x];
        }
    }

        //
        // block off a grid space
        //
        
    this.blockGrid=function(x,z,blockLower,blockUpper)
    {
        if (blockLower) this.lowerGrid[z][x]=0;
        if (blockUpper) this.upperGrid[z][x]=0;
    };
    
        //
        // find points in blocked grid space
        //
    
    this.findCenterLocation=function()
    {
        var sx=this.xBound.getSize()/5;
        var sz=this.zBound.getSize()/5;

        var bx=Math.floor((this.xBound.min+(sx*2))+(sx*0.5));
        var bz=Math.floor((this.zBound.min+(sz*2))+(sz*0.5));
        
        if (this.lowerGrid[2][2]===1) {
            this.lowerGrid[2][2]=0;
            return(new wsPoint(bx,this.yBound.max,bz));
        }

            // if not lower, always force upper
            
        this.upperGrid[2][2]=0;
        return(new wsPoint(bx,(this.yBound.min-ROOM_FLOOR_DEPTH),bz));
    };
        
    this.findRandomFreeLocation=function(genRandom)
    {
        var x,z,sx,sz,bx,bz;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,5);
            z=genRandom.randomInt(0,5);
            
                // see if lower, than upper is OK
                
            sx=this.xBound.getSize()/5;
            sz=this.zBound.getSize()/5;
                
            bx=Math.floor((this.xBound.min+(sx*x))+(sx*0.5));
            bz=Math.floor((this.zBound.min+(sz*z))+(sz*0.5));
                
            if (this.lowerGrid[z][x]===1) {
                this.lowerGrid[z][x]=0;
                return(new wsPoint(bx,this.yBound.max,bz));
            }
            else {
                if (this.upperGrid[z][x]===1) {
                    this.upperGrid[z][x]=0;
                    return(new wsPoint(bx,(this.yBound.min-ROOM_FLOOR_DEPTH),bz));
                }
            }
            
            findTry++;
        }
        
        return(null);
    };

}
