"use strict";

//
// generate room decoration class
//

function GenRoomDecorationObject(view,map,room,genRandom)
{
        // variables
        
    this.view=view;
    this.map=map;
    this.genRandom=genRandom;
    this.room=room;

        //
        // random boxes
        //

    this.addBoxes=function()
    {
        var n,count;
        var x,z,high,boxBoundX,boxBoundY,boxBoundZ;

        count=this.genRandom.randomInt(1,ROOM_DECORATIONS_BOX_EXTRA_COUNT);

        for (n=0;n!==count;n++) {
            x=this.genRandom.randomInBetween((this.room.xBound.min+1000),(this.room.xBound.max-1000));
            z=this.genRandom.randomInBetween((this.room.zBound.min+1000),(this.room.zBound.max-1000));
            
            high=2000;
            if (this.genRandom.random()>0.5) high=3500;

            boxBoundX=new wsBound((x-1000),(x+1000));
            boxBoundY=new wsBound((this.room.yBound.max-high),this.room.yBound.max);
            boxBoundZ=new wsBound((z-1000),(z+1000));
            
            map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),boxBoundX,boxBoundY,boxBoundZ,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
        }

    };
        
        //
        // machines
        //
        
    this.addMachine=function()
    {
            // the machine size
            
        var centerPt=new wsPoint(this.room.xBound.getMidPoint(),this.room.yBound.max,this.room.zBound.getMidPoint());
            
        var sizeX=this.genRandom.randomInt(2000,1000);
        var sizeY=this.room.yBound.getSize()*0.7;
        var sizeZ=this.genRandom.randomInt(2000,1000);
        
        var machineBoundX=new wsBound((centerPt.x-sizeX),(centerPt.x+sizeX));
        var machineBoundY=new wsBound((this.room.yBound.max-sizeY),this.room.yBound.max);
        var machineBoundZ=new wsBound((centerPt.z-sizeZ),(centerPt.z+sizeZ));

        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),machineBoundX,machineBoundY,machineBoundZ,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
    };

    this.addDecorations=function()
    {
            // this map have decorations?
            
        if (!ROOM_DECORATIONS) return;
        
            // randomly pick a decoration
            
        switch (this.genRandom.randomIndex(2)) {
            case 0:
                this.addBoxes();
                break;
            //case 2:
            //    this.addMachine();
            //    break;
        }
    };

}
