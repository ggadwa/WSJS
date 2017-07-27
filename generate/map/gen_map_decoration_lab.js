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
        // lab tubes
        //
        
    addTube(room,pnt,largeBase)
    {
        let xBound,yBound,zBound;
        let wid,yMid,centerPnt,radius;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top and bottom base
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.9);

        xBound=new wsBound(pnt.x,(pnt.x+wid));
        zBound=new wsBound(pnt.z,(pnt.z+wid));

        if (!largeBase) {
            yMid=(room.yBound.max-map.ROOM_FLOOR_DEPTH);
        }
        else {
            yMid=room.yBound.max-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.5);
        }
        yBound=new wsBound(yMid,room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));

        yBound=new wsBound((room.yBound.max-(map.ROOM_FLOOR_HEIGHT+map.ROOM_FLOOR_DEPTH)),(room.yBound.max-map.ROOM_FLOOR_HEIGHT));
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));

            // the tube
        
        centerPnt=new wsPoint(xBound.getMidPoint(),room.yBound.max,zBound.getMidPoint());
        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_HEIGHT),yMid);
        
        radius=Math.trunc(map.ROOM_BLOCK_WIDTH*0.3);
        
        map.addMesh(MeshPrimitivesClass.createMeshCylinderSimple(metalBitmap,centerPnt,yBound,radius,map.MESH_FLAG_DECORATION));
    }
    
        //
        // lab pump
        //

    addPump(room,pnt)
    {
        let xBound,yBound,zBound;
        let wid,reduceSize;
        let platformBitmap,metalBitmap;

        platformBitmap=map.getTexture(map.TEXTURE_TYPE_PLATFORM);
        metalBitmap=map.getTexture(map.TEXTURE_TYPE_METAL);
        
            // the top \base
            
        wid=Math.trunc(map.ROOM_BLOCK_WIDTH*0.9);

        xBound=new wsBound(pnt.x,(pnt.x+wid));
        zBound=new wsBound(pnt.z,(pnt.z+wid));

        yBound=new wsBound((room.yBound.max-map.ROOM_FLOOR_DEPTH),room.yBound.max);
        map.addMesh(MeshPrimitivesClass.createMeshCube(platformBitmap,xBound,yBound,zBound,true,true,true,true,true,false,false,map.MESH_FLAG_DECORATION));
        
            // the pump
        
        reduceSize=Math.trunc(map.ROOM_BLOCK_WIDTH*0.1);
        xBound.min+=reduceSize;
        xBound.max-=reduceSize;
        zBound.min+=reduceSize;
        zBound.max-=reduceSize;

        yBound=new wsBound((room.yBound.max-Math.trunc(map.ROOM_FLOOR_HEIGHT*0.5)),(room.yBound.max-map.ROOM_FLOOR_DEPTH));
        map.addMesh(MeshPrimitivesClass.createMeshCube(metalBitmap,xBound,yBound,zBound,true,true,true,true,true,true,false,map.MESH_FLAG_DECORATION));
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
                    
                    switch (genRandom.randomIndex(3)) {
                        case 0:
                            this.addTube(room,pnt,false);
                            break;
                        case 1:
                            this.addTube(room,pnt,true);
                            break;
                        case 2:
                            this.addPump(room,pnt);
                            break;
                    }
                    
                }
            }
        }
    }
    
}
