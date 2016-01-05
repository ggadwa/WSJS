"use strict";

//
// generate room closet class
//

function GenRoomClosetObject(view,map,room,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;

    /*

    this.addBoxes=function()
    {
        var n,count;
        var x,z,high,boxBoundX,boxBoundY,boxBoundZ;

        count=this.genRandom.randomInt(1,3);

        for (n=0;n!==count;n++) {
            x=this.genRandom.randomInBetween((this.room.xBound.min+1000),(this.room.xBound.max-1000));
            z=this.genRandom.randomInBetween((this.room.zBound.min+1000),(this.room.zBound.max-1000));
            
            high=2000;
            if (this.genRandom.random()>0.5) high=3500;

            boxBoundX=new wsBound((x-1000),(x+1000));
            boxBoundY=new wsBound((this.room.yBound.max-high),this.room.yBound.max);
            boxBoundZ=new wsBound((z-1000),(z+1000));
            
            if (this.map.boxBoundCollision(boxBoundX,boxBoundY,boxBoundZ,MESH_FLAG_STAIR)!==-1) continue;
            
            map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,MESH_FLAG_DECORATION));
        }

    };
    */

    this.addCloset=function()
    {
    };

}
