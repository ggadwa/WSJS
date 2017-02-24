/* global MeshPrimitivesClass, config, genRandom, map */

"use strict";

//
// generate room lab decoration class
//

class GenRoomDecorationLabClass
{
    constructor()
    {
        Object.seal(this);
    }
    
        //
        // lab tube
        //
        
    addTube(room,pnt)
    {
        let xBound,yBound,zBound;
        let wid,centerPnt,radius;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top and bottom base
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.9);

        xBound=new wsBound(pnt.x,(pnt.x+wid));
        zBound=new wsBound(pnt.z,(pnt.z+wid));

        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));

        yBound=new wsBound((room.yBound.max-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),(room.yBound.max-map.ROOM_FLOOR_HEIGHT));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));

            // the tube
        
        centerPnt=new wsPoint(xBound.getMidPoint(),room.yBound.max,zBound.getMidPoint());
        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        
        radius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.3);
        
        map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(metalBitmap,centerPnt,yBound,radius,map.MESH_FLAG_DECORATION));
    }
    
        //
        // lab pump
        //

    addPump(room,pnt)
    {
        let xBound,yBound,zBound;
        let wid,centerPnt,radius;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top and bottom base
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.9);

        xBound=new wsBound(pnt.x,(pnt.x+wid));
        zBound=new wsBound(pnt.z,(pnt.z+wid));

        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));

        yBound=new wsBound((room.yBound.max-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),(room.yBound.max-map.ROOM_FLOOR_HEIGHT));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,null,false,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));

            // the tube
        
        centerPnt=new wsPoint(xBound.getMidPoint(),room.yBound.max,zBound.getMidPoint());
        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        
        radius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.3);
        
        map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(metalBitmap,centerPnt,yBound,radius,map.MESH_FLAG_DECORATION));
    }
        
        //
        // lab
        //
    
    create(room)
    {
        let n,x,z,cubes,rect;
        let pnt=new wsPoint(0,0);
        
            // the cubes
            
        cubes=room.createRandomCubes(room);
        
            // create cubical walls
        
        for (n=0;n!==cubes.length;n++) {
            rect=cubes[n];
            
            for (z=rect.top;z<rect.bot;z++) {
                for (x=rect.lft;x<rect.rgt;x++) {
                    room.setBlockGrid(0,x,z);
                    pnt.setFromValues((room.xBound.min+(x*map.ROOM_BLOCK_WIDTH)),room.yBound.min,(room.zBound.min+(z*map.ROOM_BLOCK_WIDTH)));
                    this.addTube(room,pnt);
                }
            }
        }
    }
    
}
