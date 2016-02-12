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
        var n,k,stackLevel,pos,boxPos,boxY,stackCount,boxCount,rotWid;
        var ang,angAdd;
        var wid,high,rotAngle;
        
        var boxBoundX=new wsBound(0,0);
        var boxBoundY=new wsBound(0,0);
        var boxBoundZ=new wsBound(0,0);
        
        var boxPos=new wsPoint(0,0,0);
        var rotAngle=new wsPoint(0.0,0.0,0.0);

        stackCount=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_COUNT,ROOM_DECORATION_BOX_EXTRA_COUNT);

        for (n=0;n!==stackCount;n++) {
            
                // find the middle of the box spot
                // and box sizes
                
            pos=this.room.findRandomDecorationLocation(genRandom);
            if (pos===null) break;
            
            high=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_WIDTH,ROOM_DECORATION_BOX_EXTRA_WIDTH);
            wid=Math.floor(high/2);
            
                // count of boxes
                
            boxCount=this.genRandom.randomInt(ROOM_DECORATION_BOX_MIN_STACK_COUNT,ROOM_DECORATION_BOX_EXTRA_STACK_COUNT);
            boxY=this.room.yBound.max;
            rotWid=Math.floor(wid*1.5);
            
                // build the boxes around a rotating axis
                
            for (stackLevel=0;stackLevel!==3;stackLevel++) {
                
                ang=0;
                angAdd=(360.0/boxCount);

                for (k=0;k!==boxCount;k++) {

                    boxPos.set(-rotWid,0,0);
                    boxPos.rotateY(null,ang);
                    boxPos.addPoint(pos);

                    boxBoundX.set((boxPos.x-wid),(boxPos.x+wid));
                    boxBoundY.set((boxY-high),boxY);
                    boxBoundZ.set((boxPos.z-wid),(boxPos.z+wid));

                    rotAngle.set(0.0,(this.genRandom.random()*360.0),0.0);

                    map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),boxBoundX,boxBoundY,boxBoundZ,rotAngle,true,true,true,true,true,true,(stackLevel!==0),false,MESH_FLAG_DECORATION));

                    ang+=angAdd;
                }
                
                    // go up one level?
                    
                if ((boxCount===1) || (!this.genRandom.randomPercentage(ROOM_DECORATION_BOX_STACK_PERCENTAGE))) break;
                
                boxCount--;
                boxY-=high;
                rotWid=Math.floor(rotWid*0.8);
            }
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

        map.addMesh(meshPrimitives.createMeshCube(map.getBitmapById(TEXTURE_BOX),machineBoundX,machineBoundY,machineBoundZ,null,true,true,true,true,true,true,false,false,MESH_FLAG_DECORATION));
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
