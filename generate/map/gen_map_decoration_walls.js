/* global config, genRandom, map, MeshPrimitivesClass, MESH_FLAG_DECORATION, ROOM_SIDE_LEFT, ROOM_SIDE_RIGHT, ROOM_SIDE_TOP, ROOM_SIDE_BOTTOM */

"use strict";

//
// generate room wall decoration class
//

class GenRoomDecorationWallsClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // wall
        //
        
    addWall(room)
    {
        let x,z,wid;
        let xBound,yBound,zBound;
        let bitmap;
            
            // the wall location
            
        x=room.xBound.min+(genRandom.randomInt(1,(room.xBlockSize-2))*config.ROOM_BLOCK_WIDTH);
        z=room.zBound.min+(genRandom.randomInt(1,(room.zBlockSize-2))*config.ROOM_BLOCK_WIDTH);
        
        wid=Math.trunc(config.ROOM_BLOCK_WIDTH*0.1);

        bitmap=map.getTexture(map.TEXTURE_TYPE_PILLAR);
        
            // the wall
        
        switch (genRandom.randomIndex(3)) {
            case 0:
                xBound=new wsBound(x,(x+wid));
                zBound=new wsBound(z,(z+config.ROOM_BLOCK_WIDTH));
                break;
            case 1:
                xBound=new wsBound(((x+config.ROOM_BLOCK_WIDTH)-wid),(x+config.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(z,(z+config.ROOM_BLOCK_WIDTH));
                break;
            case 2:
                xBound=new wsBound(x,(x+config.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(z,(z+wid));
                break;
            case 3:
                xBound=new wsBound(x,(x+config.ROOM_BLOCK_WIDTH));
                zBound=new wsBound(((z+config.ROOM_BLOCK_WIDTH)-wid),(z+config.ROOM_BLOCK_WIDTH));
                break;
        }
        
        yBound=new wsBound((room.yBound.max-config.ROOM_FLOOR_HEIGHT),room.yBound.max);

        map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,null,false,true,true,true,true,false,false,false,MESH_FLAG_DECORATION));
    }
    
        //
        // wall decorations mainline
        //

    create(room)
    {
        let n,pieceCount;
        
        pieceCount=room.getDecorationCount();
        
        for (n=0;n!==pieceCount;n++) {
            this.addWall(room);
        }
    }

}
