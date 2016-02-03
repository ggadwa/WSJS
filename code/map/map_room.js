"use strict";

//
// map room class
// 
// this is used to track which meshes count as rooms for later placing
// entities or decorations or objectives
//

function MapRoomObject(piece,xBound,yBound,zBound,hasStories,level)
{
    this.piece=piece;
    this.xBound=xBound;
    this.yBound=yBound;
    this.zBound=zBound;
    this.hasStories=hasStories;
    this.level=level;
    
    this.lowerGrid=new Uint8Array(ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS);
    this.upperGrid=new Uint8Array(ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS);
    
    this.setupGrid=function()
    {
        var n;
        var count=ROOM_MAX_DIVISIONS*ROOM_MAX_DIVISIONS;
        
            // lower grid starts all unblocked
            // and upper grid starts blocked until we add platforms
        
        for (n=0;n!==count;n++) {
            this.lowerGrid[n]=0;
            this.upperGrid[n]=1;
        }
    };
    
    this.setupGrid();       // supergumba -- IMPORTANT!!!  Move all this after classes!
        
        //
        // block or unblock off a grid space
        //
        
    this.blockLowerGrid=function(x,z)
    {
        this.lowerGrid[(z*ROOM_MAX_DIVISIONS)+x]=1;
    };
    
    this.blockUpperGrid=function(x,z)
    {
        this.upperGrid[(z*ROOM_MAX_DIVISIONS)+x]=1;
    };
    
    this.unblockUpperGrid=function(x,z)
    {
        this.upperGrid[(z*ROOM_MAX_DIVISIONS)+x]=0;
    };
    
        //
        // find points in blocked grid space
        //
    
    this.findRandomFreeLocation=function(genRandom)
    {
        var x,z,sx,sz,bx,bz,idx;
        var findTry=0;
        
        while (findTry<25) {
            x=genRandom.randomInt(0,ROOM_MAX_DIVISIONS);
            z=genRandom.randomInt(0,ROOM_MAX_DIVISIONS);
            
                // see if lower, than upper is OK
                
            sx=this.xBound.getSize()/ROOM_MAX_DIVISIONS;
            sz=this.zBound.getSize()/ROOM_MAX_DIVISIONS;
                
            bx=Math.floor((this.xBound.min+(sx*x))+(sx*0.5));
            bz=Math.floor((this.zBound.min+(sz*z))+(sz*0.5));
            
            idx=(z*ROOM_MAX_DIVISIONS)+x;
                
            if (this.lowerGrid[idx]===0) {
                this.lowerGrid[idx]=1;
                return(new wsPoint(bx,this.yBound.max,bz));
            }
            else {
                if (ROOM_PLATFORMS) {
                    if (this.upperGrid[idx]===0) {
                        this.upperGrid[idx]=1;
                        return(new wsPoint(bx,(this.yBound.min-ROOM_FLOOR_DEPTH),bz));
                    }
                }
            }
            
            findTry++;
        }
        
        return(null);
    };

}
