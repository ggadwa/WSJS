/* global config, genRandom, map, MeshPrimitivesClass, mapRoomConstants */

"use strict";

//
// generate room cubical decoration class
//

class GenRoomDecorationCubicalClass
{
    constructor()
    {
        Object.seal(this);
    }
        
        //
        // cubical wall
        //
        
    addCubicalWall(room,bitmap,rect,wid,yBound)
    {
        let n,dx,dz;
        let xBound,zBound;
        let skipIdx;
        let skipWall=genRandom.randomIndex(4);
        
            // skip index
            
        if ((skipWall===mapRoomConstants.ROOM_SIDE_LEFT) || (skipWall===mapRoomConstants.ROOM_SIDE_RIGHT)) {
            skipIdx=rect.top+genRandom.randomIndex(rect.bot-rect.top);
        }
        else {
            skipIdx=rect.lft+genRandom.randomIndex(rect.rgt-rect.lft);
        }
        
            // left and right walls
            
        for (n=rect.top;n<rect.bot;n++) {
            dz=room.zBound.min+(n*map.ROOM_BLOCK_WIDTH);
            zBound=new wsBound(dz,(dz+map.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_LEFT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.lft*map.ROOM_BLOCK_WIDTH);
                xBound=new wsBound(dx,(dx+wid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,dx,(dz+map.ROOM_BLOCK_WIDTH));
            }
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_RIGHT) && (skipIdx===n))) {
                dx=room.xBound.min+(rect.rgt*map.ROOM_BLOCK_WIDTH);
                xBound=new wsBound((dx-wid),dx);
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,dx,(dz+map.ROOM_BLOCK_WIDTH));
            }
        }
            
            // top and bottom walls
            
        for (n=rect.lft;n<rect.rgt;n++) {
            dx=room.xBound.min+(n*map.ROOM_BLOCK_WIDTH);
            xBound=new wsBound(dx,(dx+map.ROOM_BLOCK_WIDTH));
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_TOP) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.top*map.ROOM_BLOCK_WIDTH);
                zBound=new wsBound(dz,(dz+wid));
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,(dx+map.ROOM_BLOCK_WIDTH),dz);
            }
            
            if (!((skipWall===mapRoomConstants.ROOM_SIDE_BOTTOM) && (skipIdx===n))) {
                dz=room.zBound.min+(rect.bot*map.ROOM_BLOCK_WIDTH);
                zBound=new wsBound((dz-wid),dz);
                map.addMesh(MeshPrimitivesClass.createMeshCube(bitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
                map.addOverlayDecorationWall(dx,dz,(dx+map.ROOM_BLOCK_WIDTH),dz);
            }
        }
            
    }
    
        //
        // cubical decorations mainline
        //

    create(room,rect)
    {
        let wid,yBound;
        let bitmap=map.getTexture(map.TEXTURE_TYPE_FRAME);
        
            // get width
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        
            // create cubical walls
        
        if (genRandom.randomPercentage(0.5)) {
            yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),room.yBound.max);
        }
        else {
            yBound=new wsBound((room.yBound.max-((room.storyCount-1)*map.ROOM_FLOOR_HEIGHT)),room.yBound.max);
        }
            
        this.addCubicalWall(room,bitmap,rect,wid,yBound);
    }

}
